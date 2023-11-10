use candid::CandidType;
use serde::{Deserialize, Serialize};

#[derive(CandidType, Clone, Serialize, Deserialize)]
pub struct Player {
    pub credits: u128,
}

#[derive(CandidType, Deserialize, Clone)]
pub struct PlayerRequest {
}

#[derive(CandidType)]
pub struct PlayerResponse {
}

impl Player {
    pub fn _new(
        _e: &PlayerRequest
    ) -> Self {
        Self {
            credits: 0,
        }
    }

    pub fn _update(
        &self
    ) -> Self {
        self.clone()
    }
}

impl From<Player> for PlayerResponse {
    fn from(
        _e: Player
    ) -> Self {
        Self { 
        }
    }
}

impl From<PlayerRequest> for Player {
    fn from(
        _e: PlayerRequest
    ) -> Self {
        Self {
            credits: 0,
        }
    }
}
