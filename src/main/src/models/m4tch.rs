use std::collections::HashMap;
use candid::{CandidType, Principal};
use serde::{Serialize, Deserialize};
use super::game::GameId;
use super::user::UserId;

pub type MatchId = String;

#[derive(Clone, Serialize, Deserialize, CandidType)]
pub struct MatchOptions {
    pub game_id: GameId,
    pub min_players: usize,
    pub max_players: usize,
    pub game_options: HashMap<String, String>,
}

#[derive(PartialEq, Clone, Serialize, Deserialize, CandidType)]
pub enum MatchStatus {
    CREATED,
    STARTING,
    STARTED,
    RUNNING,
    CANCELLED,
    FINISHED,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct MatchState {
    pub status: MatchStatus,
    pub game_instance_id: String,
    pub players: Vec<UserId>,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct Match {
    pub id: String,
    pub options: MatchOptions,
    pub state: MatchState,
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
    pub options: MatchOptions,
    pub status: MatchStatus,
    pub game_instance_id: String,
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
                game_instance_id: "".to_string(),
                players: vec![],
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
            options: e.options,
            status: e.state.status,
            game_instance_id: e.state.game_instance_id,
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
