import { 
    UseInfiniteQueryResult, UseQueryResult, useInfiniteQuery, 
    useMutation, useQuery, useQueryClient 
} from "react-query";
import { GameRequest, GameResponse } from "@declarations/neuralarena_be/neuralarena_be.did";
import { useActors } from "./actors";
import { GameId, gameCreate, gameFindActive, gameFindAll, gameFindById } from "@libs/games";

interface GameMethods {
    create: (req: GameRequest) => Promise<GameResponse>;
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

    return {
        create,
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

export const useGameFindAll = (
    limit: number
): UseInfiniteQueryResult<GameResponse[], Error> => {
    const {main} = useActors();

    return useInfiniteQuery<GameResponse[], Error>(
        ['games', limit], 
        ({pageParam = 0}) => gameFindAll(main, {offset: pageParam, limit}),
        {
            getNextPageParam: (lastPage, pages) => 
                lastPage.length < limit?
                    undefined:
                pages.length * limit
        }
    );
};

export const useGameFindActive = (
    limit: number
): UseInfiniteQueryResult<GameResponse[], Error> => {
    const {main} = useActors();

    return useInfiniteQuery<GameResponse[], Error>(
        ['games-active', limit], 
        ({pageParam = 0}) => gameFindActive(main, {offset: pageParam, limit}),
        {
            getNextPageParam: (lastPage, pages) => 
                lastPage.length < limit?
                    undefined:
                pages.length * limit
        }
    );
};