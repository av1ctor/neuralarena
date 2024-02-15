import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Avatar as Avatar_, Space, Stack, Title, Tooltip } from "@mantine/core";
import { useMatchFindById, useMatch } from "../../../hooks/matches";
import { useGameFindById } from "../../../hooks/games";
import { Banner } from "../../games/game/Banner";
import { matchStatusToString } from "../../../libs/matches";
import { useUI } from "../../../hooks/ui";
import { Watch } from "./Watch";
import { Avatar } from "../../users/user/Avatar";

interface Props {
}

export const Match = (props: Props) => {
    const {id} = useParams();
    const {join, start, run} = useMatch()
    const {toggleLoading, showError, showSuccess} = useUI();
    const [pov, setPov] = useState<number|undefined>(undefined);
    const match = useMatchFindById(id);
    const game = useGameFindById(match?.data?.game.id);

    const handleJoin = useCallback(async () => {
        if(id) {
            try {
                toggleLoading(true);
                await join(id)
                showSuccess('You have joined this match!');
            }
            catch(e) {
                showError(e);
            }
            finally {
                toggleLoading(false);
            }
        }
    }, [join, id]);

    const handleStartAndRun = useCallback(async () => {
        if(id) {
            try {
                toggleLoading(true);
                await start(id)
                run(id)
                showSuccess('This match is running!');
            }
            catch(e) {
                showError(e);
            }
            finally {
                toggleLoading(false);
            }
        }
    }, [join, id]);

    const handleWatch = useCallback(async () => {
        if(id) {
            try {
                toggleLoading(true);
            }
            catch(e) {
                showError(e);
            }
            finally {
                toggleLoading(false);
            }
        }
    }, [join, id]);

    const handleChangePov = useCallback(async (pov: number) => {
        setPov(pov);
    }, []);

    const updateStatus = useCallback(async () => {
        try {
            if(match.data && !('FINISHED' in match.data.status || 'CANCELLED' in match.data.status)) {
                await match.refetch()
            }
        }
        catch(e) {
            showError(e);
        }
    }, [match]);

    useEffect(() => {
        const t = setInterval(() => {
            updateStatus();
        }, 5000);
        
        return () => clearInterval(t);
    }, [updateStatus]);

    const status = matchStatusToString(match.data?.status);
    const winner = match.data && match.data.won_by.length > 0?
        match.data.won_by[0]?.toString():
        undefined;

    return (
        <>
            <div>
                {match && match.data && game && game.data &&
                    <Banner 
                        game={game.data}
                        isHalf
                    />
                }
            </div>
            <Space h="xl" />
            <div>
                <div>
                    <div>Players:</div>
                    <Tooltip.Group 
                        openDelay={300} 
                        closeDelay={100}
                    >
                        <Avatar_.Group spacing="xs">
                            {match.data?.players.map((player, index) => 
                                <Avatar 
                                    key={player.toString()} 
                                    id={player}
                                    isWinner={winner? player.toString() === winner: false}
                                    onClick={() => handleChangePov(index)}
                                />
                            )}
                        </Avatar_.Group>
                    </Tooltip.Group>
                </div>
                <Space h="xl" />
                <Stack spacing="xl">
                    {status === 'OPEN' &&
                        <Button
                            variant="gradient"
                            fullWidth
                            onClick={handleJoin}
                        >
                            Join
                        </Button>
                    }
                    {status === 'OPEN' &&
                        <Button
                            variant="gradient"
                            fullWidth
                            onClick={handleStartAndRun}
                        >
                            Start & Run
                        </Button>
                    }
                    {(status === 'FINISHED' || status === 'RUNNING') &&
                        <Stack>
                            {match.data &&
                                <Watch 
                                    match={match.data}
                                    pov={pov}
                                />
                            }
                        </Stack>
                    }
                    {status === 'RUNNING' &&
                        <Title order={1}>
                            Waiting this match to finish...
                        </Title>
                    }
                </Stack>
            </div>
        </>
    );
};