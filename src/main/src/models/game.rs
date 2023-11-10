use candid::{Principal, CandidType};
use serde::{Serialize, Deserialize};
use super::user::UserId;

pub type GameId = String;

#[derive(PartialEq, Clone, Serialize, Deserialize)]
pub enum GameStatus {
    INACTIVE,
    ACTIVE,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct Game {
    pub id: GameId,
    pub canister_id: Principal,
    pub name: String,
    pub status: GameStatus,
    pub created_at: u64,
    pub created_by: UserId,
    pub updated_at: Option<u64>,
    pub updated_by: Option<UserId>,
}

#[derive(Clone, Serialize, Deserialize, CandidType)]
pub struct GameRequest {
    pub canister_id: Principal,
    pub name: String,
}

#[derive(Clone, Serialize, Deserialize, CandidType)]
pub struct GameResponse {
    pub id: GameId,
    pub canister_id: Principal,
    pub name: String,
}

impl Game {
    pub fn new(
        id: &String,
        req: &GameRequest,
        caller: &Principal
    ) -> Self {
        Self {
            id: id.clone(),
            canister_id: req.canister_id.clone(),
            name: req.name.clone(),
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
            canister_id: e.canister_id,
            name: e.name,
        }
    }
}
