import React from "react";
import { createStyles, rem, Badge, Container, Text, Center } from "@mantine/core";
import { GameResponse } from "@declarations/neuralarena_be/neuralarena_be.did";
import { CoverCard } from "@components/CoverCard";

const useStyles = createStyles((theme) => ({
    title: {
        fontWeight: 900,
        color: theme.white,
        fontSize: rem(64),
    },

    categoryBox: {
        position: 'absolute',
        top: '0.5rem',
        right: '2rem',
    },
  
    category: {
        color: theme.primaryColor,
        fontWeight: 900,
        textTransform: 'uppercase',
    },

    subtitle: {
        color: theme.white,
        backgroundColor: theme.primaryColor,
        padding: '0 1rem',
    },
}));

interface Props {
    game: GameResponse;
    navigate?: boolean;
}
  
export const GameCard = (props: Props) => {
    const { classes } = useStyles();

    const {info} = props.game;

    return (
        <CoverCard
            cover={info.urls.cover}
            navigateTo={props.navigate? `/games/${props.game.id}`: undefined}
            height={440}
        >
            <Container className={classes.categoryBox}>
                <Badge 
                    className={classes.category} 
                    size="xs"
                >
                    {info.category}
                </Badge>
            </Container>
            <Container/>
            <Container>
                <Center>
                    <Text 
                        className={classes.title}
                        variant="gradient"
                        size="xl" 
                    >
                        {info.name}
                    </Text>
                </Center>
                <Center>
                    <Text
                        className={classes.subtitle}>
                        {info.subtitle}
                    </Text>
                </Center>
            </Container>
        </CoverCard>
    );
};