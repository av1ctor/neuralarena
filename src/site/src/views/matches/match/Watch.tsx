import React, { useEffect } from "react";
import { Center, createStyles } from "@mantine/core";
import { MatchResponse } from "../../../../../declarations/main/main.did";
import { useMatchGetSteps } from "../../../hooks/matches";

const useStyles = createStyles((theme) => ({
    canvas: {
        display: 'block',
        border: '2px solid #fff',
        borderRadius: '1rem',
        width: '100%',
        height: "600px"
    },
}));

interface Props {
    match: MatchResponse
}

const STEPS_PER_CALL = 60*10;

export const Watch = (props: Props) => {
    const { classes } = useStyles();

    const steps = useMatchGetSteps(props.match.id, STEPS_PER_CALL)

    useEffect(() => {
        if(steps.data?.pages.length) {
            if(!steps.isFetching && !steps.isFetchingNextPage) {
                steps.fetchNextPage()
            }
        }
    }, [steps.data?.pages.length]);

    console.log(steps.data?.pages);

    return (
        <Center>
            <canvas 
                className={classes.canvas}
            >
            </canvas>
        </Center>
    );
};