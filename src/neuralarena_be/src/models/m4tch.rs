use std::collections::HashMap;
use candid::{CandidType, Principal};
use neuralarena_cdk::models::{
    game::{GameCost, GameCosts, GameMapId, GameRewards}, 
    instance::{InstancePlayer, InstanceRunSlice}, 
    nas1_types::Nas1Token
};
use serde::{Serialize, Deserialize};
use super::{game::GameId, timer::TimerId};
use super::user::{UserId, UserNftRequest};

pub type MatchId = String;

#[derive(Clone, Serialize, Deserialize, CandidType)]
pub struct MatchGame {
    pub id: GameId,
    pub map_id: GameMapId,
    pub min_players: usize,
    pub max_players: usize,
    pub max_steps: usize,
    pub options: HashMap<String, String>,
}

#[derive(PartialEq, Clone, Copy, Serialize, Deserialize, CandidType)]
#[repr(C)]
pub enum MatchStatus {
    OPEN,
    CANCELLED,
    EXPIRED,
    RUNNING,
    FINISHED,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct MatchGameInstance {
    pub id: String,
    pub map_id: usize,
    pub costs: GameCosts,
    pub rewards: GameRewards,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct MatchState {
    pub status: MatchStatus,
    pub players: Vec<InstancePlayer>,
    pub num_steps: usize,
    pub initial_seed: Option<u64>,
    pub run_slices: Vec<InstanceRunSlice>,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct Match {
    pub id: String,
    pub game: MatchGame,
    pub state: MatchState,
    pub instance: MatchGameInstance,
    pub timer_id: Option<TimerId>,
    pub deadline: u64, // seconds
    pub created_at: u64,
    pub created_by: UserId,
    pub started_at: Option<u64>,
    pub won_at: Option<u64>,
    pub won_by: Option<UserId>,
}

#[derive(Clone, Serialize, Deserialize, CandidType)]
pub struct MatchRequest {
    pub game: MatchGame,
    pub deadline: u64, // seconds
}

#[derive(Clone, Serialize, Deserialize, CandidType)]
pub struct MatchPlayerNftResponse {
    pub collection_id: Principal,
    pub token_id: u128,
    pub props: Nas1Token,
}

#[derive(Clone, Serialize, Deserialize, CandidType)]
pub struct MatchPlayerResponse {
    pub id: Principal,
    pub score: f32,
    pub health: f32,
    pub nft: MatchPlayerNftResponse,
}

#[derive(Clone, Serialize, Deserialize, CandidType)]
pub struct MatchStateResponse {
    pub status: MatchStatus,
    pub num_steps: usize,
    pub initial_seed: Option<u64>,
    pub run_slices: Vec<InstanceRunSlice>,
}

#[derive(Clone, Serialize, Deserialize, CandidType)]
pub struct MatchGameInstanceResponse {
    pub costs: GameCosts,
    pub rewards: GameRewards,
}

#[derive(Clone, Serialize, Deserialize, CandidType)]
pub struct MatchResponse {
    pub id: String,
    pub state: MatchStateResponse,
    pub game: MatchGame,
    pub instance: MatchGameInstanceResponse,
    pub players: Vec<MatchPlayerResponse>,
    pub created_at: u64,
    pub created_by: UserId,
    pub deadline: u64,
    pub started_at: Option<u64>,
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
                status: MatchStatus::OPEN,
                players: vec![],
                num_steps: 0,
                initial_seed: None,
                run_slices: vec![],
            },
            instance: MatchGameInstance {
                id: "".to_string(),
                map_id: 0,
                costs: GameCosts{
                    to_play: GameCost::ICP(0),
                },
                rewards: GameRewards{
                    winner: 0,
                },
            },
            timer_id: None,
            deadline: req.deadline,
            created_at: ic_cdk::api::time(),
            created_by: caller.clone(),
            started_at: None,
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
            state: MatchStateResponse {
                status: e.state.status,
                num_steps: e.state.num_steps,
                initial_seed: e.state.initial_seed,
                run_slices: e.state.run_slices,
            },
            game: e.game,
            instance: MatchGameInstanceResponse {
                costs: e.instance.costs,
                rewards: e.instance.rewards,
            },
            players: e.state.players.iter().map(|p| MatchPlayerResponse {
                id: p.id,
                score: p.state.score,
                health: p.state.health,
                nft: MatchPlayerNftResponse{
                    collection_id: p.nft.collection_id,
                    token_id: p.nft.token_id,
                    props: p.nft.props.clone(),
                },
            }).collect(),
            deadline: e.deadline,
            created_at: e.created_at,
            created_by: e.created_by,
            started_at: e.started_at,
            won_at: e.won_at,
            won_by: e.won_by,
        }
    }
}
