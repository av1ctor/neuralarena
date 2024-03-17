import React from "react";
import { Button } from "@mantine/core";
import { IconGoGame } from "@tabler/icons-react";
import { useGameFindAll } from "@hooks/games";
import { PageTitle } from "@components/PageTitle";
import { GamesGrid } from "./Grid";
import { InfinitePaging } from "@components/InfinitePaging";

interface Props {
}

const ITEMS_PER_PAGE = 12;

export const Games = (props: Props) => {
    const games = useGameFindAll(ITEMS_PER_PAGE);

    return (
        <InfinitePaging
            query={games}
        >
            <PageTitle 
                title="All Games"
                icon={IconGoGame}
            >
                <Button>Publish</Button>
            </PageTitle>

            <GamesGrid 
                games={games.data?.pages.flat() || []}
            />
        </InfinitePaging>
    );
  }