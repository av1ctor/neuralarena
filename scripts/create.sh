#!/bin/bash

NUM_PLAYERS=4
SCREEN_WIDTH=1600
SCREEN_HEIGHT=800
MAP_SCALE=0.5
FPS=60.0
TPS=30.0
RAYS=15
FOV=3.1415
PLAYER_RADIUS=20.0
EPSILON=0.05
NUM_HIDDEN=32
MAP_NAME="map.yaml"

dfx canister call main match_create "(record {options=record {fov=$FOV; fps=$FPS; tps=$TPS; min_players=1; rays=$RAYS; num_hidden_layers=$NUM_HIDDEN; max_players=10; epsilon=$EPSILON; player_radius=$PLAYER_RADIUS; map_name=\"$MAP_NAME\"}})"