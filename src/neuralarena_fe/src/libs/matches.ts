import { 
    Asset,
    _SERVICE as Main, 
    MatchRequest, MatchResponse, 
    MatchStatus, 
    InstanceStepsResponse, 
    Pagination, 
    MatchJoinRequest,
    MatchWalletLog,
    UserNftRequest
} from "@declarations/neuralarena_be/neuralarena_be.did";
import { GameId } from "./games";
import { principalToString } from "./icp";

export type MatchId = string;

export const MIN_PLAYERS: number = 2;
export const MAX_PLAYERS: number = 10;
export const MAX_DURATION: number = 60*10;      // in seconds
export const MIN_DEADLINE: number = 60*60*1;    // ditto
export const MAX_DEADLINE: number = 60*60*24*7; // ditto

export const matchCalcTimeLeft = (
    match: MatchResponse
): Date => {
    return new Date(Number((match.created_at / 1_000_000n) + match.deadline * 1_000n) - Date.now());
};

export const matchOpenOrRunning = (
    match: MatchResponse|undefined
): boolean => {
    return match? 
        'OPEN' in match.state.status || 
        'RUNNING' in match.state.status: 
    false;
}

export const matchStatusToString = (
    status: MatchStatus|undefined
): string => {
    if(!status) {
        return 'UNKNOWN';
    }
    
    if('CANCELLED' in status) {
        return 'CANCELLED';
    }
    else if('EXPIRED' in status) {
        return 'EXPIRED';
    }
    else if('RUNNING' in status) {
        return 'RUNNING';
    }
    else if('OPEN' in status) {
        return 'OPEN';
    }
    else if('FINISHED' in status) {
        return 'FINISHED';
    }

    return 'UNKNOWN';
}

export const matchWalletLogOpToString = (
    log: MatchWalletLog|undefined
): string => {
    if(!log) {
        return '';
    }
    
    if('Deposit' in log.op) {
        return 'Deposit';
    }
    else if('Reimburse' in log.op) {
        return 'Reimburse';
    }
    else if('GameDist' in log.op) {
        return 'GameDist';
    }
    else if('PlatformDist' in log.op) {
        return 'PlatformDist';
    }
    else if('WinnerDist' in log.op) {
        return 'WinnerDist';
    }
    else if('Burn' in log.op) {
        return 'Burn';
    }

    return 'UNKNOWN';
}

export const matchWalletLogAccToString = (
    log: MatchWalletLog|undefined
): string => {
    if(!log) {
        return '';
    }
    
    if('Str' in log.acc) {
        return log.acc.Str;
    }
    else if('Prin' in log.acc) {
        return principalToString(log.acc.Prin);
    }
    else if('Main' in log.acc) {
        return 'Main';
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
    req: MatchJoinRequest
): Promise<void> => {
    const res = await main.match_join(req);
    if('Err' in res) {
        throw new Error(res.Err);
    }
    return; 
};

export const matchCreateAndJoin = async (
    main: Main,
    req: MatchRequest,
    nft: UserNftRequest
): Promise<MatchResponse> => {
    const res = await main.match_create_and_join(req, nft);
    if('Err' in res) {
        throw new Error(res.Err);
    }
    return res.Ok; 
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

export const matchFindAll = async (
    main: Main,
    pag: Pagination
): Promise<MatchResponse[]> => {
    const res = await main.match_find_all(pag);
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
): Promise<InstanceStepsResponse> => {
    const res = await main.match_get_steps(id, pag);
    if('Err' in res) {
        throw new Error(res.Err);
    }
    return res.Ok; 
};

export const matchGetAssets = async (
    main: Main,
    id: MatchId
): Promise<Map<number, Asset>> => {
    const res = await main.match_get_assets(id);
    if('Err' in res) {
        throw new Error(res.Err);
    }

    const assets = new Map<number, Asset>();
    for(const e of res.Ok.assets) {
        assets.set(Number(e[0]), e[1]);
    }
    
    return assets; 
};
