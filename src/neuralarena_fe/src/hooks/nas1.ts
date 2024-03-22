import { 
    UseInfiniteQueryResult, UseQueryResult, useInfiniteQuery, useQuery 
} from "react-query";
import { Principal } from "@dfinity/principal";
import { 
    Nas1Token, Nas1Collection, Standard 
} from "@declarations/nas1_nft/nas1_nft.did";
import { 
    nas1FindTokenById, nas1GetCollectionData, icrc7GetCollectionLogo, 
    icrc7GetCollectionDesc, icrc7GetCollectionSymbol, icrc7GetTokenOwner, 
    nas1GetTokensOf, nas1GetTokens, icrc7GetTokens, icrc7GetTokensOf, icrc7GetSupplyCap, icrc7GetTotalSupply, icrc7GetSupportedStandards
} from "@libs/nas1";

export const useNAS1GetCollectionData = (
    canister_id: Principal
): UseQueryResult<Nas1Collection, Error> => {
    return useQuery<Nas1Collection, Error>(
        ['nft-col-data', canister_id],
        () => nas1GetCollectionData(canister_id)
    );
}; 

export const useIcrc7GetCollectionSupplyCap = (
    canister_id: Principal|undefined
): UseQueryResult<number, Error> => {
    return useQuery<number, Error>(
        ['nft-col-cap', canister_id],
        () => icrc7GetSupplyCap(canister_id)
    );
}; 

export const useIcrc7GetCollectionTotalSupply = (
    canister_id: Principal|undefined
): UseQueryResult<number, Error> => {
    return useQuery<number, Error>(
        ['nft-col-total', canister_id],
        () => icrc7GetTotalSupply(canister_id)
    );
}; 

export const useIcrc7GetCollectionSupportedStandards = (
    canister_id: Principal|undefined
): UseQueryResult<Standard[], Error> => {
    return useQuery<Standard[], Error>(
        ['nft-col-standards', canister_id],
        () => icrc7GetSupportedStandards(canister_id)
    );
}; 

export const useIcrc7GetCollectionLogo = (
    canister_id: Principal
): UseQueryResult<string, Error> => {
    return useQuery<string, Error>(
        ['nft-col-logo', canister_id],
        () => icrc7GetCollectionLogo(canister_id)
    );
}; 

export const useIcrc7GetCollectionSymbol = (
    canister_id: Principal
): UseQueryResult<string, Error> => {
    return useQuery<string, Error>(
        ['nft-col-symbol', canister_id],
        () => icrc7GetCollectionSymbol(canister_id)
    );
}; 

export const useIcrc7GetCollectionDesc = (
    canister_id: Principal
): UseQueryResult<string, Error> => {
    return useQuery<string, Error>(
        ['nft-col-desc', canister_id],
        () => icrc7GetCollectionDesc(canister_id)
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

export const useIcrc7GetTokenOwner = (
    canister_id?: Principal,
    id?: number
): UseQueryResult<Principal|undefined, Error> => {
    return useQuery<Principal|undefined, Error>(
        ['nft-owner', canister_id, id],
        () => icrc7GetTokenOwner(canister_id, id)
    );
}; 

export const useIcrc7FindTokensOf = (
    canister_id: Principal|undefined,
    owner: Principal|undefined,
    limit: number
): UseInfiniteQueryResult<bigint[], Error> => {
    return useInfiniteQuery<bigint[], Error>(
        ['nft-tokens-of', canister_id, owner, limit],
        ({pageParam = undefined}) => icrc7GetTokensOf(canister_id, owner, pageParam, limit),
        {
            getNextPageParam: (lastPage, pages) => 
                lastPage.length < limit?
                    undefined:
                lastPage.length > 0?
                    Number(lastPage[lastPage.length-1]):
                    undefined
        }
    );
}; 

export const useNAS1FindTokensOf = (
    canister_id: Principal|undefined,
    owner: Principal|undefined,
    limit: number
): UseInfiniteQueryResult<{tokenId: bigint, data: Nas1Token}[], Error> => {
    return useInfiniteQuery<{tokenId: bigint, data: Nas1Token}[], Error>(
        ['nft-tokens-of-ex', canister_id, owner, limit],
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

export const useIcrc7FindTokens = (
    canister_id: Principal|undefined,
    limit: number
): UseInfiniteQueryResult<bigint[], Error> => {
    return useInfiniteQuery<bigint[], Error>(
        ['nft-tokens', canister_id, limit],
        ({pageParam = undefined}) => icrc7GetTokens(canister_id, pageParam, limit),
        {
            getNextPageParam: (lastPage, pages) => 
                lastPage.length < limit?
                    undefined:
                lastPage.length > 0?
                    Number(lastPage[lastPage.length-1]):
                    undefined
        }
    );
}; 

export const useNAS1FindTokens = (
    canister_id: Principal|undefined,
    limit: number
): UseInfiniteQueryResult<{tokenId: bigint, data: Nas1Token}[], Error> => {
    return useInfiniteQuery<{tokenId: bigint, data: Nas1Token}[], Error>(
        ['nft-tokens-ex', canister_id, limit],
        ({pageParam = undefined}) => nas1GetTokens(canister_id, pageParam, limit),
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
