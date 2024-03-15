import React from "react";
import { Carousel } from "@mantine/carousel";
import { Center, Container, Space, Title, useMantineTheme } from "@mantine/core";
import { useBrowser } from "@hooks/browser";
import { useGameFindActive } from "@hooks/games";
import { Card } from "./game/Card";

export const Top = () => {
    const {isMobile} = useBrowser();
    const theme = useMantineTheme();

    const games = useGameFindActive(6);

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
                            TOP GAMES
                        </Title>
                    </Center>
                </Container>
                <Space h="xl"/>
                <Carousel
                    slideSize={isMobile? '100%': '100%'}
                    slideGap='xl'
                    align="start"
                    slidesToScroll={isMobile? 1 : 1}
                >
                    {games.data?.pages?.map((page) => (
                        page.map((item) => (
                            <Carousel.Slide key={item.id}>
                                <Card 
                                    game={item}
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