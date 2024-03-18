import { MatchResponse } from "@declarations/neuralarena_be/neuralarena_be.did";
import { Avatar as Avatar_, Tooltip } from "@mantine/core";
import { Avatar } from "@views/users/user/Avatar";
import React from "react";

interface Props {
    match: MatchResponse|undefined;
    onChangePov: (index: number) => void;
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
        <>
            <div>Players:</div>
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
                            onClick={() => props.onChangePov(index)}
                        />
                    )}
                </Avatar_.Group>
            </Tooltip.Group>
        </>
    );
};