pub mod traits;
pub mod tables;
pub mod migrations;

use std::cell::RefCell;
use std::rc::Rc;
use ic_cdk::api::stable::{StableWriter, StableReader};
use self::tables::games::GamesTable;
use self::tables::user_matches_rel::UserMatchesRelTable;
use self::tables::users::UsersTable;
use self::tables::matches::MatchesTable;
use self::traits::table::{TableSerializable, TableDeserializable, Table, TableSubscribable};

#[derive(Clone, Debug)]
pub enum TableName {
    Users,
    Matches,
    Games,
    UserMatchesRel,
}

pub struct DB {
    pub users: Rc<RefCell<UsersTable>>,
    pub matches: Rc<RefCell<MatchesTable>>,
    pub games: Rc<RefCell<GamesTable>>,
    pub user_matches_rel: Rc<RefCell<UserMatchesRelTable>>,
}

impl DB {
    pub fn new(
    ) -> Self {
        let users = Rc::new(RefCell::new(UsersTable::new()));
        let matches = Rc::new(RefCell::new(MatchesTable::new()));
        let games = Rc::new(RefCell::new(GamesTable::new()));
        let user_matches_rel = Rc::new(RefCell::new(UserMatchesRelTable::new()));

        //
        matches.borrow_mut().subscribe(user_matches_rel.clone());

        Self {
            users,
            matches,
            games,
            user_matches_rel,
        }
    }

    pub fn serialize(
        &self,
        writer: &mut StableWriter
    ) -> Result<(), String> {
        self.users.borrow().serialize(writer)?;
        self.matches.borrow().serialize(writer)?;
        self.games.borrow().serialize(writer)?;
        self.user_matches_rel.borrow().serialize(writer)?;
        Ok(())
    }

    pub fn deserialize(
        &mut self,
        reader: &mut StableReader
    ) -> Result<(), String> {
        self.users.borrow_mut().deserialize(reader, true)?;
        self.matches.borrow_mut().deserialize(reader, true)?;
        self.games.borrow_mut().deserialize(reader, true)?;
        self.user_matches_rel.borrow_mut().deserialize(reader, true)?;
        Ok(())
    }
}
