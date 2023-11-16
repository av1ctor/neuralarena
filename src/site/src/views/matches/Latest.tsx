import React from "react";
import { Carousel } from "@mantine/carousel";
import { Center, Container, Space, Title, useMantineTheme } from "@mantine/core";
import { useBrowser } from "../../hooks/browser";
import { useMatchFindByGame } from "../../hooks/matches";
import { Card } from "./match/Card";
import { GameResponse } from "../../../../declarations/main/main.did";

interface Props {
    game: GameResponse|undefined;
}

export const Latest = (props: Props) => {
    const {isMobile} = useBrowser();
    const theme = useMantineTheme();

    const matches = useMatchFindByGame(props.game?.id, 6);

    return (
        <>
            <div>
                <Container 
                    variant="gradient" 
                    bg={theme.primaryColor}
                    p={0}
                >
                    <Center>
                        <Title size="h2" c={theme.white}>
                            Latest matches
                        </Title>
                    </Center>
                </Container>
                <Space h="xl"/>
                <Carousel
                    slideSize={isMobile? '100%': '50%'}
                    slideGap='xl'
                    align="start"
                    slidesToScroll={isMobile? 1 : 2}
                >
                    {matches.data?.pages?.map((page) => (
                        page.map((item) => (
                            props.game &&
                                <Carousel.Slide key={item.id}>
                                    <Card 
                                        game={props.game}
                                        match={item}
                                        showView
                                    />
                                </Carousel.Slide>
                        ))
                    ))}
                </Carousel>
            </div>
        </>
    );
  }