import { Center, createStyles } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import React, { useEffect, useMemo, useRef, useState } from "react"

const useStyles = createStyles((theme) => ({
    box: {
        border: `1px solid ${theme.colors.gray[8]}`,
        borderRadius: '8px',
    }
}));

const CANVAS_DEFAULT_DIM = {w: 450, h: 253};
const NEURONS_GAP = 10;
const NEURONS_RADIUS = 1;

interface Props {
    inp: number;
    hidden: number[];
    out: number;
}

export const NeuralNetArch = ({inp, hidden, out}: Props) => {
    const canvas = useRef<HTMLCanvasElement | null>(null);
    const [dim, setDim] = useState(CANVAS_DEFAULT_DIM);
    const { ref, width } = useElementSize();
    const {classes} = useStyles();

    const changeCanvasDim = (dim: {w: number, h: number}) => {
        if(canvas.current) {
            canvas.current.width = dim.w;
            canvas.current.height = dim.h;
            canvas.current.style.width = dim.w + 'px';
            canvas.current.style.height = dim.h + 'px';
        }
    };

    useEffect(() => {
        const height = width * (width > 640? 0.5: 1.0);
        const dim = {w: width, h: height};
        changeCanvasDim(dim);
        setDim(dim);
    }, [width]);

    const inpn = useMemo(() => {
        const res = [];
        const y = NEURONS_GAP / 2 + (dim.h / 2) - ((NEURONS_GAP * inp) / 2);
        for(let i = 0; i < inp; i++) {
            res.push({
                x: 30, y: 
                y + NEURONS_GAP * i
            });
        }
        return res;
    }, [inp, dim]);

    const outn = useMemo(() => {
        const res = [];
        const y = NEURONS_GAP / 2 + (dim.h / 2) - ((NEURONS_GAP * out) / 2);
        for(let i = 0; i < out; i++) {
            res.push({
                x: dim.w-30, 
                y: y + NEURONS_GAP * i
            });
        }
        return res;
    }, [out, dim]);

    const hidn = useMemo(() => {
        const res = [];
        for(let j = 0; j < hidden.length; j++) {
            const nodes = [];
            const y = NEURONS_GAP / 2 + (dim.h / 2) - ((NEURONS_GAP * hidden[j]) / 2);
            for(let i = 0; i < hidden[j]; i++) {
                nodes.push({
                    x: (dim.w/2)-(NEURONS_RADIUS/2), 
                    y: y + NEURONS_GAP * i
                });
            }
            res.push(nodes);
        }
        return res;
    }, [hidden, dim]);

    useEffect(() => {
        const ctx = canvas.current?.getContext('2d');
        if(ctx) {
            ctx.clearRect(0, 0, dim.w, dim.h);
            
            ctx.strokeStyle = "#80808020";
            for(const sn of inpn) {
                for(const nodes of hidn) {
                    for(const tn of nodes) {
                        ctx.beginPath();
                        ctx.moveTo(sn.x, sn.y);
                        ctx.lineTo(tn.x, tn.y);
                        ctx.stroke();
                    }
                }
            }

            for(const nodes of hidn) {
                for(const sn of nodes) {
                    for(const tn of outn) {
                        ctx.beginPath();
                        ctx.moveTo(sn.x, sn.y);
                        ctx.lineTo(tn.x, tn.y);
                        ctx.stroke();
                    }
                }
            }
            
            ctx.fillStyle = "#fff";
            for(const n of inpn) {
                ctx.beginPath();
                ctx.arc(n.x, n.y, NEURONS_RADIUS, 0.0, Math.PI * 2.0);
                ctx.fill();
            }

            ctx.fillStyle = "#0f0";
            for(const nodes of hidn) {
                for(const n of nodes) {
                    ctx.beginPath();
                    ctx.arc(n.x, n.y, NEURONS_RADIUS, 0.0, Math.PI * 2.0);
                    ctx.fill();
                }
            }

            ctx.fillStyle = "#f00";
            for(const n of outn) {
                ctx.beginPath();
                ctx.arc(n.x, n.y, NEURONS_RADIUS, 0.0, Math.PI * 2.0);
                ctx.fill();
            }
        }

    }, [inpn, hidn, outn, dim]);
    
    return (
        <Center                 
            ref={ref} 
            className={classes.box}
            mt="lg"
        >
            <canvas 
                ref={canvas}
                width={dim.w}
                height={dim.h}
            >
            </canvas>
        </Center>
    )
}