use std::collections::BTreeMap;
use crate::{db::DB, models::game::GameId};
use neuralarena_cdk::db::traits::crud::Crud;
use crate::models::user::UserId;

pub struct LeaderboardsService {}

impl LeaderboardsService {
    pub fn find_by_id_mut<'a>(
        game_id: &'a GameId,
        db: &'a DB
    ) -> Result<&'a mut BTreeMap<UserId, f32>, String> {
        let leaderboards = db.leaderboards.as_ptr();

        unsafe {
            match (*leaderboards).find_by_id_mut(game_id) {
                None => return Err("Not found".to_string()),
                Some(e) => Ok(e)
            }
        }
    }

    pub fn find_top(
        game_id: &GameId,
        limit: usize,
        db: &DB
    ) -> Result<Vec<(UserId, f32)>, String> {
        let leaderboards = db.leaderboards.borrow();

        let mut scores = match leaderboards.find_by_id(game_id) {
            None => return Ok(vec![]),
            Some(e) => e
        }.iter()
            .map(|e| (e.0.clone(), *e.1))
            .collect::<Vec<_>>();

        scores.sort_by(
            |a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));

        Ok(scores.iter()
            .take(limit)
            .cloned()
            .collect()
        )
    }

}