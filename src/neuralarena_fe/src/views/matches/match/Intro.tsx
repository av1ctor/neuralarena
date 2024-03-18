import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Center, createStyles } from "@mantine/core";
import { GameResponse} from "@declarations/neuralarena_be/neuralarena_be.did";
import { ThreeSceneRenderer } from "@renderers/ThreeSceneRenderer";
import { useElementSize } from "@mantine/hooks";

const useStyles = createStyles((theme) => ({
    canvas: {
        display: 'block',
        margin: 'auto',
        borderRadius: '8px',
    },
}));

interface Props {
    game: GameResponse
}

const CANVAS_DEFAULT_DIM = {w: 450, h: 253};

export const Intro = (props: Props) => {
    const { classes } = useStyles();
    const canvas = useRef<HTMLCanvasElement|null>(null);
    const [renderer, setRenderer] = useState<ThreeSceneRenderer>();
    const [dim, setDim] = useState(CANVAS_DEFAULT_DIM);
    const { ref, width } = useElementSize();

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
            ref={ref} 
        >
            <canvas 
                ref={canvas}
                className={classes.canvas}
                width={dim.w}
                height={dim.h}
            >
            </canvas>
        </Center>
    );
};