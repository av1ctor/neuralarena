import React, { useCallback } from "react";
import { createStyles, rem, Badge, Container, Text, Center, Card } from "@mantine/core";
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
  
export const GameItem = (props: Props) => {
    const { classes } = useStyles();
    const navigate = useNavigate();

    const handleView = useCallback(() => {
        navigate(`/games/${props.game.id}`)
    }, [props.game.id]);

    const {info} = props.game;
    
    return (
        <Card
            shadow="md"
            p="xl"
            radius="md"
            style={{ backgroundImage: `url(${info.urls.cover})` }}
            className={classes.card}
            onClick={handleView}
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
                        className={classes.description}>
                        {info.description}
                    </Text>
                </Center>
            </Container>
        </Card>
    );
};