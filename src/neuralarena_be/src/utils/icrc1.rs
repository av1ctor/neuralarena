use candid::Principal;
use icrc_ledger_types::icrc1::{
    account::{Account, Subaccount}, 
    transfer::{TransferArg, TransferError}
};

pub struct ICRC1Utils;

impl ICRC1Utils {
    pub fn get_subaccount(
        prin: &Principal,
        subsubaccount: u8
    ) -> Subaccount {
        let mut res = [0u8; 32];
        let len = prin.as_ref().len();
        res[0] = len as _;
        res[1..=len].copy_from_slice(prin.as_slice());
        res[30] = subsubaccount;
        res
    }

    pub fn get_default_account(
        owner: &Principal
    ) -> Account {
        Account {
            owner: owner.clone(),
            subaccount: None,
        }
    }

    pub fn get_account_ex(
        owner: &Principal,
        sub: &Principal,
        subsubaccount: u8
    ) -> Account {
        Account {
            owner: owner.clone(),
            subaccount: Some(Self::get_subaccount(sub, subsubaccount)),
        }
    }

    #[allow(unused)]
    pub async fn get_balance(
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

    pub async fn icrc1_minting_account(
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