import { UseInfiniteQueryResult, UseQueryResult, useInfiniteQuery, useMutation, useQuery, useQueryClient } from "react-query";
import { NftCollectionRequest, NftCollectionResponse } from "@declarations/neuralarena_be/neuralarena_be.did";
import { useActors } from "./actors";
import { NftCollectionId, nftColCreate, nftColFindActive, nftColFindById } from "../libs/nft_cols";

interface NftCollectionMethods {
    create: (req: NftCollectionRequest) => Promise<NftCollectionResponse>;
}

export const useNftCollection = (
): NftCollectionMethods => {
    const queryClient = useQueryClient();
    const {main} = useActors();

    const createMut = useMutation(
        async (options: {req: NftCollectionRequest}) => {
            return nftColCreate(main, options.req);
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['nft_cols']);
            }   
        }
    );

    const create = (
        req: NftCollectionRequest
    ): Promise<NftCollectionResponse> => {
        return createMut.mutateAsync({req});
    };

    return {
        create,
    }
};

export const useNftCollectionFindById = (
    id?: NftCollectionId
): UseQueryResult<NftCollectionResponse|undefined, Error> => {
    const {main} = useActors();
    
    return useQuery<NftCollectionResponse|undefined, Error>(
        ['nft_cols', id],
        () => nftColFindById(main, id)
    );
}; 

export const useNftCollectionFindActive = (
    limit: number
): UseInfiniteQueryResult<NftCollectionResponse[], Error> => {
    const {main} = useActors();

    return useInfiniteQuery<NftCollectionResponse[], Error>(
        ['nft_cols', limit], 
        ({pageParam = 0}) => nftColFindActive(main, {offset: pageParam, limit}),
        {
            getNextPageParam: (lastPage, pages) => 
                lastPage.length < limit?
                    undefined:
                pages.length * limit
        }
    );
};