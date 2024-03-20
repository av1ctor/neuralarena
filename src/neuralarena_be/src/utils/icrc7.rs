use std::collections::HashMap;

use candid::Principal;
use icrc_ledger_types::icrc1::account::Account;

pub struct ICRC7Utils;

impl ICRC7Utils {
    pub async fn verify_owners(
        tokens_owners_by_canister: &HashMap<Principal, (Vec<u128>, Vec<Principal>)>
    ) -> Result<(), String> {

        for (canister_id, tokens_owners) in tokens_owners_by_canister {
            let (accounts, ): (Vec<Option<Account>>, ) = ic_cdk::call(
                canister_id.clone(), 
                "icrc7_owner_of",
                (&tokens_owners.0, )
            ).await.map_err(|e| e.1)?;

            if accounts.len() != tokens_owners.0.len() {
                return Err("One or more tokens not found".to_string());
            }

            for (i, acc) in accounts.iter().enumerate() {
                if let Some(acc) = acc {
                    if !acc.owner.eq(&tokens_owners.1[i]) {
                        return Err(format!(
                            "NFT {}[{}] has different owner: {} != {}", 
                            canister_id, 
                            tokens_owners.0[i], 
                            acc.owner, 
                            tokens_owners.1[i]
                        ));
                    }
                }
                else {
                    return Err(format!(
                        "NFT {} was not found at collection {}", 
                        tokens_owners.0[i],
                        canister_id
                    ));
                }
            }
        }

        Ok(())
    }
}