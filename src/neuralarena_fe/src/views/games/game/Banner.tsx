import React from "react";
import { createStyles, rem, Container, Text, Center } from "@mantine/core";
import { GameResponse } from "@declarations/neuralarena_be/neuralarena_be.did";
import { CoverCard } from "@components/CoverCard";
import { useBrowser } from "@hooks/browser";

const useStyles = createStyles((theme) => ({
    title: {
        fontWeight: 900,
        color: theme.white,
        filter: 'drop-shadow(2px 4px 4px #000a)',
    },
}));

interface Props {
    game: GameResponse;
    navigate?: boolean;
    isHalf?: boolean;
}
  
export const GameBanner = (props: Props) => {
    const {isMobile} = useBrowser();
    const { classes } = useStyles();
    
    return (
        <CoverCard
            cover={props.game.info.urls.cover}
            navigateTo={props.navigate? `/games/${props.game.id}`: undefined}
            height={props.isHalf? 121: 121*2}
        >
            <Container>
                <Center>
                    <Text 
                        className={classes.title}
                        variant="gradient"
                        size={isMobile? 42: 64} 
                    >
                        {props.game.info.name}
                    </Text>
                </Center>
            </Container>
        </CoverCard>
    );
};