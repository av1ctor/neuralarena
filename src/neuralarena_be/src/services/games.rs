use candid::Principal;
use neuralarena_cdk::{
    models::game::{
        GameEndCredits, GameInfo, GameInfoResponse
    },
    db::traits::crud::{Crud, CrudSubscribable, Pagination},
    utils::uniqueid
};
use crate::db::DB;
use crate::models::{
    game::{Game, GameId, GameRequest, GameStatus},
    staff::StaffRole,
    user::{User, UserKind}
};

use super::matches::MAX_GAME_DIST;

pub struct GamesService {}

impl GamesService {
    async fn get_info(
        canister_id: Principal
    ) -> Result<GameInfo, String> {
        let (res, ): (Result<GameInfoResponse, String>, ) = ic_cdk::call(
            canister_id, 
            "game_get_info",
            ()
        ).await.map_err(|e| e.1)?;

        match res {
            Err(msg) => Err(msg),
            Ok(info) => Ok(info.info)
        }
    }

    pub async fn create(
        req: &GameRequest,
        user: &User
    ) -> Result<Game, String> {
        Self::authorize(user)?;

        let info = Self::get_info(req.canister_id).await?;

        if info.rewards.winner > MAX_GAME_DIST {
            return Err(format!("Winner reward higher than max game distribution: {} > {}", info.rewards.winner, MAX_GAME_DIST));
        }

        let id = uniqueid::generate();
        Ok(Game::new(&id, &req, &info, &user.id))
    }

    pub async fn reload(
        req: &GameRequest,
        game: &mut Game,
        user: &User
    ) -> Result<(), String> {
        Self::authorize(user)?;

        let info = Self::get_info(req.canister_id).await?;

        game.info = info;

        Ok(())
    }

    pub fn insert(
        game: &Game,
        db: &mut DB
    ) -> Result<(), String> {
        db.games.borrow_mut()
            .insert_and_notify(game.id.clone(), game.clone())
    }

    pub fn update(
        game: &Game,
        db: &mut DB
    ) -> Result<(), String> {
        db.games.borrow_mut()
            .update_and_notify(game.id.clone(), game.clone())
    }

    pub fn find_by_id(
        id: &GameId,
        db: &DB
    ) -> Result<Game, String> {
        let games = db.games.borrow();

        let game = match games.find_by_id(id) {
            None => return Err("Not found".to_string()),
            Some(e) => e
        };

        Ok((*game).clone())
    }

    pub fn find_all(
        pag: Pagination,
        db: &DB
    ) -> Result<Vec<Game>, String> {
        let games = db.games.borrow();
        
        let mut arr = games.data.0.iter()
            .map(|v| v.1)
            .cloned()
            .collect::<Vec<_>>();

        arr.sort_by(|a, b| b.info.name.cmp(&a.info.name));
        
        Ok(arr.iter()
            .skip(pag.offset as usize)
            .take(pag.limit as usize)
            .cloned()
            .collect())
    }

    pub fn find_active(
        pag: Pagination,
        db: &DB
    ) -> Result<Vec<Game>, String> {
        let games = db.games.borrow();
        
        let mut arr = games.data.0.iter()
            .map(|v| v.1)
            .filter(|g| g.status == GameStatus::ACTIVE)
            .cloned()
            .collect::<Vec<_>>();

        arr.sort_by(|a, b| b.info.name.cmp(&a.info.name));
        
        Ok(arr.iter()
            .skip(pag.offset as usize)
            .take(pag.limit as usize)
            .cloned()
            .collect())
    }

    pub async fn get_end_credits(
        game: &Game
    ) -> Result<GameEndCredits, String> {
        let (res, ): (Result<GameEndCredits, String>, ) = ic_cdk::call(
            game.canister_id, 
            "game_get_end_credits",
            ()
        ).await.map_err(|e| e.1)?;

        res
    }

    fn authorize(
        user: &User
    ) -> Result<(), String> {
        if let UserKind::Staff(staff) = &user.kind {
            if staff.role != StaffRole::Admin {
                return Err("Forbidden".to_string());
            }
        }
        else {
            return Err("Forbidden".to_string());
        }

        if !user.active {
            return Err("User inactive".to_string());
        }
        else if user.banned {
            return Err("User banned".to_string());
        }

        Ok(())
    }
}

