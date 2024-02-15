import { Principal } from "@dfinity/principal";
import { _SERVICE as Main, UserRequest, UserResponse } from "../../../declarations/neuralarena_be/neuralarena_be.did";

export enum UserKind {
    Player,
    Staff, 
}

export const userGetKind = (
    user: UserResponse | undefined
): UserKind => {
    if(user !== undefined) {
        if('Player' in user.kind) {
            return UserKind.Player;
        }
    }

    return UserKind.Staff;
};

export const userStringToKind = (
    kind: string
): UserKind => {
    if(kind === 'Player') {
        return UserKind.Player;
    }

    return UserKind.Staff;
}

export const userIsKind = (
    user: UserResponse | undefined,
    kind: string
): boolean => {
    if(user !== undefined) {
        return kind in user.kind;
    }

    return false;
};

export const userGetPrincipal = (
    user: UserResponse | undefined
): Principal => {
    if (user !== undefined) {
        return user.id;
    }

    return Principal.anonymous();
};

export const userGetNick = (
    user: UserResponse | undefined
): string => {
    if (user !== undefined) {
        return user.nick;
    }

    return 'Unknown';
};

export const userCreatePlayer = async (
    main: Main,
    req: UserRequest
): Promise<UserResponse> => {
    const res = await main.user_create_player(req);
    if('Err' in res) {
        throw new Error(res.Err);
    }
    return res.Ok; 
};

export const userCreateStaff = async (
    main: Main,
    req: UserRequest
): Promise<UserResponse> => {
    const res = await main.user_create_staff(req);
    if('Err' in res) {
        throw new Error(res.Err);
    }
    return res.Ok; 
};

export const userUpdate = async (
    main: Main,
    id: Principal,
    req: UserRequest
): Promise<UserResponse> => {
    const res = await main.user_update(id, req);
    if('Err' in res) {
        throw new Error(res.Err);
    }
    return res.Ok; 
};

export const userDelete = async (
    main: Main,
    id: Principal
): Promise<void> => {
    const res = await main.user_delete(id);
    if('Err' in res) {
        throw new Error(res.Err);
    }
    return; 
};

export const userFindMe = async (
    main: Main
): Promise<UserResponse> => {
    const res = await main.user_find_me();
    if('Err' in res) {
        throw new Error(res.Err);
    }
    return res.Ok; 
};

export const userFindById = async (
    main: Main,
    id: Principal|undefined
): Promise<UserResponse> => {
    if(!id || id.isAnonymous()) {
        return {
            id: Principal.anonymous(),
            nick: 'anonymous',
            name: [],
            email: [],
            active: false,
            banned: false,
            kind: {
                'Player': {}
            },
            created_at: 0n,
            updated_at: [],
        };
    }

    const res = await main.user_find_by_id(id);
    if('Err' in res) {
        throw new Error(res.Err);
    }
    return res.Ok; 
};
