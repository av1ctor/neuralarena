import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Center, createStyles } from "@mantine/core";
import { MatchResponse, MatchStep } from "../../../../../declarations/main/main.did";
import { useMatchGetSteps } from "../../../hooks/matches";
import GameEngineInit, {GameWrapper, GameOptionsWrapper, ObjectFOVWrapper} from 'bot-engine';
import { Canvas2dRenderer } from "../../games/game/Canvas2dRenderer";
import { matchGetMap } from "../../../libs/matches";
import { useActors } from "../../../hooks/actors";

GameEngineInit();

const useStyles = createStyles((theme) => ({
    canvas: {
        display: 'block',
        border: '2px solid #fff',
        borderRadius: '1rem',
        width: '800px',
        height: "600px"
    },
}));

interface Props {
    match: MatchResponse
}

const STEPS_PER_CALL = 60*10;

export const Watch = (props: Props) => {
    const { main } = useActors();
    const { classes } = useStyles();
    const canvas = useRef<HTMLCanvasElement|null>(null);
    const [gameEngine, setGameEngine] = useState<GameWrapper>();
    const [map, setMap] = useState<string>();

    const steps = useMatchGetSteps(props.match.id, STEPS_PER_CALL)
    const step = useRef(0);

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

    const frames = useMemo((): MatchStep[] => {
        const res = new Array<MatchStep>();

        steps.data?.pages.forEach(p => 
            p.steps.forEach(s => res.push(s))
        );

        return res;
    }, [steps.data?.pages.length]);

    useEffect(() => {
        if(canvas.current && map) {
            const {options} = props.match;
            const game_options = new Map(options.game_options);
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
                new Canvas2dRenderer(canvas.current))
            );
        }
    }, [props.match.options, canvas.current, map]);

    useLayoutEffect(() => {
        if(gameEngine && frames.length > 0) {
            let timerId: number = 0;

            const animate = () => {
                gameEngine.deserialize_entities(frames[step.current].entities as Uint8Array)
                gameEngine.render(0, 1.0, 800, 600);        

                timerId = requestAnimationFrame(animate)
            }
            timerId = requestAnimationFrame(animate)
            return () => cancelAnimationFrame(timerId)
        }
        else {
            return () => {};
        }
    }, [gameEngine, steps]);

    return (
        <Center>
            <canvas 
                ref={canvas}
                className={classes.canvas}
            >
            </canvas>
        </Center>
    );
};