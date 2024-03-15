import { useContext } from "react";
import { ActorContext } from "../stores/actor";
import { _SERVICE as Main } from "@declarations/neuralarena_be/neuralarena_be.did";

interface Actors {
    main: Main;
};

export const useActors = (
): Actors => {
    const [actors, ] = useContext(ActorContext);
    return {
        main: actors.main,
    };
};