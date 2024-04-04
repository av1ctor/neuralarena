import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Center, createStyles, rem } from "@mantine/core";
import { GameResponse, MatchResponse} from "@declarations/neuralarena_be/neuralarena_be.did";
import { ThreeSceneRenderer } from "@renderers/ThreeSceneRenderer";
import { useElementSize } from "@mantine/hooks";
import { useFont } from "@hooks/font";
import { matchStatusToString } from "@libs/matches";
import { useAuth } from "@hooks/auth";
import { useBrowser } from "@hooks/browser";
import { timeLeftToString } from "@libs/time";

const useStyles = createStyles((theme) => {
    const {isMobile} = useBrowser();
    
    return {
        container: {
            position: 'relative',
            margin: 'auto',
        },
        canvas: {
            display: 'block',
            margin: 'auto',
            borderRadius: '8px',
        },

        message_container: {
            position: 'absolute',
            left: '10px',
            right: '10px',
            bottom: "45%",
            padding: '8px',
            overflowY: 'hidden',
            backgroundColor: '#0009',
            borderRadius: rem(isMobile? 6: 8),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',

        },
        message: {
            position: 'relative',
            fontSize: rem(isMobile? 12: 18),
            fontWeight: 700,
            color: theme.primaryColor,
        },

        countdown_container: {
            position: 'absolute',
            right: '10px',
            bottom: '10px',
            margin: 0,
            padding: '8px',
            backgroundColor: '#0009',
            borderRadius: rem(isMobile? 6: 8),
            color: theme.primaryColor,
            fontSize: rem(isMobile? 14: 20),
            fontWeight: 700,
            animation: 'blinker 1s linear infinite',

            '@keyframes blinker': {
                '50%': {
                    opacity: 0,
                }
            }
        },
    };
});

interface Props {
    match: MatchResponse,
    game: GameResponse
}

const CANVAS_DEFAULT_DIM = {w: 450, h: 253};

export const MatchIntro = (props: Props) => {
    const {user} = useAuth();
    const {classes} = useStyles();
    const canvas = useRef<HTMLCanvasElement|null>(null);
    const [renderer, setRenderer] = useState<ThreeSceneRenderer>();
    const [dim, setDim] = useState(CANVAS_DEFAULT_DIM);
    const {ref, width} = useElementSize();
    const [timeLeft, setTimeLeft] = useState<Date|undefined>();
    const secondsCounter = useRef(0);
    const timerId = useRef(0);
    const font = useFont('gentilis');
    const rendererLoading = useRef(false);

    const changeCanvasDim = (dim: {w: number, h: number}) => {
        if(canvas.current) {
            canvas.current.width = dim.w;
            canvas.current.height = dim.h;
            canvas.current.style.width = dim.w + 'px';
            canvas.current.style.height = dim.h + 'px';
        }
    };

    useEffect(() => {
        const height = width / (16.0/9.0);
        const dim ={w: width, h: height};
        changeCanvasDim(dim);
        renderer?.resizeCanvas(dim);
        setDim(dim);
    }, [width, renderer]);

    useEffect(() => {
        (async () => {
            if(canvas.current && !renderer && !rendererLoading.current) {
                rendererLoading.current = true;
                try {
                    const renderer = new ThreeSceneRenderer(
                        canvas.current, 
                        props.game.info,
                        font
                    );
                    setRenderer(renderer);
                    await renderer.loadAssets(props.game.info);
                }
                finally {
                    rendererLoading.current = false;
                }
            }
        })();
    }, [canvas.current, renderer, props.game.info, font, rendererLoading]);

    const then = useRef(performance.now());

    useLayoutEffect(() => {
        if(renderer) {
            const animate = (timeStamp: number) => {
                secondsCounter.current += timeStamp;
                if(secondsCounter.current >= 1000.0) {
                    secondsCounter.current = 0;
                    const timeLeft = new Date(
                        Number(
                            (props.match.created_at / 1_000_000n) + 
                            props.match.deadline * 1_000n
                        ) - Date.now()
                    );
                    setTimeLeft(timeLeft);
                }

                const now = performance.now();
                const interval = 1000.0 / props.game.info.fps;
                const deltaTime = now - then.current;

                if(deltaTime >= interval) {
                    then.current = now - (deltaTime % interval);

                    renderer.update(deltaTime);
                    renderer.render();
                }
                
                timerId.current = requestAnimationFrame(animate);
            }

            then.current = performance.now();
            timerId.current = requestAnimationFrame(animate)
            return () => cancelAnimationFrame(timerId.current)
        }
        else {
            return () => {};
        };
    }, [renderer, props.match, props.game]);

    useEffect(() => {
        return () => {
            renderer?.stopAudio();
        }
    }, [renderer]);

    const {match} = props;

    const status = matchStatusToString(match.state.status);
    const joined = user && 
        match.players.find(p => p.id.compareTo(user.id) === 'eq');

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

                <div 
                    className={classes.message_container}
                >
                    <div 
                        className={classes.message}
                    >
                        {status === 'OPEN'?
                            joined?
                                "Waiting for players to join or for the deadline..."
                            :
                                user?
                                    "Join now before the deadline ends!"
                                :
                                    "Please log in or sign up to be able to join this match!"
                        :
                            status === 'RUNNING'?
                                "This match is running. Waiting for the results!"
                            :
                                `This match is ${status}.`
                        }
                    </div>
                </div>

                {status === 'OPEN' &&
                    <div className={classes.countdown_container}>
                        ⛹️‍♀️ {match.players.length}/{match.game.max_players.toString()} ⏰ {timeLeft && timeLeftToString(timeLeft)}
                    </div>
                }
            </div>

        </Center>
    );
};