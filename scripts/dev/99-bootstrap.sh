#!/bin/bash

sh ./scripts/dev/01-users-create.sh
GAME_ID=$(./scripts/dev/02-game-create.sh | grep -E "id = principal \"[A-Z0-9]+\"" | grep -oh -E "[A-Z0-9]+")
sh ./scripts/dev/03-nftcol-create.sh
####MATCH_ID=$(./scripts/dev/04-match-create.sh $GAME_ID | grep -E "id = \"[A-Z0-9]+\"" | grep -oh -E "[A-Z0-9]+")
####sh ./scripts/dev/05-nft-add.sh
####sh ./scripts/dev/06-match-join.sh $MATCH_ID

