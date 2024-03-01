use candid::{CandidType, Principal};
use neuralarena_cdk::models::nft::{NftStandard, NftCollectionMetadata};
use serde::{Deserialize, Serialize};

pub type NftCollectionId = Principal;

#[derive(Clone, Serialize, Deserialize)]
pub struct NftCollection {
    pub id: Principal,
    pub std: NftStandard,
    pub meta: NftCollectionMetadata,
    pub active: bool,
    pub banned: bool,
    pub created_at: u64,
    pub created_by: Principal,
    pub updated_at: Option<u64>,
    pub updated_by: Option<Principal>,
    pub deleted_at: Option<u64>,
    pub deleted_by: Option<Principal>,
}

#[derive(Clone, Serialize, Deserialize, CandidType)]
pub struct NftCollectionRequest {
    pub std: NftStandard,
    pub canister_id: Principal,
}

#[derive(Clone, Serialize, Deserialize, CandidType)]
pub struct NftCollectionResponse {
    pub id: Principal,
    pub meta: NftCollectionMetadata,
    pub active: bool,
    pub banned: bool,
}

impl NftCollection {
    pub fn new(
        req: &NftCollectionRequest,
        nft: &NftCollectionMetadata,
        caller: &Principal
    ) -> Self {
        Self {
            id: req.canister_id.clone(),
            std: NftStandard::ICRC7,
            meta: nft.clone(),
            active: true,
            banned: false,
            created_at: ic_cdk::api::time(),
            created_by: caller.clone(),
            updated_at: None,
            updated_by: None,
            deleted_at: None,
            deleted_by: None,
        }
    }
}

impl From<NftCollection> for NftCollectionResponse {
    fn from(
        e: NftCollection
    ) -> Self {
        Self {
            id: e.id,
            meta: e.meta,
            active: e.active,
            banned: e.banned,
        }
    }
}
