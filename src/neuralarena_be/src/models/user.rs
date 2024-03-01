use candid::{Principal, CandidType};
use neuralarena_cdk::models::nas1_types::Nas1Token;
use serde::{Deserialize, Serialize};
use super::developer::{Developer, DeveloperRequest, DeveloperResponse};
use super::moderator::{Moderator, ModeratorRequest, ModeratorResponse};
use super::player::{PlayerResponse, PlayerRequest, Player};
use super::staff::{StaffResponse, StaffRequest, Staff};

pub type UserId = Principal;

#[derive(Clone, Serialize, Deserialize)]
pub enum UserKind {
    Player(Player),
    Developer(Developer),
    Moderator(Moderator),
    Staff(Staff),
}

#[derive(Clone, Serialize, Deserialize)]
pub struct UserNft {
    pub collection_id: Principal,
    pub token_id: u128,
    pub data: Nas1Token,
}

impl PartialEq for UserNft {
    fn eq(&self, other: &Self) -> bool {
        self.collection_id == other.collection_id && 
        self.token_id == other.token_id
    }
}

#[derive(Clone, Serialize, Deserialize)]
pub struct User {
    pub id: UserId,
    pub nick: String,
    pub name: Option<String>,
    pub email: Option<String>,
    pub credits: u128,
    pub active: bool,
    pub banned: bool,
    pub kind: UserKind,
    pub nfts: Vec<UserNft>,
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
    Developer(DeveloperRequest),
    Moderator(ModeratorRequest),
    Staff(StaffRequest),
}

#[derive(CandidType, Deserialize, Clone)]
pub struct UserRequest {
    nick: String,
    name: Option<String>,
    email: Option<String>,
    kind: UserKindRequest,
}

#[derive(Clone, Serialize, Deserialize, CandidType)]
pub struct UserNftRequest {
    pub collection_id: Principal,
    pub token_id: u128,
}

#[derive(CandidType, Deserialize, Clone)]
pub struct UserNftsRequest {
    pub nfts: Vec<UserNftRequest>,
}

#[derive(CandidType)]
pub enum UserKindResponse {
    Player(PlayerResponse),
    Developer(DeveloperResponse),
    Moderator(ModeratorResponse),
    Staff(StaffResponse),
}

#[derive(CandidType)]
pub struct UserNftResponse {
    pub collection_id: Principal,
    pub token_id: u128,
    pub data: Nas1Token,
}

#[derive(CandidType)]
pub struct UserResponse {
    id: UserId,
    nick: String,
    name: Option<String>,
    email: Option<String>,
    active: bool,
    banned: bool,
    kind: UserKindResponse,
    nfts: Vec<UserNftResponse>,
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
            nick: e.nick.clone(),
            name: e.name.clone(),
            email: e.email.clone(),
            active: true,
            banned: false,
            credits: 0,
            kind: e.kind.clone().into(),
            nfts: vec![],
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
            nick: e.nick,
            name: e.name,
            email: e.email,
            active: e.active,
            banned: e.banned,
            kind: e.kind.into(),
            nfts: e.nfts.iter().map(|n| UserNftResponse { 
                collection_id: n.collection_id, 
                token_id: n.token_id, 
                data: n.data.clone(),
            }).collect(),
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
            UserKindRequest::Developer(k) => UserKind::Developer(k.into()),
            UserKindRequest::Moderator(k) => UserKind::Moderator(k.into()),
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
            UserKind::Developer(k) => UserKindResponse::Developer(k.into()),
            UserKind::Moderator(k) => UserKindResponse::Moderator(k.into()),
        }
    }
}