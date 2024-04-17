import React, { useCallback, useState } from "react";
import { MatchResponse } from "@declarations/neuralarena_be/neuralarena_be.did";
import { Box, Center, Grid, Rating, Stack, Text, createStyles } from "@mantine/core";
import { NftCard } from "@views/nfts/nft/Card";
import { principalToString } from "@libs/icp";
import { useDisclosure } from "@mantine/hooks";
import { NFT } from "@libs/nas1";
import { DrawerPanel } from "@components/DrawerPanel";
import { NftDetails } from "@views/nfts/nft/Details";

const useStyles = createStyles((theme) => ({
    player: {
        border: '1px solid #333',
        borderRadius: '8px',
    },
}));

interface Props {
    match: MatchResponse|undefined;
    onChangePov?: (index: number) => void;
}

export const MatchPlayers = (props: Props) => {
    const {classes} = useStyles();
    const [opened, {open, close}] = useDisclosure(false);
    const [nft, setNft] = useState<NFT|undefined>();
    
    const handleSelect = useCallback((nft: NFT) => {
        setNft(nft);
        open();
    }, []);

    const handleClose = useCallback(() => {
        setNft(undefined);
        close();
    }, []);

    const {match} = props;
    if(!match) {
        return null;
    }

    const winner = match.won_by.length > 0?
        match.won_by[0]?.toString():
        undefined;

    return (
        <>
            <Grid gutter="md">
                {match.players.map((player, index) => 
                    <Grid.Col 
                        key={index}
                        span={6}
                        md={3}
                    >
                        <Box className={classes.player} p="sm">
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
                                <NftCard
                                    nft={player.nft}
                                    selected={player.nft.token_id === nft?.token_id && 
                                        player.nft.collection_id.compareTo(nft?.collection_id) === 'eq'
                                    }
                                    game_id={match.game.id}
                                    onClick={handleSelect}
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
                    </Grid.Col>
                )}
            </Grid>

            <DrawerPanel
                title="Details"
                opened={opened}
                onClose={handleClose}
            >
                {nft && 
                    <NftDetails
                        nft={nft}
                    />
                }
            </DrawerPanel>
        </>
    );
};