import React, { useCallback } from "react";
import { Grid, Button, Center } from "@mantine/core";
import { useAuth } from "@hooks/auth";
import { IconPhoto } from "@tabler/icons-react";
import { useUI } from "@hooks/ui";
import { PageTitle } from "@components/PageTitle";
import { useNftCollectionFindAll } from "@hooks/nft_cols";
import { NftCollectionCard } from "./Collection/Card";

interface Props {
}

const ITEMS_PER_PAGE = 6;

export const NftCollections = (props: Props) => {
    const {user} = useAuth();
    const {toggleLoading} = useUI();

    const nfts = useNftCollectionFindAll(ITEMS_PER_PAGE);

    const handleNextPage = useCallback(() => {
        toggleLoading(true);
        nfts.fetchNextPage();
        toggleLoading(false);
    }, [nfts]);

    return (
        <>
            <PageTitle 
                title="All NFT Collections"
                icon={IconPhoto}
            >
                <Button>Publish</Button>
            </PageTitle>

            <Grid>
                {nfts.data?.pages?.map((page) => (
                    page.map((item, index) => (
                        user &&
                    <Grid.Col 
                        key={index} 
                        sm={12}
                    >
                        <NftCollectionCard
                            col={item}
                        />
                    </Grid.Col>
                ))
            ))}
            </Grid>

            <Center mt="lg">
                <Button
                    disabled={!nfts.hasNextPage || nfts.isFetchingNextPage}
                    onClick={handleNextPage}
                >
                    More
                </Button>
            </Center>
        </>
    );
  }