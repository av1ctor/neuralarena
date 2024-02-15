use candid::CandidType;
use serde::{Deserialize, Serialize};

#[derive(PartialEq, CandidType, Clone, Serialize, Deserialize)]
pub enum StaffRole {
    Admin,
    Contributor,
    Member,
}

#[derive(CandidType, Clone, Serialize, Deserialize)]
pub struct Staff {
    pub role: StaffRole,
}

#[derive(CandidType, Clone, Deserialize)]
pub struct StaffRequest {
    role: StaffRole,
}

#[derive(CandidType, Clone, Deserialize)]
pub struct StaffResponse {
    role: StaffRole,
}

impl Staff {
    pub fn _new(
        e: &StaffRequest
    ) -> Self {
        Self {
            role: e.role.clone(),
        }
    }

    pub fn _update(
        &self
    ) -> Self {
        self.clone()
    }
}

impl From<Staff> for StaffResponse {
    fn from(
        e: Staff
    ) -> Self {
        Self { 
            role: e.role,
        }
    }
}

impl From<StaffRequest> for Staff {
    fn from(
        e: StaffRequest
    ) -> Self {
        Self {
            role: e.role,
        }
    }
}
