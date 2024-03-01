#!/bin/bash

COLLECTION_ID=$(dfx canister id brains_nft)
TOKEN_ID=0
USER_ID=$(dfx identity get-principal)

dfx canister call neuralarena_be user_update_nfts "(principal \"$USER_ID\", record {nfts=vec {record {collection_id=principal \"$COLLECTION_ID\"; token_id=$TOKEN_ID;}}})"


