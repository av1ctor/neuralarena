import React from "react";
import { createStyles } from "@mantine/core";
import { NftCard } from "./nft/Card";
import { NFT } from "@libs/nas1";
import { Principal } from "@dfinity/principal";

const useStyles = createStyles((theme) => ({
    container: {
        width: '100%',
        overflowX: 'auto',
        display: 'flex',
        flexWrap: 'nowrap',
        gap: '1rem',
        marginTop: '1rem',
        marginBottom: '2rem',
        paddingBottom: '2rem'
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
        border: '4px solid #c0005c',
        borderRadius: '0.7rem',
    },
}));

interface Props {
    nfts: NFT[];
    selected?: NFT;
    game_id?: Principal,
    onClick?: (nft: NFT) => void;
}

export const ListNfts = (props: Props) => {
    const {classes, cx} = useStyles();
    const {nfts} = props;

    const sel = props.selected;

    return (
        <div className={classes.container}>
            {nfts?.map((nft, index) => 
                <div 
                    key={index} 
                    className={cx(
                        classes.nft, {
                            [classes.selected]: 
                                sel?.collection_id.compareTo(nft.collection_id) === 'eq' && 
                                sel?.token_id === nft.token_id
                        })}
                >
                    <NftCard
                        nft={nft}
                        size="mini"
                        selected={nft.token_id === sel?.token_id}
                        game_id={props.game_id}
                        onClick={props.onClick}
                    />
                </div>
            )}
        </div>
    );
}