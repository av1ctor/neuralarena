import { GameResponse } from "@declarations/neuralarena_be/neuralarena_be.did";
import { Grid } from "@mantine/core";
import React from "react";
import { GameCard } from "./game/Card";

interface Props {
    games: GameResponse[]|undefined;
}

export const GamesGrid = (props: Props) => {
    const {games} = props;

    return (
        <Grid>
            {games?.map((item, index) => (
                <Grid.Col 
                    key={index} 
                    sm={12}
                >
                    <GameCard 
                        game={item}
                        showView
                    />
                </Grid.Col>
        ))}
        </Grid>
    );
}