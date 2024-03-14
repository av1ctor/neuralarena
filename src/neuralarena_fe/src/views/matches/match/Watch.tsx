import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ActionIcon, Center, Grid, Group, createStyles } from "@mantine/core";
import { 
    Asset, MatchResponse, InstanceStep, 
    GameResponse, GameEndCredits 
} from "../../../../../declarations/neuralarena_be/neuralarena_be.did";
import { useMatchGetSteps } from "../../../hooks/matches";
import { ThreeRenderer } from "../../../renderers/ThreeRenderer";
import { matchGetAssets } from "../../../libs/matches";
import { gameGetEndCredits } from "../../../libs/games";
import { useActors } from "../../../hooks/actors";
import { useUI } from "../../../hooks/ui";
import gameEngineInit, {GameEngine} from "../../../game-engine/game-engine";
import { 
    IconPlayerPause, IconPlayerPlay, IconQuestionMark, 
    IconReload, 
    IconWindowMaximize, IconWindowMinimize, 
} from "@tabler/icons-react";
import { EndCredits } from "../../games/game/EndCredits";

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
        border: '1px solid #ccc',
        borderRadius: '4px',
        margin: 'auto',
    },
    credits_ctn: {
        display: 'none',
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
    },
    visible: {
        display: 'block',
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

const FPS = 60;
const STEPS_PER_CALL = FPS*10;
const CANVAS_DIM = {w: 900, h: 506};

export const Watch = (props: Props) => {
    const {toggleLoading, showError, showSuccess} = useUI();
    const { main } = useActors();
    const { classes, cx } = useStyles();
    const canvas = useRef<HTMLCanvasElement|null>(null);
    const fullscreenContainer = useRef<HTMLDivElement|null>(null);
    const [assets, setAssets] = useState<Map<number, Asset>|undefined>();
    const [engine, setEngine] = useState<any>();
    const [renderer, setRenderer] = useState<ThreeRenderer>();
    const [state, setState] = useState<WatchState>(WatchState.LOADING);
    const [, setAssetsLoadingProgress] = useState(0);
    const [, setEngineLoadingProgress] = useState(0);
    const [endCredits, setEndCredits] = useState<GameEndCredits|undefined>();
    const [endCreditsVisible, setEndCreditsVisible] = useState(false);
    const [matchProgress, setMatchProgress] = useState(0.0);
    const [canvasDim, setCanvasDim] = useState(CANVAS_DIM);

    const assetsLoading = useRef(false);
    const engineLoading = useRef(false);

    const steps = useMatchGetSteps(props.match.id, STEPS_PER_CALL)
    const step = useRef(0);

    const frames = useMemo((): InstanceStep[] => {
        const res = new Array<InstanceStep>();

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

    const handleToggleCredits = useCallback(() => {
        setEndCreditsVisible(visible => !visible);
    }, [])

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

            for(let i = first; i < stp; i++) {
                const frame = frames[i];
                try {
                    engine?.render(
                        frame.events as Uint8Array, 
                        renderer
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
        renderer?.resizeCanvas(canvasDim);
    }, [canvasDim, renderer]);

    useEffect(() => {
        if(canvas.current && !renderer) {
            const renderer = new ThreeRenderer(
                canvas.current, 
                props.game.info,
                props.match.players
            );
            setRenderer(renderer);
        }
    }, [canvas.current, renderer, props.game.info, props.match.players]);

    const loadAssets = useCallback(async () => {
        if(renderer && !assetsLoading.current) {
            try {
                assetsLoading.current = true;
                setAssetsLoadingProgress(5);
                toggleLoading(true);
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
                toggleLoading(false);
                setAssetsLoadingProgress(100);
                assetsLoading.current = false;
            }
        }
    }, [props.match.id, renderer, assetsLoading]);

    useEffect(() => {
        loadAssets();
    }, [loadAssets]);

    const loadEndCredits = useCallback(async () => {
        try {
            const credits = await gameGetEndCredits(main, props.game.id);
            setEndCredits(credits);
        }
        catch(e) {
            console.log(e);
            showError(e);
        }
    }, [props.game.id]);

    useEffect(() => {
        loadEndCredits();
    }, [loadEndCredits]);

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
                setEngineLoadingProgress(5);
                toggleLoading(true);
                await gameEngineInit(props.game.info.urls.engine_wasm);
                setEngine(new GameEngine());
                setState(WatchState.PLAYING);
            }
            catch(e) {
                console.log(e);
                showError(e);
            }
            finally {
                toggleLoading(false);
                setEngineLoadingProgress(100);
                engineLoading.current = false;
            }
        }
    }, [props.game, engine, engineLoading]);

    useEffect(() => {
        load_engine();
    }, [load_engine]);

    useLayoutEffect(() => {
        if(engine && assets && frames.length > 0) {
            let timerId: number = 0;

            const animate = () => {
                switch(state) {
                    case WatchState.PLAYING:
                        if(step.current === 0) {
                            renderer?.showStart();
                        }
                        if(step.current < frames.length) {
                            const frame = frames[step.current];
                            try {
                                engine.render(
                                    frame.events as Uint8Array, 
                                    renderer
                                );
                            }
                            catch(e) {
                                console.error(e);
                            }
                            setMatchProgress(step.current / frames.length * 100.0);
                            ++step.current;
                            if(step.current >= frames.length) {
                                setState(WatchState.FINISHED);
                            }
                        }
                        break;
                    case WatchState.PAUSED:
                        engine.render(Uint8Array.from([]), renderer);
                        break;
                    case WatchState.FINISHED:
                        if(props.match.won_by.length > 0) {
                            const winnerPrincipal = props.match.won_by[0]?.toString();
                            const winner = props.match.players
                                .findIndex(p => p.id.toString() === winnerPrincipal);
                            renderer?.changePOV(winner, true);
                        }

                        engine.render(Uint8Array.from([]), renderer);
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
    }, [engine, assets, steps, frames, state, renderer, props.match]);

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
                <div 
                    className={cx(classes.credits_ctn, {[classes.visible]: endCreditsVisible})}
                >
                    <div className={classes.credits}>
                        <EndCredits credits={endCredits} level={0} />
                    </div>
                </div>
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