use std::collections::BTreeMap;
use crate::db::TableName;
use neuralarena_cdk::db::traits::{
    table::{
        TableSerializable, TableDeserializable, TableData, Table, TableSchema, 
        TableVersioned, TableSubscribable, TableSubs, TableEventKey
    },
    crud::{CrudSubscribable, Crud}
};
use crate::models::nftcol::{NftCollectionId, NftCollection};

pub struct NftCollectionsTable {
    pub schema: TableSchema<TableName>,
    pub data: TableData<NftCollectionId, NftCollection>,
    pub subs: TableSubs<TableName>,
}

impl Table<TableName, NftCollectionId, NftCollection> for NftCollectionsTable {
    fn new(
    ) -> Self {
        Self {
            schema: TableSchema { 
                version: 0.1,
                name: TableName::NftCollections,
            },
            data: TableData(BTreeMap::new()),
            subs: TableSubs(Vec::new()),
        }
    }

    fn get_data(
        &self
    ) -> &TableData<NftCollectionId, NftCollection> {
        &self.data
    }

    fn get_data_mut(
        &mut self
    ) -> &mut TableData<NftCollectionId, NftCollection> {
        &mut self.data
    }

    fn set_data(
        &mut self,
        data: TableData<NftCollectionId, NftCollection>
    ) {
        self.data = data;
    }
    
    fn get_schema(
        &self
    ) -> &TableSchema<TableName> {
        &self.schema
    }
}

impl TableSerializable<TableName, NftCollectionId, NftCollection> for NftCollectionsTable {}

impl TableVersioned<TableName, NftCollectionId, NftCollection> for NftCollectionsTable {}

impl TableDeserializable<TableName, NftCollectionId, NftCollection> for NftCollectionsTable {}

impl Crud<TableName, NftCollectionId, NftCollection> for NftCollectionsTable {}

impl CrudSubscribable<TableName, NftCollectionId, NftCollection> for NftCollectionsTable {}

impl TableSubscribable<TableName, NftCollectionId, NftCollection> for NftCollectionsTable {
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
        k: &NftCollectionId
    ) -> TableEventKey {
        TableEventKey::Principal(k.clone())
    }

    fn get_keys(
        _v: &NftCollection
    ) -> Vec<TableEventKey> {
        vec![]
    }
}