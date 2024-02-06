#!/bin/bash

sh ./scripts/00-player-create.sh
GAME_ID=$(./scripts/01-game-create.sh | grep -E "id = \"[A-Z0-9]+\"" | grep -oh -E "[A-Z0-9]+")
MATCH_ID=$(./scripts/02-match-create.sh $GAME_ID | grep -E "id = \"[A-Z0-9]+\"" | grep -oh -E "[A-Z0-9]+")
sh ./scripts/03-match-join.sh $MATCH_ID
sh ./scripts/05-match-start-and-run.sh $MATCH_ID

