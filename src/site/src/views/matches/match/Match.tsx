import React, { useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button, Space, Stack, Title } from "@mantine/core";
import { useMatchFindById, useMatch } from "../../../hooks/matches";
import { useGameFindById } from "../../../hooks/games";
import { Banner } from "../../games/game/Banner";
import { matchStatusToString } from "../../../libs/matches";
import { useUI } from "../../../hooks/ui";
import { Watch } from "./Watch";

interface Props {
}

export const Match = (props: Props) => {
    const {id} = useParams();
    const {join, start, run} = useMatch()
    const {toggleLoading, showError, showSuccess} = useUI();
    const match = useMatchFindById(id);
    const game = useGameFindById(match?.data?.options.game_id);
    const status = matchStatusToString(match.data?.status);

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

    return (
        <>
            <div>
                {match && match.data && game && game.data &&
                    <Banner 
                        game={game.data}
                    />
                }
            </div>
            <Space h="xl" />
            <div>
                <div>
                    <div>Players:</div>
                    {match.data?.players.map(player => 
                        <div key={player.toString()}>{player.toString()}</div>
                    )}
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
                                />
                            }
                            <div>
                                <Button
                                    variant="gradient"
                                    fullWidth
                                    disabled={status !== 'FINISHED'}
                                    onClick={handleWatch}
                                >
                                    Watch
                                </Button>
                            </div>
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