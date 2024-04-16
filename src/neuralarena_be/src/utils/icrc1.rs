use std::io::Write;

use candid::Principal;
use icrc_ledger_types::icrc1::{
    account::{Account, Subaccount}, 
    transfer::{TransferArg, TransferError}
};
use sha2::{Digest, Sha256};

pub struct ICRC1Utils;

impl ICRC1Utils {
    pub fn subaccount_from_prin(
        prin: &Principal
    ) -> Subaccount {
        const DOMAIN: &[u8] = b"prin-id";
        const DOMAIN_LENGTH: [u8; 1] = [7];

        let mut hasher = Sha256::new();
        _ = hasher.write(&DOMAIN_LENGTH);
        _ = hasher.write(&DOMAIN);
        _ = hasher.write(&prin.as_slice());
        hasher.finalize().into()    
    }

    pub fn subaccount_from_str(
        text: &String
    ) -> Subaccount {
        const DOMAIN: &[u8] = b"str-id";
        const DOMAIN_LENGTH: [u8; 1] = [6];

        let mut hasher = Sha256::new();
        _ = hasher.write(&DOMAIN_LENGTH);
        _ = hasher.write(&DOMAIN);
        _ = hasher.write(&text.as_bytes());
        hasher.finalize().into()
    }

    pub async fn balance_of(
        canister_id: &Principal,
        account: Account
    ) -> Result<u128, String> {

        let (res, ): (u128, ) = ic_cdk::call(
            canister_id.clone(), 
            "icrc1_balance_of",
            (&account, )
        ).await.map_err(|e| e.1)?;

        Ok(res)
    }

    pub async fn transfer(
        canister_id: &Principal,
        arg: TransferArg
    ) -> Result<u128, String> {

        let (res, ): (Result<u128, TransferError>, ) = ic_cdk::call(
            canister_id.clone(), 
            "icrc1_transfer",
            (&arg, )
        ).await.map_err(|e| e.1)?;

        res.map_err(|e| e.to_string())
    }

    pub async fn minting_account(
        canister_id: &Principal
    ) -> Result<Option<Account>, String> {

        let (res, ): (Option<Account>, ) = ic_cdk::call(
            canister_id.clone(), 
            "icrc1_minting_account",
            ()
        ).await.map_err(|e| e.1)?;

        Ok(res)
    }
}