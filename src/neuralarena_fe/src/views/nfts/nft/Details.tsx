import { useBrowser } from "@hooks/browser";
import { useUI } from "@hooks/ui";
import { NFT } from "@libs/nas1";
import { Box, Center, SegmentedControl, Space } from "@mantine/core";
import { IconBrain, IconCube, IconHourglassHigh, IconList } from "@tabler/icons-react";
import React, { useState } from "react";
import { NftCard } from "./Card";
import { NftModel } from "./Model";
import { NftXps } from "./XPs";
import { NftSkills } from "./Skills";

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
        value: 'xps',
        label: (
          <Center>
            <IconHourglassHigh size="1rem" />
            <Box ml={10}>eXPerience</Box>
          </Center>
        ),
    },
    {
        value: 'skills',
        label: (
          <Center>
            <IconBrain size="1rem" />
            <Box ml={10}>Skills</Box>
          </Center>
        ),
    },
    {
        value: 'model',
        label: (
          <Center>
            <IconCube size="1rem" />
            <Box ml={10}>3d Model</Box>
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

            <Box className={section === 'xps'? classes.block: classes.none}>
                <NftXps	
                    nft={nft}
                />
            </Box>

            <Box className={section === 'skills'? classes.block: classes.none}>
                <NftSkills
                    nft={nft}
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