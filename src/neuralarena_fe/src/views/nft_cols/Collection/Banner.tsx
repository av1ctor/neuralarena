import React from "react";
import { createStyles, rem, Container, Text, Center } from "@mantine/core";
import { Banner } from "@components/Banner";
import { NftCollectionResponse } from "@declarations/neuralarena_be/neuralarena_be.did";

const useStyles = createStyles((theme) => ({
    title: {
        fontWeight: 900,
        color: theme.white,
        fontSize: rem(64),
    },
}));

interface Props {
    col: NftCollectionResponse;
    isHalf?: boolean;
}
  
export const NftCollectionBanner = (props: Props) => {
    const { classes } = useStyles();
    
    return (
        <Banner
            cover={props.col.meta.logo}
            height={props.isHalf? 121: 121*2}
        >
            <Container>
                <Center>
                    <Text 
                        className={classes.title}
                        variant="gradient"
                        size="xl" 
                    >
                        {props.col.meta.name}
                    </Text>
                </Center>
            </Container>
        </Banner>
    );
};