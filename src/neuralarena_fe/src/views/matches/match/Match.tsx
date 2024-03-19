import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Space, Stack, Center, Box, SegmentedControl, createStyles, Indicator } from "@mantine/core";
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
import { IconBook, IconDeviceTv, IconDoorEnter, IconList, IconUsersGroup } from "@tabler/icons-react";
import { useBrowser } from "@hooks/browser";

const useStyles = createStyles((theme) => ({
    block: {
        display: 'block',
    },
    none: {
        display: 'none',
    }
}));

interface Props {
}

export const Match = (props: Props) => {
    const {id} = useParams();
    const {isMobile} = useBrowser();
    const {user, isLogged} = useAuth();
    const {join, start, run} = useMatch()
    const {toggleLoading, showError, showSuccess} = useUI();
    const [opened, {open, close}] = useDisclosure(false);
    const [pov, setPov] = useState<number|undefined>(undefined);
    const [section, setSection] = useState('watch');
    const { classes } = useStyles();

    const match = useMatchFindById(id);
    const game = useGameFindById(match?.data?.game.id);

    const joined = match.data && user && 
        match.data.players.find(p => p.id.compareTo(user.id) === 'eq');

    const sections = useMemo(() => [
        {
            value: 'watch',
            label: (
              <Center>
                {joined? 
                    <IconDeviceTv size="1rem" />
                :
                    <IconDoorEnter size="1rem" />
                }
                <Box ml={10}>
                    {joined? 'Watch': 'Join'}
                </Box>
              </Center>
            ),
        },
        {
            value: 'players',
            label: (
              <Center>
                    {match.data && match.data.players.length > 0 &&
                        <Indicator
                            color="blue"
                            label={match.data.players.length}
                            position="top-end"
                            radius={4}
                        >
                            <IconUsersGroup size="1rem" />
                        </Indicator>
                    }
                    <Box ml={10}>
                        Players
                    </Box>
              </Center>
            ),
        },
        {
            value: 'result',
            label: (
              <Center>
                <IconList size="1rem" />
                <Box ml={10}>Result</Box>
              </Center>
            ),
        },
        {
            value: 'about',
            label: (
              <Center>
                <IconBook size="1rem" />
                <Box ml={10}>About</Box>
              </Center>
            ),
        },
    ], [joined, match.data?.players]);

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

    return (
        <>
            <div>
                {game.data &&
                    <GameBanner
                        game={game.data}
                        isHalf
                    />
                }
                
                <Space h="xl" />

                <SegmentedControl
                    orientation={isMobile? "vertical": "horizontal"}
                    fullWidth
                    color="magenta"
                    data={sections}
                    value={section}
                    onChange={setSection}
                />

                <Space h="xl" />

                <Stack className={section === 'watch'? classes.block: classes.none}>
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

                    {isLogged?
                        status === 'OPEN' && !joined &&
                            <Box mt="xl">
                                <Button
                                    variant="gradient"
                                    fullWidth
                                    onClick={open}
                                >
                                    Join
                                </Button>
                            </Box>
                    :
                        status === 'OPEN' &&
                            <Center>
                                Please log in or sign up to be able to participate!
                            </Center>
                    }

                    {isLogged && joined &&
                        status === 'OPEN' &&
                        <Box mt="xl">
                            <Button
                                variant="gradient"
                                fullWidth
                                onClick={handleStartAndRun}
                            >
                                Start & Run
                            </Button>
                        </Box>
                    }
                </Stack>

                {section === 'players' && 
                    <div>
                        <MatchPlayers
                            match={match.data}
                            game={game.data}
                            onChangePov={status === 'FINISHED'? handleChangePov: undefined}
                        />
                    </div>
                }

                {section === 'result' && 
                    <div>
                        Result
                    </div>
                }

                {section === 'about' && 
                    <div>
                        About
                    </div>
                }
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