import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ActionIcon, Center, Grid, Group, createStyles } from "@mantine/core";
import { Asset, MatchResponse, MatchStep } from "../../../../../declarations/main/main.did";
import { useMatchGetSteps } from "../../../hooks/matches";
import { ThreeRenderer } from "../../../renderers/ThreeRenderer";
import { matchGetAssets } from "../../../libs/matches";
import { useActors } from "../../../hooks/actors";
import { 
    IconPlayerPause, IconPlayerPlay, IconQuestionMark, 
    IconRefresh, IconWindowMaximize, IconWindowMinimize, 
} from "@tabler/icons-react";
import GameEngineInit, {GameWrapper, GameOptionsWrapper, ObjectFOVWrapper} from "brains-engine";

GameEngineInit();

const useStyles = createStyles((theme) => ({
    container: {
        position: 'relative',
        margin: 'auto',
    },
    controls: {
        position: 'absolute',
        bottom: 0,
        left: 2,
        right: 2,
        margin: 0,
        borderTop: '1px solid #f00',
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
        border: '1px solid #ccc',
        borderRadius: '4px',
        margin: 'auto',
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

const FPS = 60;
const STEPS_PER_CALL = FPS*10;
const CANVAS_DIM = {w: 900, h: 506};

export const Watch = (props: Props) => {
    const { main } = useActors();
    const { classes } = useStyles();
    const canvas = useRef<HTMLCanvasElement|null>(null);
    const fullscreenContainer = useRef<HTMLDivElement|null>(null);
    const [assets, setAssets] = useState<Array<Asset>|undefined>();
    const [engine, setEngine] = useState<GameWrapper>();
    const [renderer, setRenderer] = useState<ThreeRenderer>();
    const [state, setState] = useState<WatchState>(WatchState.PAUSED);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [gameProgress, setGameProgress] = useState(0.0);
    const [canvasDim, setCanvasDim] = useState(CANVAS_DIM);

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
                renderer?.reset();
            }

            return newState;
        });
    }, [step, frames, renderer]);

    const handleRestart = useCallback(() => {
        step.current = 0;
        renderer?.reset();
        setState(WatchState.PLAYING);
    }, [step, frames, renderer]);

    const handleToggleFullscreen = useCallback(() => {
        if(!document.fullscreenElement) {
            if(fullscreenContainer.current?.requestFullscreen) {
                fullscreenContainer.current?.requestFullscreen();
            }
        } 
        else {
            if(document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }, [fullscreenContainer])

    const changeCanvasDim = (dim: {w: number, h: number}) => {
        if(canvas.current) {
            canvas.current.width = dim.w;
            canvas.current.height = dim.h;
            canvas.current.style.width = dim.w + 'px';
            canvas.current.style.height = dim.h + 'px';
        }
    };

    const handleFullscreenChanged = useCallback(() => {
        if (document.fullscreenElement) {
            const ratio = (canvas.current?.width||0) / (canvas.current?.height||1);
            if(canvas.current) {
                const h = document.fullscreenElement.clientHeight;
                const w = h * ratio;
                setCanvasDim({w, h});
            }
        }
        else {
            setCanvasDim(CANVAS_DIM);
        }
    }, [canvas]);

    useEffect(() => {
        document.addEventListener('fullscreenchange', handleFullscreenChanged);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChanged);
    }, [handleFullscreenChanged]);

    useEffect(() => {
        changeCanvasDim(canvasDim);
        renderer?.resize_canvas(canvasDim);
    }, [canvasDim, renderer]);

    useEffect(() => {
        if(canvas.current && !renderer) {
            const renderer = new ThreeRenderer(canvas.current);
            setRenderer(renderer);
        }
    }, [canvas.current, renderer]);

    const loadAssets = useCallback(async () => {
        if(renderer && loadingProgress === 0) {
            try {
                setLoadingProgress(5);
                const assets = await matchGetAssets(main, props.match.id);
                for(let i = 0; i < assets.length; i++) {
                    await renderer.load_asset(i, assets[i]);
                }
                setAssets(assets);
            }
            finally {
                setLoadingProgress(100);
            }
        }
    }, [props.match.id, renderer, loadingProgress]);

    useEffect(() => {
        loadAssets();
    }, [loadAssets]);

    useEffect(() => {
        renderer?.change_pov(props.pov);
    }, [props.pov, renderer]);

    useEffect(() => {
        if(steps.data?.pages.length) {
            if(!steps.isFetching && !steps.isFetchingNextPage) {
                steps.fetchNextPage()
            }
        }
    }, [steps.data?.pages.length]);

    useEffect(() => {
        if(assets && !engine && state === WatchState.PAUSED) {
            const {options} = props.match;
            const game_options = new Map(options.game_options);
            
            setEngine(new GameWrapper(
                new GameOptionsWrapper(
                    new ObjectFOVWrapper(
                        15.0, 
                        180.0*(Math.PI/180.0), 
                        40.0
                    ), 
                    props.match.players.length, 
                    4, 
                    20.0, 
                    false,
                    false,
                    20000
                )
            ));
            setState(WatchState.PLAYING);
        }
    }, [props.match.options, state, engine, assets]);

    useLayoutEffect(() => {
        if(engine && frames.length > 0) {
            let timerId: number = 0;

            const animate = () => {
                switch(state) {
                    case WatchState.PLAYING:
                        if(step.current < frames.length) {
                            const frame = frames[step.current];
                            try {
                                engine.render(
                                    frame.entities as Uint8Array, 
                                    frame.events as Uint8Array, 
                                    renderer
                                );
                            }
                            catch(e) {
                                console.error(e);
                            }
                            setGameProgress(step.current / frames.length * 100.0);
                            ++step.current;
                            if(step.current >= frames.length) {
                                setState(WatchState.FINISHED);
                            }
                        }
                        break;
                    case WatchState.PAUSED:
                        engine.render(
                            Uint8Array.from([]), 
                            Uint8Array.from([]), 
                            renderer
                        );
                        break;
                    case WatchState.FINISHED:
                        //renderer?.show_winner(props.match.won_by as any);
                        engine.render(
                            Uint8Array.from([]), 
                            Uint8Array.from([]), 
                            renderer
                        );
                        break;
                }

                timerId = requestAnimationFrame(animate);
            }

            timerId = requestAnimationFrame(animate)
            return () => cancelAnimationFrame(timerId)
        }
        else {
            return () => {};
        };
    }, [engine, steps, frames, state, renderer, props.match]);

    return (
        <Center                 
            ref={fullscreenContainer} 
        >
            <div
                className={classes.container}>
                <canvas 
                    ref={canvas}
                    className={classes.canvas}
                    width={canvasDim.w}
                    height={canvasDim.h}
                >
                </canvas>
                <Grid className={classes.controls}>
                    <div className={classes.progress_container}>
                        <div 
                            className={classes.progress} 
                            style={{width:`${gameProgress}%`}}
                        />
                    </div>
                    <Grid.Col span={3}>
                        <Group position="left">
                            <ActionIcon>
                                <IconQuestionMark />
                            </ActionIcon>
                        </Group>
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <Group position="center">
                            <ActionIcon
                                variant="outline"
                                onClick={handleRestart}
                            >
                                <IconRefresh />
                            </ActionIcon>
                            <ActionIcon
                                variant="outline"
                                onClick={handleTogglePlay}
                            >
                                {state === WatchState.PAUSED || state === WatchState.FINISHED?
                                    <IconPlayerPlay />
                                :
                                    <IconPlayerPause />
                                }
                            </ActionIcon>
                        </Group>
                    </Grid.Col>
                    <Grid.Col span={3}>
                        <Group position="right">
                            <ActionIcon
                            >
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
                    </Grid.Col>
                </Grid>
            </div>
        </Center>
    );
};