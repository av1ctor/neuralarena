import { UseInfiniteQueryResult, UseQueryResult, useInfiniteQuery, useMutation, useQuery, useQueryClient } from "react-query";
import { MatchRequest, MatchResponse, MatchStepsResponse } from "../../../declarations/neuralarena_be/neuralarena_be.did";
import { useActors } from "./actors";
import { matchCreate, matchFindOpen, matchFindById, matchJoin, matchStart, matchRun, MatchId, matchFindByGame, matchGetSteps } from "../libs/matches";
import { GameId } from "../libs/games";

interface MatchMethods {
    create: (req: MatchRequest) => Promise<MatchResponse>;
    join: (id: MatchId) => Promise<void>;
    start: (id: MatchId) => Promise<void>;
    run: (id: MatchId) => Promise<void>;
}

export const useMatch = (
): MatchMethods => {
    const queryClient = useQueryClient();
    const {main} = useActors();

    const createMut = useMutation(
        async (options: {req: MatchRequest}) => {
            return matchCreate(main, options.req);
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['matches']);
            }   
        }
    );

    const create = (
        req: MatchRequest
    ): Promise<MatchResponse> => {
        return createMut.mutateAsync({req});
    };

    const joinMut = useMutation(
        async (options: {id: string}) => {
            return matchJoin(main, options.id);
        },
        {
            onSuccess: (_, vars) => {
                queryClient.invalidateQueries(['matches', vars.id]);
            }   
        }
    );

    const join = (
        id: string
    ): Promise<void> => {
        return joinMut.mutateAsync({id});
    };

    const startMut = useMutation(
        async (options: {id: string}) => {
            return matchStart(main, options.id);
        },
        {
            onSuccess: (_, vars) => {
                queryClient.invalidateQueries(['matches', vars.id]);
            }   
        }
    );

    const start = (
        id: string
    ): Promise<void> => {
        return startMut.mutateAsync({id});
    };

    const runMut = useMutation(
        async (options: {id: string}) => {
            return matchRun(main, options.id);
        },
        {
            onSuccess: (_, vars) => {
                queryClient.invalidateQueries(['matches', vars.id]);
            }   
        }
    );

    const run = (
        id: string
    ): Promise<void> => {
        return runMut.mutateAsync({id});
    };
    
    return {
        create,
        join,
        start,
        run,
    }
};

export const useMatchFindById = (
    id: string|undefined
): UseQueryResult<MatchResponse|undefined, Error> => {
    const {main} = useActors();
    
    return useQuery<MatchResponse|undefined, Error>(
        ['matches', id],
        () => matchFindById(main, id)
    );
}; 

export const useMatchFindOpen = (
    limit: number
): UseInfiniteQueryResult<MatchResponse[], Error> => {
    const {main} = useActors();

    return useInfiniteQuery<MatchResponse[], Error>(
        ['matches', limit], 
        ({pageParam = 0}) => matchFindOpen(main, {offset: pageParam, limit}),
        {
            getNextPageParam: (lastPage, pages) => 
                lastPage.length < limit?
                    undefined:
                pages.length * limit
        }
    );
};

export const useMatchFindByGame = (
    gameId: GameId|undefined,
    limit: number
): UseInfiniteQueryResult<MatchResponse[], Error> => {
    const {main} = useActors();

    return useInfiniteQuery<MatchResponse[], Error>(
        ['matches', gameId, limit], 
        ({pageParam = 0}) => matchFindByGame(main, gameId, {offset: pageParam, limit}),
        {
            getNextPageParam: (lastPage, pages) => 
                lastPage.length < limit?
                    undefined:
                pages.length * limit
        }
    );
};

export const useMatchGetSteps = (
    id: MatchId,
    limit: number
): UseInfiniteQueryResult<MatchStepsResponse, Error> => {
    const {main} = useActors();

    return useInfiniteQuery<MatchStepsResponse, Error>(
        ['match-steps', id, limit], 
        ({pageParam = 0}) => matchGetSteps(main, id, {offset: pageParam, limit}),
        {
            getNextPageParam: (lastPage, pages) => 
                lastPage.steps.length < limit?
                    undefined:
                pages.length * limit
        }
    );
};