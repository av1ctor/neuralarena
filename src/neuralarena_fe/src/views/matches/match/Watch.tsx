import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ActionIcon, Center, Grid, Group, createStyles } from "@mantine/core";
import { 
    Asset, MatchResponse, InstanceStep, 
    GameResponse, GameEndCredits 
} from "@declarations/neuralarena_be/neuralarena_be.did";
import { useMatchGetSteps } from "@hooks/matches";
import { ThreeGameRenderer } from "@renderers/ThreeGameRenderer";
import { matchGetAssets } from "@libs/matches";
import { useActors } from "@hooks/actors";
import { useUI } from "@hooks/ui";
import gameEngineInit, {GameEngine} from "@game-engine/game-engine";
import { 
    IconPlayerPause, IconPlayerPlay, IconQuestionMark, 
    IconReload, 
    IconWindowMaximize, IconWindowMinimize, 
} from "@tabler/icons-react";
import { EndCredits } from "@views/games/game/EndCredits";
import { useElementSize } from "@mantine/hooks";
import { useFont } from "@hooks/font";
import { useGameGetEndCredits } from "@hooks/games";

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
        height: '4px',
        ":hover": {
            height: '12px',
            cursor: 'pointer',
        }
    },
    progress: {
        position: 'absolute',
        left: 0,
        width: '1%',
        height: '100%',
        backgroundColor: '#f00',
    },
    canvas: {
        display: 'block',
        margin: 'auto',
        borderRadius: '8px',
    },
    credits_ctn: {
        position: 'absolute',
        top: '12px',
        left: '12px',
        bottom: '64px',
        right: '12px',
        overflowY: 'auto',
        backgroundColor: '#0009',
    },
    credits: {
        display: 'block',
        position: 'relative',
        width: '100%',
    }
}));

enum WatchState {
    LOADING,
    PAUSED,
    PLAYING,
    FINISHED,
}

interface Props {
    game: GameResponse,
    match: MatchResponse,
    pov: number|undefined,
}

const SECONDS_PER_CALL = 10;
const CANVAS_DEFAULT_DIM = {w: 450, h: 253};

export const MatchWatch = (props: Props) => {
    const {showError} = useUI();
    const { main } = useActors();
    const { classes, cx } = useStyles();
    const canvas = useRef<HTMLCanvasElement|null>(null);
    const [assets, setAssets] = useState<Map<number, Asset>|undefined>();
    const [engine, setEngine] = useState<GameEngine>();
    const [renderer, setRenderer] = useState<ThreeGameRenderer>();
    const [state, setState] = useState<WatchState>(WatchState.LOADING);
    const [endCreditsVisible, setEndCreditsVisible] = useState(false);
    const [matchProgress, setMatchProgress] = useState(0.0);
    const { ref, width } = useElementSize();
    const [dim, setDim] = useState(CANVAS_DEFAULT_DIM);
    const font = useFont('gentilis');
    const assetsLoading = useRef(false);
    const engineLoading = useRef(false);
    const rendererLoading = useRef(false);

    const steps = useMatchGetSteps(props.match.id, SECONDS_PER_CALL * props.game.info.fps)
    const credits = useGameGetEndCredits(props.game.id);
    const step = useRef(0);
    const timerId = useRef(0);

    const frames = useMemo((): InstanceStep[] => {
        return steps.data?.pages.flat().map(s => s.steps).flat() || [];
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

    const handleToggleCredits = useCallback(() => {
        setEndCreditsVisible(visible => !visible);
    }, [])

    const handleToggleFullscreen = useCallback(() => {
        if(!document.fullscreenElement) {
            if(ref.current?.requestFullscreen) {
                ref.current?.requestFullscreen();
            }
        } 
        else {
            if(document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }, [ref])

    const handleSkip = useCallback((e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const t = (e.clientX - rect.left) / (rect.right - rect.left);
        const stp = Math.floor(t * frames.length)|0;
        if(stp === 0) {
            step.current = 0;
            renderer?.reset(true, true);
        }
        else {
            renderer?.setSkipping(true);
            let first = step.current;
            if(stp < step.current) {
                first = 0;
                renderer?.reset(false, false);
            }
            else {
                renderer?.stopPositionalAudio();
            }

            for(let i = first; i < stp; i++) {
                const frame = frames[i];
                try {
                    engine?.render(
                        frame.entities as Uint8Array,
                        frame.events as Uint8Array, 
                        renderer,
                        1000.0 / props.game.info.fps
                    );
                }
                catch(e) {
                    console.error(e);
                }
            }
            renderer?.setSkipping(false);
            step.current = stp;
        }

        if(state !== WatchState.PLAYING) {
            renderer?.changePOV();
            setState(WatchState.PLAYING);
        }
    
        setMatchProgress(t * 100.0);
    }, [step, frames, renderer, engine, state]);

    const changeCanvasDim = (dim: {w: number, h: number}) => {
        if(canvas.current) {
            canvas.current.width = dim.w;
            canvas.current.height = dim.h;
            canvas.current.style.width = dim.w + 'px';
            canvas.current.style.height = dim.h + 'px';
        }
    };

    const resizeCanvas = (dim: {w: number, h: number}) => {
        changeCanvasDim(dim);
        renderer?.resizeCanvas(dim);
        setDim(dim);
    };

    const handleFullscreenChanged = useCallback(() => {
        if (document.fullscreenElement) {
            const ratio = (canvas.current?.width||0) / (canvas.current?.height||1);
            if(canvas.current) {
                const h = document.fullscreenElement.clientHeight;
                const w = h * ratio;
                resizeCanvas({w, h});
            }
        }   
    }, [canvas, renderer]);

    useEffect(() => {
        document.addEventListener('fullscreenchange', handleFullscreenChanged);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChanged);
    }, [handleFullscreenChanged]);

    useEffect(() => {
        if(!document.fullscreenElement) {
            const height = width / (16.0/9.0);
            resizeCanvas({w: width, h: height});
        }
    }, [width, renderer]);

    useEffect(() => {
        if(canvas.current && !renderer && !rendererLoading.current) {
            rendererLoading.current = true;
            try {
                const renderer = new ThreeGameRenderer(
                    canvas.current, 
                    props.game.info,
                    props.match.players,
                    font
                );
                setRenderer(renderer);
            }
            finally {
                rendererLoading.current = false;
            }
        }
    }, [canvas.current, renderer, props.game.info, props.match.players, font, rendererLoading]);

    const loadAssets = useCallback(async () => {
        if(renderer && !assetsLoading.current) {
            try {
                assetsLoading.current = true;
                renderer.toggleLoading(true);
                const assets = await matchGetAssets(main, props.match.id);
                for(const e of assets.entries()) {
                    await renderer.load_asset(e[0], e[1]);
                }
                setAssets(assets);
            }
            catch(e) {
                console.log(e);
                showError(e);
            }
            finally {
                renderer.toggleLoading(false);
                assetsLoading.current = false;
            }
        }
    }, [props.match.id, renderer, assetsLoading]);

    useEffect(() => {
        loadAssets();
    }, [loadAssets]);

    useEffect(() => {
        if(props.pov !== undefined) {
            renderer?.changePOV(props.pov);
        }
    }, [props.pov, renderer]);

    useEffect(() => {
        if(steps.data?.pages.length) {
            if(!steps.isFetching && !steps.isFetchingNextPage) {
                steps.fetchNextPage()
            }
        }
    }, [steps.data?.pages.length]);

    const load_engine = useCallback(async () => {
        if(!engineLoading.current && !engine) {
            try {
                engineLoading.current = true;
                await gameEngineInit(props.game.info.urls.engine_wasm);
                setEngine(new GameEngine());
            }
            catch(e) {
                console.log(e);
                showError(e);
            }
            finally {
                engineLoading.current = false;
            }
        }
    }, [props.game, engine, engineLoading]);

    useEffect(() => {
        load_engine();
    }, [load_engine]);

    useEffect(() => {
        if(engine && assets && frames.length > 0) {
            setState(WatchState.PLAYING);
        }
    }, [engine, assets, frames.length]);

    const then = useRef(performance.now());
    
    useLayoutEffect(() => {
        const animate = () => {
            const interval = 1000.0 / props.game.info.fps;
            const now = performance.now();
            const deltaTime = now - then.current;
            if(deltaTime >= interval) {
                then.current = now - (deltaTime % interval);

                try {
                    switch(state) {
                        case WatchState.LOADING:
                            renderer?.update(deltaTime);
                            renderer?.render();
                            break;

                        case WatchState.PLAYING:
                            if(step.current === 0) {
                                renderer?.showStart();
                                renderer?.playMusic();
                            }

                            if(step.current < frames.length) {
                                const frame = frames[step.current];
                                engine?.render(
                                    frame.entities as Uint8Array,
                                    frame.events as Uint8Array, 
                                    renderer,
                                    deltaTime
                                );
                                
                                setMatchProgress(step.current / frames.length * 100.0);
                                ++step.current;
                                if(step.current >= frames.length) {
                                    if('FINISHED' in props.match.state.status) {
                                        setState(WatchState.FINISHED);
                                    }
                                }
                            }
                            break;

                        case WatchState.PAUSED:
                            engine?.render(
                                Uint8Array.from([]), 
                                Uint8Array.from([]), 
                                renderer,
                                deltaTime
                            );
                            break;

                        case WatchState.FINISHED:
                            if(props.match.won_by.length > 0) {
                                const winnerPrincipal = props.match.won_by[0]?.toString();
                                const winner = props.match.players
                                    .findIndex(p => p.id.toString() === winnerPrincipal);
                                renderer?.changePOV(winner, true);
                            }

                            engine?.render(
                                Uint8Array.from([]), 
                                Uint8Array.from([]), 
                                renderer,
                                deltaTime
                            );
                            break;
                    }
                }
                catch(e) {
                    console.error(e);
                }
            }
            
            timerId.current = requestAnimationFrame(animate);
        }

        then.current = performance.now();
        timerId.current = requestAnimationFrame(animate);
        return () => {
            cancelAnimationFrame(timerId.current);
        }
    }, [engine, frames.length, state, renderer, props.match, props.game]);

    useEffect(() => {
        return () => {
            renderer?.stopFixedAudio();
            renderer?.stopPositionalAudio();
        }
    }, [renderer]);

    return (
        <Center                 
            ref={ref} 
        >
            <div
                className={classes.container}
            >
                <canvas 
                    ref={canvas}
                    className={classes.canvas}
                    width={dim.w}
                    height={dim.h}
                    >
                </canvas>
                {endCreditsVisible && 
                    <div className={classes.credits_ctn}>
                        <div className={classes.credits}>
                            <EndCredits 
                                credits={credits.data} 
                                level={0} 
                            />
                        </div>
                    </div>
                }
                <Grid className={classes.controls}>
                    <div 
                        className={classes.progress_container}
                        onClick={handleSkip}
                    >
                        <div 
                            className={classes.progress} 
                            style={{width:`${matchProgress}%`}}
                        />
                    </div>
                    <Grid.Col span={3}>
                        <Group position="left">
                            <ActionIcon
                                onClick={handleToggleCredits}
                            >
                                <IconQuestionMark />
                            </ActionIcon>
                        </Group>
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <Group position="center">
                            <ActionIcon
                                onClick={handleTogglePlay}
                            >
                                {state === WatchState.PAUSED?
                                    <IconPlayerPlay />
                                : state === WatchState.FINISHED?
                                    <IconReload />
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