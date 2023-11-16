use std::collections::{BTreeSet, BTreeMap};
use crate::db::TableName;
use crate::db::traits::table::{TableSerializable, TableDeserializable, TableEventKind, TableEventKey, TableSubscriber, TableData, Table, TableSchema, TableVersioned, TableEvent};
use crate::db::traits::crud::Crud;
use crate::models::{user::UserId, m4tch::MatchId};

pub struct UserMatchesRelTable {
    pub data: TableData<UserId, BTreeSet<MatchId>>,
    pub schema: TableSchema<TableName>,
}
    
impl Table<TableName, UserId, BTreeSet<MatchId>> for UserMatchesRelTable {
    fn new(
    ) -> Self {
        Self {
            schema: TableSchema { 
                version: 0.1,
                name: TableName::UserMatchesRel,
            },
            data: TableData(BTreeMap::new()),
        }
    }

    fn get_data(
        &self
    ) -> &TableData<UserId, BTreeSet<MatchId>> {
        &self.data
    }

    fn get_data_mut(
        &mut self
    ) -> &mut TableData<UserId, BTreeSet<MatchId>> {
        &mut self.data
    }

    fn set_data(
        &mut self,
        data: TableData<UserId, BTreeSet<MatchId>>
    ) {
        self.data = data;
    }

    fn get_schema(
        &self
    ) -> &TableSchema<TableName> {
        &self.schema
    }
}

impl TableSerializable<TableName, UserId, BTreeSet<MatchId>> for UserMatchesRelTable {}

impl TableVersioned<TableName, UserId, BTreeSet<MatchId>> for UserMatchesRelTable {}

impl TableDeserializable<TableName, UserId, BTreeSet<MatchId>> for UserMatchesRelTable {}

impl Crud<TableName, UserId, BTreeSet<MatchId>> for UserMatchesRelTable {}

impl TableSubscriber<TableName> for UserMatchesRelTable {
    fn on(
        &mut self,
        event: &TableEvent<TableName>
    ) {
        match event.table_name {
            TableName::Matches => {
                if let TableEventKey::Text(m4tch_key) = &event.pkey {
                    match event.kind {
                        TableEventKind::Create => {
                            for fkey in &event.keys {
                                if let TableEventKey::Principal(fkey) = &fkey {
                                    if !self.data.0.contains_key(fkey) {
                                        self.data.0.insert(fkey.clone(), BTreeSet::default());
                                    }

                                    self.data.0.get_mut(fkey).unwrap().insert(m4tch_key.clone());
                                }
                            }
                        },
                        TableEventKind::Update => {
                            //WARNING: assuming users can't leave matches
                        },
                        TableEventKind::Delete => {
                            for fkey in &event.keys {
                                if let TableEventKey::Principal(fkey) = &fkey {
                                    self.data.0.get_mut(fkey).unwrap()
                                        .remove(m4tch_key);
                                }
                            }
                        },
                    }
                }
            },
            _ => panic!("Unsupported")
        }
    }
}