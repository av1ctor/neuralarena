import React from "react";
import { createStyles, rem, Container, Text, Center } from "@mantine/core";
import { CoverCard } from "@components/CoverCard";
import { NftCollectionResponse } from "@declarations/neuralarena_be/neuralarena_be.did";
import { useBrowser } from "@hooks/browser";

const useStyles = createStyles((theme) => ({
    title: {
        fontWeight: 900,
        color: theme.white,
        filter: 'drop-shadow(2px 4px 4px #000a)',
    },
}));

interface Props {
    col: NftCollectionResponse;
    isHalf?: boolean;
}
  
export const NftCollectionBanner = (props: Props) => {
    const {isMobile} = useBrowser();
    const { classes } = useStyles();
    
    return (
        <CoverCard
            cover={props.col.meta.logo}
            height={props.isHalf? 121: 121*2}
        >
            <Container>
                <Center>
                    <Text 
                        className={classes.title}
                        variant="gradient"
                        size={isMobile? 42: 64}
                    >
                        {props.col.meta.name}
                    </Text>
                </Center>
            </Container>
        </CoverCard>
    );
};