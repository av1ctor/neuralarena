import React, { useCallback } from "react";
import { Grid, Button, Center } from "@mantine/core";
import { useAuth } from "@hooks/auth";
import { IconGoGame } from "@tabler/icons-react";
import { useUI } from "@hooks/ui";
import { useGameFindAll } from "@hooks/games";
import { GameCard } from "./game/Card";
import { PageTitle } from "@components/PageTitle";

interface Props {
}

const ITEMS_PER_PAGE = 12;

export const Games = (props: Props) => {
    const {user} = useAuth();
    const {toggleLoading} = useUI();

    const games = useGameFindAll(ITEMS_PER_PAGE);

    const handleNextPage = useCallback(() => {
        toggleLoading(true);
        games.fetchNextPage();
        toggleLoading(false);
    }, [games]);

    return (
        <>
            <PageTitle 
                title="All Games"
                icon={<IconGoGame size="4rem" /> }
            >
                <Button>New</Button>
            </PageTitle>

            <Grid>
                {games.data?.pages?.map((page) => (
                    page.map((item, index) => (
                        user &&
                    <Grid.Col 
                        key={index} 
                        sm={12}
                    >
                        <GameCard 
                            game={item}
                            showView
                        />
                    </Grid.Col>
                ))
            ))}
            </Grid>

            <Center mt="lg">
                <Button
                    disabled={!games.hasNextPage || games.isFetchingNextPage}
                    onClick={handleNextPage}
                >
                    More
                </Button>
            </Center>
        </>
    );
  }