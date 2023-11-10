use candid::{Principal, CandidType};
use serde::{Deserialize, Serialize};
use super::player::{PlayerResponse, PlayerRequest, Player};
use super::staff::{StaffResponse, StaffRequest, Staff};

pub type UserId = Principal;

#[derive(Clone, Serialize, Deserialize)]
pub enum UserKind {
    Player(Player),
    Staff(Staff),
}

#[derive(Clone, Serialize, Deserialize)]
pub struct User {
    pub id: UserId,
    pub name: String,
    pub email: String,
    pub credits: u128,
    pub active: bool,
    pub banned: bool,
    pub kind: UserKind,
    pub created_at: u64,
    pub created_by: Principal,
    pub updated_at: Option<u64>,
    pub updated_by: Option<Principal>,
    pub deleted_at: Option<u64>,
    pub deleted_by: Option<Principal>,
}

#[derive(CandidType, Deserialize, Clone)]
pub enum UserKindRequest {
    Player(PlayerRequest),
    Staff(StaffRequest),
}

#[derive(CandidType, Deserialize, Clone)]
pub struct UserRequest {
    name: String,
    email: String,
    kind: UserKindRequest,
}

#[derive(CandidType)]
pub enum UserKindResponse {
    Player(PlayerResponse),
    Staff(StaffResponse),
}

#[derive(CandidType)]
pub struct UserResponse {
    id: UserId,
    name: String,
    email: String,
    active: bool,
    banned: bool,
    kind: UserKindResponse,
    created_at: u64,
    updated_at: Option<u64>,
}

impl User {
    pub fn new(
        e: &UserRequest,
        caller: &Principal
    ) -> Self {
        Self {
            id: caller.clone(),
            name: e.name.clone(),
            email: e.email.clone(),
            active: true,
            banned: false,
            credits: 0,
            kind: e.kind.clone().into(),
            created_at: ic_cdk::api::time(),
            created_by: caller.clone(),
            updated_at: None,
            updated_by: None,
            deleted_at: None,
            deleted_by: None,
        }
    }

    pub fn _update(
        &self,
        caller: &Principal
    ) -> Self {
        Self {
            updated_at: Some(ic_cdk::api::time()),
            updated_by: Some(caller.clone()),
            ..self.clone()
        }
    }
}

impl From<User> for UserResponse {
    fn from(
        e: User
    ) -> Self {
        Self { 
            id: e.id,
            name: e.name, 
            email: e.email,
            active: e.active,
            banned: e.banned,
            kind: e.kind.into(),
            created_at: e.created_at,
            updated_at: e.updated_at,
        }
    }
}

impl From<UserKindRequest> for UserKind {
    fn from(
        value: UserKindRequest
    ) -> Self {
        match value {
            UserKindRequest::Player(k) => UserKind::Player(k.into()),
            UserKindRequest::Staff(k) => UserKind::Staff(k.into()),
        }
    }
}

impl From<UserKind> for UserKindResponse {
    fn from(
        value: UserKind
    ) -> Self {
        match value {
            UserKind::Player(k) => UserKindResponse::Player(k.into()),
            UserKind::Staff(k) => UserKindResponse::Staff(k.into()),
        }
    }
}