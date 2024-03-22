import React from "react";
import { GameId } from "@libs/games";
import { useGameGetLeaderboard } from "@hooks/games";
import { Box, Grid, Group, Stack } from "@mantine/core";
import { principalToString } from "@libs/icp";

interface Props {
    id: GameId|undefined;
}

export const GameLeaderboard = (props: Props) => {
    const query = useGameGetLeaderboard(props.id, 20);
    
    return (
        <Stack align="stretch" spacing="md">
            {query.data?.map((e, index) => 
                <Group key={index} grow>
                    <Box>
                        {principalToString(e[0])}
                    </Box>
                    <Box>
                        {e[1].toFixed(2)}
                    </Box>
                </Group>
            )}
        </Stack>
    );
};