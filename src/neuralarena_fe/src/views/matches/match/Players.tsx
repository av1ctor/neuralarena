import React from "react";
import { MatchResponse } from "@declarations/neuralarena_be/neuralarena_be.did";
import { Center, Grid, Stack, Text } from "@mantine/core";
import { Nft } from "@views/nfts/nft/Nft";
import { principalToString } from "@libs/icp";

interface Props {
    match: MatchResponse|undefined;
    onChangePov?: (index: number) => void;
}

export const MatchPlayers = (props: Props) => {
    const {match} = props;
    if(!match) {
        return null;
    }

    const winner = match.won_by.length > 0?
        match.won_by[0]?.toString():
        undefined;

    return (
        <Grid>
            {match.players.map((player, index) => 
                <Grid.Col 
                    key={index} 
                    span={6}
                    md={3}
                >
                    <Stack spacing={0}>
                        <Center>
                            <Text>
                                {winner && player.id.toString() === winner? '🏆': ''}
                                <b>{principalToString(player.id)}</b>
                                {winner && player.id.toString() === winner? '🏆': ''}
                            </Text>
                        </Center>
                        <Center>
                            <small>with</small>
                        </Center>
                        <Nft
                            nft={player.nft}
                            onClick={props.onChangePov? () => props.onChangePov!(index): undefined}
                        />
                    </Stack>
                </Grid.Col>
            )}
        </Grid>
    );
};