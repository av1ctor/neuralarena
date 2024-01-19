use std::collections::HashMap;
use candid::{CandidType, Principal};
use serde::{Serialize, Deserialize};
use bot_engine_gltf::game::Game;
use crate::agent::dqnagent::DqnAgent;
use super::game::GameId;
use super::user::UserId;

pub type MatchId = String;

#[derive(Clone, Serialize, Deserialize, CandidType)]
pub struct MatchOptions {
    pub game_id: GameId,
    pub min_players: usize,
    pub max_players: usize,
    pub fps: f32,
    pub tps: f32,
    pub epsilon: f64,
    pub num_hidden_layers: usize,
    pub game_options: HashMap<String, String>,
}

#[derive(PartialEq, Clone, Serialize, Deserialize, CandidType)]
pub enum MatchStatus {
    CREATED,
    STARTED,
    RUNNING,
    CANCELLED,
    FINISHED,
}

#[derive(Clone, Serialize, Deserialize, CandidType)]
pub struct MatchStep {
    pub terminated: bool,
    pub timedout: bool,
    pub entities: Vec<u8>,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct MatchState {
    pub steps: Vec<MatchStep>,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct Match {
    pub id: String,
    pub options: MatchOptions,
    pub status: MatchStatus,
    pub players: HashMap<UserId, usize>,
    pub state: MatchState,
    pub game: Option<Game>,
    pub agent: Option<DqnAgent>,
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
    pub players: Vec<UserId>,
    pub created_at: u64,
    pub created_by: UserId,
    pub started_at: Option<u64>,
    pub started_by: Option<UserId>,
    pub won_at: Option<u64>,
    pub won_by: Option<UserId>,
}

#[derive(Clone, Serialize, Deserialize, CandidType)]
pub struct MatchStepsResponse {
    pub steps: Vec<MatchStep>,
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
            status: MatchStatus::CREATED,
            state: MatchState { 
                steps: vec![],
            },
            players: HashMap::default(),
            game: None,
            agent: None,
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
        let mut players = e.players.iter().collect::<Vec<_>>();
        players.sort_by(|a, b| a.1.cmp(b.1));
        
        Self { 
            id: e.id,
            options: e.options,
            status: e.status,
            players: players.iter().map(|e| e.0).cloned().collect(),
            created_at: e.created_at,
            created_by: e.created_by,
            started_at: e.started_at,
            started_by: e.started_by,
            won_at: e.won_at,
            won_by: e.won_by,
            
        }
    }
}
