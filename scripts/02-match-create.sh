#!/bin/bash

GAME_ID=$1
MIN_PLAYERS=1
MAX_PLAYERS=4
FPS=60.0
TPS=30.0
EPSILON=0.05
NUM_HIDDEN=32

RAYS=15
FOV=3.1415
PLAYER_RADIUS=20.0
MAX_DIST=40.0
MIN_KEYS=4

dfx canister call main match_create "(record {options=record {game_options=vec {record {\"fov\"; \"$FOV\"}; record {\"rays\"; \"$RAYS\"}; record {\"player_radius\"; \"$PLAYER_RADIUS\"}; record {\"max_dist\"; \"$MAX_DIST\"}; record {\"min_keys\", \"$MIN_KEYS\"}}; fps=$FPS; tps=$TPS; min_players=$MIN_PLAYERS; num_hidden_layers=$NUM_HIDDEN; max_players=$MAX_PLAYERS; epsilon=$EPSILON; game_id=\"$GAME_ID\"}})"


