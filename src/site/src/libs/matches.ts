import { 
    _SERVICE as Main, 
    MatchAssetsResponse, 
    MatchRequest, MatchResponse, 
    MatchStatus, 
    MatchStepsResponse, 
    Pagination 
} from "../../../declarations/main/main.did";
import { GameId } from "./games";

export type MatchId = string;

export const matchStatusToString = (
    status: MatchStatus|undefined
): string => {
    if(!status) {
        return 'UNKNOWN';
    }
    
    if('CANCELLED' in status) {
        return 'CANCELLED'
    }
    else if('RUNNING' in status) {
        return 'RUNNING'
    }
    else if('CREATED' in status) {
        return 'OPEN'
    }
    else if('STARTED' in status) {
        return 'STARTED'
    }
    else if('FINISHED' in status) {
        return 'FINISHED'
    }

    return 'UNKNOWN';
}

export const matchCreate = async (
    main: Main,
    req: MatchRequest
): Promise<MatchResponse> => {
    const res = await main.match_create(req);
    if('Err' in res) {
        throw new Error(res.Err);
    }
    return res.Ok; 
};

export const matchJoin = async (
    main: Main,
    id: MatchId
): Promise<void> => {
    const res = await main.match_join(id);
    if('Err' in res) {
        throw new Error(res.Err);
    }
    return; 
};

export const matchStart = async (
    main: Main,
    id: MatchId
): Promise<void> => {
    const res = await main.match_start(id);
    if('Err' in res) {
        throw new Error(res.Err);
    }
    return; 
};

export const matchRun = async (
    main: Main,
    id: MatchId
): Promise<void> => {
    const res = await main.match_run(id);
    if('Err' in res) {
        throw new Error(res.Err);
    }
    return; 
};

export const matchFindById = async (
    main: Main,
    id: MatchId|undefined
): Promise<MatchResponse|undefined> => {
    if(!id) {
        return undefined;
    }
    
    const res = await main.match_find_by_id(id);
    if('Err' in res) {
        throw new Error(res.Err);
    }
    return res.Ok; 
};

export const matchFindOpen = async (
    main: Main,
    pag: Pagination
): Promise<MatchResponse[]> => {
    const res = await main.match_find_open(pag);
    if('Err' in res) {
        throw new Error(res.Err);
    }
    return res.Ok; 
};

export const matchFindByGame = async (
    main: Main,
    gameId: GameId|undefined,
    pag: Pagination
): Promise<MatchResponse[]> => {
    if(!gameId) {
        return []
    };

    const res = await main.match_find_by_game(gameId, pag);
    if('Err' in res) {
        throw new Error(res.Err);
    }
    return res.Ok; 
};

export const matchGetSteps = async (
    main: Main,
    id: MatchId,
    pag: Pagination
): Promise<MatchStepsResponse> => {
    const res = await main.match_get_steps(id, pag);
    if('Err' in res) {
        throw new Error(res.Err);
    }
    return res.Ok; 
};

export const matchGetAssets = async (
    main: Main,
    id: MatchId
): Promise<Map<number, string>> => {
    const res = await main.match_get_assets(id);
    if('Err' in res) {
        throw new Error(res.Err);
    }
    
    const map = new Map<number, string>();
    for(const entry of res.Ok.assets) {
        map.set(
            Number(entry[0]), 
            entry[1].length === 0? "": entry[1][0]
        );
    }
    
    return map; 
};
