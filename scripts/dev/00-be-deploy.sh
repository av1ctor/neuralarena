#!/bin/bash

ICP_LEDGER_CANISTER_ID=$(dfx canister id icp_ledger_canister)

dfx deploy neuralarena_be --argument "(record {
    icp_ledger_canister_id= principal \"$ICP_LEDGER_CANISTER_ID\"; 
})"
