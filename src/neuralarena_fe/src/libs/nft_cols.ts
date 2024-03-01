import { Principal } from "@dfinity/principal";
import { 
    _SERVICE as Main, 
    NftCollectionRequest, NftCollectionResponse, 
    Pagination 
} from "../../../declarations/neuralarena_be/neuralarena_be.did";

export type NftCollectionId = Principal;

export const nftColCreate = async (
    main: Main,
    req: NftCollectionRequest
): Promise<NftCollectionResponse> => {
    const res = await main.nft_col_create(req);
    if('Err' in res) {
        throw new Error(res.Err);
    }
    return res.Ok; 
};

export const nftColFindById = async (
    main: Main,
    id?: NftCollectionId
): Promise<NftCollectionResponse|undefined> => {
    if(!id) {
        return undefined;
    }
    
    const res = await main.nft_col_find_by_id(id);
    if('Err' in res) {
        throw new Error(res.Err);
    }
    return res.Ok; 
};

export const nftColFindActive = async (
    main: Main,
    pag: Pagination
): Promise<NftCollectionResponse[]> => {
    const res = await main.nft_col_find_active(pag);
    if('Err' in res) {
        throw new Error(res.Err);
    }
    return res.Ok; 
};
