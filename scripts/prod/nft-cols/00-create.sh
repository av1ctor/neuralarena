#!/bin/bash

CANISTER_ID=$(dfx canister id brains_nft --network ic)

dfx canister --identity deployer --network ic call neuralarena_be nft_col_create "(
    record {
        canister_id=principal \"$CANISTER_ID\"; 
        std=variant {ICRC7};
    }
)"
