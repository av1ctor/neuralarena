import React from "react";
import { Button } from "@mantine/core";
import { IconPhoto } from "@tabler/icons-react";
import { PageTitle } from "@components/PageTitle";
import { useNftCollectionFindAll } from "@hooks/nft_cols";
import { NftCollectionGrid } from "./Grid";
import { InfinitePaging } from "@components/InfinitePaging";

interface Props {
}

const ITEMS_PER_PAGE = 6;

export const NftCollections = (props: Props) => {
    const cols = useNftCollectionFindAll(ITEMS_PER_PAGE);

    return (
        <>
            <PageTitle 
                title="All NFT Collections"
                icon={IconPhoto}
            >
                <Button>Publish</Button>
            </PageTitle>

            <InfinitePaging
                query={cols}
            >
                <NftCollectionGrid
                    cols={cols.data?.pages.flat() || []}
                />
            </InfinitePaging>
        </>
    );
  }