import React, { useCallback, useState } from "react";
import { Divider, Grid, Group, Card, Text, Button, Center } from "@mantine/core";
import { Card as MatchCard } from "@views/matches/match/Card";
import { useAuth } from "@hooks/auth";
import { useUserFindMatches } from "@hooks/users";
import { IconGalaxy } from "@tabler/icons-react";
import { useUI } from "@hooks/ui";

interface Props {
}

const ITEMS_PER_PAGE = 6;

export const UserMatches = (props: Props) => {
    const {user} = useAuth();
    const {toggleLoading, isLoading} = useUI();
    const [limit, setLimit] = useState(ITEMS_PER_PAGE);

    const matches = useUserFindMatches(user?.id, limit);

    const handleNextPage = useCallback(() => {
        toggleLoading(true);
        setLimit(limit => limit + ITEMS_PER_PAGE);
        toggleLoading(false);
    }, []);

    return (
        <Card withBorder radius="md" p="xl" className="main-card card">
            <Group position="apart" noWrap spacing="xl">
                <div>
                    <Text fz="lg" className="card-title" fw={500}>
                        <IconGalaxy size="1rem" /> Matches
                    </Text>
                    <Text fz="xs" c="dimmed" mt={3} mb="xl">
                        Your matches
                    </Text>
                </div>
            </Group>

            <Divider pb="xs" />

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
                    disabled={isLoading? true: matches.data? matches.data.pages.length * ITEMS_PER_PAGE < limit: true}
                    onClick={handleNextPage}
                >
                    More
                </Button>
            </Center>
        </Card>
    );
  }