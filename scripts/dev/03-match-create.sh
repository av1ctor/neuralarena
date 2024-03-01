#!/bin/bash

GAME_ID=$1

dfx canister call neuralarena_be match_create "(record {game=record {options=vec {}; id=\"$GAME_ID\"}})"


