use std::collections::HashMap;
use candid::{CandidType, Principal};
use serde::{Serialize, Deserialize};
use super::game::GameId;
use super::user::UserId;

pub type MatchId = String;

#[derive(Clone, Serialize, Deserialize, CandidType)]
pub struct MatchOptions {
    pub game_id: GameId,
    pub game_options: HashMap<String, String>,
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
    pub instance_id: String,
    pub min_players: usize,
    pub max_players: usize,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct MatchState {
    pub status: MatchStatus,
    pub players: Vec<UserId>,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct Match {
    pub id: String,
    pub options: MatchOptions,
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
    pub options: MatchOptions,
}

#[derive(Clone, Serialize, Deserialize, CandidType)]
pub struct MatchResponse {
    pub id: String,
    pub status: MatchStatus,
    pub players: Vec<UserId>,
    pub created_at: u64,
    pub created_by: UserId,
    pub started_at: Option<u64>,
    pub started_by: Option<UserId>,
    pub won_at: Option<u64>,
    pub won_by: Option<UserId>,
}

impl Match {
    pub fn new(
        id: &String,
        req: &MatchRequest,
        caller: &Principal
    ) -> Self {
        Self {
            id: id.clone(),
            options: req.options.clone(), 
            state: MatchState { 
                status: MatchStatus::CREATED,
                players: vec![],
            },
            instance: MatchGameInstance {
                instance_id: "".to_string(),
                min_players: 0,
                max_players: 0,
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
            players: e.state.players,
            created_at: e.created_at,
            created_by: e.created_by,
            started_at: e.started_at,
            started_by: e.started_by,
            won_at: e.won_at,
            won_by: e.won_by,
            
        }
    }
}
