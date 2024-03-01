#!/bin/bash

GAME_ID=$1
MATCH_ID=$(./scripts/dev/03-match-create.sh $GAME_ID | grep -E "id = \"[A-Z0-9]+\"" | grep -oh -E "[A-Z0-9]+")
sh ./scripts/dev/04-match-join.sh $MATCH_ID
