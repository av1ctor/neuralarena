use std::{any::Any, collections::{BTreeSet, HashMap}};
use candid::Principal;
use neuralarena_cdk::{
    db::traits::crud::{Crud, CrudSubscribable, Pagination},
    models::instance::{
        InstanceAssetsResponse, InstanceId, InstancePlayer, 
        InstanceRunResponse, InstanceStepsResponse
    },
    utils::uniqueid
};
use crate::models::{
    game::{Game, GameId}, 
    m4tch::{Match, MatchId, MatchRequest, MatchStatus}, 
    nftcol::NftCollection, 
    user::{User, UserNftRequest}
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

        let id = uniqueid::generate();
        let mut m4tch = Match::new(&id, &req, &user.id);

        let (res, ): (Result<InstanceId, String>, ) = ic_cdk::call(
            game.canister_id, 
            "instance_create",
            (
                m4tch.game.options.clone(), 
            )
        ).await.map_err(|e| e.1)?;

        match res {
            Err(msg) => Err(msg),
            Ok(id) => {
                m4tch.instance.id = id;
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
        if  num_players >= game.info.max_players {
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

            let (res, ): (Result<HashMap<String, Vec<u8>>, String>, ) = ic_cdk::call(
                nft_col.meta.nas1.assets_canister_id, 
                "nas1_token_tensors", 
                (user_nft.token_id, )
            ).await.map_err(|e| e.1)?;

            match res {
                Ok(tensors) => {
                    m4tch.state.players.push(InstancePlayer {
                        id: user.id.clone(),
                        nft: user_nft.data.clone(),
                        nft_col: nft_col.meta.clone(),
                        tensors,
                    });
                },
                Err(msg) => return Err(msg),
            }

            let ok_to_run = m4tch.state.players.len() == game.info.max_players;
            Ok(ok_to_run)
        }
        else {
            Err("NFT not registered".to_string())
        }
    }

    pub fn start_step1(
        m4tch: &mut Match,
        game: &Game,
        user: &User
    ) -> Result<(), String> {
        Self::authorize(user)?;
        
        if m4tch.state.players.len() < game.info.min_players {
            return Err("Too few players".to_string());
        }

        if m4tch.state.status != MatchStatus::CREATED {
            return Err("Invalid match state".to_string());
        }

        m4tch.state.status = MatchStatus::STARTING;
        Ok(())
    }

    pub async fn start_step2(
        m4tch: &mut Match,
        game: &Game
    ) -> Result<(), String> {
        let (res, ): (Result<(), String>, ) = ic_cdk::call(
            game.canister_id, 
            "instance_start",
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
        game: &Game,
        user: &User
    ) -> Result<(), String> {
        Self::authorize(user)?;
        
        if m4tch.state.players.len() < game.info.min_players {
            return Err("Too few players".to_string());
        }

        if m4tch.state.status != MatchStatus::STARTED {
            return Err("Invalid match state".to_string());
        }

        m4tch.state.status = MatchStatus::RUNNING;
        Ok(())
    }

    pub async fn run_step2(
        m4tch: &mut Match,
        game: &Game
    ) -> Result<(), String> {

        let (res, ): (Result<InstanceRunResponse, String>, ) = ic_cdk::call(
            game.canister_id, 
            "instance_run",
            (
                m4tch.instance.id.clone(),
            )
        ).await.map_err(|e| e.1)?;
        
        m4tch.state.status = MatchStatus::FINISHED;

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
