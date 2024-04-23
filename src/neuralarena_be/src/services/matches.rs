use std::collections::{BTreeSet, HashMap};
use candid::Principal;
use neuralarena_cdk::{
    db::traits::crud::{Crud, CrudSubscribable, Pagination},
    models::{
        game::GameCost, 
        ic_asset_types::{GetRequest, GetResponse}, 
        instance::{
            InstanceAssetsResponse, InstanceId, InstancePlayer, 
            InstancePlayerNft, InstancePlayerState, 
            InstanceRunRequest, InstanceRunResponse, InstanceRunSlice, 
            InstanceStepsResponse
        }, 
        nas1_types::{
            Nas1Token, Nas1TokenGameDeltaProps, Nas1TokenGameProps, 
            Nas1UpdatePropsArg, MIN_GAME_PROPS_DELTA
        }
    },
    utils::uniqueid
};
use crate::{
    models::{
        game::{Game, GameId}, 
        m4tch::{
            Match, MatchGameInstance, MatchId, MatchRequest, MatchStatus, 
            MatchWalletLog, MatchWalletLogAccount, MatchWalletLogOp, 
            MatchWalletLogTransfer
        }, 
        nftcol::NftCollection, 
        user::{User, UserNftRequest}
    }, 
    services::wallets::Wallets, 
    utils::icrc7
};
use crate::db::DB;
use crate::models::user::UserKind;
use super::wallets::TRANSFER_FEE;

const MIN_PLAYERS: usize = 2;
const MAX_STEPS: usize = (60 * 10) * 60;    // 10 minutes at 60 FPS, 20 minutes at 30 FPS, etc
const MIN_OPENED: u64 = 60 * 60 * 01;       // one hour
const MAX_OPENED: u64 = 60 * 60 * 24 * 7;   // one week

pub const MAX_GAME_DIST: u128 = 75;         // * 100
const PLATFORM_FEE: u128 = 20;              // * 100

pub struct MatchesService {}

impl MatchesService {
    pub async fn create(
        req: &MatchRequest,
        game: &Game,
        user: &User
    ) -> Result<Match, String> {
        Self::authorize(user)?;

        // validations
        if req.game.map_id >= game.info.maps.len() {
            return Err("Invalid map id".to_string());
        }
        
        if req.game.max_steps == 0 || req.game.max_steps > MAX_STEPS {
            return Err("Invalid duration".to_string());
        }
        
        if req.game.min_players > req.game.max_players {
            return Err("Min number of players can't be greater than max number of players".to_string());
        }
        else if req.game.min_players < game.info.min_players.max(MIN_PLAYERS) {
            return Err("Min number of players can't be lower than game's min number of players".to_string());
        }
        else if req.game.min_players > game.info.max_players {
            return Err("Min number of players can't be greater than game's max number of players".to_string());
        }
        else if req.game.max_players > game.info.max_players {
            return Err("Max number of players can't be greater than game's max number of players".to_string());
        }
        
        if req.deadline < MIN_OPENED {
            return Err(format!("Match can't be open for less than {} seconds", MIN_OPENED));
        }
        else if req.deadline > MAX_OPENED {
            return Err(format!("Match can't be open for more than {} seconds", MAX_OPENED));
        }

        let id = uniqueid::generate();
        let mut m4tch = Match::new(&id, &req, &user.id);

        let (res, ): (Result<InstanceId, String>, ) = ic_cdk::call(
            game.id, 
            "instance_create",
            (
                m4tch.game.map_id,
                m4tch.game.options.clone(), 
            )
        ).await.map_err(|e| e.1)?;

        match res {
            Err(msg) => Err(msg),
            Ok(id) => {
                m4tch.instance = MatchGameInstance{
                    id,
                    map_id: m4tch.game.map_id,
                    costs: game.info.costs.clone(),
                    rewards: game.info.rewards.clone(),
                };
                Ok(m4tch)
            }
        } 
    }

    pub fn insert(
        m4tch: &Match,
        db: &mut DB
    ) -> Result<(), String> {
        db.matches.borrow_mut()
            .insert_and_notify(m4tch.id.clone(), m4tch.clone())
    }

    pub fn update(
        m4tch: &Match,
        db: &mut DB
    ) -> Result<(), String> {
        db.matches.borrow_mut()
            .update_and_notify(m4tch.id.clone(), m4tch.clone())
    }

    pub fn find_by_id(
        id: &MatchId,
        db: &DB
    ) -> Result<Match, String> {
        let matches = db.matches.borrow();

        let m4tch = match matches.find_by_id(id) {
            None => return Err("Match not found".to_string()),
            Some(e) => e
        };

        Ok((*m4tch).clone())
    }

    pub fn find_all(
        pag: Pagination,
        db: &DB
    ) -> Result<Vec<Match>, String> {
        let matches = db.matches.borrow();
        
        let mut arr = matches.data.0.iter()
            .map(|v| v.1)
            .cloned()
            .collect::<Vec<_>>();

        arr.sort_by(|a, b| b.created_at.cmp(&a.created_at));
        
        Ok(arr.iter()
            .skip(pag.offset as usize)
            .take(pag.limit as usize)
            .cloned()
            .collect())
    }  

    pub fn find_open(
        pag: Pagination,
        db: &DB
    ) -> Result<Vec<Match>, String> {
        let matches = db.matches.borrow();
        
        let mut arr = matches.data.0.iter()
            .map(|v| v.1)
            .filter(|m| m.state.status == MatchStatus::OPEN)
            .cloned()
            .collect::<Vec<_>>();

        arr.sort_by(|a, b| b.created_at.cmp(&a.created_at));
        
        Ok(arr.iter()
            .skip(pag.offset as usize)
            .take(pag.limit as usize)
            .cloned()
            .collect())
    }    

    pub fn find_by_game(
        game_id: GameId,
        pag: Pagination,
        db: &DB
    ) -> Result<Vec<Match>, String> {
        let matches_rel = db.game_matches_rel.borrow();
        
        let ids = matches_rel.data.0.get(&game_id)
            .cloned().unwrap_or(BTreeSet::new());

        let mut arr = ids.iter()
            .map(|id| db.matches.borrow().data.0[id].clone())
            .collect::<Vec<_>>();

        arr.sort_by(|a, b| b.created_at.cmp(&a.created_at));
        
        Ok(arr.iter()
            .skip(pag.offset as usize)
            .take(pag.limit as usize)
            .cloned()
            .collect())
    }

    pub async fn join(
        m4tch: &mut Match,
        game: &Game,
        user: &User,
        nft: &UserNftRequest,
        nft_col: &NftCollection,
        icp_ledger_canister_id: Principal
    ) -> Result<bool, String> {
        Self::authorize(user)?;
        
        let num_players = m4tch.state.players.len();
        if  num_players >= m4tch.game.max_players {
            return Err("Too many players".to_string());
        }

        if m4tch.state.status != MatchStatus::OPEN {
            return Err("Invalid match state".to_string());
        }

        if m4tch.state.players.iter().any(|u| u.id == user.id) {
            return Err("Already part of the match".to_string());
        }

        // verify the NFT's
        if let Some(user_nft) = user.nfts.iter()
            .find(|n| n.collection_id == nft.collection_id && n.token_id == nft.token_id) {
            
            // verify if the nft can be used in this game
            for skill in &game.info.skills {
                if !nft_col.meta.nas1.skills.contains(skill) {
                    return Err(format!("NFT doesn't know the skill {} needed to play this game", skill));
                }
            }

            for state in &game.info.states {
                if !nft_col.meta.nas1.states.contains(state) {
                    return Err(format!("NFT doesn't have the state {} needed to play this game", state));
                }
            }

            // get tensors
            let mut tensors = HashMap::new();

            for skill in &nft_col.meta.nas1.skills {
                let key = format!("/tensors/{}/{:0>5}.safetensors", skill, nft.token_id);
                let (res, ): (GetResponse, ) = ic_cdk::call(
                    nft_col.meta.nas1.assets_canister_id, 
                    "get", 
                    (
                        GetRequest{
                            key, 
                            accept_encodings: vec!["identity".to_string()]
                        },
                    )
                ).await.map_err(|e| e.1)?;
        
                tensors.insert(skill.clone(), res.content);
            }

            // send to match's account
            let amount = Self::get_cost_to_play(&m4tch)?;
            
            let tx = Wallets::transfer_from_prin_to_str(
                &user.id, 
                &m4tch.id, 
                amount + (TRANSFER_FEE * 3), 
                &icp_ledger_canister_id
            ).await?;

            m4tch.state.wallet_logs.push(MatchWalletLog { 
                op: MatchWalletLogOp::Deposit, 
                acc: MatchWalletLogAccount::Prin(user.id.clone()), 
                res: Ok(MatchWalletLogTransfer {
                    value: amount,
                    time: ic_cdk::api::time(),
                    tx,
                }),
            });

            m4tch.state.balance += amount;
            
            // add player
            m4tch.state.players.push(InstancePlayer {
                id: user.id.clone(),
                nft: InstancePlayerNft {
                    collection_id: user_nft.collection_id,
                    token_id: user_nft.token_id,
                    props: None,
                },
                nft_col: nft_col.meta.clone(),
                tensors,
                state: InstancePlayerState {
                    active: true,
                    skill: "".to_string(),
                    last_thought: 0,
                    score: 0.0,
                    health: 100.0,
                    xp: 0.0,          // will be set when running
                    obs: HashMap::new(),
                }
            });

            let ok_to_run = m4tch.state.players.len() == m4tch.game.max_players;
            Ok(ok_to_run)
        }
        else {
            Err("NFT not registered".to_string())
        }
    }

    async fn verify_players(
        players: &Vec<InstancePlayer>
    ) -> Result<(), String> {
        // revalidate NFT's, because they may have been transfered
        let mut nfts_by_canister = HashMap::<Principal, (Vec<u128>, Vec<Principal>)>::new();
        for player in players {
            if let Some(tokens_owners) = nfts_by_canister.get_mut(&player.nft.collection_id) {
                tokens_owners.0.push(player.nft.token_id);
                tokens_owners.1.push(player.id.clone());
            }
            else {
                nfts_by_canister.insert(
                    player.nft.collection_id.clone(),
                    (
                        vec![player.nft.token_id],
                        vec![player.id.clone()]
                    )
                );
            }
        }

        icrc7::ICRC7Utils::verify_owners(&nfts_by_canister).await
    }

    fn get_cost_to_play(
        m4tch: &Match,
    ) -> Result<u128, String> {
        match m4tch.instance.costs.to_play {
            GameCost::USD(_) => Err("Currency USD is not supported yet".to_string()),
            GameCost::ICP(value) => Ok(value),
        }
    }

    async fn transfer_balances(
        m4tch: &mut Match,
        winner: &Option<Principal>,
        icp_ledger_canister_id: &Principal
    ) -> Result<(), String> {
        let amount = m4tch.state.balance;

        let game_cut = (amount * (MAX_GAME_DIST - if winner.is_some() {
                m4tch.instance.rewards.winner
            } else {
                0
            })) / 100;
        let winner_reward = if winner.is_some() && m4tch.instance.rewards.winner > 0 {
                (amount * m4tch.instance.rewards.winner) / 100
            } else {
                0
            };
        let platform_fee = (amount * PLATFORM_FEE) / 100;
        let to_burn = amount - game_cut - winner_reward - platform_fee;

        // give game its cut
        if game_cut > TRANSFER_FEE {
            match Wallets::transfer_from_str_to_prin(
                &m4tch.id,
                &m4tch.game.id, 
                game_cut,
                icp_ledger_canister_id
            ).await {
                Ok(tx) => {
                    m4tch.state.wallet_logs.push(MatchWalletLog{
                        op: MatchWalletLogOp::GameDist,
                        acc: MatchWalletLogAccount::Prin(m4tch.game.id.clone()),
                        res: Ok(MatchWalletLogTransfer{
                            value: game_cut,
                            time: ic_cdk::api::time(),
                            tx,
                        }),
                    });
                },
                Err(msg) => {
                    m4tch.state.wallet_logs.push(MatchWalletLog{
                        op: MatchWalletLogOp::GameDist,
                        acc: MatchWalletLogAccount::Prin(m4tch.game.id.clone()),
                        res: Err(msg),
                    });
                }
            };
        }
        
        // collect platform fee
        if platform_fee > TRANSFER_FEE {
            match Wallets::transfer_from_str_to_main(
                &m4tch.id,
                platform_fee,
                icp_ledger_canister_id
            ).await {
                Ok(tx) => {
                    m4tch.state.wallet_logs.push(MatchWalletLog{
                        op: MatchWalletLogOp::PlatformDist,
                        acc: MatchWalletLogAccount::Main,
                        res: Ok(MatchWalletLogTransfer{
                            value: platform_fee,
                            time: ic_cdk::api::time(),
                            tx,
                        }),
                    });
                },
                Err(msg) => {
                    m4tch.state.wallet_logs.push(MatchWalletLog{
                        op: MatchWalletLogOp::PlatformDist,
                        acc: MatchWalletLogAccount::Main,
                        res: Err(msg),
                    });
                }
            };
        }

        // reward winner
        if winner_reward > TRANSFER_FEE {
            match Wallets::transfer_from_str_to_prin(
                &m4tch.id,
                &winner.unwrap(), 
                winner_reward,
                icp_ledger_canister_id
            ).await {
                Ok(tx) => {
                    m4tch.state.wallet_logs.push(MatchWalletLog{
                        op: MatchWalletLogOp::WinnerDist,
                        acc: MatchWalletLogAccount::Prin(winner.unwrap().clone()),
                        res: Ok(MatchWalletLogTransfer{
                            value: winner_reward,
                            time: ic_cdk::api::time(),
                            tx,
                        }),
                    });
                },
                Err(msg) => {
                    m4tch.state.wallet_logs.push(MatchWalletLog{
                        op: MatchWalletLogOp::WinnerDist,
                        acc: MatchWalletLogAccount::Prin(winner.unwrap().clone()),
                        res: Err(msg),
                    });
                }
            };
        }

        // burn the rest
        if to_burn > TRANSFER_FEE {
            match Wallets::burn_from_str(
                &m4tch.id,
                to_burn,
                icp_ledger_canister_id
            ).await {
                Ok(tx) => {
                    match tx {
                        Some(tx) => {
                            m4tch.state.wallet_logs.push(MatchWalletLog{
                                op: MatchWalletLogOp::Burn,
                                acc: MatchWalletLogAccount::Main,
                                res: Ok(MatchWalletLogTransfer{
                                    value: to_burn,
                                    time: ic_cdk::api::time(),
                                    tx,
                                }),
                            });
                        },
                        None => {
                            m4tch.state.wallet_logs.push(MatchWalletLog{
                                op: MatchWalletLogOp::Burn,
                                acc: MatchWalletLogAccount::Main,
                                res: Err("Ledger doesn't support burning tokens".to_string()),
                            });
                        }
                    }
                },
                Err(msg) => {
                    m4tch.state.wallet_logs.push(MatchWalletLog{
                        op: MatchWalletLogOp::Burn,
                        acc: MatchWalletLogAccount::Main,
                        res: Err(msg),
                    });
                }
            };
        }

        m4tch.state.balance = 0;

        Ok(())
    }

    async fn update_players_game_props(
        m4tch: &Match, 
        game: &Game,
        old_game_props: &Vec<Nas1TokenGameProps>
    ) -> Result<(), String> {

        for (i, player) in m4tch.state.players.iter().enumerate() {
            // NOTE: all params are deltas, because some other match could have 
            // updated the xp while this match was running
            let old_game_props = &old_game_props[i];
            let delta_xp = player.state.xp - old_game_props.xp;
            if delta_xp.abs() > MIN_GAME_PROPS_DELTA {
                let _: (Result<(), String>, ) = ic_cdk::call(
                    player.nft.collection_id, 
                    "nas1_update_props",
                    (
                        Nas1UpdatePropsArg {
                            token_id: player.nft.token_id,
                            game_canister_id: game.id.clone(),
                            game_props: Nas1TokenGameDeltaProps {
                                delta_xp
                            }
                        },
                    )
                ).await.map_err(|e| e.1)?;
            }
        }
        
        Ok(())
    }

    async fn setup_match(
        m4tch: &mut Match,
        game: &Game
    ) -> Result<(), String> {
        // get the nas1 token for each player
        for player in &mut m4tch.state.players {
            let (token_data, ): (Option<Nas1Token>, ) = ic_cdk::call(
                player.nft.collection_id, 
                "nas1_token_data",
                (player.nft.token_id, )
            ).await.map_err(|e| e.1)?;

            if let Some(token_data) = token_data {
                player.nft.props = Some(token_data);
            }
            else {
                return Err(format!("Token not found: {}", player.nft.token_id));
            }
        }
        
        let (res, ): (Result<(), String>, ) = ic_cdk::call(
            game.id, 
            "instance_setup",
            (
                m4tch.instance.id.clone(), 
                m4tch.state.players.clone()
            )
        ).await.map_err(|e| e.1)?;

        res
    }

    pub async fn run(
        m4tch: &mut Match,
        game: &Game,
        initial_seed: u64,
        icp_ledger_canister_id: &Principal
    ) -> Result<(), String> {

        Self::verify_players(&m4tch.state.players).await?;

        Self::setup_match(m4tch, game).await?;

        m4tch.state.initial_seed = Some(initial_seed);

        let old_game_props = m4tch.state.players.iter()
            .map(|p| p.nft.props.as_ref().unwrap()
                .game_props.get(&game.id).or(Some(&Nas1TokenGameProps{
                    xp: 0.0
                })).unwrap().clone()
            )
            .collect();

        let mut slice = 0;
        let res = loop {
            let seed = initial_seed ^ m4tch.state.num_steps as u64;

            m4tch.state.run_slices.push(InstanceRunSlice { 
                first_step: m4tch.state.num_steps, 
                seed
            });

            let (res, ): (Result<InstanceRunResponse, String>, ) = ic_cdk::call(
                game.id, 
                "instance_run",
                (
                    m4tch.instance.id.clone(),
                    InstanceRunRequest{
                        slice,
                        seed,
                        max_instructions: 500_000_000,
                        max_steps: m4tch.game.max_steps,
                    }
                )
            ).await.map_err(|e| e.1)?;

            if let Ok(res) = res {
                for (i, player) in m4tch.state.players.iter_mut().enumerate() {
                    let inst_player = &res.players[i];
                    player.state.score = inst_player.score;
                    player.state.health = inst_player.health;
                    player.state.xp = inst_player.xp;
                }

                if res.terminated || res.timedout {
                    m4tch.state.status = MatchStatus::FINISHED;
                    m4tch.state.num_steps = res.steps;
                    break Ok(res);
                }
            }
            else {
                break res;
            }

            slice += 1;
        };

        match res {
            Ok(result) => {
                Self::transfer_balances(
                    m4tch,
                    &result.won_by,
                    icp_ledger_canister_id,
                ).await?;

                Self::update_players_game_props(
                    m4tch,
                    game,
                    &old_game_props
                ).await?;
        
                m4tch.won_by = result.won_by;
                m4tch.won_at = result.won_at;
                Ok(())
            },
            Err(msg) => Err(msg),
        }
    }

    pub fn _delete(
        id: &MatchId,
        db: &mut DB,
        user: &User
    ) -> Result<(), String> {
        Self::authorize(user)?;
        
        let mut matches = db.matches.borrow_mut();

        let m4tch = match matches.find_by_id(id) {
            None => return Err("Not found".to_string()),
            Some(e) => e
        };

        if user.id != m4tch.created_by {
            return Err("Forbidden".to_string());
        }

        if m4tch.state.status != MatchStatus::OPEN {
            return Err("Invalid match state".to_string());
        }
        
        matches.delete_and_notify(id)
    }

    pub async fn get_assets(
        m4tch: &Match,
        game: &Game
    ) -> Result<InstanceAssetsResponse, String> {
        let (res, ): (Result<InstanceAssetsResponse, String>, ) = ic_cdk::call(
            game.id, 
            "instance_get_assets",
            (m4tch.instance.id.clone(), )
        ).await.map_err(|e| e.1)?;

        res
    }

    pub async fn get_steps(
        m4tch: &Match,
        game: &Game,
        pag: Pagination
    ) -> Result<InstanceStepsResponse, String> {
        if ![MatchStatus::RUNNING, MatchStatus::FINISHED]
            .contains(&m4tch.state.status) {
            return Err("Invalid match state".to_string());
        }
        
        let (res, ): (Result<InstanceStepsResponse, String>, ) = ic_cdk::call(
            game.id, 
            "instance_get_steps",
            (m4tch.instance.id.clone(), pag, )
        ).await.map_err(|e| e.1)?;

        res
    }

    pub async fn reimburse(
        m4tch: &mut Match,
        icp_ledger_canister_id: &Principal
    ) -> Result<(), String> {
        let amount = Self::get_cost_to_play(m4tch)? - (TRANSFER_FEE*2);

        // return money to players
        for player in &m4tch.state.players {
            if amount > TRANSFER_FEE {
                match Wallets::transfer_from_str_to_prin(
                    &m4tch.id,
                    &player.id, 
                    amount,
                    icp_ledger_canister_id
                ).await {
                    Ok(tx) => {
                        m4tch.state.wallet_logs.push(MatchWalletLog{
                            op: MatchWalletLogOp::Reimburse,
                            acc: MatchWalletLogAccount::Prin(player.id.clone()),
                            res: Ok(MatchWalletLogTransfer{
                                value: amount,
                                time: ic_cdk::api::time(),
                                tx,
                            }),
                        });
                    },
                    Err(msg) => {
                        m4tch.state.wallet_logs.push(MatchWalletLog{
                            op: MatchWalletLogOp::Reimburse,
                            acc: MatchWalletLogAccount::Prin(player.id.clone()),
                            res: Err(msg),
                        });
                    }
                };
            }
        }

        m4tch.state.balance = 0;

        Ok(())
    }

    fn authorize(
        user: &User
    ) -> Result<(), String> {
        match user.kind {
            UserKind::Player(_) => {
                if !user.active {
                    return Err("User inactive".to_string());
                }
                else if user.banned {
                    return Err("User banned".to_string());
                }
        
                Ok(())
            }
            _ => {
                Err("Forbidden".to_string())
            },
        }

    }
}
