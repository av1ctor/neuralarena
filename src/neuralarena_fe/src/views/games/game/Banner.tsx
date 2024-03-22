import React from "react";
import { createStyles, rem, Container, Text, Center } from "@mantine/core";
import { GameResponse } from "@declarations/neuralarena_be/neuralarena_be.did";
import { Banner } from "@components/Banner";

const useStyles = createStyles((theme) => ({
    title: {
        fontWeight: 900,
        color: theme.white,
        fontSize: rem(64),
    },
}));

interface Props {
    game: GameResponse;
    navigate?: boolean;
    isHalf?: boolean;
}
  
export const GameBanner = (props: Props) => {
    const { classes } = useStyles();
    
    return (
        <Banner
            cover={props.game.info.urls.cover}
            navigateTo={props.navigate? `/games/${props.game.id}`: undefined}
            height={props.isHalf? 121: 121*2}
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
        </Banner>
    );
};