use std::collections::HashMap;
use candid::Principal;
use icrc_ledger_types::icrc1::account::Account;
use crate::{db::DB, models::user::UserNft};
use neuralarena_cdk::{
    db::traits::crud::{Crud, CrudSubscribable, Pagination},
    models::nas1_types::Nas1Token
};
use crate::models::m4tch::Match;
use crate::models::user::{User, UserId, UserKind, UserNftRequest};

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

        if user.nfts.len() != 0 {
            return Err("Number of user's NFT's must be zero".to_string());
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
            None => return Err("User not found".to_string()),
            Some(e) => e
        };

        if *id != user.created_by || *caller != user.created_by {
            return Err("Forbidden".to_string());
        }

        if req.nfts.len() != user.nfts.len() {
            return Err("User's NFT's can't be changed".to_string());
        }

        for nft in &req.nfts {
            if !user.nfts.contains(&nft) {
                return Err("User's NFT can't be changed".to_string());
            }
        }

        users.update_and_notify(id.to_owned(), req.clone())
    }

    pub fn update_nfts(
        user: &mut User,
        nfts: Vec<UserNft>,
        db: &mut DB,
        caller: &Principal
    ) -> Result<(), String> {
        if user.id != user.created_by || *caller != user.created_by {
            return Err("Forbidden".to_string());
        }

        user.nfts = nfts;

        let mut users = db.users.borrow_mut();
        users.update_and_notify(user.id.to_owned(), user.clone())?;

        Ok(())
    }

    pub async fn verify_nfts(
        user: &User,
        nfts: &Vec<UserNftRequest>
    ) -> Result<Vec<UserNft>, String> {
        let mut nfts_by_canister = HashMap::<Principal, Vec<u128>>::new();
        for nft in nfts {
            if let Some(nft_by_id) = nfts_by_canister.get_mut(&nft.collection_id) {
                nft_by_id.push(nft.token_id);
            }
            else {
                nfts_by_canister.insert(nft.collection_id.clone(), vec![nft.token_id]);
            }
        }

        let mut nfts = vec![];

        for (canister_id, token_ids) in nfts_by_canister {
            // check if user is the owner
            let (accounts, ): (Vec<Option<Account>>, ) = ic_cdk::call(
                canister_id, 
                "icrc7_owner_of",
                (&token_ids, )
            ).await.map_err(|e| e.1)?;

            if accounts.len() != token_ids.len() {
                return Err("One or more tokens not found".to_string());
            }

            for (i, acc) in accounts.iter().enumerate() {
                if let Some(acc) = acc {
                    if acc.owner != user.id {
                        return Err(format!("User {} isn't the owner of {}[{}]", user.id, canister_id, token_ids[i]));
                    }
                }
                else {
                    return Err(format!("Token not found {}[{}]", canister_id, token_ids[i]));
                }
            }

            for token_id in token_ids {
                let (token_data, ): (Option<Nas1Token>, ) = ic_cdk::call(
                    canister_id, 
                    "nas1_token_data",
                    (token_id, )
                ).await.map_err(|e| e.1)?;
    
                if let Some(token_data) = token_data {
                    nfts.push(UserNft { 
                        collection_id: canister_id.clone(), 
                        token_id,
                        data: token_data,
                    });
                }
                else {
                    return Err(format!("Token not found: {}", token_id));
                }
            }
        }

        Ok(nfts)
    }

    pub fn delete(
        id: &UserId,
        db: &mut DB,
        caller: &Principal
    ) -> Result<(), String> {
        let mut users = db.users.borrow_mut();

        let user = match users.find_by_id(id) {
            None => return Err("User not found".to_string()),
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
        _caller: &Principal
    ) -> Result<User, String> {
        let users = db.users.borrow();

        let user = match users.find_by_id(id) {
            None => return Err("User not found".to_string()),
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
            None => return Err("User not found".to_string()),
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