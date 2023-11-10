import { _SERVICE as Main, GameRequest, GameResponse, Pagination } from "../../../declarations/main/main.did";

export const gameCreate = async (
    main: Main,
    req: GameRequest
): Promise<GameResponse> => {
    const res = await main.games_create(req);
    if('Err' in res) {
        throw new Error(res.Err);
    }
    return res.Ok; 
};

export const gameUpdate = async (
    main: Main,
    id: string,
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
    id: string
): Promise<void> => {
    const res = await main.game_delete(id);
    if('Err' in res) {
        throw new Error(res.Err);
    }
    return; 
};

export const gameFindById = async (
    main: Main,
    id: string
): Promise<GameResponse> => {
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
