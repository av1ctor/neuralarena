import { UseInfiniteQueryResult, UseQueryResult, useInfiniteQuery, useMutation, useQuery, useQueryClient } from "react-query";
import { GameRequest, GameResponse } from "../../../declarations/main/main.did";
import { useActors } from "./actors";
import { GameId, gameCreate, gameDelete, gameFindActive, gameFindById, gameUpdate } from "../libs/games";

interface GameMethods {
    create: (req: GameRequest) => Promise<GameResponse>;
    update: (id: GameId, req: GameRequest) => Promise<GameResponse>;
    remove: (id: GameId) => Promise<void>;
}

export const useGame = (
): GameMethods => {
    const queryClient = useQueryClient();
    const {main} = useActors();

    const createMut = useMutation(
        async (options: {req: GameRequest}) => {
            return gameCreate(main, options.req);
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['games']);
            }   
        }
    );

    const create = (
        req: GameRequest
    ): Promise<GameResponse> => {
        return createMut.mutateAsync({req});
    };

    const updateMut = useMutation(
        async (options: {id: GameId, req: GameRequest}) => {
            return gameUpdate(main, options.id, options.req);
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['games']);
            }   
        }
    );

    const update = (
        id: GameId,
        req: GameRequest
    ): Promise<GameResponse> => {
        return updateMut.mutateAsync({id, req});
    };

    const deleteMut = useMutation(
        async (options: {id: GameId}) => {
            return gameDelete(main, options.id);
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['games']);
            }   
        }
    );

    const remove = (
        id: GameId
    ): Promise<void> => {
        return deleteMut.mutateAsync({id});
    };
    
    return {
        create,
        update,
        remove,
    }
};

export const useGameFindById = (
    id?: GameId
): UseQueryResult<GameResponse|undefined, Error> => {
    const {main} = useActors();
    
    return useQuery<GameResponse|undefined, Error>(
        ['games', id],
        () => gameFindById(main, id)
    );
}; 

export const useGameFindActive = (
    limit: number
): UseInfiniteQueryResult<GameResponse[], Error> => {
    const {main} = useActors();

    return useInfiniteQuery<GameResponse[], Error>(
        ['games', limit], 
        ({pageParam = 0}) => gameFindActive(main, {offset: pageParam, limit}),
        {
            getNextPageParam: (lastPage, pages) => 
                lastPage.length < limit?
                    undefined:
                pages.length * limit
        }
    );
};