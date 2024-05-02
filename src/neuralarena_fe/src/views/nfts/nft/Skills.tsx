import React from "react";
import { Card, Text, Box } from "@mantine/core";
import { useNAS1FindTokenById, useNAS1GetCollectionData } from "@hooks/nas1";
import { NFT } from "@libs/nas1";
import { NftSkill } from "./Skill";

interface Props {
    nft: NFT;
}

export const NftSkills = (props: Props) => {
    const collection = useNAS1GetCollectionData(props.nft.collection_id);
    const token = useNAS1FindTokenById(props.nft.collection_id, Number(props.nft.token_id));

    return (
        <Box mb="sm">
            <Text size="sm" color="dimmed">
                <b>Learned skills <small>(Neural Networks)</small></b>
            </Text>
            <Card 
                radius="md" 
                p="xs" 
                bg="transparent"
                withBorder
                w="100%"
            >
                {token.data && collection.data?.skills.map((skill) => 
                    <NftSkill 
                        key={skill}
                        skill={skill}
                        token={token.data}
                    />
                )}  
            </Card>
        </Box>
    );
}