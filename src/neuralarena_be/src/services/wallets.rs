use candid::{Nat, Principal};
use icrc_ledger_types::icrc1::transfer::TransferArg;
use crate::utils::icrc1::ICRC1Utils;

pub const MAIN_SUBSUB_ACCOUNT: u8 = 0;
pub const RESERVED_SUBSUB_ACCOUNT: u8 = 1;

pub const TRANSFER_FEE: u128 = 10_000;

pub struct Wallets;

impl Wallets {
    pub async fn transfer_from_main_to_reserved(
        owner: &Principal,
        amount: u128,
        icp_ledger_canister_id: &Principal
    ) -> Result<u128, String> {
        let from_subaccount = Some(
            ICRC1Utils::get_subaccount(owner, MAIN_SUBSUB_ACCOUNT)
        );
        
        let to = ICRC1Utils::get_account_ex(
            &ic_cdk::id(), 
            owner, 
            RESERVED_SUBSUB_ACCOUNT
        );

        ICRC1Utils::transfer(icp_ledger_canister_id, TransferArg { 
            from_subaccount, 
            to, 
            amount: Nat::from(amount + TRANSFER_FEE * 3),
            created_at_time: Some(ic_cdk::api::time()), 
            fee: None, 
            memo: None, 
        }).await
    }

    pub async fn transfer_from_reserved_to_main(
        from: &Principal,
        to: Option<&Principal>,
        amount: u128,
        icp_ledger_canister_id: &Principal
    ) -> Result<u128, String> {
        let from_subaccount = Some(
            ICRC1Utils::get_subaccount(from, RESERVED_SUBSUB_ACCOUNT)
        );
        
        let to = if let Some(to) = to {
            ICRC1Utils::get_account_ex(
                &ic_cdk::id(), 
                to, 
                MAIN_SUBSUB_ACCOUNT
            )
        }
        else {
            ICRC1Utils::get_default_account(&ic_cdk::id())
        };

        ICRC1Utils::transfer(icp_ledger_canister_id, TransferArg { 
            from_subaccount, 
            to, 
            amount: Nat::from(amount),
            created_at_time: Some(ic_cdk::api::time()), 
            fee: None, 
            memo: None, 
        }).await
    }

    pub async fn burn_from_reserved(
        from: &Principal,
        amount: u128,
        icp_ledger_canister_id: &Principal
    ) -> Result<Option<u128>, String> {
        let from_subaccount = Some(
            ICRC1Utils::get_subaccount(from, RESERVED_SUBSUB_ACCOUNT)
        );
        
        let burn_account = ICRC1Utils::icrc1_minting_account(icp_ledger_canister_id).await?;

        if let Some(to) = burn_account {
            let tx = ICRC1Utils::transfer(icp_ledger_canister_id, TransferArg { 
                from_subaccount, 
                to, 
                amount: Nat::from(amount),
                created_at_time: Some(ic_cdk::api::time()), 
                fee: None, 
                memo: None, 
            }).await?;
            Ok(Some(tx))
        }
        else {
            Ok(None)
        }
    }
}