#!/bin/bash

RCIRCUIT_ID=$(dfx canister id rcircuit_be)
LPISLANDS_ID=$(dfx canister id lpislands_be)

dfx canister --identity deployer call neuralarena_be game_create "(
    record {
        canister_id=principal \"$RCIRCUIT_ID\"
    }
)"

dfx canister --identity deployer call neuralarena_be game_create "(
    record {
        canister_id=principal \"$LPISLANDS_ID\"
    }
)"
