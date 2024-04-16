use candid::{Principal, CandidType};
use serde::{Serialize, Deserialize};
use super::user::UserId;
use neuralarena_cdk::models::game::GameInfo;

pub type GameId = Principal;

#[derive(PartialEq, Clone, Serialize, Deserialize)]
pub enum GameStatus {
    INACTIVE,
    ACTIVE,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct Game {
    pub id: Principal,
    pub info: GameInfo,
    pub status: GameStatus,
    pub created_at: u64,
    pub created_by: UserId,
    pub updated_at: Option<u64>,
    pub updated_by: Option<UserId>,
}

#[derive(Clone, Serialize, Deserialize, CandidType)]
pub struct GameRequest {
    pub canister_id: Principal,
}

#[derive(Clone, Serialize, Deserialize, CandidType)]
pub struct GameResponse {
    pub id: GameId,
    pub info: GameInfo,
}

impl Game {
    pub fn new(
        req: &GameRequest,
        info: &GameInfo,
        caller: &Principal
    ) -> Self {
        Self {
            id: req.canister_id.clone(),
            info: info.clone(),
            status: GameStatus::ACTIVE,
            created_at: ic_cdk::api::time(),
            created_by: caller.clone(),
            updated_at: None,
            updated_by: None,
        }
    }
}

impl From<Game> for GameResponse {
    fn from(
        e: Game
    ) -> Self {
        Self {
            id: e.id,
            info: e.info,
        }
    }
}
