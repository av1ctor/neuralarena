#!/bin/bash

MATCH_ID=$1
COLLECTION_ID=$(dfx canister id brains_nft)
TOKEN_ID=0

dfx canister call neuralarena_be match_join "(record {id=\"$MATCH_ID\"; nft=record{collection_id=principal \"$COLLECTION_ID\"; token_id=$TOKEN_ID;}})"


