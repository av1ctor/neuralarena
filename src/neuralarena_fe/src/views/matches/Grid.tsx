import { MatchResponse } from "@declarations/neuralarena_be/neuralarena_be.did";
import { Grid } from "@mantine/core";
import React from "react";
import { MatchCard } from "./match/Card";
import { MatchItem } from "./match/Item";

interface Props {
    matches: MatchResponse[]|undefined;
}

export const MatchesGrid = (props: Props) => {
    const {matches} = props;

    return (
        <Grid>
            {matches?.map((item, index) => (
                <Grid.Col 
                    key={index} 
                    sm={12}
                >
                    <MatchItem
                        match={item}
                        showView
                    />
                </Grid.Col>
        ))}
        </Grid>
    );
}