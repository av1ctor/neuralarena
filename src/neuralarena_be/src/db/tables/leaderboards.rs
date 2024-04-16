use std::collections::BTreeMap;
use crate::{db::TableName, models::user::UserId};
use neuralarena_cdk::db::traits::{
    table::{TableSerializable, TableDeserializable, TableEventKind, 
        TableEventKey, TableSubscriber, TableData, Table, TableSchema, 
        TableVersioned, TableEvent
    },
    crud::Crud
};
use crate::models::game::GameId;

pub struct LeaderboardsTable {
    pub data: TableData<GameId, BTreeMap<UserId, f32>>,
    pub schema: TableSchema<TableName>,
}
    
impl Table<TableName, GameId, BTreeMap<UserId, f32>> for LeaderboardsTable {
    fn new(
    ) -> Self {
        Self {
            schema: TableSchema { 
                version: 0.1,
                name: TableName::Leaderboards,
            },
            data: TableData(BTreeMap::new()),
        }
    }

    fn get_data(
        &self
    ) -> &TableData<GameId, BTreeMap<UserId, f32>> {
        &self.data
    }

    fn get_data_mut(
        &mut self
    ) -> &mut TableData<GameId, BTreeMap<UserId, f32>> {
        &mut self.data
    }

    fn set_data(
        &mut self,
        data: TableData<GameId, BTreeMap<UserId, f32>>
    ) {
        self.data = data;
    }

    fn get_schema(
        &self
    ) -> &TableSchema<TableName> {
        &self.schema
    }
}

impl TableSerializable<TableName, GameId, BTreeMap<UserId, f32>> for LeaderboardsTable {}

impl TableVersioned<TableName, GameId, BTreeMap<UserId, f32>> for LeaderboardsTable {}

impl TableDeserializable<TableName, GameId, BTreeMap<UserId, f32>> for LeaderboardsTable {}

impl Crud<TableName, GameId, BTreeMap<UserId, f32>> for LeaderboardsTable {}

impl TableSubscriber<TableName> for LeaderboardsTable {
    fn on(
        &mut self,
        event: &TableEvent<TableName>
    ) {
        match event.table_name {
            TableName::Games => {
                if let TableEventKey::Principal(game_key) = &event.pkey {
                    match event.kind {
                        TableEventKind::Create => {
                            if !self.data.0.contains_key(game_key) {
                                self.data.0.insert(game_key.clone(), BTreeMap::new());
                            }
                        },
                        TableEventKind::Update => {
                        },
                        TableEventKind::Delete => {
                            self.data.0.remove(game_key);
                        },
                    }
                }
            },
            _ => panic!("Unsupported")
        }
    }
}