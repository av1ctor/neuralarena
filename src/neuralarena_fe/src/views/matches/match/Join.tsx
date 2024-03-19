import { MatchResponse } from "@declarations/neuralarena_be/neuralarena_be.did";
import { useAuth } from "@hooks/auth";
import { useMatch } from "@hooks/matches";
import { useUI } from "@hooks/ui";
import { NFT } from "@libs/nas1";
import { Button, Center } from "@mantine/core";
import { ListNfts } from "@views/nfts/List";
import React, { useCallback, useState } from "react";

interface Props {
    match: MatchResponse|undefined;
    onClose: () => void;
}

export const JoinMatch = (props: Props) => {
    const {user, isLogged} = useAuth();
    const {toggleLoading, showError, showSuccess} = useUI();
    const [nft, setNft] = useState<NFT|undefined>(undefined);
    const {join} = useMatch()

    const handleSelectNft = useCallback(async (nft: NFT) => {
        setNft(nft);
    }, []);
        
    const handleJoin = useCallback(async () => {
        if(props.match?.id && nft) {
            try {
                toggleLoading(true);
                await join({
                    id: props.match.id, 
                    nft: {
                        token_id: nft.token_id,
                        collection_id: nft.collection_id
                    }
                });
                showSuccess('You have joined this match!');
                props.onClose();
            }
            catch(e) {
                showError(e);
            }
            finally {
                toggleLoading(false);
            }
        }
    }, [join, props.match?.id, nft, props.onClose]);

    const nfts = user?.nfts || [];
    
    return (
        <>
            <div>
                {nfts.length > 0?
                    <Center>Please select a NFT to be your player in this match</Center>
                :
                    <Center>You have no NFT's in your account. Please add at least one!</Center>
                }
                <ListNfts  
                    nfts={nfts}
                    selected={nft}
                    onClick={handleSelectNft}
                />
            </div>
            <div>
                <Button
                    variant="gradient"
                    fullWidth
                    disabled={!nft}
                    onClick={handleJoin}
                >
                    Submit
                </Button>
            </div>
        </>
    );
};