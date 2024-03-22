import React from "react";
import { Grid } from "@mantine/core";
import { GameResponse } from "@declarations/neuralarena_be/neuralarena_be.did";
import { GameMap_ } from "./Map";

interface Props {
    game: GameResponse|undefined;
}

export const GameMaps = (props: Props) => {
    const {game} = props;

    return (
        <Grid>
            {game?.info.maps.map((item, index) => (
                <Grid.Col 
                    key={index} 
                    md={12}
                >
                    <GameMap_
                        map={item}
                    />
                </Grid.Col>
            ))}
        </Grid>
    );
};