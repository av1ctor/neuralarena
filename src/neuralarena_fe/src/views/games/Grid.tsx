import { GameResponse } from "@declarations/neuralarena_be/neuralarena_be.did";
import { Grid } from "@mantine/core";
import React from "react";
import { GameItem } from "./game/Item";

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
                    <GameItem
                        game={item}
                        navigate
                    />
                </Grid.Col>
        ))}
        </Grid>
    );
}