use std::collections::HashSet;
use candid::CandidType;
use serde::{Serialize, Deserialize};
use bot_engine::line::Line;
use bot_engine::game::Game;
use bot_engine::vector2d::Vector2d;
use crate::agent::dqnagent::DqnAgent;

pub type MatchId = String;
pub type UserId = String;

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
    pub created_at: u128,
    pub created_by: UserId,
    pub started_at: Option<u128>,
    pub started_by: Option<UserId>,
    pub won_at: Option<u128>,
    pub won_by: Option<UserId>,
    pub steps: Vec<MatchStep>,
}

pub struct Match {
    pub options: MatchOptions,
    pub players: HashSet<UserId>,
    pub state: MatchState,
    pub game: Option<Game<Vector2d, Line<Vector2d>>>,
    pub agent: Option<DqnAgent>,
}

#[derive(Clone, Serialize, Deserialize, CandidType)]
pub struct MatchCreateRequest {
    pub options: MatchOptions,
}

#[derive(Clone, Serialize, Deserialize, CandidType)]
pub struct MatchCreateResponse {
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
pub struct MatchJoinResponse {
    pub id: String,
}

#[derive(Clone, Serialize, Deserialize, CandidType)]
pub struct MatchStepsRequest {
    pub id: MatchId,
    pub ofs: usize,
    pub len: usize,
}

#[derive(Clone, Serialize, Deserialize, CandidType)]
pub struct MatchStepsResponse {
    pub steps: Vec<MatchStep>,
}