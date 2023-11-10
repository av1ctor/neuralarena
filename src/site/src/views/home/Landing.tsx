import React, { useCallback } from "react";
import { createStyles, Image, Container, Title, Button, Group, Text, List, ThemeIcon, rem, Flex } from '@mantine/core';
import { IconBrandGithub, IconCheck, IconUserPlus } from '@tabler/icons-react';
import { Link } from "react-router-dom";
import { useBrowser } from "../../hooks/browser";
  
const useStyles = createStyles((theme) => ({
    inner: {
        display: 'flex',
        flexWrap: 'wrap',
    },

    content: {
        maxWidth: rem(480),
        marginRight: `calc(${theme.spacing.xl} * 3)`,

        [theme.fn.smallerThan('md')]: {
            marginRight: 0,
            maxWidth: rem(820),
        },
    },
  
    title: {
        color: theme.colorScheme === 'dark' ? theme.white : theme.black,
        fontFamily: `Greycliff CF, ${theme.fontFamily}`,
        fontSize: rem(42),
        lineHeight: 1.2,
        fontWeight: 900,
        textAlign: 'justify',

        [theme.fn.smallerThan('xs')]: {
            fontSize: rem(28),
        },
    },

    subtitle: {
        textAlign: 'justify',
    },

    item: {
        textAlign: 'justify',
    },
  
    control: {
        [theme.fn.smallerThan('xs')]: {
            flex: 1,
        },
    },
  
    imageContainer: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
    },

    image: {
        margin: 'auto',
    },
  
    highlight: {
        position: 'relative',
        backgroundColor: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).background,
        borderRadius: theme.radius.md,
        padding: '0.5rem 1rem',
        lineHeight: '4rem',
    },
}));

const Landing = () => {
    const { classes } = useStyles();
    const {redirectToSignup} = useBrowser();

    const handleViewSourceCode = useCallback(() => {
        window.open("https://github.com/av1ctor/neuralnet", "blank");
    }, []);

    const handleSignup = useCallback(() => {
        redirectToSignup();
    }, []);

    return (
        <Container>
            <div className={classes.inner}>
                <div className={classes.content}>
                    <Title className={classes.title}>
                        Play <span className={classes.highlight}>games</span> with your AI bot and win incredible prizes!
                    </Title>
                    <Text color="dimmed" mt="md" className={classes.subtitle}>
                        Neural Arena is a decentralized game platform where users play against each other using their AI bots
                    </Text>

                    <List
                        mt={30}
                        spacing="sm"
                        size="sm"
                        icon={
                            <ThemeIcon size={20} radius="xl">
                                <IconCheck size={rem(12)} stroke={1.5} />
                            </ThemeIcon>
                        }
                    >
                        <List.Item className={classes.item}>
                            <b>On-chain</b> – Neural Arena is a decentralized web3 app, running 100% on-chain on the Internet Computer. The app under control of its DAO owners.
                        </List.Item>
                        <List.Item className={classes.item}>
                            <b>Open-source</b> – released under GPL license, anyone can verify the source code and contribute to the app.
                        </List.Item>
                    </List>

                    <Group mt={30}>
                        <Button 
                            variant="gradient"
                            radius="xl" 
                            size="md" 
                            className={classes.control}
                            onClick={handleSignup}
                        >
                            <IconUserPlus size="1rem" />&nbsp;Create an account
                        </Button>
                        <Button 
                            variant="default" 
                            radius="xl" 
                            size="md" 
                            className={classes.control}
                            onClick={handleViewSourceCode}
                        >
                            <IconBrandGithub size="1rem" />&nbsp;View source code
                        </Button>
                    </Group>
                </div>
                <div className={classes.imageContainer}>
                    <Image src="logo.svg" className={classes.image} />
                </div>
            </div>
        </Container>
    );
};

export default Landing;