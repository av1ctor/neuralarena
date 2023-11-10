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
                if let (
                        TableEventKey::Text(m4tch_key), 
                        TableEventKey::Principal(doctor_key),
                        TableEventKey::Principal(patient_key)
                    ) = (event.pkey.clone(), event.keys[0].clone(), event.keys[1].clone()) {
                    match event.kind {
                        TableEventKind::Create => {
                            // doctor
                            if !self.data.0.contains_key(&doctor_key) {
                                self.data.0.insert(doctor_key.clone(), BTreeSet::new());
                            }

                            self.data.0.get_mut(&doctor_key).unwrap()
                                .insert(m4tch_key.clone());

                            // patient
                            if !self.data.0.contains_key(&patient_key) {
                                self.data.0.insert(patient_key.clone(), BTreeSet::new());
                            }

                            self.data.0.get_mut(&patient_key).unwrap()
                                .insert(m4tch_key.clone());
                        },
                        TableEventKind::Update => {
                            // assuming user_key won't be updated
                        },
                        TableEventKind::Delete => {
                            self.data.0.get_mut(&doctor_key).unwrap()
                                .remove(&m4tch_key);
                            self.data.0.get_mut(&patient_key).unwrap()
                                .remove(&m4tch_key);
                        },
                    }
                }
            },
            _ => panic!("Unsupported")
        }
    }
}