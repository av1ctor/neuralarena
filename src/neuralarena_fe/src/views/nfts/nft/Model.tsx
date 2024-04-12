import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Center, createStyles } from "@mantine/core";
import { useNAS1FindTokenById } from "@hooks/nas1";
import { NFT } from "@libs/nas1";
import { useElementSize } from "@mantine/hooks";
import { useFont } from "@hooks/font";
import { ThreeModelRenderer } from "@renderers/ThreeModelRenderer";

const useStyles = createStyles((theme) => ({
    canvas: {
        display: 'block',
        margin: 'auto',
        borderRadius: '8px',
    },
}));

const CANVAS_DEFAULT_DIM = {w: 450, h: 450*1.25};

interface Props {
    nft: NFT;
}

export const NftModel = ({nft}: Props) => {
    const {classes} = useStyles();
    const canvas = useRef<HTMLCanvasElement|null>(null);
    const [renderer, setRenderer] = useState<ThreeModelRenderer>();
    const [dim, setDim] = useState(CANVAS_DEFAULT_DIM);
    const {ref, width} = useElementSize();
    const timerId = useRef(0);
    const font = useFont('gentilis');
    const rendererLoading = useRef(false);
    const token = useNAS1FindTokenById(nft.collection_id, Number(nft.token_id));

    const changeCanvasDim = (dim: {w: number, h: number}) => {
        if(canvas.current) {
            canvas.current.width = dim.w;
            canvas.current.height = dim.h;
            canvas.current.style.width = dim.w + 'px';
            canvas.current.style.height = dim.h + 'px';
        }
    };

    useEffect(() => {
        const height = width * 1.25;
        const dim ={w: width, h: height};
        changeCanvasDim(dim);
        renderer?.resizeCanvas(dim);
        setDim(dim);
    }, [width, renderer]);

    useEffect(() => {
        (async () => {
            if(canvas.current && token.data && !renderer && !rendererLoading.current) {
                rendererLoading.current = true;
                try {
                    const renderer = new ThreeModelRenderer(
                        canvas.current, 
                        font
                    );
                    setRenderer(renderer);
                    await renderer.loadAssets(token.data.model_url, dim.w / dim.h);
                }
                finally {
                    rendererLoading.current = false;
                }
            }
        })();
    }, [canvas.current, renderer, token, font, rendererLoading]);

    const then = useRef(performance.now());

    useLayoutEffect(() => {
        if(renderer) {
            const animate = (timeStamp: number) => {
                const now = performance.now();
                const interval = 1000.0 / 30.0;
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
    }, [renderer]);

    useEffect(() => {
        return () => {
            renderer?.stopAudio();
        }
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
}