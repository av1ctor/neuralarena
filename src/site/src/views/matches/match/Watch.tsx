import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ActionIcon, Center, Group, createStyles } from "@mantine/core";
import { MatchResponse, MatchStep } from "../../../../../declarations/main/main.did";
import { useMatchGetSteps } from "../../../hooks/matches";
import GameEngineInit, {GameWrapper, GameOptionsWrapper, ObjectFOVWrapper} from 'bot-engine';
import { Canvas2dRenderer } from "../../../renderers/Canvas2dRenderer";
import { matchGetMap } from "../../../libs/matches";
import { useActors } from "../../../hooks/actors";
import { IconPlayerPause, IconPlayerPlay, IconQuestionMark, IconRefresh, IconWindowMaximize, IconWindowMinimize, IconZoomIn, IconZoomOut } from "@tabler/icons-react";

GameEngineInit();

const useStyles = createStyles((theme) => ({
    container: {
        position: 'relative',
        margin: 'auto',
        display: 'flex',
    },
    controls: {
        position: 'absolute',
        paddingBottom: '16px',
        bottom: 0,
        left: 2,
        right: 2,
        borderTop: '2px solid #f00',
    },
    progress_container: {
        position: 'relative',
        width: '100%',
    },
    progress: {
        position: 'absolute',
        left: 0,
        width: '1%',
        height: '4px',
        backgroundColor: '#f00',
    },
    canvas: {
        display: 'block',
        border: '2px solid #fff',
        borderRadius: '1rem',
        flex: '1 1 auto'
    },
}));

enum WatchState {
    PAUSED,
    PLAYING,
    FINISHED,
}

interface Props {
    match: MatchResponse,
    pov: number
}

const STEPS_PER_CALL = 60*10;

export const Watch = (props: Props) => {
    const { main } = useActors();
    const { classes } = useStyles();
    const canvas = useRef<HTMLCanvasElement|null>(null);
    const canvasContainer = useRef<HTMLDivElement|null>(null);
    const [gameEngine, setGameEngine] = useState<GameWrapper>();
    const [renderer, setRenderer] = useState<Canvas2dRenderer>();
    const [map, setMap] = useState<string>();
    const [state, setState] = useState<WatchState>(WatchState.PAUSED);
    const [zoom, setZoom] = useState(1.0);
    const [progress, setProgress] = useState(0.0);

    const steps = useMatchGetSteps(props.match.id, STEPS_PER_CALL)
    const step = useRef(0);

    const frames = useMemo((): MatchStep[] => {
        const res = new Array<MatchStep>();

        steps.data?.pages.forEach(p => 
            p.steps.forEach(s => res.push(s))
        );

        return res;
    }, [steps.data?.pages.length]);

    const handleTogglePlay = useCallback(() => {
        setState(state => {
            const newState = state === WatchState.PLAYING? 
                WatchState.PAUSED: 
                WatchState.PLAYING;

            if(newState === WatchState.PLAYING &&
                step.current >= frames.length) {
                step.current = 0;
            }

            return newState;
        });
    }, [step, frames]);

    const handleZoomIn = useCallback(() => {
        setZoom(zoom => {
            return Math.min(zoom + 0.25, 4.0);
        });
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoom(zoom => {
            return Math.max(zoom - 0.25, 0.25);
        });
    }, []);

    const handleToggleFullscreen = useCallback(() => {
        if(!document.fullscreenElement) {
            if(canvasContainer.current?.requestFullscreen) {
                canvasContainer.current?.requestFullscreen();
            }
        } 
        else {
            if(document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }, [canvasContainer])

    const loadMap = useCallback(async () => {
        setMap(await matchGetMap(main, props.match.id));
    }, [props.match.id]);

    useEffect(() => {
        loadMap();
    }, [loadMap]);

    useEffect(() => {
        if(steps.data?.pages.length) {
            if(!steps.isFetching && !steps.isFetchingNextPage) {
                steps.fetchNextPage()
            }
        }
    }, [steps.data?.pages.length]);

    useEffect(() => {
        if(!gameEngine && state === WatchState.PAUSED && canvas.current && map) {
            const {options} = props.match;
            const game_options = new Map(options.game_options);
            
            const renderer = new Canvas2dRenderer(canvas.current);
            setRenderer(renderer);

            setGameEngine(new GameWrapper(
                new GameOptionsWrapper(
                    false, 
                    new ObjectFOVWrapper(
                        15.0, 
                        180.0*(Math.PI/180.0), 
                        40.0
                    ), 
                    60, 
                    props.match.players.length, 
                    4, 
                    20.0, 
                    false
                ), 
                map, 
                renderer
            ));
            setState(WatchState.PLAYING);
        }
    }, [props.match.options, state, canvas.current, map, gameEngine]);

    useLayoutEffect(() => {
        if(gameEngine && frames.length > 0) {
            let timerId: number = 0;

            const animate = () => {
                switch(state) {
                    case WatchState.PLAYING:
                        if(step.current < frames.length) {
                            gameEngine.deserialize_entities(frames[step.current].entities as Uint8Array)
                            gameEngine.render(props.pov, zoom, 800, 600);
                            timerId = requestAnimationFrame(animate)
                            ++step.current;
                            setProgress(step.current / frames.length * 100.0);
                            if(step.current >= frames.length) {
                                setState(WatchState.FINISHED);
                            }
                        }
                        break;
                    case WatchState.FINISHED:
                        renderer?.show_winner(props.match.won_by as any);
                        break;
                }
            }
            timerId = requestAnimationFrame(animate)
            return () => cancelAnimationFrame(timerId)
        }
        else {
            return () => {};
        }
    }, [gameEngine, steps, frames, zoom, state, renderer, props.match, props.pov]);

    return (
        <Center>
            <div
                ref={canvasContainer} 
                className={classes.container}>
                <canvas 
                    ref={canvas}
                    className={classes.canvas}
                    width={800}
                    height={600}
                >
                </canvas>
                <Group className={classes.controls} position="apart">
                    <div className={classes.progress_container}>
                        <div 
                            className={classes.progress} 
                            style={{width:`${progress}%`}}
                        />
                    </div>
                    <Group pl={16}>
                        <ActionIcon>
                            <IconQuestionMark />
                        </ActionIcon>
                    </Group>
                    <Group>
                        <ActionIcon
                            variant="outline"
                            onClick={handleTogglePlay}
                        >
                            {state === WatchState.PAUSED?
                                <IconPlayerPlay />
                            :
                                state === WatchState.FINISHED?
                                    <IconRefresh />
                                :
                                    <IconPlayerPause />
                            }
                        </ActionIcon>
                    </Group>
                    <Group pr={16}>
                        <ActionIcon
                            onClick={handleZoomIn}
                        >
                            <IconZoomIn />
                        </ActionIcon>
                        <ActionIcon
                            onClick={handleZoomOut}
                        >
                            <IconZoomOut />
                        </ActionIcon>
                        <ActionIcon>
                            {!document.fullscreenElement?
                                <IconWindowMaximize 
                                    onClick={handleToggleFullscreen}
                                />
                            :
                                <IconWindowMinimize
                                    onClick={handleToggleFullscreen}
                                />
                            }
                        </ActionIcon>
                    </Group>
                </Group>
            </div>
        </Center>
    );
};