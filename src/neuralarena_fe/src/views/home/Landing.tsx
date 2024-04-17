import React, { useCallback } from "react";
import { createStyles, Image, Container, Title, Button, Group, Text, List, ThemeIcon, rem, Space } from '@mantine/core';
import { IconBook, IconCheck, IconUser, IconUserPlus } from '@tabler/icons-react';
import { useBrowser } from "@hooks/browser";
import { TopGames } from "@views/games/Top";
import logo from "@assets/logo-vert.svg";
import { useAuth } from "@hooks/auth";
import { config } from "../../config";
import { useUI } from "@hooks/ui";
  
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

        [theme.fn.smallerThan('md')]: {
            marginTop: '2rem'
        },
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
    const { classes, cx } = useStyles();
    const { classes: globClasses } = useUI();
    const {redirectToSignup, navigateToUserPage} = useBrowser();
    const {user} = useAuth();

    const handleReadWhitepaper = useCallback(() => {
        window.open(config.WHITEPAPER_URL, "blank");
    }, []);

    const handleSignup = useCallback(() => {
        redirectToSignup();
    }, []);

    const handleShowUserPage = useCallback(() => {
        navigateToUserPage();
    }, []);

    return (
        <Container>
            <div className={classes.inner}>
                <div className={classes.content}>
                    <Title className={classes.title}>
                        Play <span className={classes.highlight}>games</span> with your AI bot and win incredible prizes!
                    </Title>
                    <Text color="dimmed" mt="md" className={classes.subtitle}>
                        <b>Neural Arena</b> is a decentralized web3 game platform, pioneering a world-first approach where users employ their <b>AI-enhanced NFT characters (AI players)</b> to compete against each other in matches to <b>improve their NFT's experience</b> (XP) and to <b>win prizes</b> in crypto
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
                            Each <b>NFT</b> contains the visual features (the 3d model with animations) and the skills (the parameters of its <b>artificial neural network</b>) trained using <b>deep reinforcement learning</b>(RL). All the contents (the NN data, the 3d model and the sound effects) are <b>stored on-chain</b>.
                        </List.Item>
                        <List.Item className={classes.item}>
                            All games <b>run 100% on-chain</b> to ensure no match can be manipulated as there are no external interferences, making hacking impossible.
                        </List.Item>
                        <List.Item className={classes.item}>
                            The platform is <b>independent</b> of the games and NFT's hosted. Developers will soon be able to <b>publish their own games and NFT collections</b> using our Canister Development Kit (CDK) and our NFT generator.
                        </List.Item>
                        <List.Item className={classes.item}>
                            Neural Arena will be fully <b>open-source</b> upon the launch of its SNS Decentralized Autonomous Organization (DAO). 
                        </List.Item>
                    </List>

                    <Group mt={30}>
                        {!user?
                            <Button 
                                variant="gradient"
                                radius="xl" 
                                size="md" 
                                className={cx(classes.control, {[globClasses.animatedOutline]: true})}
                                onClick={handleSignup}
                            >
                                <IconUserPlus size="1rem" />&nbsp;Create an account
                            </Button>
                        :
                            <Button 
                                variant="gradient"
                                radius="xl" 
                                size="md" 
                                className={cx(classes.control, {[globClasses.animatedOutline]: true})}
                                onClick={handleShowUserPage}
                            >
                                <IconUser size="1rem" />&nbsp;Go to your page
                            </Button>
                        }
                        <Button 
                            variant="default" 
                            bg="green"
                            radius="xl" 
                            size="md" 
                            className={classes.control}
                            onClick={handleReadWhitepaper}
                        >
                            <IconBook size="1rem" />&nbsp;Read our whitepaper
                        </Button>
                    </Group>
                </div>

                <div className={classes.imageContainer}>
                    <Image src={logo} className={classes.image} />
                </div>
            </div>

            <Space h="4rem" />

            <div>
                <TopGames/>
            </div>
        </Container>
    );
};

export default Landing;