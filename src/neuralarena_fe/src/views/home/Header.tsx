import React from 'react';
import { ActionIcon, Avatar, Box, Burger, Center, Collapse, Divider, Drawer, Group, Header, HoverCard, ScrollArea, UnstyledButton, createStyles, rem, useMantineColorScheme, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconChevronDown, IconDeviceGamepad, IconGoGame, IconMoonStars, IconPhoto, IconSun } from '@tabler/icons-react';
import { AuthMenu } from './menus/Auth';
import { UserMenu } from './menus/User';
import { useAuth } from '@hooks/auth';
import logo from "@assets/logo-horz.svg";
import { Link } from 'react-router-dom';

const useStyles = createStyles((theme) => ({
    header: {
    },
    
    link: {
        display: 'flex',
        alignItems: 'center',
        height: '100%',
        paddingLeft: theme.spacing.md,
        paddingRight: theme.spacing.md,
        textDecoration: 'none',
        color: theme.colorScheme === 'dark' ? theme.white : theme.black,
        fontWeight: 500,
        fontSize: theme.fontSizes.sm,
    
        [theme.fn.smallerThan('sm')]: {
            height: rem(42),
            display: 'flex',
            alignItems: 'center',
            width: '100%',
        },
    
        ...theme.fn.hover({
            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
        }),
    },
  
    hiddenMobile: {
        [theme.fn.smallerThan('sm')]: {
            display: 'none',
        },
    },
  
    hiddenDesktop: {
        [theme.fn.largerThan('sm')]: {
            display: 'none',
        },
    },
}));
  
interface Props {
}

const ToggleThemeButton = () => {
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const dark = colorScheme === 'dark';

    return (
        <ActionIcon
            variant="outline"
            color={dark ? 'yellow' : 'blue'}
            onClick={() => toggleColorScheme()}
            title="Toggle color scheme"
            >
            {dark ? <IconSun size="1.1rem" /> : <IconMoonStars size="1.1rem" />}
        </ActionIcon>
    );
};

const AppHeader = (props: Props) => {
    const {user} = useAuth();
    const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
    const [linksOpened, { toggle: toggleLinks }] = useDisclosure(false);
    const {classes, theme} = useStyles();

    return (
        <Box>
            <Header height={60} px="md" zIndex={101} className={classes.header}>
                <Group position="apart" sx={{ height: '100%' }}>
                    <Group sx={{ height: '100%' }} spacing={0} className={classes.hiddenMobile}>

                        <a href="#" className={classes.link}>
                            <img src={logo} />
                        </a>

                        <a href="#/nfts" className={classes.link}>
                            <IconPhoto size="1rem" />&nbsp;NFT's
                        </a>

                        <a href="#/games" className={classes.link}>
                            <IconGoGame size="1rem" />&nbsp;Games
                        </a>

                        <a href="#/matches" className={classes.link}>
                            <IconDeviceGamepad size="1rem" />&nbsp;Matches
                        </a>

                        {user && 
                            <HoverCard width={600} position="bottom" radius="md" shadow="md" withinPortal>
                                <HoverCard.Target>
                                    <a href="#" className={classes.link}>
                                        <Center inline>
                                            <Avatar color="cyan" radius="xl" size="sm">
                                                {user.nick.substr(0, 2).toUpperCase()}
                                            </Avatar>
                                            &nbsp;<Text fw={500} size="xs">{user.name}</Text>&nbsp;
                                            <IconChevronDown size={16} color={theme.fn.primaryColor()} />
                                        </Center>
                                    </a>
                                </HoverCard.Target>

                                <HoverCard.Dropdown sx={{ overflow: 'hidden' }}>
                                    <UserMenu />
                                </HoverCard.Dropdown>
                            </HoverCard>
                        }
                    </Group>

                    <Group className={classes.hiddenMobile}>
                        <ToggleThemeButton />
                        <AuthMenu />
                    </Group>
                    
                    <Burger opened={drawerOpened} onClick={toggleDrawer} className={classes.hiddenDesktop} />
                </Group>
            </Header>

            <Drawer
                opened={drawerOpened}
                onClose={closeDrawer}
                size="100%"
                padding="md"
                title={
                    <a href="#" className={classes.link} onClick={closeDrawer}>
                        <img src={logo} />
                    </a>
                }
                className={classes.hiddenDesktop}
                zIndex={1000000}
            >
                <ScrollArea h={`calc(100vh - ${rem(60)})`} mx="-md">
                    <Divider my="sm" color={theme.colorScheme === 'dark' ? 'dark.5' : 'gray.1'} />
        
                    <Link to="/nfts" className={classes.link} onClick={closeDrawer}>
                        <IconGoGame size="1rem" />&nbsp;NFT's
                    </Link>

                    <Link to="/games" className={classes.link} onClick={closeDrawer}>
                        <IconGoGame size="1rem" />&nbsp;Games
                    </Link>

                    <Link to="/matches" className={classes.link} onClick={closeDrawer}>
                        <IconDeviceGamepad size="1rem" />&nbsp;Matches
                    </Link>

                    {user && 
                        <>
                            <UnstyledButton className={classes.link} onClick={toggleLinks}>
                                <Center inline>
                                    <Avatar color="cyan" radius="xl" size="sm">
                                        {user.nick.substr(0, 2).toUpperCase()}
                                    </Avatar>
                                    &nbsp;<Text fw={500} size="xs">{user.name}</Text>&nbsp;
                                    <IconChevronDown size={16} color={theme.fn.primaryColor()} />
                                </Center>
                            </UnstyledButton>
                            <Collapse in={linksOpened}>
                                <UserMenu onClick={closeDrawer} />
                            </Collapse>
                        </>
                    }
        
                    <Divider my="sm" color={theme.colorScheme === 'dark' ? 'dark.5' : 'gray.1'} />
        
                    <Group className={classes.hiddenDesktop} position="center" grow pb="xl" px="md">
                        <div>
                            <ToggleThemeButton />
                        </div>
                        <AuthMenu onClick={closeDrawer} />
                    </Group>
                </ScrollArea>
            </Drawer>
        </Box>
    );
}

export default AppHeader;