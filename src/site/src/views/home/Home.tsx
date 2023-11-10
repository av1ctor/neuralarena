import React from "react";
import { Route, Routes } from "react-router-dom";
import { AppShell, Container, LoadingOverlay, useMantineTheme } from '@mantine/core';
import { useUI } from "../../hooks/ui";
import Header from "./Header";
import Footer from "./Footer";
import {Front} from "./Front";
import Login from "../users/user/Login";
import Signup from "../users/user/Signup";

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
                            theme.colors.dark[8] : 
                            theme.white,
                    },
                }}
                navbarOffsetBreakpoint="sm"
                asideOffsetBreakpoint="sm"
                header={
                    <Header />
                }
            >
                <Container size="md">
                    <Routes>
                        <Route path="/user/login" element={<Login authenticateOnly={false} />} />
                        <Route path="/user/signup" element={<Signup />} />
                        <Route path="/" element={<Front />} />
                    </Routes>
                </Container>
                
                <Footer />
            </AppShell>
            
            <LoadingOverlay loader={<img src="/loading.svg" />} visible={isLoading}  />
        </>
    );
};

export default Home;