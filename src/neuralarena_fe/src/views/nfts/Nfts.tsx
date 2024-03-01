import React from "react";
import { Group, createStyles } from "@mantine/core";
import { Nft } from "./Nft";
import { NFT } from "../../libs/nas1";

const useStyles = createStyles((theme) => ({
    container: {
        width: '100%',
        overflowX: 'auto',
        display: 'flex',
        flexWrap: 'nowrap',
        gap: '1rem',
        marginTop: '1rem',
        marginBottom: '2rem',
    },
    nft: {
        flex: '0 0 auto',
        ":hover": {
            cursor: 'pointer'
        },
        border: '4px solid transparent;',
        borderRadius: '0.5rem',
    },
    selected: {
        border: '4px solid #fff',
        borderRadius: '0.5rem',
    },
}));

interface Props {
    nfts: NFT[];
    selected?: NFT;
    onClick?: (nft: NFT) => void;
}

export const Nfts = (props: Props) => {
    const { classes } = useStyles();
    const {nfts} = props;

    return (
        <div className={classes.container}>
            {nfts?.map((nft, index) => 
                <div 
                    key={index} 
                    className={`${classes.nft} ${props.selected?.collection_id === nft.collection_id && props.selected?.token_id === nft.token_id? classes.selected: ''}`}
                >
                    <Nft
                        nft={nft}
                        mini
                        onClick={props.onClick}
                    />
                </div>
            )}            
        </div>
    );
}