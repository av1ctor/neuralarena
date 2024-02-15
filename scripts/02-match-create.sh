#!/bin/bash

GAME_ID=$1

dfx canister call neuralarena_be match_create "(record {options=record {game_options=vec {}; game_id=\"$GAME_ID\"}})"


