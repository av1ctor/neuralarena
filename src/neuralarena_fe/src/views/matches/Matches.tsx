import React, { useCallback } from "react";
import { Grid, Button, Center } from "@mantine/core";
import { Card as MatchCard } from "@views/matches/match/Card";
import { useAuth } from "@hooks/auth";
import { IconDeviceGamepad } from "@tabler/icons-react";
import { useUI } from "@hooks/ui";
import { useMatchFindAll } from "@hooks/matches";
import { PageTitle } from "@components/PageTitle";

interface Props {
}

const ITEMS_PER_PAGE = 6;

export const Matches = (props: Props) => {
    const {user} = useAuth();
    const {toggleLoading} = useUI();

    const matches = useMatchFindAll(ITEMS_PER_PAGE);

    const handleNextPage = useCallback(() => {
        toggleLoading(true);
        matches.fetchNextPage();
        toggleLoading(false);
    }, [matches]);

    return (
        <>
            <PageTitle 
                title="All Matches"
                icon={<IconDeviceGamepad size="4rem" /> }
            >
                <Button>New</Button>
            </PageTitle>

            <Grid>
                {matches.data?.pages?.map((page) => (
                    page.map((item, index) => (
                        user &&
                    <Grid.Col 
                        key={index} 
                        sm={6}
                    >
                        <MatchCard 
                            match={item}
                            showView
                        />
                    </Grid.Col>
                ))
            ))}
            </Grid>

            <Center mt="lg">
                <Button
                    disabled={!matches.hasNextPage || matches.isFetchingNextPage}
                    onClick={handleNextPage}
                >
                    More
                </Button>
            </Center>
        </>
    );
  }