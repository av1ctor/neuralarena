use std::collections::HashSet;
use candid::{CandidType, Principal};
use serde::{Serialize, Deserialize};
use bot_engine::line::Line;
use bot_engine::game::Game;
use bot_engine::vector2d::Vector2d;
use crate::agent::dqnagent::DqnAgent;
use crate::db::traits::crud::Pagination;

use super::user::UserId;

pub type MatchId = String;

#[derive(Clone, Serialize, Deserialize, CandidType)]
pub struct MatchOptions {
    pub map_name: String,
    pub min_players: usize,
    pub max_players: usize,
    pub fps: f32,
    pub tps: f32,
    pub rays: usize,
    pub fov: f32,
    pub player_radius: f32,
    pub epsilon: f64,
    pub num_hidden_layers: usize,
}

#[derive(PartialEq, Clone, Serialize, Deserialize)]
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
    pub winner: Option<usize>,
    pub entities: Vec<u8>,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct MatchState {
    pub status: MatchStatus,
    pub steps: Vec<MatchStep>,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct Match {
    pub id: String,
    pub options: MatchOptions,
    pub players: HashSet<UserId>,
    pub state: MatchState,
    pub game: Option<Game<Vector2d, Line<Vector2d>>>,
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
}

#[derive(Clone, Serialize, Deserialize, CandidType)]
pub struct MatchStartRequest {
    pub id: String,
}

#[derive(Clone, Serialize, Deserialize, CandidType)]
pub struct MatchRunRequest {
    pub id: String,
}

#[derive(Clone, Serialize, Deserialize, CandidType)]
pub struct MatchJoinRequest {
    pub id: String,
    pub name: String,
}

#[derive(Clone, Serialize, Deserialize, CandidType)]
pub struct MatchStepsRequest {
    pub id: MatchId,
    pub pag: Pagination,
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
            state: MatchState { 
                status: MatchStatus::CREATED,
                steps: vec![],
            },
            players: HashSet::default(),
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
        Self { 
            id: e.id,
        }
    }
}
