use std::collections::{BTreeSet, BTreeMap};
use crate::db::TableName;
use crate::db::traits::table::{TableSerializable, TableDeserializable, TableEventKind, TableEventKey, TableSubscriber, TableData, Table, TableSchema, TableVersioned, TableEvent};
use crate::db::traits::crud::Crud;
use crate::models::{game::GameId, m4tch::MatchId};

pub struct GameMatchesRelTable {
    pub data: TableData<GameId, BTreeSet<MatchId>>,
    pub schema: TableSchema<TableName>,
}
    
impl Table<TableName, GameId, BTreeSet<MatchId>> for GameMatchesRelTable {
    fn new(
    ) -> Self {
        Self {
            schema: TableSchema { 
                version: 0.1,
                name: TableName::GameMatchesRel,
            },
            data: TableData(BTreeMap::new()),
        }
    }

    fn get_data(
        &self
    ) -> &TableData<GameId, BTreeSet<MatchId>> {
        &self.data
    }

    fn get_data_mut(
        &mut self
    ) -> &mut TableData<GameId, BTreeSet<MatchId>> {
        &mut self.data
    }

    fn set_data(
        &mut self,
        data: TableData<GameId, BTreeSet<MatchId>>
    ) {
        self.data = data;
    }

    fn get_schema(
        &self
    ) -> &TableSchema<TableName> {
        &self.schema
    }
}

impl TableSerializable<TableName, GameId, BTreeSet<MatchId>> for GameMatchesRelTable {}

impl TableVersioned<TableName, GameId, BTreeSet<MatchId>> for GameMatchesRelTable {}

impl TableDeserializable<TableName, GameId, BTreeSet<MatchId>> for GameMatchesRelTable {}

impl Crud<TableName, GameId, BTreeSet<MatchId>> for GameMatchesRelTable {}

impl TableSubscriber<TableName> for GameMatchesRelTable {
    fn on(
        &mut self,
        event: &TableEvent<TableName>
    ) {
        match event.table_name {
            TableName::Matches => {
                if let (TableEventKey::Text(m4tch_key), TableEventKey::Text(game_key)) = 
                    (&event.pkey, &event.keys[0]) {
                    match event.kind {
                        TableEventKind::Create => {
                            if !self.data.0.contains_key(game_key) {
                                self.data.0.insert(game_key.clone(), BTreeSet::default());
                            }

                            self.data.0.get_mut(game_key).unwrap().insert(m4tch_key.clone());
                        },
                        TableEventKind::Update => {
                        },
                        TableEventKind::Delete => {
                            self.data.0.get_mut(game_key).unwrap()
                                .remove(m4tch_key);
                        },
                    }
                }
            },
            _ => panic!("Unsupported")
        }
    }
}