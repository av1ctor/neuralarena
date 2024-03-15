use std::cell::RefCell;
use crate::db::DB;
use candid::Principal;
use ic_cdk::api::stable;
use ic_cdk::{caller, trap};
use models::game::{GameRequest, Game, GameResponse, GameId};
use models::m4tch::{
    Match, MatchId, MatchJoinRequest, 
    MatchRequest, MatchResponse
};
use models::nftcol::{
    NftCollection, NftCollectionId, 
    NftCollectionRequest, NftCollectionResponse
};
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
use services::matches::MatchesService;
use services::nftcols::NftCollectionsService;
use services::users::UsersService;

mod models;
mod db;
mod services;

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
            &id, &db.borrow(), caller)?;

        // verify if all NFT's are registered, active and not banned
        for req_nft in &req.nfts {
            let nft = NftCollectionsService::find_by_id(
                &req_nft.collection_id, &db.borrow(), caller)?;
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
async fn game_create(
    req: GameRequest
) -> Result<GameResponse, String> {
    let caller = &caller();

    let user = DB.with(|db| -> Result<User, String> {
        let user = UsersService::find_by_id(
            caller, &db.borrow(), caller)?;

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

    let (user, mut game) = DB.with(|db| -> Result<(User, Game), String> {
        let user = UsersService::find_by_id(
            caller, &db.borrow(), caller)?;

        let game = GamesService::find_by_id(
            &id, &db.borrow(), caller)?;

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
    let caller = caller();

    DB.with(|db| {
        match GamesService::find_by_id(&id, &db.borrow(), &caller) {
            Ok(game) => Ok(game.into()),
            Err(msg) => Err(msg)
        }
    })
}

#[ic_cdk::query]
fn game_find_all(
    pag: Pagination
) -> Result<Vec<GameResponse>, String> {
    let caller = caller();

    DB.with(|db| {
        match GamesService::find_all(pag, &db.borrow(), &caller) {
            Ok(list) => Ok(list.iter().map(|e| e.clone().into()).collect()),
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

#[ic_cdk::query(composite = true)]
pub async fn game_get_end_credits(
    id: GameId
) -> Result<GameEndCredits, String> {
    let caller = &caller();
    
    let game = DB.with(|db| -> Result<Game, String> {
        let game = GamesService::find_by_id(
            &id, &db.borrow(), caller)?;

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
            caller, &db.borrow(), caller)?;

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
            caller, &db.borrow(), caller)?;

        let col = NftCollectionsService::find_by_id(
            &id, &db.borrow(), caller)?;

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
    let caller = caller();

    DB.with(|db| {
        match NftCollectionsService::find_by_id(&id, &db.borrow(), &caller) {
            Ok(col) => Ok(col.into()),
            Err(msg) => Err(msg)
        }
    })
}

#[ic_cdk::query]
fn nft_col_find_all(
    pag: Pagination
) -> Result<Vec<NftCollectionResponse>, String> {
    let caller = caller();

    DB.with(|db| {
        match NftCollectionsService::find_all(pag, &db.borrow(), &caller) {
            Ok(list) => Ok(list.iter().map(|e| e.clone().into()).collect()),
            Err(msg) => Err(msg)
        }
    })
}

#[ic_cdk::query]
fn nft_col_find_active(
    pag: Pagination
) -> Result<Vec<NftCollectionResponse>, String> {
    let caller = caller();

    DB.with(|db| {
        match NftCollectionsService::find_active(pag, &db.borrow(), &caller) {
            Ok(list) => Ok(list.iter().map(|e| e.clone().into()).collect()),
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

    let (user, game) = DB.with(|db| -> Result<(User, Game), String> {
        let user = UsersService::find_by_id(
            caller, &db.borrow(), caller)?;

        let game = GamesService::find_by_id(
            &req.game.id, &db.borrow(), caller)?;

        Ok((user, game))
    })?;

    let m4tch = MatchesService::create(&req, &game, &user).await?;

    DB.with(|db| {
        MatchesService::insert(
            &m4tch,
            &mut db.borrow_mut()
        )
    })?;

    Ok(m4tch.into())
}

#[ic_cdk::update]
pub async fn match_join(
    req: MatchJoinRequest
) -> Result<(), String> {
    let caller = &caller();

    let (user, mut m4tch, game, nft_col) = DB.with(|db| -> Result<(User, Match, Game, NftCollection), String> {
        let user = UsersService::find_by_id(
            caller, &db.borrow(), caller)?;

        let m4tch = MatchesService::find_by_id(
            &req.id, &db.borrow(), caller)?;
    
        let game = GamesService::find_by_id(
            &m4tch.game.id, &db.borrow(), caller)?;

        let nft_col = NftCollectionsService::find_by_id(
            &req.nft.collection_id, &db.borrow(), caller)?;
    
        Ok((user, m4tch, game, nft_col))
    })?;

    match MatchesService::join(&mut m4tch, &game, &user, &req.nft, &nft_col).await {
        Ok(start) => {
            DB.with(|db| {
                MatchesService::update(&m4tch, &mut db.borrow_mut())
            })?;

            if start {
                _start_match(&mut m4tch, &game, &user).await?;
                _run_match(&mut m4tch, &game, &user).await
            }
            else {
                Ok(())
            }
        },
        Err(msg) => Err(msg),
    }
}

async fn _start_match(
    m4tch: &mut Match,
    game: &Game,
    user: &User
) -> Result<(), String> {
    MatchesService::start_step1(m4tch, game, user)?;

    DB.with(|db| {
        MatchesService::update(m4tch, &mut db.borrow_mut())
    })?;

    MatchesService::start_step2(m4tch, game).await?;

    DB.with(|db| {
        MatchesService::update(m4tch, &mut db.borrow_mut())
    })?;

    Ok(())
}

async fn _run_match(
    m4tch: &mut Match,
    game: &Game,
    user: &User
) -> Result<(), String> {
    MatchesService::run_step1(m4tch, game, user)?;

    DB.with(|db| {
        MatchesService::update(m4tch, &mut db.borrow_mut())
    })?;

    MatchesService::run_step2(m4tch, game).await?;

    DB.with(|db| {
        MatchesService::update(m4tch, &mut db.borrow_mut())
    })?;

    Ok(())
}

#[ic_cdk::update]        
pub async fn match_start(
    id: MatchId
) -> Result<(), String> {     
    let caller = &caller();

    let (user, mut m4tch, game) = DB.with(|db| -> Result<(User, Match, Game), String> {
        let user = UsersService::find_by_id(
            caller, &db.borrow(), caller)?;

        let m4tch = MatchesService::find_by_id(
            &id, &db.borrow(), caller)?;
    
        let game = GamesService::find_by_id(
            &m4tch.game.id, &db.borrow(), caller)?;

        Ok((user, m4tch, game))
    })?;

    _start_match(&mut m4tch, &game, &user).await
}

#[ic_cdk::update]
pub async fn match_run(
    id: MatchId
) -> Result<(), String> {
    let caller = &caller();

    let (user, mut m4tch, game) = DB.with(|db| -> Result<(User, Match, Game), String> {
        let user = UsersService::find_by_id(
            caller, &db.borrow(), caller)?;

        let m4tch = MatchesService::find_by_id(
            &id, &db.borrow(), caller)?;
    
        let game = GamesService::find_by_id(
            &m4tch.game.id, &db.borrow(), caller)?;

        Ok((user, m4tch, game))
    })?;

    _run_match(&mut m4tch, &game, &user).await
}

#[ic_cdk::query(composite = true)]
pub async fn match_get_assets(
    id: MatchId
) -> Result<InstanceAssetsResponse, String> {
    let caller = &caller();
    
    let (m4tch, game) = DB.with(|db| -> Result<(Match, Game), String> {
        let m4tch = MatchesService::find_by_id(
            &id, &db.borrow(), caller)?;
        let game = GamesService::find_by_id(
            &m4tch.game.id, &db.borrow(), caller)?;

        Ok((m4tch, game))
    })?;

    MatchesService::get_assets(&m4tch, &game).await
}

#[ic_cdk::query(composite = true)]
pub async fn match_get_steps(
    id: MatchId,
    pag: Pagination
) -> Result<InstanceStepsResponse, String> {
    let caller = &caller();
    
    let (m4tch, game) = DB.with(|db| -> Result<(Match, Game), String> {
        let m4tch = MatchesService::find_by_id(
            &id, &db.borrow(), caller)?;
        let game = GamesService::find_by_id(
            &m4tch.game.id, &db.borrow(), caller)?;

        Ok((m4tch, game))
    })?;

    MatchesService::get_steps(&m4tch, &game, pag).await
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
pub fn match_find_all(
    pag: Pagination
) -> Result<Vec<MatchResponse>, String> {
    let caller = caller();

    DB.with(|db| {
        match MatchesService::find_all(pag, &db.borrow(), &caller) {
            Ok(list) => Ok(list.iter().map(|e| e.clone().into()).collect()),
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

ic_cdk::export_candid!();