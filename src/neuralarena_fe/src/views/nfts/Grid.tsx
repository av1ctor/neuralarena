import React from "react";
import { Grid } from "@mantine/core";
import { Nft } from "./nft/Nft";
import { Principal } from "@dfinity/principal";

interface Props {
    collectionId: Principal;
    nfts: bigint[];
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
                    />
                </Grid.Col>
        ))}
        </Grid>
    );
}