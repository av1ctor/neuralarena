import React from "react";
import { GameResponse, MatchResponse } from "@declarations/neuralarena_be/neuralarena_be.did";
import { Avatar as Avatar_, Box, Tooltip } from "@mantine/core";
import { Avatar } from "@views/users/user/Avatar";

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

    const slots = new Array(
            Number(match.game.max_players || 10n) - match.players.length
        )
        .fill({});

    return (
        <Box mt="xl" w="100%">
            <Tooltip.Group 
                openDelay={300} 
                closeDelay={100}
            >
                <Avatar_.Group spacing="xs">
                    {match.players.map((player, index) => 
                        <Avatar 
                            key={player.id.toString()} 
                            id={player.id}
                            isWinner={winner? player.id.toString() === winner: false}
                            onClick={props.onChangePov? () => props.onChangePov!(index): undefined}
                        />
                    )}
                    {slots.map((_, index) => 
                        <Avatar 
                            key={index} 
                        />
                    )}
                </Avatar_.Group>
            </Tooltip.Group>
        </Box>
    );
};