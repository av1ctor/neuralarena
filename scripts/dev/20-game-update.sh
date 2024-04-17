#!/bin/bash

CANISTER_ID=$(dfx canister id rcircuit_be)
GAME_ID=$1

dfx canister --identity deployer call neuralarena_be game_update "(
    principal \"$GAME_ID\",
)"
