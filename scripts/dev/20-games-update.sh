#!/bin/bash

RCIRCUIT_ID=$(dfx canister id rcircuit_be)
LPISLANDS_ID=$(dfx canister id lpislands_be)

dfx canister --identity deployer call neuralarena_be game_update "(
    principal \"$RCIRCUIT_ID\",
)"

dfx canister --identity deployer call neuralarena_be game_update "(
    principal \"$LPISLANDS_ID\",
)"
