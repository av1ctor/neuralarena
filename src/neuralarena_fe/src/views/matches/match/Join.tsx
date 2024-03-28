import React, { useCallback, useState } from "react";
import { Button, Center, Grid, TextInput } from "@mantine/core";
import { GameResponse, MatchResponse } from "@declarations/neuralarena_be/neuralarena_be.did";
import { useActors } from "@hooks/actors";
import { useAuth } from "@hooks/auth";
import { useIcrc1GetBallance } from "@hooks/icrc1";
import { useMatch } from "@hooks/matches";
import { useUI } from "@hooks/ui";
import { e8sToDecimal, principalToAccountId, principalToSubAccount } from "@libs/icp";
import { MAIN_SUB_ACCOUNT, TRANSFER_FEE } from "@libs/icrc1";
import { NFT } from "@libs/nas1";
import { ListNfts } from "@views/nfts/List";
import { IconCoin } from "@tabler/icons-react";
import { gameCostToPlay } from "@libs/games";

interface Props {
    match: MatchResponse|undefined;
    game: GameResponse|undefined;
    onClose: () => void;
}

export const MatchJoin = (props: Props) => {
    const {user} = useAuth();
    const {icpLedger, ids} = useActors();
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

    const mainAccBalance = useIcrc1GetBallance(
        icpLedger, 
        principalToAccountId(
            ids.main,
            principalToSubAccount(user?.id, MAIN_SUB_ACCOUNT)
        )
    );

    const nfts = user?.nfts || [];
    const cost = gameCostToPlay(props.game).value + (TRANSFER_FEE*(3n+1n));
    const okToJoin = cost <= (mainAccBalance.data || 0n)
    
    return (
        <Grid>
            <Grid.Col>
            <Center>
                {nfts.length > 0?
                    <span>Please select a NFT to be your player in this match</span>
                :
                    <span>You have no NFT's in your account. Please add at least one!</span>
                }
                </Center>
            </Grid.Col>

            <Grid.Col>
                <ListNfts  
                    nfts={nfts}
                    selected={nft}
                    onClick={handleSelectNft}
                />
            </Grid.Col>

            <Grid.Col md={6}>
                <TextInput
                    label="Your Neural Arena balance"
                    value={`${e8sToDecimal(mainAccBalance.data || 0n)} ICP`}
                    readOnly
                    icon={<IconCoin size="1rem" />}
                />
            </Grid.Col>
            <Grid.Col md={6}>
                <TextInput
                    label="Cost to play this match"
                    value={`${e8sToDecimal(cost)} ICP`}
                    readOnly
                    icon={<IconCoin size="1rem" />}
                />
            </Grid.Col>
            <Grid.Col>
                <Button
                    variant="gradient"
                    fullWidth
                    disabled={!nft || !okToJoin}
                    onClick={handleJoin}
                >
                    Submit
                </Button>
            </Grid.Col>
        </Grid>
    );
};