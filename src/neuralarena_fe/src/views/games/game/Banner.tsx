import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Paper, createStyles, rem, Container, Text, Center } from "@mantine/core";
import { GameResponse } from "@declarations/neuralarena_be/neuralarena_be.did";

const useStyles = createStyles((theme) => ({
    card: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        cursor: 'pointer',
    },
  
    title: {
        fontWeight: 900,
        color: theme.white,
        fontSize: rem(64),
    },
}));

interface Props {
    game: GameResponse;
    isHalf?: boolean;
}
  
export const Banner = (props: Props) => {
    const { classes } = useStyles();

    const navigate = useNavigate();

    const handleView = useCallback(() => {
        navigate(`/games/${props.game.id}`)
    }, [props.game.id]);
    
    return (
        <Paper
            shadow="md"
            radius="md"
            style={{ 
                backgroundImage: `url(${props.game.info.urls.cover})`,
                height: props.isHalf? rem(110): rem(220),
            }}
            className={classes.card}
            onClick={handleView}
        >
            <Container>
                <Center>
                    <Text 
                        className={classes.title}
                        variant="gradient"
                        size="xl" 
                    >
                        {props.game.info.name}
                    </Text>
                </Center>
            </Container>
        </Paper>
    );
};