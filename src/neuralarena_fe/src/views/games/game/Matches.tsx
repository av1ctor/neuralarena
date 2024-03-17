import React from "react";
import { useMatchFindByGame } from "@hooks/matches";
import { GameResponse } from "@declarations/neuralarena_be/neuralarena_be.did";
import { MatchesGrid } from "@views/matches/Grid";
import { InfinitePaging } from "@components/InfinitePaging";

interface Props {
    game: GameResponse|undefined;
}

const ITEMS_PER_PAGE = 6;

export const GameMatches = (props: Props) => {
    const matches = useMatchFindByGame(props.game?.id, ITEMS_PER_PAGE);

    return (
        <InfinitePaging
            query={matches}
        >
            <MatchesGrid
                matches={matches.data?.pages.flat() || []} 
            />
        </InfinitePaging>
    );
  }