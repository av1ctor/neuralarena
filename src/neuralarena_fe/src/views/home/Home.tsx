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
import { NftCollection } from "@views/nft_cols/Collection/Collection";
import { UserPage } from "@views/users/user/Page";
import { Policies } from "./Policies";
import { Privacy } from "./Privacy";
import { UserWallet } from "@views/users/user/Wallet";

interface Props {
}

const Home = (props: Props) => {
    const theme = useMantineTheme();
    const {isLoading} = useUI();

    return (
        <>
            <AppShell
                styles={{
                    root: {
                        background: theme.colorScheme === 'dark' ? 
                            theme.colors.dark[8]
                        : 
                            theme.white,
                        backgroundImage: theme.colorScheme === 'dark'?
                            `url(${bgBlack})`
                        :
                            `url(${bgWhite})`,
                        minHeight: '40rem',
                    },
                }}
                navbarOffsetBreakpoint="sm"
                asideOffsetBreakpoint="sm"
                header={
                    <Header />
                }
                footer={
                    <Footer />
                }
            >
                <Space h="4rem" />

                <Container size="md">
                    <Routes>
                        <Route path="/nfts" element={<NftCollections />} />
                        <Route path="/nfts/:id" element={<NftCollection />} />
                        <Route path="/games" element={<Games />} />
                        <Route path="/games/:id" element={<Game />} />
                        <Route path="/matches" element={<AllMatches />} />
                        <Route path="/matches/:id" element={<Match />} />
                        <Route path="/users" element={<UserPage />} />
                        <Route path="/users/login" element={<Login authenticateOnly={false} />} />
                        <Route path="/users/signup" element={<Signup />} />
                        <Route path="/users/nfts" element={<UserNfts />} />
                        <Route path="/users/matches" element={<UserMatches />} />
                        <Route path="/users/profile" element={<Profile />} />
                        <Route path="/users/wallet" element={<UserWallet />} />
                        <Route path="/policies" element={<Policies />} />
                        <Route path="/privacy" element={<Privacy />} />
                        <Route path="/" element={<Front />} />
                    </Routes>
                </Container>
            </AppShell>
            
            <LoadingOverlay loader={<img src={loadingImage} />} visible={isLoading}  />
        </>
    );
};

export default Home;