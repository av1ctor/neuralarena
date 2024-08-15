#!/bin/bash

RCIRCUIT_ID=$(dfx canister id rcircuit_be --network ic)

dfx canister --identity deployer call neuralarena_be game_update --network ic "(
    principal \"$RCIRCUIT_ID\",
)"
