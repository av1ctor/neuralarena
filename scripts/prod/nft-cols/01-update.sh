#!/bin/bash

NFT_COL_ID=$(dfx canister id brains_nft --network ic)

dfx canister --identity deployer --network ic call neuralarena_be nft_col_update "(
    principal \"$NFT_COL_ID\"
)"
