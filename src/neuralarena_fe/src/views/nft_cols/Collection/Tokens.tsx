import React, { useCallback, useState } from "react";
import { NftsGrid } from "../../nfts/Grid";
import { InfinitePaging } from "@components/InfinitePaging";
import { useIcrc7FindTokens } from "@hooks/icrc7";
import { Principal } from "@dfinity/principal";
import { DrawerPanel } from "@components/DrawerPanel";
import { useDisclosure } from "@mantine/hooks";
import { NFT } from "@libs/nas1";
import { NftDetails } from "@views/nfts/nft/Details";

interface Props {
    collectionId: Principal;
}

const ITEMS_PER_PAGE = 4;

export const NftCollectionTokens = (props: Props) => {
    const [opened, {open, close}] = useDisclosure(false);
    const query = useIcrc7FindTokens(props.collectionId, ITEMS_PER_PAGE);
    const [nft, setNft] = useState<NFT|undefined>();

    const handleSelect = useCallback((nft: NFT) => {
        setNft(nft);
        open();
    }, []);

    const handleClose = useCallback(() => {
        setNft(undefined);
        close();
    }, []);

    return (
        <>
            <InfinitePaging
                query={query}
            >
                <NftsGrid
                    collectionId={props.collectionId}
                    nfts={query.data?.pages.flat() || []} 
                    selected={nft}
                    onClick={handleSelect}
                />
            </InfinitePaging>

            <DrawerPanel
                title="Details"
                opened={opened}
                onClose={handleClose}
            >
                {nft && 
                    <NftDetails
                        nft={nft}
                    />
                }
            </DrawerPanel>
        </>
    );
  }