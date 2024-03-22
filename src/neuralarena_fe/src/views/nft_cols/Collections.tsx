import React from "react";
import { Button, Center, createStyles } from "@mantine/core";
import { IconPhoto } from "@tabler/icons-react";
import { PageTitle } from "@components/PageTitle";
import { useNftCollectionFindAll } from "@hooks/nft_cols";
import { NftCollectionGrid } from "./Grid";
import { InfinitePaging } from "@components/InfinitePaging";
import { DrawerPanel } from "@components/DrawerPanel";
import { useDisclosure } from "@mantine/hooks";

const useStyles = createStyles((theme) => ({
    soon: {
        fontSize: '4rem'
    },
}));

interface Props {
}

const ITEMS_PER_PAGE = 6;

export const NftCollections = (props: Props) => {
    const [opened, {open, close}] = useDisclosure(false);
    const {classes} = useStyles();

    const cols = useNftCollectionFindAll(ITEMS_PER_PAGE);

    return (
        <>
            <PageTitle 
                title="All NFT Collections"
                icon={IconPhoto}
            >
                <Button
                    onClick={open}
                >
                    Publish
                </Button>
            </PageTitle>

            <InfinitePaging
                query={cols}
            >
                <NftCollectionGrid
                    cols={cols.data?.pages.flat() || []}
                />
            </InfinitePaging>

            <DrawerPanel
                opened={opened}
                title="Publish your NFT collection"
                onClose={close}
            >
                <Center className={classes.soon} mt="6rem">
                    Soon...
                </Center>
            </DrawerPanel>
        </>
    );
  }