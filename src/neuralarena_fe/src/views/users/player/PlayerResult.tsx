import React from "react";
import { MatchPlayerResponse } from "@declarations/neuralarena_be/neuralarena_be.did";
import { Box, Center, Rating, Stack, Text, createStyles } from "@mantine/core";
import { NftCard } from "@views/nfts/nft/Card";
import { principalToString } from "@libs/icp";
import { NFT } from "@libs/nas1";
import { GameId } from "@libs/games";

const useStyles = createStyles((theme) => ({
    player: {
        border: '1px solid #333',
        borderRadius: '8px',
    },
}));

interface Props {
    player: MatchPlayerResponse;
    isWinner: boolean;
    gameId: GameId;
    nft: NFT|undefined;
    onClick?: (nft: NFT) => void;
}

export const PlayerResult = ({player, isWinner, gameId, nft, onClick}: Props) => {
    const {classes} = useStyles();
    
    return (
        <Box className={classes.player} p="sm">
            <Stack spacing={0}>
                <Center>
                    <Text>
                        {isWinner? '🏆': ''}
                        <b>{principalToString(player.id)}</b>
                        {isWinner? '🏆': ''}
                    </Text>
                </Center>
                <Center>
                    <small>with</small>
                </Center>
                <NftCard
                    nft={player.nft}
                    selected={player.nft.token_id === nft?.token_id && 
                        player.nft.collection_id.compareTo(nft?.collection_id) === 'eq'
                    }
                    gameId={gameId}
                    onClick={onClick}
                />
                <Center>
                    <Text>
                        Score: <b>{player.score.toFixed(2)}</b>
                    </Text>
                </Center>
                <Center>
                    <Text size={10}>
                        <Rating 
                            title={`Health: ${player.health.toFixed(2)}`}
                            value={player.health / 10.0} 
                            fractions={2} 
                            count={10}
                            emptySymbol={'🤍'} 
                            fullSymbol={'💖'}
                            readOnly 
                        />
                    </Text>
                </Center>
            </Stack>
        </Box>
);
};