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
    const actor = createActor(canister_id);
    return await actor.nas1_collection_data();
};

export const nas1FindTokenById = async (
    canister_id: Principal,
    id: number,
): Promise<Nas1Token> => {
    const actor = createActor(canister_id);
    const res = await actor.nas1_token_data(BigInt(id));
    if(res.length === 0) {
        throw new Error("Token not found");
    }

    return res[0]; 
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

    const actor = createActor(canister_id);
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

export const nas1GetTokens = async (
    canister_id: Principal|undefined,
    last: number|undefined,
    limit: number
): Promise<{tokenId: bigint, data: Nas1Token}[]> => {
    if(!canister_id) {
        return []
    };

    const actor = createActor(canister_id);
    const tokensIds = await actor.icrc7_tokens(
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
