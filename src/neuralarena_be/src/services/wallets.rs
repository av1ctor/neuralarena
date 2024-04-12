use candid::{Nat, Principal};
use icrc_ledger_types::icrc1::{account::Account, transfer::TransferArg};
use crate::utils::icrc1::ICRC1Utils;

pub const TRANSFER_FEE: u128 = 10_000;

pub struct Wallets;

impl Wallets {
    #[allow(unused)]
    pub async fn balance_of_str(
        acc: &String,
        icp_ledger_canister_id: &Principal
    ) -> Result<u128, String> {
        Self::_balance_of(
            Self::str_account(acc), 
            icp_ledger_canister_id
        ).await
    }

    pub async fn transfer_from_prin_to_str(
        from: &Principal,
        to: &String,
        amount: u128,
        icp_ledger_canister_id: &Principal
    ) -> Result<u128, String> {
        Self::_transfer(
            Some(
                ICRC1Utils::subaccount_from_prin(from)
            ), 
            Self::str_account(to), 
            amount,
            icp_ledger_canister_id
        ).await
    }

    pub async fn transfer_from_str_to_prin(
        from: &String,
        to: &Principal,
        amount: u128,
        icp_ledger_canister_id: &Principal
    ) -> Result<u128, String> {
        Self::_transfer(
            Some(
                ICRC1Utils::subaccount_from_str(from)
            ), 
            Self::prin_account(to), 
            amount,
            icp_ledger_canister_id
        ).await
    }

    pub async fn transfer_from_str_to_str(
        from: &String,
        to: &String,
        amount: u128,
        icp_ledger_canister_id: &Principal
    ) -> Result<u128, String> {
        Self::_transfer(
            Some(
                ICRC1Utils::subaccount_from_str(from)
            ), 
            Self::str_account(to), 
            amount,
            icp_ledger_canister_id
        ).await
    }

    pub async fn transfer_from_str_to_main(
        from: &String,
        amount: u128,
        icp_ledger_canister_id: &Principal
    ) -> Result<u128, String> {
        Self::_transfer(
            Some(
                ICRC1Utils::subaccount_from_str(from)
            ), 
            Self::main_account(), 
            amount,
            icp_ledger_canister_id
        ).await
    }

    pub async fn burn_from_str(
        from: &String,
        amount: u128,
        icp_ledger_canister_id: &Principal
    ) -> Result<Option<u128>, String> {
        let burn_account = ICRC1Utils::minting_account(icp_ledger_canister_id).await?;

        if let Some(to) = burn_account {
            let tx = Self::_transfer(
                Some(
                    ICRC1Utils::subaccount_from_str(from)
                ), 
                to, 
                amount,
                icp_ledger_canister_id
            ).await?;
            Ok(Some(tx))
        }
        else {
            Ok(None)
        }
    }

    fn main_account(
    ) -> Account {
        Account {
            owner: ic_cdk::id(),
            subaccount: None,
        }
    }

    fn prin_account(
        prin: &Principal,
    ) -> Account {
        Account {
            owner: ic_cdk::id(),
            subaccount: Some(ICRC1Utils::subaccount_from_prin(prin)),
        }
    }

    fn str_account(
        id: &String,
    ) -> Account {
        Account {
            owner: ic_cdk::id(),
            subaccount: Some(ICRC1Utils::subaccount_from_str(id)),
        }
    }

    async fn _transfer(
        from_subaccount: Option<[u8; 32]>, 
        to: Account, 
        amount: u128,
        icp_ledger_canister_id: &Principal
    ) -> Result<u128, String> {
        ICRC1Utils::transfer(icp_ledger_canister_id, TransferArg { 
            from_subaccount, 
            to, 
            amount: Nat::from(amount + TRANSFER_FEE * 3),
            created_at_time: Some(ic_cdk::api::time()), 
            fee: None, 
            memo: None, 
        }).await
    }
    
    async fn _balance_of(
        acc: Account, 
        icp_ledger_canister_id: &Principal
    ) -> Result<u128, String> {
        ICRC1Utils::balance_of(icp_ledger_canister_id, acc).await
    }
}