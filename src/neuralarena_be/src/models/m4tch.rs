use std::collections::HashMap;
use candid::{CandidType, Principal};
use neuralarena_cdk::models::{
    nas1_types::Nas1Token,
    instance::InstancePlayer,
    game::GameMapId
};
use serde::{Serialize, Deserialize};
use super::game::GameId;
use super::user::{UserId, UserNftRequest};

pub type MatchId = String;

#[derive(Clone, Serialize, Deserialize, CandidType)]
pub struct MatchGame {
    pub id: GameId,
    pub map_id: GameMapId,
    pub options: HashMap<String, String>,
}

#[derive(PartialEq, Clone, Copy, Serialize, Deserialize, CandidType)]
#[repr(C)]
pub enum MatchStatus {
    CREATED,
    STARTING,
    STARTED,
    RUNNING,
    CANCELLED,
    FINISHED,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct MatchGameInstance {
    pub id: String,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct MatchState {
    pub status: MatchStatus,
    pub players: Vec<InstancePlayer>,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct Match {
    pub id: String,
    pub game: MatchGame,
    pub state: MatchState,
    pub instance: MatchGameInstance,
    pub created_at: u64,
    pub created_by: UserId,
    pub started_at: Option<u64>,
    pub started_by: Option<UserId>,
    pub won_at: Option<u64>,
    pub won_by: Option<UserId>,
}

#[derive(Clone, Serialize, Deserialize, CandidType)]
pub struct MatchRequest {
    pub game: MatchGame
}

#[derive(Clone, Serialize, Deserialize, CandidType)]
pub struct MatchPlayerResponse {
    pub id: Principal,
    pub nft: Nas1Token,
}

#[derive(Clone, Serialize, Deserialize, CandidType)]
pub struct MatchResponse {
    pub id: String,
    pub status: MatchStatus,
    pub game: MatchGame,
    pub players: Vec<MatchPlayerResponse>,
    pub created_at: u64,
    pub created_by: UserId,
    pub started_at: Option<u64>,
    pub started_by: Option<UserId>,
    pub won_at: Option<u64>,
    pub won_by: Option<UserId>,
}

#[derive(Clone, Serialize, Deserialize, CandidType)]
pub struct MatchJoinRequest {
    pub id: String,
    pub nft: UserNftRequest,
}

impl Match {
    pub fn new(
        id: &String,
        req: &MatchRequest,
        caller: &Principal
    ) -> Self {
        Self {
            id: id.clone(),
            game: req.game.clone(), 
            state: MatchState { 
                status: MatchStatus::CREATED,
                players: vec![],
            },
            instance: MatchGameInstance {
                id: "".to_string(),
            },
            created_at: ic_cdk::api::time(),
            created_by: caller.clone(),
            started_at: None,
            started_by: None,
            won_at: None,
            won_by: None,
        }
    }
}

impl From<Match> for MatchResponse {
    fn from(
        e: Match
    ) -> Self {
        
        Self { 
            id: e.id,
            status: e.state.status,
            game: e.game,
            players: e.state.players.iter().map(|p| MatchPlayerResponse {
                id: p.id,
                nft: p.nft.clone(),
            }).collect(),
            created_at: e.created_at,
            created_by: e.created_by,
            started_at: e.started_at,
            started_by: e.started_by,
            won_at: e.won_at,
            won_by: e.won_by,
            
        }
    }
}
