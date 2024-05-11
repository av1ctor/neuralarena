import React from "react";
import { Box, Center, Divider, Rating, Text, createStyles } from "@mantine/core";
import { NftCard } from "@views/nfts/nft/Card";
import { GameId } from "@libs/games";
import { principalToString } from "@libs/icp";
import { MatchPlayerResponse } from "@declarations/neuralarena_be/neuralarena_be.did";

interface Props {
    player: MatchPlayerResponse;
    score: number;
    health: number;
    gameId: GameId;
    size?: 'nano';
    transparent?: boolean;
}

export const PlayerState = ({player, score, health, gameId, size, transparent}: Props) => {
    return (
        player.nft &&
            <NftCard
                nft={player.nft}
                gameId={gameId}
                size={size}
                transparent={transparent}
            >
                <Divider m="sm" />
                <Center>
                    <Text size={size === 'nano'? 'xs': "sm"}>
                        <b>{principalToString(player.id)}</b>
                    </Text>
                </Center>
                <Center>
                    <Text size={size === 'nano'? 'xs': "sm"}>
                        Score: <b>{score.toFixed(2)}</b>
                    </Text>
                </Center>
                <Center>
                    <Text size={10}>
                        <Rating 
                            title={`Health: ${health.toFixed(2)}`}
                            value={health / (size === 'nano'? 20: 10)} 
                            fractions={2} 
                            count={size === 'nano'? 5: 10}
                            emptySymbol={'🤍'} 
                            fullSymbol={'💖'}
                            readOnly 
                        />
                    </Text>
                </Center>
            
            </NftCard>
        
    );
};