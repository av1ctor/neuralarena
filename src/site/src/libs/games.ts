import { _SERVICE as Main, GameRequest, GameResponse, Pagination } from "../../../declarations/main/main.did";

export type GameId = string;

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

export const gameUpdate = async (
    main: Main,
    id: GameId,
    req: GameRequest
): Promise<GameResponse> => {
    const res = await main.game_update(id, req);
    if('Err' in res) {
        throw new Error(res.Err);
    }
    return res.Ok; 
};

export const gameDelete = async (
    main: Main,
    id: GameId
): Promise<void> => {
    const res = await main.game_delete(id);
    if('Err' in res) {
        throw new Error(res.Err);
    }
    return; 
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
