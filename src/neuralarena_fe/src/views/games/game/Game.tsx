import React from "react";
import { useParams } from "react-router-dom";
import { useGameFindById } from "../../../hooks/games";
import { Card } from "./Card";
import { Space } from "@mantine/core";
import { Latest } from "../../matches/Latest";

interface Props {
}

export const Game = (props: Props) => {
    const {id} = useParams();
    const game = useGameFindById(id);

    return (
        <>
            <div>
                {game && game.data &&
                    <Card 
                        game={game.data} 
                    />
                }
            </div>
            <Space h="xl" />
            <div>
                <Latest game={game.data} />
            </div>
        </>
    );
};