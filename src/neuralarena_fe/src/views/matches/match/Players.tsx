import React, { useCallback, useState } from "react";
import { MatchResponse } from "@declarations/neuralarena_be/neuralarena_be.did";
import { Grid } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { NFT } from "@libs/nas1";
import { DrawerPanel } from "@components/DrawerPanel";
import { NftDetails } from "@views/nfts/nft/Details";
import { PlayerResult } from "@views/users/player/PlayerResult";

interface Props {
    match: MatchResponse|undefined;
    onChangePov?: (index: number) => void;
}

export const MatchPlayers = (props: Props) => {
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
                        <PlayerResult
                            player={player}
                            isWinner={winner && player.id.toString() === winner? true: false}
                            gameId={match.game.id}
                            nft={nft}
                            onClick={handleSelect}
                        />
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