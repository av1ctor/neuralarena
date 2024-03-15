import { 
    UseInfiniteQueryResult, UseQueryResult, useInfiniteQuery, useQuery 
} from "react-query";
import { Principal } from "@dfinity/principal";
import { 
    Nas1Token, Nas1Collection 
} from "@declarations/nas1_nft/nas1_nft.did";
import { 
    nas1FindTokenById, nas1GetCollectionData, nas1GetCollectionLogo, 
    nas1GetCollectionDesc, nas1GetCollectionSymbol, nas1GetTokenOwner, nas1GetTokensOf
} from "../libs/nas1";

export const useNAS1GetCollectionData = (
    canister_id: Principal
): UseQueryResult<Nas1Collection, Error> => {
    return useQuery<Nas1Collection, Error>(
        ['nft-col-data', canister_id],
        () => nas1GetCollectionData(canister_id)
    );
}; 

export const useNAS1GetCollectionLogo = (
    canister_id: Principal
): UseQueryResult<string, Error> => {
    return useQuery<string, Error>(
        ['nft-col-logo', canister_id],
        () => nas1GetCollectionLogo(canister_id)
    );
}; 

export const useNAS1GetCollectionSymbol = (
    canister_id: Principal
): UseQueryResult<string, Error> => {
    return useQuery<string, Error>(
        ['nft-col-symbol', canister_id],
        () => nas1GetCollectionSymbol(canister_id)
    );
}; 

export const useNAS1GetCollectionDesc = (
    canister_id: Principal
): UseQueryResult<string, Error> => {
    return useQuery<string, Error>(
        ['nft-col-desc', canister_id],
        () => nas1GetCollectionDesc(canister_id)
    );
}; 

export const useNAS1FindTokenById = (
    canister_id: Principal,
    id: number
): UseQueryResult<Nas1Token, Error> => {
    return useQuery<Nas1Token, Error>(
        ['nft-token', canister_id, id],
        () => nas1FindTokenById(canister_id, id)
    );
}; 

export const useNAS1GetTokenOwner = (
    canister_id?: Principal,
    id?: number
): UseQueryResult<Principal|undefined, Error> => {
    return useQuery<Principal|undefined, Error>(
        ['nft-owner', canister_id, id],
        () => nas1GetTokenOwner(canister_id, id)
    );
}; 

export const useNAS1FindTokensOf = (
    canister_id: Principal|undefined,
    owner: Principal|undefined,
    limit: number
): UseInfiniteQueryResult<{tokenId: bigint, data: Nas1Token}[], Error> => {
    return useInfiniteQuery<{tokenId: bigint, data: Nas1Token}[], Error>(
        ['nft-tokens', canister_id, owner, limit],
        ({pageParam = undefined}) => nas1GetTokensOf(canister_id, owner, pageParam, limit),
        {
            getNextPageParam: (lastPage, pages) => 
                lastPage.length < limit?
                    undefined:
                lastPage.length > 0?
                    Number(lastPage[lastPage.length-1].tokenId):
                    undefined
        }
    );
}; 
