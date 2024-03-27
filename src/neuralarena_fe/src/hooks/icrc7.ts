import { 
    UseInfiniteQueryResult, UseQueryResult, useInfiniteQuery, useQuery 
} from "react-query";
import { Principal } from "@dfinity/principal";
import { 
    Standard 
} from "@declarations/nas1_nft/nas1_nft.did";
import { 
    icrc7GetCollectionLogo, icrc7GetCollectionDesc, icrc7GetCollectionSymbol, 
    icrc7GetTokenOwner, icrc7GetTokens, icrc7GetTokensOf, icrc7GetSupplyCap, 
    icrc7GetTotalSupply, icrc7GetSupportedStandards
} from "@libs/icrc7";

export const useIcrc7GetCollectionSupplyCap = (
    canister_id: Principal|undefined
): UseQueryResult<number, Error> => {
    return useQuery<number, Error>(
        ['icrc7-col-cap', canister_id],
        () => icrc7GetSupplyCap(canister_id)
    );
}; 

export const useIcrc7GetCollectionTotalSupply = (
    canister_id: Principal|undefined
): UseQueryResult<number, Error> => {
    return useQuery<number, Error>(
        ['icrc7-col-total', canister_id],
        () => icrc7GetTotalSupply(canister_id)
    );
}; 

export const useIcrc7GetCollectionSupportedStandards = (
    canister_id: Principal|undefined
): UseQueryResult<Standard[], Error> => {
    return useQuery<Standard[], Error>(
        ['icrc7-col-standards', canister_id],
        () => icrc7GetSupportedStandards(canister_id)
    );
}; 

export const useIcrc7GetCollectionLogo = (
    canister_id: Principal
): UseQueryResult<string, Error> => {
    return useQuery<string, Error>(
        ['icrc7-col-logo', canister_id],
        () => icrc7GetCollectionLogo(canister_id)
    );
}; 

export const useIcrc7GetCollectionSymbol = (
    canister_id: Principal
): UseQueryResult<string, Error> => {
    return useQuery<string, Error>(
        ['icrc7-col-symbol', canister_id],
        () => icrc7GetCollectionSymbol(canister_id)
    );
}; 

export const useIcrc7GetCollectionDesc = (
    canister_id: Principal
): UseQueryResult<string, Error> => {
    return useQuery<string, Error>(
        ['icrc7-col-desc', canister_id],
        () => icrc7GetCollectionDesc(canister_id)
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
