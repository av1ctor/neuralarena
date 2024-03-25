#!/bin/bash

CANISTER_ID=$(dfx canister id rcircuit_be)

dfx identity use deployer
dfx canister call neuralarena_be game_create "(record {canister_id=principal \"$CANISTER_ID\"})"
dfx identity use default