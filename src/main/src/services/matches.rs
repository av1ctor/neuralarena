use std::collections::BTreeSet;
use candid::Principal;
use neuralarena_cdk::{
    db::traits::crud::{CrudSubscribable, Crud, Pagination},
    models::game_instance::{
        InstanceCreateResponse, 
        InstanceAssetsResponse,
        InstanceStepsResponse
    },
    utils::uniqueid
};
use crate::models::{
    game::{
        Game, 
        GameId, 
    }, 
    m4tch::MatchRequest, user::User
};
use crate::models::m4tch::{Match, MatchId, MatchStatus};
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

        let (res, ): (InstanceCreateResponse, ) = ic_cdk::call(
            game.canister_id, 
            "instance_create",
            (
                m4tch.options.game_options.clone(), 
            )
        ).await.unwrap();

        m4tch.state.game_instance_id = res.instance_id;
        m4tch.options.min_players = res.min_players;
        m4tch.options.max_players = res.max_players;

        Ok(m4tch)
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
            None => return Err("Not found".to_string()),
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
        
        let ids = matches_rel.data.0.get(&game_id).cloned().unwrap_or(BTreeSet::new());

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

    pub fn join(
        m4tch: &mut Match,
        user: &User
    ) -> Result<bool, String> {
        Self::authorize(user)?;
        
        let num_players = m4tch.state.players.len();
        if  num_players >= m4tch.options.max_players {
            return Err("Too many players".to_string());
        }

        if m4tch.state.status != MatchStatus::CREATED {
            return Err("Invalid match state".to_string());
        }

        if m4tch.state.players.contains(&user.id) {
            return Err("Already part of the match".to_string());
        }

        m4tch.state.players.push(user.id.clone());

        let ok_to_run = m4tch.state.players.len() == m4tch.options.max_players;
        
        Ok(ok_to_run)
    }

    pub fn start_step1(
        m4tch: &mut Match,
        user: &User
    ) -> Result<(), String> {
        Self::authorize(user)?;
        
        if m4tch.state.players.len() < m4tch.options.min_players {
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
        let (_, ): ((), ) = ic_cdk::call(
            game.canister_id, 
            "instance_start",
            (
                m4tch.state.game_instance_id.clone(), 
                m4tch.state.players.clone()
            )
        ).await.unwrap();

        m4tch.state.status = MatchStatus::STARTED;

        Ok(())
    }

    pub fn run_step1(
        m4tch: &mut Match,
        user: &User
    ) -> Result<(), String> {
        Self::authorize(user)?;
        
        if m4tch.state.players.len() < m4tch.options.min_players {
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

        let (_, ): ((), ) = ic_cdk::call(
            game.canister_id, 
            "instance_run",
            (
                m4tch.state.game_instance_id.clone(),
            )
        ).await.unwrap();        
        
        m4tch.state.status = MatchStatus::FINISHED;
        
        Ok(())
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
        game: &Game
    ) -> Result<InstanceAssetsResponse, String> {
        let (res, ): (InstanceAssetsResponse, ) = ic_cdk::call(
            game.canister_id, 
            "instance_get_assets",
            ()
        ).await.unwrap();

        Ok(res)
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
        
        let (res, ): (InstanceStepsResponse, ) = ic_cdk::call(
            game.canister_id, 
            "instance_get_steps",
            (pag, )
        ).await.unwrap();

        Ok(res)
    }

    fn authorize(
        user: &User
    ) -> Result<(), String> {
        //FIXME: remove this by-pass when the UI is done
        if false {
            if let UserKind::Player(_) = user.kind.clone() {
            }
            else {
                return Err("Forbidden".to_string());
            }
        }

        Ok(())
    }
}
