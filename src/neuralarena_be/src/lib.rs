use std::cell::RefCell;
use std::time::Duration;
use crate::db::DB;
use candid::Principal;
use ic_cdk::api::stable;
use ic_cdk::{caller, trap};
use models::game::{GameRequest, Game, GameResponse, GameId};
use models::m4tch::{
    Match, MatchId, MatchJoinRequest, 
    MatchRequest, MatchResponse, MatchStatus
};
use models::nftcol::{
    NftCollection, NftCollectionId, 
    NftCollectionRequest, NftCollectionResponse
};
use models::timer::{Timer, TimerTarget};
use models::user::{
    User, UserId, UserNftsRequest, UserRequest, UserResponse
};
use neuralarena_cdk::{
    db::traits::crud::Pagination,
    models::{
        instance::{
            InstanceAssetsResponse,
            InstanceStepsResponse
        },
        game::GameEndCredits
    },
    utils::{
        serdeser, random
    }
};
use serde::{Deserialize, Serialize};
use services::games::GamesService;
use services::leaderboards::LeaderboardsService;
use services::matches::MatchesService;
use services::nftcols::NftCollectionsService;
use services::timers::TimersService;
use services::users::UsersService;

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
}

#[ic_cdk::init]
fn init(
) {
    ic_cdk::setup();

    STATE.with(|r| {
        let mut state = r.borrow_mut();
        state.owner = Some(caller());
    });

    random::init();
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

    random::init();

    _restart_timers();
}

fn _restart_timers(
) {
    DB.with(|db| {
        let timers = TimersService::find_all(&db.borrow());
        let mut delay = 15;
        for mut timer in timers {
            match timer.target {
                TimerTarget::Match(match_id) => {
                    if let Ok(m4tch) = MatchesService::find_by_id(&match_id, &db.borrow()) {
                        let elapsed = (ic_cdk::api::time() - m4tch.created_at) / 1_000_000_000;
                        let remaining = if elapsed >= m4tch.deadline {
                            delay
                        } 
                        else {
                            (m4tch.deadline - elapsed).max(delay)
                        };

                        delay += 4;

                        timer.timer_id = Some(ic_cdk_timers::set_timer(
                            Duration::from_secs(remaining), 
                            || ic_cdk::spawn(_run_match_after_time_expired(match_id))
                        ));
                    }
                },
            }
        }
    });
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
async fn user_update_nfts(
    id: UserId,
    req: UserNftsRequest
) -> Result<UserResponse, String> {
    let caller = &caller();

    let mut user = DB.with(|db| -> Result<User, String> {
        
        let user = UsersService::find_by_id(
            &id, &db.borrow())?;

        // verify if all NFT's are registered, active and not banned
        for req_nft in &req.nfts {
            let nft = NftCollectionsService::find_by_id(
                &req_nft.collection_id, &db.borrow())?;
            if !nft.active {
                return Err("NFT inactive".to_string());
            }
            if nft.banned {
                return Err("NFT banned".to_string());
            }
        }

        Ok(user)
    })?;

    let nfts = UsersService::verify_nfts(&user, &req.nfts).await?;

    DB.with(|db| {
        match UsersService::update_nfts(
            &mut user, nfts, &mut db.borrow_mut(), &caller) {
            Ok(_) => Ok(user.into()),
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
        match UsersService::find_by_id(&caller, &db.borrow()) {
            Ok(user) => Ok(user.into()),
            Err(msg) => Err(msg)
        }
    })
}

#[ic_cdk::query]
fn user_find_by_id(
    id: UserId
) -> Result<UserResponse, String> {

    DB.with(|db| {
        match UsersService::find_by_id(&id, &db.borrow()) {
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
            Ok(list) => 
                Ok(list.iter()
                    .map(|e| e.clone().into())
                    .collect()
                ),
            Err(msg) => Err(msg)
        }
    })
}

/*
 * games facade
 */
#[ic_cdk::update]
async fn game_create(
    req: GameRequest
) -> Result<GameResponse, String> {
    let caller = &caller();

    let user = DB.with(|db| -> Result<User, String> {
        let user = UsersService::find_by_id(
            caller, &db.borrow())?;

        Ok(user)
    })?;

    let game = GamesService::create(&req, &user).await?;

    DB.with(|db| {
        GamesService::insert(
            &game,
            &mut db.borrow_mut()
        )
    })?;

    Ok(game.into())
}

#[ic_cdk::update]
async fn game_update(
    id: GameId,
    req: GameRequest
) -> Result<GameResponse, String> {
    let caller = &caller();

    let (user, mut game) = DB.with(
        |db| -> Result<(User, Game), String> {
        
        let user = UsersService::find_by_id(
            caller, &db.borrow())?;

        let game = GamesService::find_by_id(
            &id, &db.borrow())?;

        Ok((user, game))
    })?;

    GamesService::reload(&req, &mut game, &user).await?;

    DB.with(|db| {
        GamesService::update(
            &game,
            &mut db.borrow_mut()
        )
    })?;

    Ok(game.into())
}

#[ic_cdk::query]
fn game_find_by_id(
    id: GameId
) -> Result<GameResponse, String> {

    DB.with(|db| {
        match GamesService::find_by_id(&id, &db.borrow()) {
            Ok(game) => Ok(game.into()),
            Err(msg) => Err(msg)
        }
    })
}

#[ic_cdk::query]
fn game_find_all(
    pag: Pagination
) -> Result<Vec<GameResponse>, String> {

    DB.with(|db| {
        match GamesService::find_all(pag, &db.borrow()) {
            Ok(list) => 
                Ok(list.iter()
                    .map(|e| e.clone().into())
                    .collect()
                ),
            Err(msg) => Err(msg)
        }
    })
}

#[ic_cdk::query]
fn game_find_active(
    pag: Pagination
) -> Result<Vec<GameResponse>, String> {

    DB.with(|db| {
        match GamesService::find_active(pag, &db.borrow()) {
            Ok(list) => 
                Ok(list.iter()
                    .map(|e| e.clone().into())
                    .collect()
                ),
            Err(msg) => Err(msg)
        }
    })
}

#[ic_cdk::query]
fn game_get_leaderboard(
    game_id: GameId,
    limit: u32
) -> Result<Vec<(UserId, f32)>, String> {

    DB.with(|db| {
        LeaderboardsService::find_top(&game_id, limit.max(100) as _, &db.borrow())
    })
}

#[ic_cdk::query(composite = true)]
pub async fn game_get_end_credits(
    id: GameId
) -> Result<GameEndCredits, String> {
    
    let game = DB.with(|db| -> Result<Game, String> {
        let game = GamesService::find_by_id(
            &id, &db.borrow())?;

        Ok(game)
    })?;

    GamesService::get_end_credits(&game).await
}

/*
 * nft collections facade
 */
#[ic_cdk::update]
async fn nft_col_create(
    req: NftCollectionRequest
) -> Result<NftCollectionResponse, String> {
    let caller = &caller();

    let user = DB.with(|db| -> Result<User, String> {
        let user = UsersService::find_by_id(
            caller, &db.borrow())?;

        Ok(user)
    })?;

    let col = NftCollectionsService::create(&req, &user).await?;

    DB.with(|db| {
        NftCollectionsService::insert(
            &col,
            &mut db.borrow_mut()
        )
    })?;

    Ok(col.into())
}

#[ic_cdk::update]
async fn nft_col_update(
    id: NftCollectionId
) -> Result<NftCollectionResponse, String> {
    let caller = &caller();

    let (user, mut col) = DB.with(|db| -> Result<(User, NftCollection), String> {
        let user = UsersService::find_by_id(
            caller, &db.borrow())?;

        let col = NftCollectionsService::find_by_id(
            &id, &db.borrow())?;

        Ok((user, col))
    })?;

    NftCollectionsService::reload(&mut col, &user).await?;

    DB.with(|db| {
        NftCollectionsService::update(
            &col,
            &mut db.borrow_mut()
        )
    })?;

    Ok(col.into())
}

#[ic_cdk::query]
fn nft_col_find_by_id(
    id: NftCollectionId
) -> Result<NftCollectionResponse, String> {

    DB.with(|db| {
        match NftCollectionsService::find_by_id(&id, &db.borrow()) {
            Ok(col) => Ok(col.into()),
            Err(msg) => Err(msg)
        }
    })
}

#[ic_cdk::query]
fn nft_col_find_all(
    pag: Pagination
) -> Result<Vec<NftCollectionResponse>, String> {

    DB.with(|db| {
        match NftCollectionsService::find_all(pag, &db.borrow()) {
            Ok(list) => 
                Ok(list.iter()
                    .map(|e| e.clone().into())
                    .collect()
                ),
            Err(msg) => Err(msg)
        }
    })
}

#[ic_cdk::query]
fn nft_col_find_active(
    pag: Pagination
) -> Result<Vec<NftCollectionResponse>, String> {

    DB.with(|db| {
        match NftCollectionsService::find_active(pag, &db.borrow()) {
            Ok(list) => 
                Ok(list.iter()
                    .map(|e| e.clone().into())
                    .collect()
                ),
            Err(msg) => Err(msg)
        }
    })
}

/*
 * matches facade
 */
#[ic_cdk::update]
pub async fn match_create(
    req: MatchRequest
) -> Result<MatchResponse, String> {
    let caller = &caller();

    let (user, game) = DB.with(
        |db| -> Result<(User, Game), String> {
        
        let user = UsersService::find_by_id(
            caller, &db.borrow())?;

        let game = GamesService::find_by_id(
            &req.game.id, &db.borrow())?;

        Ok((user, game))
    })?;

    let mut m4tch = MatchesService::create(&req, &game, &user).await?;
    
    let mut timer = TimersService::create(
        m4tch.deadline, 
        TimerTarget::Match(m4tch.id.clone())
    );

    m4tch.timer_id = Some(timer.id.clone());

    let match_id = m4tch.id.clone();

    timer.timer_id = Some(ic_cdk_timers::set_timer(
        Duration::from_secs(m4tch.deadline), 
        || ic_cdk::spawn(_run_match_after_time_expired(match_id))
    ));

    DB.with(|db| -> Result<(), String> {
        MatchesService::insert(
            &m4tch,
            &mut db.borrow_mut()
        )?;

        TimersService::insert(
            &timer,
            &mut db.borrow_mut()
        )?;

        Ok(())
    })?;

    Ok(m4tch.into())
}

#[ic_cdk::update]
pub async fn match_join(
    req: MatchJoinRequest
) -> Result<(), String> {
    let caller = &caller();

    let (user, mut m4tch, game, nft_col, mut timer) = DB.with(
        |db| -> Result<(User, Match, Game, NftCollection, Timer), String> {
        
        let user = UsersService::find_by_id(
            caller, &db.borrow())?;

        let m4tch = MatchesService::find_by_id(
            &req.id, &db.borrow())?;
    
        let game = GamesService::find_by_id(
            &m4tch.game.id, &db.borrow())?;

        let nft_col = NftCollectionsService::find_by_id(
            &req.nft.collection_id, &db.borrow())?;

        let timer = TimersService::find_by_id(
            m4tch.timer_id.as_ref().unwrap(), &db.borrow())?;
                
        Ok((user, m4tch, game, nft_col, timer))
    })?;

    match MatchesService::join(
        &mut m4tch, &game, &user, &req.nft, &nft_col).await {
        Ok(start) => {
            DB.with(|db| {
                MatchesService::update(&m4tch, &mut db.borrow_mut())
            })?;

            // max number of players reached?
            if start {
                // NOTE: must reload from DB because we called an async fn above and the match timer
                //       can have been expired already
                let m4tch = DB.with(|db| -> Result<Match, String> {
                    MatchesService::find_by_id(&req.id, &db.borrow())
                })?;
                
                if m4tch.state.status == MatchStatus::OPEN {
                    // cancel the current timer and create a new one with a 5 seconds delay
                    TimersService::cancel(&timer);

                    timer.timer_id = Some(ic_cdk_timers::set_timer(
                        Duration::from_secs(5), 
                        || ic_cdk::spawn(_run_match_after_time_expired(m4tch.id))
                    ));
                    
                    DB.with(|db| {
                        TimersService::update(&timer, &mut db.borrow_mut())
                    })?;
                }

                Ok(())
            }
            else {
                Ok(())
            }
        },
        Err(msg) => Err(msg),
    }
}

async fn _run_match(
    m4tch: &mut Match,
    game: &Game
) -> Result<(), String> {
    // mark as running and save
    m4tch.state.status = MatchStatus::RUNNING;
    m4tch.started_at = Some(ic_cdk::api::time());

    DB.with(|db| {
        MatchesService::update(m4tch, &mut db.borrow_mut())
    })?;

    // run and save the result
    let initial_seed = random::next_u64();
    MatchesService::run(m4tch, game, initial_seed).await?;

    DB.with(|db| -> Result<(), String> {
        MatchesService::update(m4tch, &mut db.borrow_mut())?;

        // update game's leader board
        let mut db_ref = db.borrow_mut();
        let leaderboard = LeaderboardsService::find_by_id_mut(
            &m4tch.game.id, &mut db_ref)?;

        for player in &m4tch.state.players {
            *leaderboard.entry(player.id).or_insert(0.0) += player.state.score;
        }

        Ok(())
    })?;

    Ok(())
}

async fn _run_match_after_time_expired(
    id: MatchId
)  {     
    let (mut m4tch, game) = DB.with(
        |db| -> Result<(Match, Game), String> {
        
        let m4tch = MatchesService::find_by_id(
            &id, &db.borrow())?;
    
        let game = GamesService::find_by_id(
            &m4tch.game.id, &db.borrow())?;

        _ = TimersService::delete(
            &m4tch.timer_id.as_ref().unwrap(), 
            &mut db.borrow_mut()
        );
    
        Ok((m4tch, game))
    }).unwrap();

    // not enough players? cancel it..
    if m4tch.state.players.len() < m4tch.game.min_players {        
        m4tch.state.status = MatchStatus::EXPIRED;
        DB.with(|db| {
            MatchesService::update(&mut m4tch, &mut db.borrow_mut())
        }).unwrap();
    }
    else {
        _run_match(&mut m4tch, &game).await.unwrap();
    }
}

#[ic_cdk::query(composite = true)]
pub async fn match_get_assets(
    id: MatchId
) -> Result<InstanceAssetsResponse, String> {
    
    let (m4tch, game) = DB.with(
        |db| -> Result<(Match, Game), String> {
        
        let m4tch = MatchesService::find_by_id(
            &id, &db.borrow())?;
        let game = GamesService::find_by_id(
            &m4tch.game.id, &db.borrow())?;

        Ok((m4tch, game))
    })?;

    MatchesService::get_assets(&m4tch, &game).await
}

#[ic_cdk::query(composite = true)]
pub async fn match_get_steps(
    id: MatchId,
    pag: Pagination
) -> Result<InstanceStepsResponse, String> {
    
    let (m4tch, game) = DB.with(
        |db| -> Result<(Match, Game), String> {
        
        let m4tch = MatchesService::find_by_id(
            &id, &db.borrow())?;
        let game = GamesService::find_by_id(
            &m4tch.game.id, &db.borrow())?;

        Ok((m4tch, game))
    })?;

    MatchesService::get_steps(&m4tch, &game, pag).await
}

#[ic_cdk::query]
fn match_find_by_id(
    id: MatchId
) -> Result<MatchResponse, String> {

    DB.with(|db| {
        match MatchesService::find_by_id(&id, &db.borrow()) {
            Ok(m) => Ok(m.into()),
            Err(msg) => Err(msg)
        }
    })
}

#[ic_cdk::query]
pub fn match_find_all(
    pag: Pagination
) -> Result<Vec<MatchResponse>, String> {

    DB.with(|db| {
        match MatchesService::find_all(pag, &db.borrow()) {
            Ok(list) => 
                Ok(list.iter()
                    .map(|e| e.clone().into())
                    .collect()
                ),
            Err(msg) => Err(msg)
        }
    })
}

#[ic_cdk::query]
pub fn match_find_open(
    pag: Pagination
) -> Result<Vec<MatchResponse>, String> {

    DB.with(|db| {
        match MatchesService::find_open(pag, &db.borrow()) {
            Ok(list) => 
                Ok(list.iter()
                    .map(|e| e.clone().into())
                    .collect()
                ),
            Err(msg) => Err(msg)
        }
    })
}

#[ic_cdk::query]
fn match_find_by_game(
    game_id: GameId,
    pag: Pagination
) -> Result<Vec<MatchResponse>, String> {

    DB.with(|db| {
        match MatchesService::find_by_game(
            game_id, pag, &db.borrow()) {
            Ok(list) => 
                Ok(list.iter()
                    .map(|e| e.clone().into())
                    .collect()
                ),
            Err(msg) => Err(msg)
        }
    })
}

ic_cdk::export_candid!();