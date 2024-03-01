#!/bin/bash

sh ./scripts/dev/00-users-create.sh
GAME_ID=$(./scripts/dev/01-game-create.sh | grep -E "id = \"[A-Z0-9]+\"" | grep -oh -E "[A-Z0-9]+")
MATCH_ID=$(./scripts/dev/03-match-create.sh $GAME_ID | grep -E "id = \"[A-Z0-9]+\"" | grep -oh -E "[A-Z0-9]+")
sh ./scripts/dev/04-match-join.sh $MATCH_ID
sh ./scripts/dev/06-match-start-and-run.sh $MATCH_ID

