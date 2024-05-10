import React, { useMemo } from "react";
import { Text, Box, Center } from "@mantine/core";
import { useNAS1FindTokenById } from "@hooks/nas1";
import { NFT } from "@libs/nas1";
import { Principal } from "@dfinity/principal";
import { Nas1TokenGameProps } from "@declarations/nas1_nft/nas1_nft.did";
import { NftXp } from "./XP";
import { ContainerBox } from "@components/ContainerBox";

interface Props {
    nft: NFT;
}

export const NftXps = (props: Props) => {
    const token = useNAS1FindTokenById(props.nft.collection_id, Number(props.nft.token_id));

    const xps = useMemo((): [Principal, Nas1TokenGameProps][] => {
        if(!token.data) {
            return [];
        }
        let res = new Array<[Principal, Nas1TokenGameProps]>();
        for(const e of token.data?.game_props) {
            res.push(e);
        }
        return res;
    }, [token]);

    return (
        <ContainerBox>
            <Box>
                {xps.length > 0? 
                    xps.map((xp, index) => 
                        <NftXp
                            key={index}
                            index={index}
                            canisterId={xp[0]}
                            xp={xp[1].xp}
                        />
                    )
                :
                    <Center>
                        <Text size="xs">
                            Time to start earning some XP! Join a match and let the fun begin! 😆
                        </Text>
                    </Center>
                }
            </Box>
        </ContainerBox>
    );
}