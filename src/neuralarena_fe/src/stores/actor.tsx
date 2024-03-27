import React, {createContext, useReducer} from "react";
import { _SERVICE as Main, idlFactory as mainIdlFactory } from "@declarations/neuralarena_be/neuralarena_be.did";
import { _SERVICE as IcpLedger, idlFactory as icpLedgerIdlFactory } from "@declarations/icp_ledger_canister/icp_ledger_canister.did";
import { canisterId as mainCanisterId } from "@declarations/neuralarena_be";
import { config } from "../config";
import { Principal } from "@dfinity/principal";
import { createActor } from "@libs/icp";

export interface ActorState {
    main: Main;
    icpLedger: IcpLedger;
    ids: {
        main: Principal;
        icpLedger: Principal;
    };
};

export enum ActorActionType {
    SET_MAIN,
    RESET_MAIN,
    SET_ICP_LEDGER,
    RESET_ICP_LEDGER,
};

export interface ActorAction {
    type: ActorActionType;
    payload: any;
};

const options = {agentOptions: {host: config.IC_GATEWAY}};

const initialState: ActorState = {
    main: createActor(
        mainCanisterId, 
        mainIdlFactory,
        options
    ),
    icpLedger: createActor(
        config.ICP_LEDGER_CANISTER_ID!.toText(), 
        icpLedgerIdlFactory,
        options
    ),
    ids: {
        main: Principal.fromText(mainCanisterId),
        icpLedger: config.ICP_LEDGER_CANISTER_ID!,
    },
};

export const ActorContext = createContext<[ActorState, (action: ActorAction) => void]>([
    initialState, (action: ActorAction) => {}
]);

const reducer = (state: ActorState, action: ActorAction): ActorState => {
    switch(action.type) {
        case ActorActionType.SET_MAIN:
            return {
                ...state,
                main: action.payload
            };

        case ActorActionType.RESET_MAIN:
            return {
                ...state,
                main: createActor(
                    mainCanisterId, 
                    mainIdlFactory,
                    options
                )
            };
    
        case ActorActionType.SET_ICP_LEDGER:
            return {
                ...state,
                icpLedger: action.payload
            };

        case ActorActionType.RESET_ICP_LEDGER:
            return {
                ...state,
                icpLedger: createActor(
                    config.ICP_LEDGER_CANISTER_ID!.toText(), 
                    icpLedgerIdlFactory,
                    options
                )
            };
    
        default:
            return state;
    }
};

interface Props {
    children: any
};

export const ActorContextProvider = (props: Props) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    return (
        <ActorContext.Provider
            value={[state, dispatch]}>
            {props.children}
        </ActorContext.Provider>
    );
};