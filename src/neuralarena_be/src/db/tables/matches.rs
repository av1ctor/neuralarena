use std::collections::BTreeMap;
use crate::db::TableName;
use neuralarena_cdk::db::traits::{
    table::{
        TableSerializable, TableDeserializable, TableData, Table, TableSchema, 
        TableVersioned, TableSubscribable, TableSubs, TableEventKey
    },
    crud::{CrudSubscribable, Crud}
};
use crate::models::m4tch::{MatchId, Match};

pub struct MatchesTable {
    pub schema: TableSchema<TableName>,
    pub data: TableData<MatchId, Match>,
    pub subs: TableSubs<TableName>,
}

impl Table<TableName, MatchId, Match> for MatchesTable {
    fn new(
    ) -> Self {
        Self {
            schema: TableSchema { 
                version: 0.1,
                name: TableName::Matches,
            },
            data: TableData(BTreeMap::new()),
            subs: TableSubs(Vec::new()),
        }
    }

    fn get_data(
        &self
    ) -> &TableData<MatchId, Match> {
        &self.data
    }

    fn get_data_mut(
        &mut self
    ) -> &mut TableData<MatchId, Match> {
        &mut self.data
    }

    fn set_data(
        &mut self,
        data: TableData<MatchId, Match>
    ) {
        self.data = data;
    }
    
    fn get_schema(
        &self
    ) -> &TableSchema<TableName> {
        &self.schema
    }
}

impl TableSerializable<TableName, MatchId, Match> for MatchesTable {}

impl TableVersioned<TableName, MatchId, Match> for MatchesTable {}

impl TableDeserializable<TableName, MatchId, Match> for MatchesTable {}

impl Crud<TableName, MatchId, Match> for MatchesTable {}

impl CrudSubscribable<TableName, MatchId, Match> for MatchesTable {}

impl TableSubscribable<TableName, MatchId, Match> for MatchesTable {
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
        k: &MatchId
    ) -> TableEventKey {
        TableEventKey::Text(k.clone())
    }

    fn get_keys(
        v: &Match
    ) -> Vec<TableEventKey> {
        let mut arr = vec![TableEventKey::Text(v.game.id.clone())];

        arr.append(
            &mut v.state.players.iter()
                .map(|p| TableEventKey::Principal(p.id.clone()))
                .collect::<Vec<_>>()
        );

        arr
    }
}