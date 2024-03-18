import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Center, createStyles } from "@mantine/core";
import { GameResponse} from "@declarations/neuralarena_be/neuralarena_be.did";
import { ThreeSceneRenderer } from "@renderers/ThreeSceneRenderer";

const useStyles = createStyles((theme) => ({
    canvas: {
        display: 'block',
        margin: 'auto',
    },
}));

interface Props {
    game: GameResponse
}

const CANVAS_DIM = {w: 900, h: 506};

export const Intro = (props: Props) => {
    const { classes } = useStyles();
    const canvas = useRef<HTMLCanvasElement|null>(null);
    const [renderer, setRenderer] = useState<ThreeSceneRenderer>();
    const [canvasDim, setCanvasDim] = useState(CANVAS_DIM);

    const changeCanvasDim = (dim: {w: number, h: number}) => {
        if(canvas.current) {
            canvas.current.width = dim.w;
            canvas.current.height = dim.h;
            canvas.current.style.width = dim.w + 'px';
            canvas.current.style.height = dim.h + 'px';
        }
    };

    useEffect(() => {
        changeCanvasDim(canvasDim);
        renderer?.resizeCanvas(canvasDim);
    }, [canvasDim, renderer]);

    useEffect(() => {
        if(canvas.current && !renderer) {
            const renderer = new ThreeSceneRenderer(
                canvas.current, 
                props.game.info
            );
            setRenderer(renderer);
        }
    }, [canvas.current, renderer, props.game.info]);

    useLayoutEffect(() => {
        if(renderer) {
            let timerId = 0;
            const animate = () => {
                renderer.render();
                timerId = requestAnimationFrame(animate);
            }

            timerId = requestAnimationFrame(animate)
            return () => cancelAnimationFrame(timerId)
        }
        else {
            return () => {};
        };
    }, [renderer]);

    return (
        <Center                 
        >
            <canvas 
                ref={canvas}
                className={classes.canvas}
                width={canvasDim.w}
                height={canvasDim.h}
            >
            </canvas>
        </Center>
    );
};