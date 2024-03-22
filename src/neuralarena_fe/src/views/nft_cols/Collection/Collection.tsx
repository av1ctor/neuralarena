import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Center, SegmentedControl, Space } from "@mantine/core";
import { IconBook, IconPhoto, IconShoppingBag } from "@tabler/icons-react";
import { useBrowser } from "@hooks/browser";
import { useUI } from "@hooks/ui";
import { useNftCollectionFindById } from "@hooks/nft_cols";
import { Principal } from "@dfinity/principal";
import { NftCollectionBanner } from "./Banner";
import { NftCollectionTokens } from "./Tokens";
import { NftCollectionAbout } from "./About";

const sections = [
    {
        value: 'tokens',
        label: (
          <Center>
            <IconPhoto size="1rem" />
            <Box ml={10}>Tokens</Box>
          </Center>
        ),
    },
    {
        value: 'marketplace',
        label: (
          <Center>
            <IconShoppingBag size="1rem" />
            <Box ml={10}>Marketplace</Box>
          </Center>
        ),
    },
    {
        value: 'about',
        label: (
          <Center>
            <IconBook size="1rem" />
            <Box ml={10}>About</Box>
          </Center>
        ),
    },
];

interface Props {
}

export const NftCollection = (props: Props) => {
    const {id} = useParams();
    const {isMobile} = useBrowser();
    const {classes} = useUI();
    const [section, setSection] = useState('tokens');
    
    const query = useNftCollectionFindById(id? Principal.fromText(id): undefined);

    return (
        <>
            <div>
                {query && query.data &&
                    <NftCollectionBanner
                        col={query.data}
                        isHalf 
                    />
                }
            </div>
            <Space h="xl" />
            <div>
                <SegmentedControl 
                    orientation={isMobile? "vertical": "horizontal"}
                    fullWidth
                    color="magenta"
                    data={sections}
                    value={section}
                    onChange={setSection}
                />
                
                <Space h="xl" />

                <Box className={section === 'tokens'? classes.block: classes.none}>
                    {id &&
                        <NftCollectionTokens 
                            collectionId={Principal.fromText(id)}
                        />
                    }
                </Box>

                <Box className={section === 'marketplace'? classes.block: classes.none}>
                    Marketplace
                </Box>

                <Box className={section === 'about'? classes.block: classes.none}>
                    <NftCollectionAbout
                        col={query.data}
                    />
                </Box>
            </div>
        </>
    );
};