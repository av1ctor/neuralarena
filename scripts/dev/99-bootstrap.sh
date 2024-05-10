#!/bin/bash

sh ./scripts/dev/users/00-create.sh
GAME_ID=$(./scripts/dev/games/00-create.sh | grep -E "id = principal \"[A-Z0-9]+\"" | grep -oh -E "[A-Z0-9]+")
sh ./scripts/dev/nft-cols/00-create.sh
####MATCH_ID=$(./scripts/dev/matches/00-create.sh $GAME_ID | grep -E "id = \"[A-Z0-9]+\"" | grep -oh -E "[A-Z0-9]+")
####sh ./scripts/dev/nfts/00-add.sh
####sh ./scripts/dev/matches/01-join.sh $MATCH_ID

