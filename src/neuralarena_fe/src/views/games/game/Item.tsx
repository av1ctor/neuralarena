import React from "react";
import { GameResponse } from "@declarations/neuralarena_be/neuralarena_be.did";
import { GameCard } from "./Card";

interface Props {
    game: GameResponse;
    navigate?: boolean;
}
  
export const GameItem = (props: Props) => {
    return (
        <GameCard 
            game={props.game}
            navigate={props.navigate}
        />
    );
};