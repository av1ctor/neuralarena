import React from "react";
import { useAuth } from "@hooks/auth";
import Landing from "./Landing";
import { TopGames } from "@views/games/Top";

export const Front = () => {
    const {isLogged} = useAuth();

    if(!isLogged) {
        return <Landing />;
    }

    return (
        <TopGames/>
    );
}