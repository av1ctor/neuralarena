import { 
    UseInfiniteQueryResult, UseQueryResult, useInfiniteQuery, 
    useMutation, useQuery, useQueryClient 
} from "react-query";
import { Principal } from "@dfinity/principal";
import { 
    MatchResponse, UserNftsRequest, UserRequest, UserResponse 
} from "@declarations/neuralarena_be/neuralarena_be.did";
import { useActors } from "./actors";
import { 
    userCreatePlayer, userCreateStaff, userDelete, 
    userFindById, userFindMatches, userFindMe, userUpdate, userUpdateNfts 
} from "@libs/users";

interface UserMethods {
    create: (req: UserRequest) => Promise<UserResponse>;
    update: (id: Principal, req: UserRequest) => Promise<UserResponse>;
    updateNfts: (id: Principal, req: UserNftsRequest) => Promise<UserResponse>;
    remove: (id: Principal) => Promise<void>;
}

export const useUser = (
): UserMethods => {
    const queryClient = useQueryClient();
    const {main} = useActors();

    const createMut = useMutation(
        async (options: {req: UserRequest}) => {
            return 'Player' in options.req.kind?
                userCreatePlayer(main, options.req):
                userCreateStaff(main, options.req);
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['users']);
            }   
        }
    );

    const create = (
        req: UserRequest
    ): Promise<UserResponse> => {
        return createMut.mutateAsync({req});
    };

    const updateMut = useMutation(
        async (options: {id: Principal, req: UserRequest}) => {
            return userUpdate(main, options.id, options.req);
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['users']);
            }   
        }
    );

    const update = (
        id: Principal,
        req: UserRequest
    ): Promise<UserResponse> => {
        return updateMut.mutateAsync({id, req});
    };

    const updateNftsMut = useMutation(
        async (options: {id: Principal, req: UserNftsRequest}) => {
            return userUpdateNfts(main, options.id, options.req);
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['users']);
            }   
        }
    );

    const updateNfts = (
        id: Principal,
        req: UserNftsRequest
    ): Promise<UserResponse> => {
        return updateNftsMut.mutateAsync({id, req});
    };

    const deleteMut = useMutation(
        async (options: {id: Principal}) => {
            return userDelete(main, options.id);
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['users']);
            }   
        }
    );

    const remove = (
        id: Principal
    ): Promise<void> => {
        return deleteMut.mutateAsync({id});
    };
    
    return {
        create,
        update,
        updateNfts,
        remove,
    }
};

export const useUserFindMe = (
): UseQueryResult<UserResponse, Error> => {
    const {main} = useActors();
    
    return useQuery<UserResponse, Error>(
        ['users', 'me'],
        () => userFindMe(main)
    );
}; 

export const useUserFindById = (
    id: Principal|undefined
): UseQueryResult<UserResponse, Error> => {
    const {main} = useActors();
    
    return useQuery<UserResponse, Error>(
        ['users', id],
        () => userFindById(main, id)
    );
}; 

export const useUserFindMatches = (
    id: Principal|undefined,
    limit: number
): UseInfiniteQueryResult<MatchResponse[], Error> => {
    const {main} = useActors();
    
    return useInfiniteQuery<MatchResponse[], Error>(
        ['user-matches', id, limit], 
        ({pageParam = 0}) => userFindMatches(main, id, {offset: pageParam, limit}),
        {
            getNextPageParam: (lastPage, pages) => 
                lastPage.length < limit?
                    undefined:
                pages.length * limit
        }
    );
}; 
