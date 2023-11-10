use std::collections::BTreeMap;
use crate::db::TableName;
use crate::db::traits::table::{TableSerializable, TableDeserializable, TableData, Table, TableSchema, TableVersioned, TableSubscribable, TableSubs, TableEventKey};
use crate::db::traits::crud::{CrudSubscribable, Crud};
use crate::models::game::{GameId, Game};

pub struct GamesTable {
    pub schema: TableSchema<TableName>,
    pub data: TableData<GameId, Game>,
    pub subs: TableSubs<TableName>,
}

impl Table<TableName, GameId, Game> for GamesTable {
    fn new(
    ) -> Self {
        Self {
            schema: TableSchema { 
                version: 0.1,
                name: TableName::Games,
            },
            data: TableData(BTreeMap::new()),
            subs: TableSubs(Vec::new()),
        }
    }

    fn get_data(
        &self
    ) -> &TableData<GameId, Game> {
        &self.data
    }

    fn get_data_mut(
        &mut self
    ) -> &mut TableData<GameId, Game> {
        &mut self.data
    }

    fn set_data(
        &mut self,
        data: TableData<GameId, Game>
    ) {
        self.data = data;
    }
    
    fn get_schema(
        &self
    ) -> &TableSchema<TableName> {
        &self.schema
    }
}

impl TableSerializable<TableName, GameId, Game> for GamesTable {}

impl TableVersioned<TableName, GameId, Game> for GamesTable {}

impl TableDeserializable<TableName, GameId, Game> for GamesTable {}

impl Crud<TableName, GameId, Game> for GamesTable {}

impl CrudSubscribable<TableName, GameId, Game> for GamesTable {}

impl TableSubscribable<TableName, GameId, Game> for GamesTable {
    fn get_subs(
        &self
    ) -> &TableSubs<TableName> {
        &self.subs
    }

    fn get_subs_mut(
        &mut self
    ) -> &mut TableSubs<TableName> {
        &mut self.subs
    }

    fn get_pkey(
        k: &GameId
    ) -> TableEventKey {
        TableEventKey::Text(k.clone())
    }

    fn get_keys(
        _v: &Game
    ) -> Vec<TableEventKey> {
        vec![]
    }
}