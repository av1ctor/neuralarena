#!/bin/bash

CANISTER_ID=$(dfx canister id brains_be)

dfx canister call neuralarena_be game_create "(record {canister_id=principal \"$CANISTER_ID\"})"