import { useBrowser } from "@hooks/browser";
import { useUI } from "@hooks/ui";
import { NFT } from "@libs/nas1";
import { Box, Center, SegmentedControl, Space } from "@mantine/core";
import { Icon3dCubeSphere, IconList } from "@tabler/icons-react";
import React, { useState } from "react";
import { NftCard } from "./Card";
import { NftModel } from "./Model";

const sections = [
    {
        value: 'info',
        label: (
          <Center>
            <IconList size="1rem" />
            <Box ml={10}>Data</Box>
          </Center>
        ),
    },
    {
        value: 'model',
        label: (
          <Center>
            <Icon3dCubeSphere size="1rem" />
            <Box ml={10}>Model</Box>
          </Center>
        ),
    },
];

interface Props {
    nft: NFT;
}

export const NftDetails = ({nft}: Props) => {
    const {isMobile} = useBrowser();
    const {classes} = useUI();
    const [section, setSection] = useState('info');

    return (
        <>
            <SegmentedControl
                orientation={isMobile? "vertical": "horizontal"}
                fullWidth
                color="magenta"
                data={sections}
                value={section}
                onChange={setSection}
            />
            
            <Space h="xl" />

            <Box className={section === 'info'? classes.block: classes.none}>
                <NftCard 
                    nft={nft}
                    size="full"
                />
            </Box>

            <Box className={section === 'model'? classes.block: classes.none}>
                <NftModel
                    nft={nft}
                />
            </Box>
        </>
    );
}