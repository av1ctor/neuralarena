import React, { useCallback } from "react";
import { Card, Container, Text, createStyles, rem } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { NftCollectionResponse } from "@declarations/neuralarena_be/neuralarena_be.did";

export const useStyles = createStyles((theme) => ({
    card: {
        height: rem(440),
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        ":hover": {
            backgroundColor: theme.colors.grape,
            backgroundBlendMode: theme.colorScheme === "dark"? 'soft-light': 'hard-light',
            cursor: 'pointer',
        }
    },
  
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
    const navigate = useNavigate();
    const { classes } = useStyles();

    const handleView = useCallback(() => {
        navigate(`/nfts/${props.col.id}`);
    }, [props.col.id]);

    const { col } = props;

    return (
        <Card
            shadow="md"
            p="xl"
            radius="md"
            style={{ backgroundImage: `url(${col.meta.logo})` }}
            className={classes.card}
            onClick={handleView}
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
        </Card>
    );
};
