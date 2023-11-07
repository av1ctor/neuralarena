mod nn;
mod dqn;
mod agent;
pub mod types;

use std::cell::RefCell;
use std::collections::{HashSet, HashMap};
use crate::agent::agent::Agent;
use agent::baseagent::BaseAgentOptions;
use bot_engine::line::Line;
use bot_engine::vector2d::Vector2d;
use bot_engine::env::Env;
use bot_engine::game::{Game, GameOptions, ObjectFOV};
use bot_engine::map::Map;
use candid::{Principal, CandidType};
use dqn::dqn::DqnOptions;
use agent::dqnagent::DqnAgent;
use ic_cdk::{caller, trap};
use rand::{SeedableRng, Rng, RngCore};
use rand::rngs::StdRng;
use serde::Deserialize;
use types::*;

const TENSORS: &[u8] = include_bytes!("../tensors/15rays-32hidden-60fps-30tps-0.05epsilon.safetensors");
const MAP: &str = include_str!("../maps/map.yaml");

#[derive(Default, Deserialize, CandidType)]
struct State {
    owner: Option<Principal>,
}

thread_local! {
    static STATE: RefCell<State> = RefCell::default();
    static MATCHES: RefCell<HashMap<String, Match>> = RefCell::new(HashMap::default());
    static RNG: RefCell<Option<StdRng>> = RefCell::default();
}

#[ic_cdk::init]
fn init(
) {
    ic_cdk::setup();

    STATE.with(|r| {
        let mut state = r.borrow_mut();
        state.owner = Some(caller());
    });

    _init_rng();
}

fn _init_rng() {
    RNG.with(|r| {
        let mut rng = r.borrow_mut();
        *rng = Some(StdRng::seed_from_u64(ic_cdk::api::time()));
    });
}

#[ic_cdk::pre_upgrade]
fn pre_upgrade() {
    STATE.with(|cell| {
        if let Err(err) = ic_cdk::storage::stable_save::<(&State,)>((
            &cell.borrow(),
        )) {
            trap(&format!(
                "An error occurred when saving to stable memory (pre_upgrade): {:?}",
                err
            ));
        };
    });
}

#[ic_cdk::post_upgrade]
fn post_upgrade() {
    STATE.with(|cell| {
        match ic_cdk::storage::stable_restore::<(State, )>() {
            Ok((s_, )) => {
                cell.replace(s_);
            }
            Err(err) => {
                trap(&format!(
                    "An error occurred when loading from stable memory (post_upgrade): {:?}",
                    err
                ));
            }
        }
    });

    _init_rng();
}

fn _gen_id(
) -> String {
    let (lsu64, msu64) = RNG.with(|r| {
        let mut rng = r.borrow_mut();
        let rng = rng.as_mut().unwrap();
        (rng.next_u64(), rng.next_u64())
    });
    ulid::Ulid::from_parts(ic_cdk::api::time() / 1000000, (msu64 as u128) << 64 | (lsu64 as u128)).to_string()
}

#[ic_cdk::update]
pub fn match_create(
    req: MatchCreateRequest
) -> Result<MatchCreateResponse, String> {
    
    let caller = &caller();
    
    let id = _gen_id();

    MATCHES.with(|r| {
        r.borrow_mut().insert(
            id.clone(), 
            Match { 
                options: req.options, 
                state: MatchState { 
                    status: MatchStatus::CREATED,
                    created_at: 0,
                    created_by: caller.to_string(),
                    started_at: None,
                    started_by: None,
                    won_at: None,
                    won_by: None,
                    steps: vec![],
                },
                players: HashSet::default(),
                game: None,
                agent: None,
            }
        );
    });

    Ok(MatchCreateResponse{
        id
    })
}

#[ic_cdk::update]
pub fn match_join(
    req: MatchJoinRequest
) -> Result<MatchJoinResponse, String> {
    MATCHES.with(|r| {
        let mut matches = r.borrow_mut();
        
        let m_tch = match matches.get_mut(&req.id) {
            None => return Err("Unknown match".to_string()),
            Some(m) => m
        };

        if m_tch.players.len() >= m_tch.options.max_players {
            return Err("Too many players".to_string());
        }

        let caller = &caller();
        
        m_tch.players.insert(caller.to_string());

        Ok(MatchJoinResponse { 
            id: caller.to_string()
        })
    })
}

#[ic_cdk::update]        
pub fn match_start(
    req: MatchStartRequest
) -> Result<(), String> {     
    MATCHES.with(|r| {
        let mut matches = r.borrow_mut();
        
        let m_tch = match matches.get_mut(&req.id) {
            None => return Err("Unknown match".to_string()),
            Some(m) => m
        };

        if m_tch.players.len() < m_tch.options.min_players {
            return Err("Too few players".to_string());
        }

        let mut map = Map::load_from_string(&MAP.to_string())?;
        map.prepare();
        
        let mut rng = StdRng::seed_from_u64(ic_cdk::api::time());

        let game = Game::new(
            map, 
            GameOptions {
                fps: m_tch.options.fps as f32,
                fov: ObjectFOV { 
                    rays: m_tch.options.rays, 
                    angle: m_tch.options.fov, 
                    max_dist: m_tch.options.player_radius * 2.0,
                },
                num_players: m_tch.players.len(),
                min_keys: 4,
                player_radius: m_tch.options.player_radius,
                debug: false,
                training: false,
            },
            &mut rng
        );

        let options = BaseAgentOptions { 
            dqn: DqnOptions {
                n_actions: game.get_num_actions(),
                n_obs: game.get_num_obs(),
                n_hidden: m_tch.options.num_hidden_layers
            },
            epsilon: m_tch.options.epsilon,
            rng,
        };
        
        let mut agent = DqnAgent::new(&options);

        /*let tensors_path = format!(
            "./weights/{}rays-{}hidden-{}fps-{}tps-{}epsilon.safetensors", 
            m_tch.options.rays, 
            m_tch.options.num_hidden_layers, 
            m_tch.options.fps, 
            m_tch.options.tps, 
            m_tch.options.epsilon
        );*/
    
        agent.load(&TENSORS.to_vec())?;

        m_tch.game = Some(game);
        m_tch.agent = Some(agent);
        m_tch.state.status = MatchStatus::STARTED;

        Ok(())
    })
}

#[ic_cdk::update]
pub fn match_run(
    req: MatchRunRequest
) -> Result<(), String> {
    
    MATCHES.with(|r| {
        let mut matches = r.borrow_mut();
        
        let m_tch = match matches.get_mut(&req.id) {
            None => return Err("Unknown match".to_string()),
            Some(m) => m
        };

        if m_tch.state.status != MatchStatus::STARTED {
            return Err("Invalid match state".to_string());
        }

        m_tch.state.status = MatchStatus::RUNNING;

        let game = m_tch.game.as_mut().unwrap();
        let agent = m_tch.agent.as_mut().unwrap();
        
        let mut num_steps = 1;
        let mut running = true;
        let mut last_thought_step = 0;
        let steps_between_thoughts = (m_tch.options.fps / m_tch.options.tps) as u32;

        let mut obs_vec = vec![]; 

        let obs = &game.reset();
        for i in 0..game.options.num_players {
            obs_vec.push(obs[i].clone());
        }

        let pre = ic_cdk::api::performance_counter(0);

        while running {
            let do_think = num_steps - last_thought_step >= steps_between_thoughts;

            let actions = if do_think  { 
                last_thought_step = num_steps;
                
                let mut actions = vec![0usize; game.options.num_players];

                let players_idx = gen_players_idx(game);
                
                for i in 0..game.options.num_players {
                    let p = players_idx[i];
                    let action = agent.choose_action(obs_vec[p].clone().into())
                        .unwrap_or(game.random_action());

                    actions[p] = action;
                }

                actions.iter()
                    .map(|v| Some(v.clone() as usize))
                    .collect::<Vec<Option<usize>>>()
            } else {
                vec![None; game.options.num_players]
            };

            let step = game.step(&actions, 1.0);
            num_steps += 1;

            m_tch.state.steps.push(MatchStep {
                terminated: step.terminated,
                timedout: step.timedout,
                winner: step.winner,
                entities: game.serialize_entities()?,
            });

            running = !step.terminated && !step.timedout;

            for p in 0..step.players.len() {
                obs_vec[p] = step.players[p].obs.clone();
            }
        }

        m_tch.state.status = MatchStatus::FINISHED;

        let post = ic_cdk::api::performance_counter(0);
        ic_cdk::print((post - pre).to_string());

        Ok(())
    })
}

#[ic_cdk::query]
pub fn get_steps(
    req: MatchStepsRequest
) -> Result<MatchStepsResponse, String> {
    MATCHES.with(|r| {
        let matches = r.borrow();
        
        let m_tch = match matches.get(&req.id) {
            None => return Err("Unknown match".to_string()),
            Some(m) => m
        };

        if ![MatchStatus::STARTED, MatchStatus::FINISHED].contains(&m_tch.state.status) {
            return Err("Invalid match state".to_string());
        }

        let steps = m_tch.state.steps.iter()
            .skip(req.ofs)
            .take(req.len)
            .cloned()
            .collect();
        
        Ok(MatchStepsResponse { 
            steps
        })
    })
}

fn gen_players_idx(
    game: &mut Game<Vector2d, Line<Vector2d>>
) -> Vec<usize> {
    let mut indexes = HashSet::new();

    while indexes.len() < game.options.num_players {
        indexes.insert(game.rng.gen_range(0..game.options.num_players));
    }

    indexes.into_iter().collect()
}

#[cfg(target_arch = "wasm32")]
pub fn always_fail(_buf: &mut [u8]) -> Result<(), getrandom::Error> {
    Err(getrandom::Error::UNSUPPORTED)
}

#[cfg(target_arch = "wasm32")]
getrandom::register_custom_getrandom!(always_fail);

ic_cdk::export_candid!();