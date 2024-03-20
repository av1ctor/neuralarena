use std::{any::Any, collections::{BTreeSet, HashMap}};
use candid::Principal;
use neuralarena_cdk::{
    db::traits::crud::{Crud, CrudSubscribable, Pagination},
    models::{
        ic_asset_types::{GetRequest, GetResponse}, 
        instance::{
            InstanceAssetsResponse, InstanceId, InstancePlayer, InstancePlayerNft, InstancePlayerState, InstanceRunRequest, InstanceRunResponse, InstanceRunSlice, InstanceStepsResponse
        }
    },
    utils::uniqueid
};
use crate::{
    models::{
        game::{Game, GameId}, 
        m4tch::{Match, MatchId, MatchRequest, MatchStatus}, 
        nftcol::NftCollection, 
        user::{User, UserNftRequest}
    }, 
    utils::icrc7
};
use crate::db::DB;
use crate::models::user::UserKind;

pub struct MatchesService {}

impl MatchesService {
    pub async fn create(
        req: &MatchRequest,
        game: &Game,
        user: &User
    ) -> Result<Match, String> {
        Self::authorize(user)?;

        // validations
        if req.game.min_players > req.game.max_players {
            return Err("Min number of players can't be greater than max number of players".to_string());
        }
        else if req.game.min_players < game.info.min_players {
            return Err("Min number of players can't be lower than game's min number of players".to_string());
        }
        else if req.game.min_players > game.info.max_players {
            return Err("Min number of players can't be greater than game's max number of players".to_string());
        }
        else if req.game.max_players > game.info.max_players {
            return Err("Max number of players can't be greater than game's max number of players".to_string());
        }

        let id = uniqueid::generate();
        let mut m4tch = Match::new(&id, &req, &user.id);

        let (res, ): (Result<InstanceId, String>, ) = ic_cdk::call(
            game.canister_id, 
            "instance_create",
            (
                m4tch.game.map_id,
                m4tch.game.options.clone(), 
            )
        ).await.map_err(|e| e.1)?;

        match res {
            Err(msg) => Err(msg),
            Ok(id) => {
                m4tch.instance.id = id;
                m4tch.instance.map_id = m4tch.game.map_id;
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
        db: &DB,
        _caller: &Principal
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
        db: &DB,
        _caller: &Principal
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
        db: &DB,
        _caller: &Principal
    ) -> Result<Vec<Match>, String> {
        let matches = db.matches.borrow();
        
        let mut arr = matches.data.0.iter()
            .map(|v| v.1)
            .filter(|m| m.state.status == MatchStatus::CREATED)
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
        db: &DB,
        _caller: &Principal
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
        nft_col: &NftCollection
    ) -> Result<bool, String> {
        Self::authorize(user)?;
        
        let num_players = m4tch.state.players.len();
        if  num_players >= m4tch.game.max_players {
            return Err("Too many players".to_string());
        }

        if m4tch.state.status != MatchStatus::CREATED {
            return Err("Invalid match state".to_string());
        }

        if m4tch.state.players.iter().any(|u| u.id == user.id) {
            return Err("Already part of the match".to_string());
        }

        if let Some(user_nft) = user.nfts.iter()
            .find(|n| n.collection_id == nft.collection_id && n.token_id == nft.token_id) {
            
            // verify if the nft can be used in this game
            for skill in &game.info.skills {
                if !nft_col.meta.nas1.skills.contains(skill) {
                    return Err(format!("NFT doesn't know the skill {} needed to play this game", skill));
                }
            }

            for anim in &game.info.animations {
                if !nft_col.meta.nas1.animations.contains(anim) {
                    return Err(format!("NFT doesn't have the animation {} needed to play this game", anim));
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
            
            m4tch.state.players.push(InstancePlayer {
                id: user.id.clone(),
                nft: InstancePlayerNft {
                    collection_id: user_nft.collection_id,
                    token_id: user_nft.token_id,
                    props: user_nft.props.clone(),
                },
                nft_col: nft_col.meta.clone(),
                tensors,
                state: InstancePlayerState {
                    active: true,
                    last_thought: 0,
                    obs: vec![],
                }
            });

            let ok_to_run = m4tch.state.players.len() == game.info.max_players;
            Ok(ok_to_run)
        }
        else {
            Err("NFT not registered".to_string())
        }
    }

    pub fn setup_step1(
        m4tch: &mut Match,
        _game: &Game,
        user: &User
    ) -> Result<(), String> {
        Self::authorize(user)?;
        
        if m4tch.state.players.len() < m4tch.game.min_players {
            return Err("Too few players".to_string());
        }

        if m4tch.state.status != MatchStatus::CREATED {
            return Err("Invalid match state".to_string());
        }

        m4tch.state.status = MatchStatus::STARTING;
        Ok(())
    }

    pub async fn setup_step2(
        m4tch: &mut Match,
        game: &Game
    ) -> Result<(), String> {
        let (res, ): (Result<(), String>, ) = ic_cdk::call(
            game.canister_id, 
            "instance_setup",
            (
                m4tch.instance.id.clone(), 
                m4tch.state.players.clone()
            )
        ).await.map_err(|e| e.1)?;

        if let Err(msg) = res {
            Err(msg)
        }
        else {
            m4tch.state.status = MatchStatus::STARTED;
            Ok(())
        }
    }

    pub fn run_step1(
        m4tch: &mut Match,
        _game: &Game,
        user: &User
    ) -> Result<(), String> {
        Self::authorize(user)?;
        
        if m4tch.state.players.len() < m4tch.game.min_players {
            return Err("Too few players".to_string());
        }

        if m4tch.state.status != MatchStatus::STARTED {
            return Err("Invalid match state".to_string());
        }

        m4tch.state.status = MatchStatus::RUNNING;
        Ok(())
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

        icrc7::ICRC7Utils::verify_owners(&nfts_by_canister).await?;

        Ok(())
    }

    pub async fn run_step2(
        m4tch: &mut Match,
        game: &Game,
        initial_seed: u64
    ) -> Result<(), String> {

        Self::verify_players(&m4tch.state.players).await?;

        m4tch.state.initial_seed = Some(initial_seed);

        let mut slice = 0;
        let res = loop {
            let seed = initial_seed ^ m4tch.state.num_steps as u64;

            m4tch.state.slices.push(InstanceRunSlice { 
                first_step: m4tch.state.num_steps, 
                seed
            });

            let (res, ): (Result<InstanceRunResponse, String>, ) = ic_cdk::call(
                game.canister_id, 
                "instance_run",
                (
                    m4tch.instance.id.clone(),
                    InstanceRunRequest{
                        slice,
                        seed,
                        max_instructions: 500_000_000,
                    }
                )
            ).await.map_err(|e| e.1)?;

            if let Ok(res) = res {
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

        if m4tch.state.status != MatchStatus::CREATED {
            return Err("Invalid match state".to_string());
        }
        
        matches.delete_and_notify(id)
    }

    pub async fn get_assets(
        m4tch: &Match,
        game: &Game
    ) -> Result<InstanceAssetsResponse, String> {
        let (res, ): (Result<InstanceAssetsResponse, String>, ) = ic_cdk::call(
            game.canister_id, 
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
        if ![MatchStatus::STARTED, MatchStatus::FINISHED]
            .contains(&m4tch.state.status) {
            return Err("Invalid match state".to_string());
        }
        
        let (res, ): (Result<InstanceStepsResponse, String>, ) = ic_cdk::call(
            game.canister_id, 
            "instance_get_steps",
            (m4tch.instance.id.clone(), pag, )
        ).await.map_err(|e| e.1)?;

        res
    }

    fn authorize(
        user: &User
    ) -> Result<(), String> {
        //FIXME: remove this by-pass when the UI is done
        if false {
            if UserKind::Player.type_id() != user.kind.type_id() {
                return Err("Forbidden".to_string());
            }

            if !user.active {
                return Err("User inactive".to_string());
            }
            else if user.banned {
                return Err("User banned".to_string());
            }
        }

        Ok(())
    }
}
