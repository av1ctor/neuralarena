use std::collections::BTreeMap;
use crate::{db::TableName, models::timer::TimerTarget};
use neuralarena_cdk::db::traits::{
    table::{
        TableSerializable, TableDeserializable, TableData, Table, TableSchema, 
        TableVersioned, TableSubscribable, TableSubs, TableEventKey
    },
    crud::{CrudSubscribable, Crud}
};
use crate::models::timer::{TimerId, Timer};

pub struct TimersTable {
    pub schema: TableSchema<TableName>,
    pub data: TableData<TimerId, Timer>,
    pub subs: TableSubs<TableName>,
}

impl Table<TableName, TimerId, Timer> for TimersTable {
    fn new(
    ) -> Self {
        Self {
            schema: TableSchema { 
                version: 0.1,
                name: TableName::Timers,
            },
            data: TableData(BTreeMap::new()),
            subs: TableSubs(Vec::new()),
        }
    }

    fn get_data(
        &self
    ) -> &TableData<TimerId, Timer> {
        &self.data
    }

    fn get_data_mut(
        &mut self
    ) -> &mut TableData<TimerId, Timer> {
        &mut self.data
    }

    fn set_data(
        &mut self,
        data: TableData<TimerId, Timer>
    ) {
        self.data = data;
    }
    
    fn get_schema(
        &self
    ) -> &TableSchema<TableName> {
        &self.schema
    }
}

impl TableSerializable<TableName, TimerId, Timer> for TimersTable {}

impl TableVersioned<TableName, TimerId, Timer> for TimersTable {}

impl TableDeserializable<TableName, TimerId, Timer> for TimersTable {}

impl Crud<TableName, TimerId, Timer> for TimersTable {}

impl CrudSubscribable<TableName, TimerId, Timer> for TimersTable {}

impl TableSubscribable<TableName, TimerId, Timer> for TimersTable {
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
        k: &TimerId
    ) -> TableEventKey {
        TableEventKey::Text(k.clone())
    }

    fn get_keys(
        v: &Timer
    ) -> Vec<TableEventKey> {
        let mut arr = vec![];

        match &v.target {
            TimerTarget::Match(id) => 
                arr.push(TableEventKey::Text(id.clone())),
        }

        arr
    }
}