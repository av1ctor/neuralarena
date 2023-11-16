use candid::CandidType;
use serde::{Deserialize, Serialize};

#[derive(CandidType, Clone, Serialize, Deserialize)]
pub struct Developer {
    pub balance: u128,
    pub url: Option<String>,
}

#[derive(CandidType, Deserialize, Clone)]
pub struct DeveloperRequest {
    pub url: Option<String>,
}

#[derive(CandidType)]
pub struct DeveloperResponse {
    pub url: Option<String>,
}

impl Developer {
    pub fn _new(
        e: &DeveloperRequest
    ) -> Self {
        Self {
            balance: 0,
            url: e.url.clone(),
        }
    }

    pub fn _update(
        &self
    ) -> Self {
        self.clone()
    }
}

impl From<Developer> for DeveloperResponse {
    fn from(
        e: Developer
    ) -> Self {
        Self { 
            url: e.url,
        }
    }
}

impl From<DeveloperRequest> for Developer {
    fn from(
        e: DeveloperRequest
    ) -> Self {
        Self {
            balance: 0,
            url: e.url,
        }
    }
}
