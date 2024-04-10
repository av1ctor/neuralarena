#!/bin/bash

ICP_LEDGER_CANISTER_ID=$(dfx canister id icp_ledger_canister --network ic)

dfx deploy neuralarena_be -v --network ic --identity deployer --with-cycles 1000000000000 --argument "(
    record {
        icp_ledger_canister_id= principal \"$ICP_LEDGER_CANISTER_ID\"; 
    }
)"
