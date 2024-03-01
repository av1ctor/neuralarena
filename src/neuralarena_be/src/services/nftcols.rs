use std::collections::HashMap;
use candid::Principal;
use icrc_ledger_types::icrc::generic_value::Value;
use neuralarena_cdk::models::icrc7_types::Standard;
use neuralarena_cdk::models::nas1_types::Nas1Collection;
use neuralarena_cdk::models::nft::{NftCollectionMetadata, NftStandard};
use crate::db::DB;
use neuralarena_cdk::db::traits::crud::{Crud, CrudSubscribable, Pagination};
use crate::models::nftcol::{NftCollection, NftCollectionId, NftCollectionRequest};
use crate::models::staff::StaffRole;
use crate::models::user::{User, UserKind};

pub struct NftCollectionsService {}

impl NftCollectionsService {
    pub async fn create(
        req: &NftCollectionRequest,
        user: &User
    ) -> Result<NftCollection, String> {
        Self::authorize(user)?;

        if req.std != NftStandard::ICRC7 {
            return Err("Unsupported NFT standard".to_string());
        }

        // check if the nft's support NAS-1
        let (stds, ): (Vec<Standard>, ) = ic_cdk::call(
            req.canister_id, 
            "icrc7_supported_standards",
            ()
        ).await.map_err(|e| e.1)?;

        if !stds.iter().any(|s| s.name == "NAS-1") {
            return Err("The NFT is not NAS-1 compatible".to_string());
        }

        // get the ICRC7 metadata
        let (icrc7_meta, ): (HashMap<String, Value>, ) = ic_cdk::call(
            req.canister_id, 
            "icrc7_collection_metadata",
            ()
        ).await.map_err(|e| e.1)?;

        // get the NAS1 metadata
        let (nas1_meta, ): (Nas1Collection, ) = ic_cdk::call(
            req.canister_id, 
            "nas1_collection_data",
            ()
        ).await.map_err(|e| e.1)?;

        let meta = NftCollectionMetadata {
            std: NftStandard::ICRC7,
            name: icrc7_meta["icrc7:name"].to_string(),
            desc: icrc7_meta["icrc7:description"].to_string(),
            logo: icrc7_meta["icrc7:logo"].to_string(),
            nas1: nas1_meta,
        };

        Ok(NftCollection::new(&req, &meta, &user.id))
    }

    pub fn insert(
        nft: &NftCollection,
        db: &mut DB
    ) -> Result<(), String> {
        db.nft_cols.borrow_mut()
            .insert_and_notify(nft.id.clone(), nft.clone())
    }

    pub fn _update(
        nft: &NftCollection,
        db: &mut DB
    ) -> Result<(), String> {
        db.nft_cols.borrow_mut()
            .update_and_notify(nft.id.clone(), nft.clone())
    }

    pub fn find_by_id(
        id: &NftCollectionId,
        db: &DB,
        _caller: &Principal
    ) -> Result<NftCollection, String> {
        let nfts = db.nft_cols.borrow();

        let nft = match nfts.find_by_id(id) {
            None => return Err("NFT not found".to_string()),
            Some(e) => e
        };

        Ok((*nft).clone())
    }

    pub fn find_active(
        pag: Pagination,
        db: &DB,
        _caller: &Principal
    ) -> Result<Vec<NftCollection>, String> {
        let nfts = db.nft_cols.borrow();
        
        let mut arr = nfts.data.0.iter()
            .map(|v| v.1)
            .filter(|n| n.active)
            .cloned()
            .collect::<Vec<_>>();

        arr.sort_by(|a, b| b.meta.name.cmp(&a.meta.name));
        
        Ok(arr.iter()
            .skip(pag.offset as usize)
            .take(pag.limit as usize)
            .cloned()
            .collect())
    }

    fn authorize(
        user: &User
    ) -> Result<(), String> {
        if let UserKind::Staff(staff) = &user.kind {
            if staff.role != StaffRole::Admin {
                return Err("Forbidden".to_string());
            }
        }
        else {
            return Err("Forbidden".to_string());
        }

        if !user.active {
            return Err("User inactive".to_string());
        }
        else if user.banned {
            return Err("User banned".to_string());
        }

        Ok(())
    }
}

