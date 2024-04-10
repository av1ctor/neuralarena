#!/bin/bash

CANISTER_ID=$(dfx canister id rcircuit_be)

dfx canister --identity deployer call neuralarena_be game_create "(
    record {
        canister_id=principal \"$CANISTER_ID\"
    }
)"
