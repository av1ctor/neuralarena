import React from "react";
import { Grid } from "@mantine/core";
import { Nft } from "./nft/Nft";
import { Principal } from "@dfinity/principal";
import { NFT } from "@libs/nas1";

interface Props {
    collectionId: Principal;
    nfts: bigint[];
    selected?: NFT;
    onClick?: (nft: NFT) => void;
}

export const NftsGrid = (props: Props) => {
    const {collectionId, nfts} = props;

    const list = nfts.map(n => ({
        collection_id: collectionId, 
        token_id: n
    }));

    return (
        <Grid>
            {list.map((item, index) => (
                <Grid.Col 
                    key={index} 
                    span={6}
                    md={3}
                >
                    <Nft
                        nft={item}
                        selected={item.token_id === props.selected?.token_id}
                        onClick={props.onClick}
                    />
                </Grid.Col>
        ))}
        </Grid>
    );
}