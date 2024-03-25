#!/bin/bash

CANISTER_ID=$(dfx canister id rcircuit_be)
GAME_ID=$1

dfx identity use deployer
dfx canister call neuralarena_be game_update "(\"$GAME_ID\", record {canister_id=principal \"$CANISTER_ID\"})"
dfx identity use default