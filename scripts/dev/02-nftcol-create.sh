#!/bin/bash

CANISTER_ID=$(dfx canister id brains_nft)

dfx identity use deployer
dfx canister call neuralarena_be nft_col_create "(record {canister_id=principal \"$CANISTER_ID\"; std=variant {ICRC7};})"
dfx identity use default