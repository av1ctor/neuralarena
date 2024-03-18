import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Space, Stack, Title, Center } from "@mantine/core";
import { useMatchFindById, useMatch } from "@hooks/matches";
import { useGameFindById } from "@hooks/games";
import { matchStatusToString } from "@libs/matches";
import { useUI } from "@hooks/ui";
import { Watch } from "./Watch";
import { useAuth } from "@hooks/auth";
import { Intro } from "./Intro";
import { GameBanner } from "@views/games/game/Banner";
import { useDisclosure } from "@mantine/hooks";
import { JoinMatch } from "./Join";
import { DrawerPanel } from "@components/DrawerPanel";
import { MatchPlayers } from "./Players";

interface Props {
}

export const Match = (props: Props) => {
    const {id} = useParams();
    const {user, isLogged} = useAuth();
    const {join, start, run} = useMatch()
    const {toggleLoading, showError, showSuccess} = useUI();
    const [opened, {open, close}] = useDisclosure(false);
    const [pov, setPov] = useState<number|undefined>(undefined);

    const match = useMatchFindById(id);
    const game = useGameFindById(match?.data?.game.id);

    const handleStartAndRun = useCallback(async () => {
        if(id) {
            try {
                toggleLoading(true);
                await start(id);
                run(id);
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

    const handleChangePov = useCallback(async (pov: number) => {
        setPov(pov);
    }, []);

    const updateStatus = useCallback(async () => {
        try {
            if(match.data && 
                !('FINISHED' in match.data.status || 
                  'CANCELLED' in match.data.status)) {
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
    const joined = match.data && user && 
        match.data.players.find(p => p.id.compareTo(user.id) === 'eq');

    return (
        <>
            <div>
                {game.data &&
                    <GameBanner
                        game={game.data}
                        isHalf
                    />
                }
                <div>
                    <MatchPlayers
                        match={match.data}
                        onChangePov={handleChangePov}
                    />
                </div>
                <Space h="xl" />
                <Stack spacing="xl">
                    {match.data && game.data?
                        (status === 'FINISHED' || status === 'RUNNING')?
                            <Watch 
                                game={game.data}
                                match={match.data}
                                pov={pov}
                            />
                        :
                            <Intro
                                game={game.data}
                            />
                    :
                        null   
                    }
                    {status === 'RUNNING' &&
                        <Title order={1}>
                            Waiting this match to finish...
                        </Title>
                    }

                    {isLogged?
                        status === 'OPEN' && !joined &&
                            <div>
                                <Button
                                    variant="gradient"
                                    fullWidth
                                    onClick={open}
                                >
                                    Join
                                </Button>
                            </div>
                    :
                        status === 'OPEN' &&
                            <Center>
                                Please log in or sign up to be able to participate!
                            </Center>
                    }
                    {isLogged &&
                        status === 'OPEN' &&
                        <div>
                            <Button
                                variant="gradient"
                                fullWidth
                                onClick={handleStartAndRun}
                            >
                                Start & Run
                            </Button>
                        </div>
                    }
                </Stack>
            </div>

            <DrawerPanel
                title="Join match"
                opened={opened}
                onClose={close}
            >
                <JoinMatch
                    match={match.data}
                    onClose={close}
                />
            </DrawerPanel>

        </>
    );
};