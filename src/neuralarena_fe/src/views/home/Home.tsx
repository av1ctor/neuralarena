import React from "react";
import { Route, Routes } from "react-router-dom";
import { AppShell, Container, LoadingOverlay, Space, useMantineTheme } from '@mantine/core';
import { useUI } from "@hooks/ui";
import Header from "./Header";
import Footer from "./Footer";
import {Front} from "./Front";
import Login from "@views/users/user/Login";
import Signup from "@views/users/user/Signup";
import { Game } from "@views/games/game/Game";
import { Match } from "@views/matches/match/Match";
import loadingImage from "@assets/loading.svg";
import Profile from "@views/users/user/Profile";
import { UserNfts } from "@views/users/user/Nfts";
import { UserMatches } from "@views/users/user/Matches";
import { AllMatches } from "@views/matches/Matches";
import { Games } from "@views/games/Games";
import { NftCollections } from "@views/nft_cols/Collections";
import bgBlack from "@assets/bg-black.svg";
import bgWhite from "@assets/bg-white.svg";

interface Props {
}

const Home = (props: Props) => {
    const theme = useMantineTheme();
    const {isLoading} = useUI();

    return (
        <>
            <AppShell
                styles={{
                    main: {
                        background: theme.colorScheme === 'dark' ? 
                            theme.colors.dark[8]
                        : 
                            theme.white,
                        backgroundImage: theme.colorScheme === 'dark'?
                            `url(${bgBlack})`
                        :
                            `url(${bgWhite})`,
                    },
                }}
                navbarOffsetBreakpoint="sm"
                asideOffsetBreakpoint="sm"
                header={
                    <Header />
                }
            >
                <Space h="4rem" />

                <Container size="md">
                    <Routes>
                        <Route path="/nfts" element={<NftCollections />} />
                        <Route path="/games" element={<Games />} />
                        <Route path="/games/:id" element={<Game />} />
                        <Route path="/matches" element={<AllMatches />} />
                        <Route path="/matches/:id" element={<Match />} />
                        <Route path="/user/login" element={<Login authenticateOnly={false} />} />
                        <Route path="/user/signup" element={<Signup />} />
                        <Route path="/user/nfts" element={<UserNfts />} />
                        <Route path="/user/matches" element={<UserMatches />} />
                        <Route path="/user/profile" element={<Profile />} />
                        <Route path="/" element={<Front />} />
                    </Routes>
                </Container>

                <Space h="4rem" />
                
                <Footer />
            </AppShell>
            
            <LoadingOverlay loader={<img src={loadingImage} />} visible={isLoading}  />
        </>
    );
};

export default Home;