use candid::Principal;
use crate::db::DB;
use neuralarena_cdk::db::traits::crud::{Crud, CrudSubscribable, Pagination};
use crate::models::game::{Game, GameId, GameStatus};
use crate::models::staff::StaffRole;
use crate::models::user::UserKind;
use super::users::UsersService;

pub struct GamesService {}

impl GamesService {
    pub fn create(
        id: &GameId,
        game: &Game,
        db: &mut DB,
        caller: &Principal
    ) -> Result<(), String> {
        Self::authorize(caller, db)?;
        db.games.borrow_mut().insert_and_notify(id.clone(), game.clone())
    }

    pub fn update(
        id: &GameId,
        req: &Game,
        db: &mut DB,
        caller: &Principal
    ) -> Result<(), String> {
        Self::authorize(caller, db)?;

        let mut games = db.games.borrow_mut();

        let game = match games.find_by_id(id) {
            None => return Err("Not found".to_string()),
            Some(e) => e
        };

        if *caller != game.created_by {
            return Err("Forbidden".to_string());
        }

        games.update_and_notify(id.to_owned(), req.clone())
    }

    pub fn delete(
        id: &GameId,
        db: &mut DB,
        caller: &Principal
    ) -> Result<(), String> {
        Self::authorize(caller, db)?;

        let mut games = db.games.borrow_mut();

        let game = match games.find_by_id(id) {
            None => return Err("Not found".to_string()),
            Some(e) => e
        };

        if *caller != game.created_by {
            return Err("Forbidden".to_string());
        }
        
        games.delete_and_notify(id)
    }

    pub fn find_by_id(
        id: &GameId,
        db: &DB,
        _caller: &Principal
    ) -> Result<Game, String> {
        let games = db.games.borrow();

        let game = match games.find_by_id(id) {
            None => return Err("Not found".to_string()),
            Some(e) => e
        };

        Ok((*game).clone())
    }

    pub fn find_active(
        pag: Pagination,
        db: &DB,
        _caller: &Principal
    ) -> Result<Vec<Game>, String> {
        let games = db.games.borrow();
        
        let mut arr = games.data.0.iter()
            .map(|v| v.1)
            .filter(|g| g.status == GameStatus::ACTIVE)
            .cloned()
            .collect::<Vec<_>>();

        arr.sort_by(|a, b| b.name.cmp(&a.name));
        
        Ok(arr.iter()
            .skip(pag.offset as usize)
            .take(pag.limit as usize)
            .cloned()
            .collect())
    }

    fn authorize(
        caller: &Principal, 
        db: &mut DB
    ) -> Result<(), String> {
        //FIXME: remove this by-pass when the UI is done
        if false {
            if *caller == Principal::anonymous() {
                return Err("Anonymous not allowed".to_string());
            }
            
            let user = match UsersService::find_by_id(caller, db, caller) {
                Ok(e) => e,
                Err(msg) => return Err(msg),
            };
        
            if let UserKind::Staff(staff) = user.kind {
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
        }

        Ok(())
    }
}

