use std::collections::HashSet;

use bot_engine::env::Env;
use bot_engine::game::{Game, GameOptions, ObjectFOV};
use bot_engine::line::Line;
use bot_engine::map::Map;
use bot_engine::vector2d::Vector2d;
use candid::Principal;
use rand::Rng;
use rand::rngs::StdRng;
use crate::agent::agent::Agent;
use crate::agent::baseagent::BaseAgentOptions;
use crate::agent::dqnagent::DqnAgent;
use crate::db::traits::crud::{CrudSubscribable, Crud, Pagination};
use crate::dqn::dqn::DqnOptions;
use crate::models::m4tch::{Match, MatchId, MatchStatus, MatchStep};
use crate::db::DB;
use crate::models::user::UserKind;

use super::users::UsersService;

const TENSORS: &[u8] = include_bytes!("../../tensors/15rays-32hidden-60fps-30tps-0.05epsilon.safetensors");
const MAP: &str = include_str!("../../maps/map.yaml");

pub struct MatchesService {}

impl MatchesService {
    pub fn create(
        id: &MatchId,
        m4tch: &Match,
        db: &mut DB,
        caller: &Principal
    ) -> Result<(), String> {
        Self::authorize(caller, db)?;

        db.matches.borrow_mut().insert_and_notify(id.clone(), m4tch.clone())
    }

    pub fn join(
        id: &MatchId,
        db: &mut DB,
        caller: &Principal
    ) -> Result<(), String> {
        Self::authorize(caller, db)?;
        
        let mut matches = db.matches.borrow_mut();

        let mut m4tch = match matches.find_by_id(id) {
            None => return Err("Not found".to_string()),
            Some(e) => e.clone()
        };

        if m4tch.players.len() >= m4tch.options.max_players {
            return Err("Too many players".to_string());
        }

        if m4tch.state.status != MatchStatus::CREATED {
            return Err("Invalid match state".to_string());
        }

        if m4tch.players.contains(caller) {
            return Err("Already part of the match".to_string());
        }

        m4tch.players.insert(caller.clone());

        matches.update_and_notify(id.to_owned(), m4tch.to_owned())
    }

    pub fn start(
        id: &MatchId,
        db: &mut DB,
        rng: &mut StdRng,
        caller: &Principal
    ) -> Result<(), String> {
        Self::authorize(caller, db)?;
        
        let mut matches = db.matches.borrow_mut();

        let mut m4tch = match matches.find_by_id(id) {
            None => return Err("Not found".to_string()),
            Some(e) => e.clone()
        };

        if m4tch.players.len() < m4tch.options.min_players {
            return Err("Too few players".to_string());
        }

        if m4tch.state.status != MatchStatus::CREATED {
            return Err("Invalid match state".to_string());
        }

        let mut map = Map::load_from_string(&MAP.to_string())?;
        map.prepare();
        
        let game = Game::new(
            map, 
            GameOptions {
                fps: m4tch.options.fps as f32,
                fov: ObjectFOV { 
                    rays: m4tch.options.rays, 
                    angle: m4tch.options.fov, 
                    max_dist: m4tch.options.player_radius * 2.0,
                },
                num_players: m4tch.players.len(),
                min_keys: 4,
                player_radius: m4tch.options.player_radius,
                debug: false,
                training: false,
            },
            rng
        );

        let options = BaseAgentOptions { 
            dqn: DqnOptions {
                n_actions: game.get_num_actions(),
                n_obs: game.get_num_obs(),
                n_hidden: m4tch.options.num_hidden_layers
            },
            epsilon: m4tch.options.epsilon,
        };
        
        let mut agent = DqnAgent::new(&options);

        /*let tensors_path = format!(
            "./weights/{}rays-{}hidden-{}fps-{}tps-{}epsilon.safetensors", 
            m4tch.options.rays, 
            m4tch.options.num_hidden_layers, 
            m4tch.options.fps, 
            m4tch.options.tps, 
            m4tch.options.epsilon
        );*/
    
        agent.load(&TENSORS.to_vec())?;

        m4tch.game = Some(game);
        m4tch.agent = Some(agent);
        m4tch.state.status = MatchStatus::STARTED;

        matches.update_and_notify(id.to_owned(), m4tch.to_owned())?;

        Ok(())
    }

    pub fn run(
        id: &MatchId,
        db: &mut DB,
        rng: &mut StdRng,
        caller: &Principal
    ) -> Result<(), String> {
        Self::authorize(caller, db)?;
        
        let mut matches = db.matches.borrow_mut();

        let mut m4tch = match matches.find_by_id(id) {
            None => return Err("Not found".to_string()),
            Some(e) => e.clone()
        };

        if m4tch.players.len() < m4tch.options.min_players {
            return Err("Too few players".to_string());
        }

        if m4tch.state.status != MatchStatus::STARTED {
            return Err("Invalid match state".to_string());
        }

        m4tch.state.status = MatchStatus::RUNNING;

        let game = m4tch.game.as_mut().unwrap();
        let agent = m4tch.agent.as_mut().unwrap();
        
        let mut num_steps = 1;
        let mut running = true;
        let mut last_thought_step = 0;
        let steps_between_thoughts = (m4tch.options.fps / m4tch.options.tps) as u32;

        let mut obs_vec = vec![]; 

        let obs = &game.reset(rng);
        for i in 0..game.options.num_players {
            obs_vec.push(obs[i].clone());
        }

        let pre = ic_cdk::api::performance_counter(0);

        while running {
            let do_think = num_steps - last_thought_step >= steps_between_thoughts;

            let actions = if do_think  { 
                last_thought_step = num_steps;
                
                let mut actions = vec![0usize; game.options.num_players];

                let players_idx = Self::gen_players_idx(game, rng);
                
                for i in 0..game.options.num_players {
                    let p = players_idx[i];
                    let action = agent.choose_action(obs_vec[p].clone().into(), rng)
                        .unwrap_or(game.random_action(rng));

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

            m4tch.state.steps.push(MatchStep {
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

        m4tch.state.status = MatchStatus::FINISHED;

        let post = ic_cdk::api::performance_counter(0);
        ic_cdk::print((post - pre).to_string());

        matches.update_and_notify(id.to_owned(), m4tch.to_owned())?;

        Ok(())
    }

    fn gen_players_idx(
        game: &mut Game<Vector2d, Line<Vector2d>>,
        rng: &mut StdRng
    ) -> Vec<usize> {
        let mut indexes = HashSet::new();
    
        while indexes.len() < game.options.num_players {
            indexes.insert(rng.gen_range(0..game.options.num_players));
        }
    
        indexes.into_iter().collect()
    }

    pub fn _delete(
        id: &MatchId,
        db: &mut DB,
        caller: &Principal
    ) -> Result<(), String> {
        Self::authorize(caller, db)?;
        
        let mut matches = db.matches.borrow_mut();

        let m4tch = match matches.find_by_id(id) {
            None => return Err("Not found".to_string()),
            Some(e) => e
        };

        if *caller != m4tch.created_by {
            return Err("Forbidden".to_string());
        }

        if m4tch.state.status != MatchStatus::CREATED {
            return Err("Invalid match state".to_string());
        }
        
        matches.delete_and_notify(id)
    }

    pub fn steps(
        id: &MatchId,
        pag: Pagination,
        db: &mut DB,
        _caller: &Principal
    ) -> Result<Vec<MatchStep>, String> {
        let matches = db.matches.borrow_mut();

        let m4tch = match matches.find_by_id(id) {
            None => return Err("Not found".to_string()),
            Some(e) => e
        };

        if ![MatchStatus::STARTED, MatchStatus::FINISHED].contains(&m4tch.state.status) {
            return Err("Invalid match state".to_string());
        }

        Ok(m4tch.state.steps.iter()
            .skip(pag.offset as usize)
            .take(pag.limit as usize)
            .cloned()
            .collect())
    }

    fn authorize(
        caller: &Principal, 
        db: &mut DB
    ) -> Result<(), String> {
        if *caller == Principal::anonymous() {
            return Err("Anonymous not allowed".to_string());
        }
        
        let user = match UsersService::find_by_id(caller, db, caller) {
            Ok(e) => e,
            Err(msg) => return Err(msg),
        };
    
        if let UserKind::Player(_player) = user.kind {
        }
        else {
            return Err("Forbidden".to_string());
        }

        Ok(())
    }
}
