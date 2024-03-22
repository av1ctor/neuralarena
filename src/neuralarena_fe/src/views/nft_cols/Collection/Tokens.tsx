import React from "react";
import { NftsGrid } from "../../nfts/Grid";
import { InfinitePaging } from "@components/InfinitePaging";
import { useNAS1FindTokens } from "@hooks/nas1";
import { Principal } from "@dfinity/principal";

interface Props {
    collectionId: Principal;
}

const ITEMS_PER_PAGE = 4;

export const NftCollectionTokens = (props: Props) => {
    const query = useNAS1FindTokens(props.collectionId, ITEMS_PER_PAGE);

    return (
        <InfinitePaging
            query={query}
        >
            <NftsGrid
                collectionId={props.collectionId}
                nfts={query.data?.pages.flat() || []} 
            />
        </InfinitePaging>
    );
  }