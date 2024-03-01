import React from "react";
import { createStyles } from "@mantine/core";
import { Nft } from "./Nft";
import { NFT } from "../../libs/nas1";

const useStyles = createStyles((theme) => ({
    container: {
        position: 'relative',
        margin: 'auto',
    },
}));

interface Props {
    nfts: NFT[];
    onClick?: (nft: NFT) => void;
}

export const Nfts = (props: Props) => {
    const { classes } = useStyles();
    const {nfts} = props;

    return (
        <div className={classes.container}>
            {nfts?.map((nft, index) => 
                <Nft
                    key={index} 
                    nft={nft}
                    onClick={props.onClick}
                />
            )}            
        </div>
    );
}