import { Principal } from "@dfinity/principal";
import { Nas1Token, Nas1Collection } from "@declarations/nas1_nft/nas1_nft.did";
import { createActor } from "@declarations/nas1_nft";

export interface NFT {
    collection_id: Principal, 
    token_id: bigint,
}

export const nas1GetCollectionData = async (
    canister_id: Principal
): Promise<Nas1Collection> => {
    let actor = createActor(canister_id);
    return await actor.nas1_collection_data();
};

export const nas1GetCollectionLogo = async (
    canister_id: Principal
): Promise<string> => {
    let actor = createActor(canister_id);
    let res = await actor.icrc7_logo();
    if(res.length === 0) {
        return "";
    }

    return res[0];
};

export const nas1GetCollectionSymbol = async (
    canister_id: Principal
): Promise<string> => {
    let actor = createActor(canister_id);
    let res = await actor.icrc7_symbol();
    return res;
};

export const nas1GetCollectionDesc = async (
    canister_id: Principal
): Promise<string> => {
    let actor = createActor(canister_id);
    let res = await actor.icrc7_description();
    if(res.length === 0) {
        return "";
    }

    return res[0];
};

export const nas1FindTokenById = async (
    canister_id: Principal,
    id: number,
): Promise<Nas1Token> => {
    let actor = createActor(canister_id);
    const res = await actor.nas1_token_data(BigInt(id));
    if(res.length === 0) {
        throw new Error("Token not found");
    }

    return res[0]; 
};

export const nas1GetTokenOwner = async (
    canister_id?: Principal,
    id?: number,
): Promise<Principal|undefined> => {
    if(!canister_id || id === undefined) {
        return undefined;
    }
    let actor = createActor(canister_id);
    const res = await actor.icrc7_owner_of([BigInt(id)]);
    if(res.length === 0) {
        throw new Error("Token not found");
    }

    return res[0][0]?.owner; 
};

export const nas1GetTokensOf = async (
    canister_id: Principal|undefined,
    owner: Principal|undefined,
    last: number|undefined,
    limit: number
): Promise<{tokenId: bigint, data: Nas1Token}[]> => {
    if(!canister_id || !owner) {
        return []
    };

    let actor = createActor(canister_id);
    const tokensIds = await actor.icrc7_tokens_of(
        {owner, subaccount: [new Uint8Array(32)]},
        last !== undefined? [BigInt(last)]: [],
        [BigInt(limit)]
    );

    const res = Array<{tokenId: bigint, data: Nas1Token}>();
    for(const tokenId of tokensIds) {
        const nft = await nas1FindTokenById(canister_id, Number(tokenId));
        res.push({tokenId, data: nft});
    }

    return res; 
};
