use serde::{Deserialize, Serialize};
use super::m4tch::MatchId;

pub type TimerId = String;

#[derive(Clone, Serialize, Deserialize)]
pub enum TimerTarget {
    Match(MatchId),
}

#[derive(Clone, Serialize, Deserialize)]
pub struct Timer {
    pub id: TimerId,
    pub duration: u64, // secs
    pub target: TimerTarget,
    pub created_at: u64,
    #[serde(skip)]
    pub timer_id: Option<ic_cdk_timers::TimerId>,
}

impl Timer {
    pub fn new(
        id: TimerId,
        duration: u64,
        target: TimerTarget
    ) -> Self {
        Self {
            id,
            duration,
            target,
            created_at: ic_cdk::api::time(),
            timer_id: None,
        }
    }
}
