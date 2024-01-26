use std::collections::{BTreeSet, HashMap, HashSet};
use brains_engine::{
    asset::GameAsset, 
    env::{Env, AssetId}, 
    game::{Game, GameOptions, ObjectFOV, LevelOptions}, 
    map::Map
};
use candid::Principal;
use rand::Rng;
use rand::rngs::StdRng;
use crate::{agent::agent::Agent, utils::null_renderer::NullRenderer, nn::tensor::Tensor};
use crate::agent::baseagent::BaseAgentOptions;
use crate::agent::dqnagent::DqnAgent;
use crate::db::traits::crud::{CrudSubscribable, Crud, Pagination};
use crate::dqn::dqn::DqnOptions;
use crate::models::game::GameId;
use crate::models::m4tch::{Match, MatchId, MatchStatus, MatchStep};
use crate::db::DB;
use crate::models::user::UserKind;
use super::users::UsersService;

const TENSORS: &[u8] = include_bytes!("../../tensors/15rays-32hidden-0.05epsilon.safetensors");
const MAP: &[u8] = include_bytes!("../../maps/map-no-tex.glb");
const NAVMESH: &[u8] = include_bytes!("../../maps/navmesh.bin");

struct Player {
    last_thought: u32,
    steps_per_thought: u32,
    obs: Tensor,
}
pub struct MatchesService {}

impl MatchesService {
    pub fn get_assets(
        db: &DB,
        id: MatchId
    ) -> Result<HashMap<AssetId, GameAsset>, String> {
        let matches = db.matches.borrow_mut();

        let m4tch = match matches.find_by_id(&id) {
            None => return Err("Not found".to_string()),
            Some(e) => e.clone()
        };

        let game = m4tch.game.as_ref().unwrap();

        let assets = game.get_assets();
        Ok(assets)
    }

    pub fn create(
        id: &MatchId,
        m4tch: &mut Match,
        db: &mut DB,
        caller: &Principal
    ) -> Result<(), String> {
        Self::authorize(caller, db)?;

        let rays = m4tch.options.game_options["rays"].parse::<usize>()
            .map_err(|err| err.to_string())?;
        let angle = m4tch.options.game_options["fov"].parse::<f32>()
            .map_err(|err| err.to_string())?;
        let player_radius = m4tch.options.game_options["player_radius"].parse::<f32>()
            .map_err(|err| err.to_string())?;
        
        let game = Game::new(
            Map::new(MAP, NAVMESH),
            GameOptions {
                level: LevelOptions {
                    num: 0
                },
                fov: ObjectFOV { 
                    rays, 
                    angle, 
                    max_dist: 2.5,
                },
                num_players: 0,
                min_keys: 4,
                max_steps: 60 * 30,
                player_radius,
                debug: false,
                training: false,
            }
        );

        m4tch.game = Some(game);
    
        db.matches.borrow_mut().insert_and_notify(id.clone(), m4tch.clone())
    }

    pub fn find_by_id(
        id: &MatchId,
        db: &DB,
        _caller: &Principal
    ) -> Result<Match, String> {
        let matches = db.matches.borrow();

        let m4tch = match matches.find_by_id(id) {
            None => return Err("Not found".to_string()),
            Some(e) => e
        };

        Ok((*m4tch).clone())
    }

    pub fn find_open(
        pag: Pagination,
        db: &DB,
        _caller: &Principal
    ) -> Result<Vec<Match>, String> {
        let matches = db.matches.borrow();
        
        let mut arr = matches.data.0.iter()
            .map(|v| v.1)
            .filter(|m| m.status == MatchStatus::CREATED)
            .cloned()
            .collect::<Vec<_>>();

        arr.sort_by(|a, b| b.created_at.cmp(&a.created_at));
        
        Ok(arr.iter()
            .skip(pag.offset as usize)
            .take(pag.limit as usize)
            .cloned()
            .collect())
    }    

    pub fn find_by_game(
        game_id: GameId,
        pag: Pagination,
        db: &DB,
        _caller: &Principal
    ) -> Result<Vec<Match>, String> {
        let matches_rel = db.game_matches_rel.borrow();
        
        let ids = matches_rel.data.0.get(&game_id).cloned().unwrap_or(BTreeSet::new());

        let mut arr = ids.iter()
            .map(|id| db.matches.borrow().data.0[id].clone())
            .collect::<Vec<_>>();

        arr.sort_by(|a, b| b.created_at.cmp(&a.created_at));
        
        Ok(arr.iter()
            .skip(pag.offset as usize)
            .take(pag.limit as usize)
            .cloned()
            .collect())
    }

    pub fn join(
        id: &MatchId,
        db: &mut DB,
        caller: &Principal
    ) -> Result<bool, String> {
        Self::authorize(caller, db)?;
        
        let mut matches = db.matches.borrow_mut();

        let mut m4tch = match matches.find_by_id(id) {
            None => return Err("Not found".to_string()),
            Some(e) => e.clone()
        };

        let num_players = m4tch.players.len();
        if  num_players >= m4tch.options.max_players {
            return Err("Too many players".to_string());
        }

        if m4tch.status != MatchStatus::CREATED {
            return Err("Invalid match state".to_string());
        }

        if m4tch.players.contains_key(caller) {
            return Err("Already part of the match".to_string());
        }

        m4tch.players.insert(caller.clone(), num_players);

        let ok_to_run = m4tch.players.len() == m4tch.options.max_players;
        
        matches.update_and_notify(id.to_owned(), m4tch)?;

        Ok(ok_to_run)
    }

    pub fn start(
        id: &MatchId,
        db: &mut DB,
        _rng: &mut StdRng,
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

        if m4tch.status != MatchStatus::CREATED {
            return Err("Invalid match state".to_string());
        }

        // update game
        let game = m4tch.game.as_mut().unwrap();

        game.options.num_players = m4tch.players.len();

        // create the agent
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
            "./weights/{}rays-{}hidden-{}epsilon.safetensors", 
            m4tch.options.rays, 
            m4tch.options.num_hidden_layers, 
            m4tch.options.fps, 
            m4tch.options.tps, 
            m4tch.options.epsilon
        );*/
    
        agent.load(&TENSORS.to_vec())?;

        m4tch.agent = Some(agent);

        // start match
        m4tch.status = MatchStatus::STARTED;

        matches.update_and_notify(id.clone(), m4tch)
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

        if m4tch.status != MatchStatus::STARTED {
            return Err("Invalid match state".to_string());
        }

        m4tch.status = MatchStatus::RUNNING;

        let game = m4tch.game.as_mut().unwrap();
        let mut renderer = NullRenderer::new();
        let agent = m4tch.agent.as_mut().unwrap();
        
        let mut steps = 0;
        let mut running = true;

        let mut players = vec![];
        let obs = &game.reset(&mut renderer, rng);
        for i in 0..game.options.num_players {
            let steps_per_thought = rng.gen_range(1000..10000);
            players.push(Player {
                last_thought: 0,
                steps_per_thought,
                obs: obs[i].to_owned().into(),
            });
        }

        let pre = ic_cdk::api::performance_counter(0);

        while running && steps < game.options.max_steps {

            let mut actions = vec![None; game.options.num_players];

            let players_idx = Self::shuffle_players_idx(game, rng);
            
            for i in 0..game.options.num_players {
                let p = players_idx[i];
                let player = &mut players[p];
                
                player.last_thought += 1000;
                if player.last_thought >= player.steps_per_thought {
                    player.last_thought = 0;

                    actions[p] = match agent.choose_action(player.obs.clone(), rng) {
                        Some(action) => Some(action),
                        None => Some(game.random_action(rng)),
                    };
                }
            }

            let step = game.step(&actions, 1.0, &mut renderer);
            steps += 1;

            let entities = game.serialize_entities()?;
            let events = game.serialize_events()?;

            m4tch.state.steps.push(MatchStep {
                terminated: step.terminated,
                timedout: step.timedout,
                entities,
                events,
            });

            running = !step.terminated && !step.timedout;

            if let Some(winner) = step.winner {
                let player_ids = m4tch.players.iter().map(|p| p.0).collect::<Vec<_>>();

                m4tch.won_by = Some(player_ids[winner].clone());
                m4tch.won_at = Some(ic_cdk::api::time());
            }

            for i in 0..step.players.len() {
                players[i].obs = step.players[i].obs.to_owned().into();
            }

            game.clear_events();
        }

        m4tch.status = MatchStatus::FINISHED;

        let post = ic_cdk::api::performance_counter(0);
        ic_cdk::print((post - pre).to_string());

        matches.update_and_notify(id.to_owned(), m4tch)
    }

    fn shuffle_players_idx(
        game: &mut Game,
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

        if m4tch.status != MatchStatus::CREATED {
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

        if ![MatchStatus::STARTED, MatchStatus::FINISHED]
            .contains(&m4tch.status) {
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
        //FIXME: remove this by-pass when the UI is done
        if false {
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
        }

        Ok(())
    }
}
