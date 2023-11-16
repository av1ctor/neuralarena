use candid::CandidType;
use serde::{Deserialize, Serialize};

#[derive(CandidType, Clone, Serialize, Deserialize)]
pub struct Moderator {
    pub balance: u128,
}

#[derive(CandidType, Deserialize, Clone)]
pub struct ModeratorRequest {
}

#[derive(CandidType)]
pub struct ModeratorResponse {
}

impl Moderator {
    pub fn _new(
        _e: &ModeratorRequest
    ) -> Self {
        Self {
            balance: 0,
        }
    }

    pub fn _update(
        &self
    ) -> Self {
        self.clone()
    }
}

impl From<Moderator> for ModeratorResponse {
    fn from(
        _e: Moderator
    ) -> Self {
        Self { 
        }
    }
}

impl From<ModeratorRequest> for Moderator {
    fn from(
        _e: ModeratorRequest
    ) -> Self {
        Self {
            balance: 0,
        }
    }
}
