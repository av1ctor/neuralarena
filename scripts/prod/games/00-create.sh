#!/bin/bash

RCIRCUIT_ID=$(dfx canister id rcircuit_be --network ic)

dfx canister --identity deployer --network ic call neuralarena_be game_create "(
    record {
        canister_id=principal \"$RCIRCUIT_ID\"
    }
)"
