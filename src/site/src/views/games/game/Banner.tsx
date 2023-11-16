import React from "react";
import { Paper, createStyles, rem, Container, Text, Center } from "@mantine/core";
import { GameResponse } from "../../../../../declarations/main/main.did";

const useStyles = createStyles((theme) => ({
    card: {
        height: rem(220),
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
}));

interface Props {
    game: GameResponse;
}
  
export const Banner = (props: Props) => {
    const { classes } = useStyles();
    
    return (
        <Paper
            shadow="md"
            p="xl"
            radius="md"
            style={{ backgroundImage: `url(${props.game.image})` }}
            className={classes.card}
        >
            <Container/>
            <Container>
                <Center>
                    <Text 
                        className={classes.title}
                        variant="gradient"
                        size="xl" 
                    >
                        {props.game.name}
                    </Text>
                </Center>
            </Container>
            <Container>
            </Container>
        </Paper>
    );
};