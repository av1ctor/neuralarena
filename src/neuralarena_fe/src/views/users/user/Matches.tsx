import React, { useCallback } from "react";
import { Grid, Button, Center } from "@mantine/core";
import { Card as MatchCard } from "@views/matches/match/Card";
import { useAuth } from "@hooks/auth";
import { useUserFindMatches } from "@hooks/users";
import { IconDeviceGamepad } from "@tabler/icons-react";
import { useUI } from "@hooks/ui";
import { PageTitle } from "@components/PageTitle";
import { DrawerPanel } from "@components/DrawerPanel";
import { MatchCreate } from "@views/matches/match/Create";
import { useDisclosure } from "@mantine/hooks";

interface Props {
}

const ITEMS_PER_PAGE = 6;

export const UserMatches = (props: Props) => {
    const {user} = useAuth();
    const {toggleLoading} = useUI();
    const [opened, {open, close}] = useDisclosure(false);

    const matches = useUserFindMatches(user?.id, ITEMS_PER_PAGE);

    const handleNextPage = useCallback(() => {
        toggleLoading(true);
        matches.fetchNextPage();
        toggleLoading(false);
    }, [matches]);

    return (
        <>
            <PageTitle 
                title="Your Matches"
                icon={IconDeviceGamepad}
            >
                <Button
                    onClick={open}
                >
                    New
                </Button>
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

            <DrawerPanel
                title="Create a new match"
                opened={opened}
                onClose={close}
            >
                <MatchCreate
                    onClose={close}
                />
            </DrawerPanel>
        </>
    );
  }