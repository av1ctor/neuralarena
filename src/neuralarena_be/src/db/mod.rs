pub mod tables;
pub mod migrations;

use std::cell::RefCell;
use std::rc::Rc;
use ic_cdk::api::stable::{StableWriter, StableReader};
use self::tables::{
    game_matches_rel::GameMatchesRelTable, 
    games::GamesTable, 
    leaderboards::LeaderboardsTable, 
    matches::MatchesTable, 
    nftcols::NftCollectionsTable, 
    timers::TimersTable, 
    user_matches_rel::UserMatchesRelTable, 
    users::UsersTable
};
use neuralarena_cdk::db::traits::table::{
    TableSerializable, TableDeserializable, Table, TableSubscribable
};

#[derive(Clone, Debug)]
pub enum TableName {
    Users,
    Matches,
    Games,
    Leaderboards,
    NftCollections,
    Timers,
    UserMatchesRel,
    GameMatchesRel,
}

pub struct DB {
    pub users: Rc<RefCell<UsersTable>>,
    pub matches: Rc<RefCell<MatchesTable>>,
    pub games: Rc<RefCell<GamesTable>>,
    pub leaderboards: Rc<RefCell<LeaderboardsTable>>,
    pub nft_cols: Rc<RefCell<NftCollectionsTable>>,
    pub timers: Rc<RefCell<TimersTable>>,
    pub user_matches_rel: Rc<RefCell<UserMatchesRelTable>>,
    pub game_matches_rel: Rc<RefCell<GameMatchesRelTable>>,
}

impl DB {
    pub fn new(
    ) -> Self {
        let users = Rc::new(RefCell::new(UsersTable::new()));
        let matches = Rc::new(RefCell::new(MatchesTable::new()));
        let games = Rc::new(RefCell::new(GamesTable::new()));
        let leaderboards = Rc::new(RefCell::new(LeaderboardsTable::new()));
        let nft_cols = Rc::new(RefCell::new(NftCollectionsTable::new()));
        let timers = Rc::new(RefCell::new(TimersTable::new()));
        let user_matches_rel = Rc::new(RefCell::new(UserMatchesRelTable::new()));
        let game_matches_rel = Rc::new(RefCell::new(GameMatchesRelTable::new()));

        //
        matches.borrow_mut().subscribe(user_matches_rel.clone());
        matches.borrow_mut().subscribe(game_matches_rel.clone());

        //
        games.borrow_mut().subscribe(leaderboards.clone());

        Self {
            users,
            matches,
            games,
            leaderboards,
            nft_cols,
            timers,
            user_matches_rel,
            game_matches_rel,
        }
    }

    pub fn serialize(
        &self,
        writer: &mut StableWriter
    ) -> Result<(), String> {
        self.users.borrow().serialize(writer)?;
        self.matches.borrow().serialize(writer)?;
        self.games.borrow().serialize(writer)?;
        self.leaderboards.borrow().serialize(writer)?;
        self.nft_cols.borrow().serialize(writer)?;
        self.timers.borrow().serialize(writer)?;
        self.user_matches_rel.borrow().serialize(writer)?;
        self.game_matches_rel.borrow().serialize(writer)?;
        Ok(())
    }

    pub fn deserialize(
        &mut self,
        reader: &mut StableReader
    ) -> Result<(), String> {
        self.users.borrow_mut().deserialize(reader, true)?;
        self.matches.borrow_mut().deserialize(reader, true)?;
        self.games.borrow_mut().deserialize(reader, true)?;
        self.leaderboards.borrow_mut().deserialize(reader, true)?;
        self.nft_cols.borrow_mut().deserialize(reader, true)?;
        self.timers.borrow_mut().deserialize(reader, true)?;
        self.user_matches_rel.borrow_mut().deserialize(reader, true)?;
        self.game_matches_rel.borrow_mut().deserialize(reader, true)?;
        Ok(())
    }
}
