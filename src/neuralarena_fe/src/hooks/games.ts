import { 
    UseInfiniteQueryResult, UseQueryResult, useInfiniteQuery, 
    useMutation, useQuery, useQueryClient 
} from "react-query";
import { GameEndCredits, GameRequest, GameResponse } from "@declarations/neuralarena_be/neuralarena_be.did";
import { useActors } from "./actors";
import { GameId, gameCreate, gameFindActive, gameFindAll, gameFindById, gameGetEndCredits, gameGetLeaderboard } from "@libs/games";
import { Principal } from "@dfinity/principal";

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

export const useGameGetLeaderboard = (
    id: GameId|undefined,
    limit: number
): UseQueryResult<[Principal, number][], Error> => {
    const {main} = useActors();
    
    return useQuery<[Principal, number][], Error>(
        ['leaderboard', id, limit],
        () => gameGetLeaderboard(main, id, limit)
    );
}; 

export const useGameGetEndCredits = (
    id: GameId|undefined,
): UseQueryResult<GameEndCredits, Error> => {
    const {main} = useActors();
    
    return useQuery<GameEndCredits, Error>(
        ['game-credits', id],
        () => gameGetEndCredits(main, id)
    );
}; 
