import React from "react";
import { Container, Text, createStyles, rem } from "@mantine/core";
import { NftCollectionResponse } from "@declarations/neuralarena_be/neuralarena_be.did";
import { Banner } from "@components/Banner";

export const useStyles = createStyles((theme) => ({
    title: {
        fontWeight: 900,
        color: theme.white,
        fontSize: rem(64),
    },

    description: {
        color: theme.white,
        backgroundColor: theme.primaryColor,
        padding: '0 1rem',
    },
}));

export interface Props {
    col: NftCollectionResponse
}

export const NftCollectionCard = (props: Props) => {
    const { classes } = useStyles();

    const { col } = props;

    return (
        <Banner
            cover={col.meta.logo}
            navigateTo={`/nfts/${props.col.id}`}
            height={440}
        >
            <Container/>
            <Container>
                <Text
                    className={classes.title}
                    variant="gradient"
                    size="xl"
                >
                    {col.meta.name}
                </Text>
                <Text
                    className={classes.description}>
                    {col.meta.desc}
                </Text>
            </Container>
        </Banner>
    );
};
