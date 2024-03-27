import { useContext } from "react";
import { ActorContext } from "@stores/actor";
import { _SERVICE as Main } from "@declarations/neuralarena_be/neuralarena_be.did";
import { _SERVICE as IcpLedger } from "@declarations/icp_ledger_canister/icp_ledger_canister.did";
import { Principal } from "@dfinity/principal";

interface Actors {
    main: Main;
    icpLedger: IcpLedger;
    ids: {
        main: Principal;
        icpLedger: Principal;
    };
};

export const useActors = (
): Actors => {
    const [actors, ] = useContext(ActorContext);
    return {
        main: actors.main,
        icpLedger: actors.icpLedger,
        ids: actors.ids,
    };
};