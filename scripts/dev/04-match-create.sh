#!/bin/bash

GAME_ID=$1
MAP_ID=0
MIN_PLAYERS=2
MAX_PLAYERS=10
MAX_STEPS=7200
DEADLINE=86400

dfx canister call neuralarena_be match_create "(record {game=record {id=\"$GAME_ID\"; map_id=$MAP_ID; min_players=$MIN_PLAYERS; max_players=$MAX_PLAYERS; max_steps=$MAX_STEPS; options=vec {};}; deadline=$DEADLINE})"


