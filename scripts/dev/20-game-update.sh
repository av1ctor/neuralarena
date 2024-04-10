#!/bin/bash

CANISTER_ID=$(dfx canister id rcircuit_be)
GAME_ID=$1

dfx canister --identity deployer call neuralarena_be game_update "(
    \"$GAME_ID\", 
    record {
        canister_id=principal \"$CANISTER_ID\"
    }
)"
