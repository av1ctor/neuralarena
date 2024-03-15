import React, { useCallback } from "react";
import { Button, Paper, createStyles, rem, Badge, Container, Text, Center } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { GameResponse } from "@declarations/neuralarena_be/neuralarena_be.did";

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

    description: {
        color: theme.white,
        backgroundColor: theme.primaryColor,
        padding: '0 1rem',
    },
  }));

interface Props {
    game: GameResponse;
    showView?: boolean;
}
  
export const GameCard = (props: Props) => {
    const { classes } = useStyles();
    const navigate = useNavigate();

    const handleView = useCallback(() => {
        navigate(`/games/${props.game.id}`)
    }, [props.game.id]);

    const {info} = props.game;
    
    return (
        <Paper
            shadow="md"
            p="xl"
            radius="md"
            style={{ backgroundImage: `url(${info.urls.cover})` }}
            className={classes.card}
        >
            <div className={classes.categoryBox}>
                <Badge 
                    className={classes.category} 
                    size="xs"
                >
                    {info.category}
                </Badge>
            </div>
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
                        className={classes.description}>
                        {info.description}
                    </Text>
                </Center>
            </Container>
            <Container>
                {props.showView &&
                    <Button 
                        variant="gradient"
                        size="md" 
                        onClick={handleView}
                    >
                        View
                    </Button>
                }
            </Container>
        </Paper>
    );
};