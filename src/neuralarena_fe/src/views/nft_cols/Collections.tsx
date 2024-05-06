import React from "react";
import { Button, Center, createStyles } from "@mantine/core";
import { IconPhoto } from "@tabler/icons-react";
import { PageTitle } from "@components/PageTitle";
import { useNftCollectionFindAll } from "@hooks/nft_cols";
import { NftCollectionGrid } from "./Grid";
import { InfinitePaging } from "@components/InfinitePaging";
import { DrawerPanel } from "@components/DrawerPanel";
import { useDisclosure } from "@mantine/hooks";
import { useUI } from "@hooks/ui";
import { useBrowser } from "@hooks/browser";
import { useAuth } from "@hooks/auth";

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
    const {classes} = useUI();
    const {user} = useAuth();
    const {redirectToLogin} = useBrowser();
    const {classes: local} = useStyles();

    const cols = useNftCollectionFindAll(ITEMS_PER_PAGE);

    return (
        <>
            <PageTitle 
                title="All NFT Collections"
                icon={IconPhoto}
            >
                <Button
                    className={classes.animatedOutline}
                    variant="gradient"
                    onClick={!user? redirectToLogin: open}
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
                <Center className={local.soon} mt="6rem">
                    Soon...
                </Center>
            </DrawerPanel>
        </>
    );
  }