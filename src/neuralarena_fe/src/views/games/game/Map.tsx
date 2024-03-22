import React from "react";
import { GameMap } from "@declarations/neuralarena_be/neuralarena_be.did";
import { Badge, Card, Center, Container, Text, createStyles, rem } from "@mantine/core";

const useStyles = createStyles((theme) => ({
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
        fontSize: rem(24),
    },
    description: {
        color: theme.white,
        backgroundColor: theme.primaryColor,
        padding: '0 1rem',
    },
    versionBox: {
        position: 'absolute',
        top: '0.5rem',
        right: '0.5rem',
    },
}));

interface Props {
    map: GameMap;
}

export const GameMap_ = (props: Props) => {
    const {classes} = useStyles();
    const {map} = props;

    return (
        <Card
            shadow="md"
            p="xl"
            radius="md"
            style={{ backgroundImage: `url(${map.image_url})` }}
            className={classes.card}
        >
            <Container
                className={classes.versionBox}
            >
                <Badge size="xs" c="red">v{map.version.toFixed(2)}</Badge>
            </Container>
            <Container>
                <Center>
                    <Text 
                        className={classes.title}
                        variant="gradient"
                        size="xl" 
                    >
                        {map.name}
                    </Text>
                </Center>
                <Center>
                    <Text
                        className={classes.description}>
                        {map.description}
                    </Text>
                </Center>
            </Container>

        </Card>
    );
};