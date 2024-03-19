import React, { useCallback } from "react";
import {HashRouter as Router} from "react-router-dom";
import {QueryClient, QueryClientProvider} from 'react-query';
import { ColorScheme, ColorSchemeProvider, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { useLocalStorage } from "@mantine/hooks";
import {AuthContextProvider} from "@stores/auth";
import { ActorContextProvider } from "@stores/actor";
import { UIContextProvider } from "@stores/ui";
import { WalletContextProvider } from "@stores/wallet";
import { FontsContextProvider } from "@stores/fonts";
import { IcProviderBuider } from "@libs/icproviderbuilder";
import Home from "@views/home/Home";
import { GlobalStyles } from "./GlobaStyles";
import { Font } from "three/examples/jsm/loaders/FontLoader.js";
import { loadFonts } from "@libs/fonts";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: Infinity,
        },
    },
});

const authProvider = new IcProviderBuider()
    .withInternetIdentity()
    .withPlug()
    .build();

const colors = {
    'magenta': [
        "#ffe9f6", "#ffd1e6", "#faa1c9", "#f66eab", "#f24391", 
        "#f02881", "#f01879", "#d60867", "#c0005c", "#a9004f"
    ],
};

const fonts: Map<string, Font> = new Map();

loadFonts(fonts);

export const App = () => {
    const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
        key: 'mantine-color-scheme',
        defaultValue: 'light',
        getInitialValueInEffect: true,
    });
    
    const toggleColorScheme = useCallback((value?: ColorScheme) => {
        setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));
    }, [colorScheme, setColorScheme]);
        
    return (
        <QueryClientProvider 
            client={queryClient}
        >
            <AuthContextProvider 
                provider={authProvider}
            >
                <WalletContextProvider>
                    <ActorContextProvider>
                        <UIContextProvider>
                            <FontsContextProvider
                                fonts={fonts}
                            >
                                <ColorSchemeProvider 
                                    colorScheme={colorScheme} 
                                    toggleColorScheme={toggleColorScheme}
                                >
                                    <MantineProvider 
                                        theme={{ 
                                            colorScheme, 
                                            primaryColor: 'magenta',
                                            colors: colors as any, 
                                            defaultGradient: {from: '#ff6600', to: '#ff00ff', deg: 135.0}
                                        }} 
                                        withGlobalStyles 
                                        withNormalizeCSS
                                    >
                                        <GlobalStyles />
                                        <Notifications 
                                            position="bottom-right" 
                                        />
                                        <Router> 
                                            <Home />
                                        </Router>
                                    </MantineProvider>
                                </ColorSchemeProvider>
                            </FontsContextProvider>
                        </UIContextProvider>
                    </ActorContextProvider>
                </WalletContextProvider>
            </AuthContextProvider>
        </QueryClientProvider>
    );
};


