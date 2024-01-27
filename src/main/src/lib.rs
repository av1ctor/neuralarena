use std::cell::RefCell;
use std::mem::size_of;
use crate::db::DB;
use candid::Principal;
use db::traits::crud::Pagination;
use ic_cdk::api::stable;
use ic_cdk::{caller, trap};
use models::game::{GameRequest, Game, GameResponse, GameId};
use models::m4tch::{
    Match, MatchId, 
    MatchAssetsResponse, 
    MatchRequest, MatchResponse, 
    MatchStepsResponse
};
use models::user::{UserRequest, UserResponse, User, UserId};
use rand::{SeedableRng, RngCore};
use rand::rngs::StdRng;
use serde::{Deserialize, Serialize};
use services::games::GamesService;
use services::matches::MatchesService;
use services::users::UsersService;
use utils::serdeser;

mod nn;
mod dqn;
mod agent;
mod models;
mod db;
mod services;
mod utils;

const STATE_VERSION: f32 = 0.1;

#[derive(Default, Serialize, Deserialize)]
struct State {
    owner: Option<Principal>,
}

thread_local! {
    static STATE: RefCell<State> = RefCell::default();
    static DB: RefCell<DB> = RefCell::new(DB::new());    
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
    let mut writter = stable::StableWriter::default();
    
    STATE.with(|cell| {
        if let Err(err) = serdeser::serialize(
            cell.to_owned(),
            STATE_VERSION,
            &mut writter
        ) {
            trap(&format!(
                "An error occurred when saving state to stable memory (pre_upgrade): {:?}",
                err
            ));
        };
    });

    DB.with(|db| {
        if let Err(err) = db.borrow().serialize(&mut writter) {
            trap(&format!(
                "An error occurred when saving DB to stable memory (pre_upgrade): {:?}",
                err
            ));
        }
    });
}

#[ic_cdk::post_upgrade]
fn post_upgrade() {
    let mut reader = stable::StableReader::default();

    STATE.with(|cell| {
        match serdeser::deserialize::<State>(
            STATE_VERSION, 
            &mut reader
        ) {
            Ok(s_) => {
                cell.replace(s_);
            }
            Err(err) => {
                trap(&format!(
                    "An error occurred when restoring state from stable memory (post_upgrade): {:?}",
                    err
                ));
            }
        }
    });

    DB.with(|db| {
        if let Err(err) = db.borrow_mut().deserialize(&mut reader) {
            trap(&format!(
                "An error occurred when restoring DB from stable memory (post_upgrade): {:?}",
                err
            ));
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

/*
 * users facade
 */
#[ic_cdk::update]
fn user_create_player(
    req: UserRequest
) -> Result<UserResponse, String> {
    let caller = caller();

    DB.with(|db| {
        let user = User::new(&req, &caller);
        match UsersService::create_player(&user, &mut db.borrow_mut(), &caller) {
            Ok(()) => Ok(user.into()),
            Err(msg) => Err(msg)
        }
    })
}

#[ic_cdk::update]
fn user_create_staff(
    req: UserRequest
) -> Result<UserResponse, String> {
    let caller = caller();

    DB.with(|db| {
        let user = User::new(&req, &caller);
        match UsersService::create_staff(&user, &mut db.borrow_mut(), &caller) {
            Ok(()) => Ok(user.into()),
            Err(msg) => Err(msg)
        }
    })
}

#[ic_cdk::update]
fn user_update(
    id: UserId,
    req: UserRequest
) -> Result<UserResponse, String> {
    let caller = caller();

    DB.with(|db| {
        let user = User::new(&req, &caller);
        match UsersService::update(&id, &user, &mut db.borrow_mut(), &caller) {
            Ok(()) => Ok(user.into()),
            Err(msg) => Err(msg)
        }
    })
}

#[ic_cdk::update]
fn user_delete(
    id: UserId
) -> Result<(), String> {
    let caller = caller();

    DB.with(|db| {
        UsersService::delete(&id, &mut db.borrow_mut(), &caller)
    })
}

 #[ic_cdk::query]
fn user_find_me(
) -> Result<UserResponse, String> {
    let caller = caller();

    DB.with(|db| {
        match UsersService::find_by_id(&caller, &db.borrow(), &caller) {
            Ok(user) => Ok(user.into()),
            Err(msg) => Err(msg)
        }
    })
}

#[ic_cdk::query]
fn user_find_by_id(
    id: UserId
) -> Result<UserResponse, String> {
    let caller = caller();

    DB.with(|db| {
        match UsersService::find_by_id(&id, &db.borrow(), &caller) {
            Ok(user) => Ok(user.into()),
            Err(msg) => Err(msg)
        }
    })
}

#[ic_cdk::query]
fn user_find_matches(
    id: UserId,
    pag: Pagination
) -> Result<Vec<MatchResponse>, String> {
    let caller = caller();

    DB.with(|db| {
        match UsersService::find_matches(&id, pag, &db.borrow(), &caller) {
            Ok(list) => Ok(list.iter().map(|e| e.clone().into()).collect()),
            Err(msg) => Err(msg)
        }
    })
}

/*
 * games facade
 */
#[ic_cdk::update]
fn game_create(
    req: GameRequest
) -> Result<GameResponse, String> {
    let caller = caller();

    DB.with(|db| {
        let id = _gen_id();
        let game = Game::new(&id, &req, &caller);
        match GamesService::create(&id, &game, &mut db.borrow_mut(), &caller) {
            Ok(()) => Ok(game.into()),
            Err(msg) => Err(msg)
        }
    })
}

#[ic_cdk::update]
fn game_update(
    id: GameId,
    req: GameRequest
) -> Result<GameResponse, String> {
    let caller = caller();

    DB.with(|db| {
        let game = Game::new(&id, &req, &caller);
        match GamesService::update(&id, &game, &mut db.borrow_mut(), &caller) {
            Ok(()) => Ok(game.into()),
            Err(msg) => Err(msg)
        }
    })
}

#[ic_cdk::update]
fn game_delete(
    id: GameId
) -> Result<(), String> {
    let caller = caller();

    DB.with(|db| {
        GamesService::delete(&id, &mut db.borrow_mut(), &caller)
    })
}

#[ic_cdk::query]
fn game_find_by_id(
    id: GameId
) -> Result<GameResponse, String> {
    let caller = caller();

    DB.with(|db| {
        match GamesService::find_by_id(&id, &db.borrow(), &caller) {
            Ok(game) => Ok(game.into()),
            Err(msg) => Err(msg)
        }
    })
}

#[ic_cdk::query]
fn game_find_active(
    pag: Pagination
) -> Result<Vec<GameResponse>, String> {
    let caller = caller();

    DB.with(|db| {
        match GamesService::find_active(pag, &db.borrow(), &caller) {
            Ok(list) => Ok(list.iter().map(|e| e.clone().into()).collect()),
            Err(msg) => Err(msg)
        }
    })
}

/*
 * matches facade
 */
#[ic_cdk::update]
pub fn match_create(
    req: MatchRequest
) -> Result<MatchResponse, String> {
    let caller = caller();

    DB.with(|db| {
        let id = _gen_id();
        let mut m4tch = Match::new(&id, &req, &caller);
        match MatchesService::create(&id, &mut m4tch, &mut db.borrow_mut(), &caller) {
            Ok(()) => Ok(m4tch.into()),
            Err(msg) => Err(msg)
        }
    })
}

#[ic_cdk::update]
pub fn match_join(
    id: MatchId
) -> Result<(), String> {
    DB.with(|db| {
        match MatchesService::join(&id, &mut db.borrow_mut(), &caller()) {
            Ok(start) => {
                if start {
                    _ = RNG.with(|rng| {
                        match MatchesService::start(
                            &id, 
                            &mut db.borrow_mut(), 
                            &mut rng.borrow_mut().as_mut().unwrap(), 
                            &caller()
                        ) {
                            Ok(_) => {
                                //FIXME: method should be async so this could return immediately
                                match MatchesService::run(
                                    &id, 
                                    &mut db.borrow_mut(), 
                                    &mut rng.borrow_mut().as_mut().unwrap(), 
                                    &caller()
                                ) {
                                    Ok(_) => {},
                                    Err(msg) => return Err(msg),
                                };

                                Ok(())
                            },
                            Err(msg) => return Err(msg),
                        }
                    });
                }

                Ok(())
            },
            Err(msg) => Err(msg),
        }
    })
}

#[ic_cdk::update]        
pub fn match_start(
    id: MatchId
) -> Result<(), String> {     
    DB.with(|db| {
        RNG.with(|rng| {
            MatchesService::start(
                &id, 
                &mut db.borrow_mut(), 
                &mut rng.borrow_mut().as_mut().unwrap(), 
                &caller()
            )
        })
    })
}

#[ic_cdk::update]
pub fn match_run(
    id: MatchId
) -> Result<(), String> {
    DB.with(|db| {
        RNG.with(|rng| {
            MatchesService::run(
                &id, 
                &mut db.borrow_mut(), 
                &mut rng.borrow_mut().as_mut().unwrap(), 
                &caller()
            )
        })
    })
}

#[ic_cdk::query]
pub fn match_get_assets(
    id: MatchId
) -> Result<MatchAssetsResponse, String> {
    DB.with(|db| {
        match MatchesService::get_assets(&db.borrow(), id) {
            Ok(assets) => {
                Ok(MatchAssetsResponse{
                    assets
                })
            },
            Err(err) => Err(err),
        }
    })
}

#[ic_cdk::query]
pub fn match_get_steps(
    id: MatchId,
    pag: Pagination
) -> Result<MatchStepsResponse, String> {
    DB.with(|db| {
        match MatchesService::steps(&id, pag, &mut db.borrow_mut(), &caller()) {
            Ok(steps) => Ok(MatchStepsResponse{
                steps
            }),
            Err(msg) => Err(msg),
        }
    })
}

#[ic_cdk::query]
fn match_find_by_id(
    id: MatchId
) -> Result<MatchResponse, String> {
    let caller = caller();

    DB.with(|db| {
        match MatchesService::find_by_id(&id, &db.borrow(), &caller) {
            Ok(m) => Ok(m.into()),
            Err(msg) => Err(msg)
        }
    })
}

#[ic_cdk::query]
pub fn match_find_open(
    pag: Pagination
) -> Result<Vec<MatchResponse>, String> {
    let caller = caller();

    DB.with(|db| {
        match MatchesService::find_open(pag, &db.borrow(), &caller) {
            Ok(list) => Ok(list.iter().map(|e| e.clone().into()).collect()),
            Err(msg) => Err(msg)
        }
    })
}

#[ic_cdk::query]
fn match_find_by_game(
    game_id: GameId,
    pag: Pagination
) -> Result<Vec<MatchResponse>, String> {
    let caller = caller();

    DB.with(|db| {
        match MatchesService::find_by_game(game_id, pag, &db.borrow(), &caller) {
            Ok(list) => Ok(list.iter().map(|e| e.clone().into()).collect()),
            Err(msg) => Err(msg)
        }
    })
}

#[cfg(target_arch = "wasm32")]
pub fn always_fail(_buf: &mut [u8]) -> Result<(), getrandom::Error> {
    Err(getrandom::Error::UNSUPPORTED)
}

#[cfg(target_arch = "wasm32")]
getrandom::register_custom_getrandom!(always_fail);

#[no_mangle]
pub unsafe fn malloc(
    size: usize
) -> *mut u8 {
    let align = std::mem::align_of::<usize>();
    let layout = std::alloc::Layout::from_size_align_unchecked(size + size_of::<usize>(), align);
    let ptr = std::alloc::alloc(layout);
    *ptr.cast::<usize>() = size;
    ptr.add(size_of::<usize>())
}

#[no_mangle]
pub unsafe fn free(
    ptr: *mut u8
) {
    let ptr = ptr.sub(size_of::<usize>());
    let size = *ptr.cast::<usize>();
    let align = std::mem::align_of::<usize>();
    let layout = std::alloc::Layout::from_size_align_unchecked(size, align);
    std::alloc::dealloc(ptr, layout);
}

#[no_mangle]
#[allow(non_snake_case)]
pub unsafe fn _ZdlPv(
    _ptr: *mut u8
) {
    panic!("delete called from C++");
}

ic_cdk::export_candid!();