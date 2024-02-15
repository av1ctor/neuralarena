#!/bin/bash

NAME="Braaains"
DESCRIPTION="Eat brains and win the game!"
CATEGORY="Zombies"
CANISTER_ID=$(dfx canister id brains_be)
IMAGE="https://www.digitaltrends.com/wp-content/uploads/2021/03/best-zombie-games-for-xbox-one.jpg?p=1"

dfx canister call neuralarena_be game_create "(record {name=\"$NAME\"; canister_id=principal \"$CANISTER_ID\"; description=\"$DESCRIPTION\"; category=\"$CATEGORY\"; image=\"$IMAGE\"})"