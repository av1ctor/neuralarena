import React from "react";
import { useNAS1FindTokenById, useNAS1GetCollectionData } from "@hooks/nas1";
import { NFT } from "@libs/nas1";
import { NftSkill } from "./Skill";
import { ContainerBox } from "@components/ContainerBox";

interface Props {
    nft: NFT;
}

export const NftSkills = (props: Props) => {
    const collection = useNAS1GetCollectionData(props.nft.collection_id);
    const token = useNAS1FindTokenById(props.nft.collection_id, Number(props.nft.token_id));

    return (
        <ContainerBox>
            {token.data && collection.data?.skills.map((skill) => 
                <NftSkill 
                    key={skill}
                    skill={skill}
                    token={token.data}
                />
            )}  
        </ContainerBox>
    );
}