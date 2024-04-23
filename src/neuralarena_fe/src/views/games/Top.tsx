import React from "react";
import { Carousel } from "@mantine/carousel";
import { Center, Container, Space, Title, useMantineTheme } from "@mantine/core";
import { useBrowser } from "@hooks/browser";
import { useGameFindActive } from "@hooks/games";
import { GameCard } from "./game/Card";

export const TopGames = () => {
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
                    slideSize='100%'
                    slideGap='xl'
                    align="start"
                    slidesToScroll={1}
                    loop
                >
                    {games.data?.pages?.map((page) => (
                        page.map((item) => (
                            <Carousel.Slide key={item.id.toString()}>
                                <GameCard 
                                    game={item}
                                    navigate
                                />
                            </Carousel.Slide>
                        ))
                    ))}
                </Carousel>
            </div>
        </>
    );
  }