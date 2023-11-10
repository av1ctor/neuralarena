use candid::Principal;
use crate::db::DB;
use crate::db::traits::crud::{Crud, Pagination, CrudSubscribable};
use crate::models::m4tch::Match;
use crate::models::user::{User, UserId, UserKind};

pub struct UsersService {}

impl UsersService {
    pub fn create_player(
        user: &User,
        db: &mut DB,
        caller: &Principal
    ) -> Result<(), String> {
        if *caller == Principal::anonymous() {
            return Err("Anonymous not allowed".to_string());
        }

        match &user.kind {
            UserKind::Player(_) => {},
            _ => {
                return Err("Invalid user kind".to_string());
            }
        }
        
        db.users.borrow_mut().insert_and_notify(caller.to_owned(), user.clone())
    }

    pub fn create_staff(
        user: &User,
        db: &mut DB,
        caller: &Principal
    ) -> Result<(), String> {
        if *caller == Principal::anonymous() {
            return Err("Anonymous not allowed".to_string());
        }

        match &user.kind {
            UserKind::Staff(_) => {},
            _ => {
                return Err("Invalid user kind".to_string());
            }
        }
        
        db.users.borrow_mut().insert_and_notify(caller.to_owned(), user.clone())
    }

    pub fn update(
        id: &UserId,
        req: &User,
        db: &mut DB,
        caller: &Principal
    ) -> Result<(), String> {
        let mut users = db.users.borrow_mut();

        let user = match users.find_by_id(id) {
            None => return Err("Not found".to_string()),
            Some(e) => e
        };

        if *id != user.created_by || *caller != user.created_by {
            return Err("Forbidden".to_string());
        }

        users.update_and_notify(id.to_owned(), req.clone())
    }

    pub fn delete(
        id: &UserId,
        db: &mut DB,
        caller: &Principal
    ) -> Result<(), String> {
        let mut users = db.users.borrow_mut();

        let user = match users.find_by_id(id) {
            None => return Err("Not found".to_string()),
            Some(e) => e
        };

        if *id != user.created_by || *caller != user.created_by {
            return Err("Forbidden".to_string());
        }
        
        users.delete_and_notify(id)
    }

    pub fn find_by_id(
        id: &UserId,
        db: &DB,
        caller: &Principal
    ) -> Result<User, String> {
        if *caller == Principal::anonymous() {
            return Err("Forbidden".to_string());
        }
        
        let users = db.users.borrow();

        let user = match users.find_by_id(id) {
            None => return Err("Not found".to_string()),
            Some(e) => e
        };

        Ok((*user).clone())
    }

    pub fn find_matches(
        id: &UserId,
        pag: Pagination,
        db: &DB,
        caller: &Principal
    ) -> Result<Vec<Match>, String> {
        let users = db.users.borrow();

        let user = match users.find_by_id(id) {
            None => return Err("Not found".to_string()),
            Some(e) => e
        };

        if *id != user.created_by || *caller != user.created_by {
            return Err("Forbidden".to_string());
        }

        let ids = match db.user_matches_rel.borrow().find_by_id(id) {
            None => vec![],
            Some(set) =>  {
                let mut arr: Vec<String> = set.iter().cloned().collect();
                arr.sort_by(|a, b| b.cmp(a));
                arr.iter()
                    .skip(pag.offset as usize)
                    .take(pag.limit as usize)
                    .cloned()
                    .collect()
            }
        };

        let matches = db.matches.borrow();
        let user_mtaches = ids.iter().map(|id| matches.get(id).clone())
            .collect();
        
        Ok(user_mtaches)
    }
}