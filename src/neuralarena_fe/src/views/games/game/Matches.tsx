import React, { useCallback, useEffect } from "react";
import { useMatchFindByGame } from "@hooks/matches";
import { GameResponse } from "@declarations/neuralarena_be/neuralarena_be.did";
import { MatchesGrid } from "@views/matches/Grid";
import { InfinitePaging } from "@components/InfinitePaging";
import { useUI } from "@hooks/ui";

interface Props {
    game: GameResponse|undefined;
}

const ITEMS_PER_PAGE = 6;

export const GameMatches = (props: Props) => {
    const {showError} = useUI();
    const matches = useMatchFindByGame(props.game?.id, ITEMS_PER_PAGE);

    const update = useCallback(async () => {
        try {
            if(matches.isFetched) {
                await matches.refetch()
            }
        }
        catch(e) {
            showError(e);
        }
    }, [matches]);

    useEffect(() => {
        const t = setInterval(() => {
            update();
        }, 10000);
        
        return () => clearInterval(t);
    }, [update]);

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