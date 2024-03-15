import React, { useCallback } from "react";
import { Button, Card, Center, Container, Paper, Text, Image, createStyles, rem } from "@mantine/core";
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
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
        >
            <Card.Section>
                <Image
                    src={col.meta.logo}
                    height={256}
                    fit="cover"
                    withPlaceholder />
            </Card.Section>

            <Container>
                <Center>
                    <Text
                        className={classes.title}
                        variant="gradient"
                        size="xl"
                    >
                        {col.meta.name}
                    </Text>
                </Center>
                <Center>
                    <Text
                        className={classes.description}>
                        {col.meta.desc}
                    </Text>
                </Center>
            </Container>
            <Center mt="lg">
                <Button
                    variant="gradient"
                    size="md"
                    onClick={handleView}
                >
                    View
                </Button>
            </Center>
        </Card>
    );
};
