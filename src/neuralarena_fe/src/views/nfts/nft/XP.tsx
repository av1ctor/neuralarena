import React from "react";
import { Box, Grid, Text, TextInput } from "@mantine/core";
import { Principal } from "@dfinity/principal";
import { useGameFindById } from "@hooks/games";

interface Props {
    index: number;
    canisterId: Principal;
    xp: number;
}

export const TokenXp = ({index, canisterId, xp}: Props) => {
    
    const game = useGameFindById(canisterId);
    
    return (
        <Box>
            <Grid>
                <Grid.Col md={12} m={0} pb={0}>
                    <Text size="xs" color="lime">
                        <b>#{index+1}</b>
                    </Text>
                </Grid.Col>
                <Grid.Col md={6} pt={0}>
                    <TextInput
                        label="Game"
                        value={`${game.data?.info.name} (${canisterId.toString()})`}
                        size="xs"
                        readOnly
                    />
                </Grid.Col>
                <Grid.Col md={6} pt={0}>
                    <TextInput
                        label="XP"
                        value={xp.toFixed(2)}
                        size="xs"
                        readOnly
                    />
                </Grid.Col>
            </Grid>
        </Box>
    );
};