import React from "react";
import { Box, Center, Rating, Text, createStyles } from "@mantine/core";
import { NftCard } from "@views/nfts/nft/Card";
import { GameId } from "@libs/games";
import { principalToString } from "@libs/icp";
import { MatchPlayerResponse } from "@declarations/neuralarena_be/neuralarena_be.did";

const useStyles = createStyles((theme) => ({
    player: {
        borderRadius: '8px',
        backgroundColor: `${theme.colors.gray[9]}7f`,
    },
}));

interface Props {
    player: MatchPlayerResponse;
    score: number;
    health: number;
    gameId: GameId;
}

export const PlayerState = ({player, score, health, gameId}: Props) => {
    const {classes} = useStyles();

    return (
        <Box 
            className={classes.player}
        >
            {player.nft &&
                <NftCard
                    nft={player.nft}
                    gameId={gameId}
                    size="nano"
                >
                    <Center>
                        <Text size="sm">
                            <b>{principalToString(player.id)}</b>
                        </Text>
                    </Center>
                    <Center>
                        <Text size="sm">
                            Score: <b>{score.toFixed(2)}</b>
                        </Text>
                    </Center>
                    <Center>
                        <Text size={10}>
                            <Rating 
                                title={`Health: ${health.toFixed(2)}`}
                                value={health / 10.0} 
                                fractions={2} 
                                count={10}
                                emptySymbol={'🤍'} 
                                fullSymbol={'💖'}
                                readOnly 
                            />
                        </Text>
                    </Center>
                
                </NftCard>
            }
        </Box>
    );
};