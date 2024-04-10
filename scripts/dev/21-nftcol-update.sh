#!/bin/bash

NFT_COL_ID=$(dfx canister id brains_nft)

dfx canister --identity deployer call neuralarena_be nft_col_update "(
    principal \"$NFT_COL_ID\"
)"
