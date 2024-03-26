import { 
    _SERVICE as Main, 
    GameRequest, GameResponse, 
    Pagination, Asset, GameEndCredits 
} from "@declarations/neuralarena_be/neuralarena_be.did";
import { Principal } from "@dfinity/principal";

export type GameId = string;

export const gameAssetDataTextValue = (
    asset: Asset,
    key: string
): string|undefined => {
    const field = asset.data.find(f => f[0] === key);
    if(!field || !('Text' in field[1])) {
        return undefined;
    }
    else {
        return (field[1] as any).Text;
    }
};

export const gameAssetDataU32Value = (
    asset: Asset,
    key: string
): number|undefined => {
    const field = asset.data.find(f => f[0] === key);
    if(!field || !('U32' in field[1])) {
        return undefined;
    }
    else {
        return (field[1] as any).U32;
    }
};

export const gameCreate = async (
    main: Main,
    req: GameRequest
): Promise<GameResponse> => {
    const res = await main.game_create(req);
    if('Err' in res) {
        throw new Error(res.Err);
    }
    return res.Ok; 
};

export const gameFindById = async (
    main: Main,
    id?: GameId
): Promise<GameResponse|undefined> => {
    if(!id) {
        return undefined;
    }
    
    const res = await main.game_find_by_id(id);
    if('Err' in res) {
        throw new Error(res.Err);
    }
    return res.Ok; 
};

export const gameFindAll = async (
    main: Main,
    pag: Pagination
): Promise<GameResponse[]> => {
    const res = await main.game_find_all(pag);
    if('Err' in res) {
        throw new Error(res.Err);
    }
    return res.Ok; 
};

export const gameFindActive = async (
    main: Main,
    pag: Pagination
): Promise<GameResponse[]> => {
    const res = await main.game_find_active(pag);
    if('Err' in res) {
        throw new Error(res.Err);
    }
    return res.Ok; 
};

export const gameGetEndCredits = async (
    main: Main,
    id: GameId|undefined
): Promise<GameEndCredits> => {
    if(!id) {
        return {
            title: '',
            sub: [],
            people: []
        };
    }
    
    const res = await main.game_get_end_credits(id);
    if('Err' in res) {
        throw new Error(res.Err);
    }

    return res.Ok; 
};

export const gameGetLeaderboard = async (
    main: Main,
    id: GameId|undefined,
    limit: number
): Promise<[Principal, number][]> => {
    if(!id) {
        return [];
    }
    
    const res = await main.game_get_leaderboard(id, limit);
    if('Err' in res) {
        throw new Error(res.Err);
    }
    return res.Ok; 
};
