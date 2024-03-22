import React from 'react';
import { Group, UnstyledButton, createStyles, rem, Text, ThemeIcon, Grid } from '@mantine/core';
import { IconUser, IconDeviceGamepad, IconPhoto, IconWallet } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

const useStyles = createStyles((theme) => ({
    subLink: {
        width: '100%',
        padding: `${theme.spacing.xs} ${theme.spacing.md}`,
        borderRadius: theme.radius.md,
    
        ...theme.fn.hover({
            backgroundColor: theme.colorScheme === 'dark'? 
                theme.colors.dark[7]: 
                theme.colors.gray[0],
        }),
    
        '&:active': theme.activeStyles,
    },

    url: {
        color: 'inherit',
        textDecoration: 'none',
    },
}));

const items = [
    {
        icon: IconDeviceGamepad,
        title: 'Matches',
        description: 'Your matches',
        to: "/users/matches"
    },
    {
        icon: IconPhoto,
        title: 'NFTs',
        description: 'Your NFTs',
        to: "/users/nfts"
    },
    {
        icon: IconWallet,
        title: 'Wallet',
        description: 'Your wallet',
        to: "/users/wallet"
    },
    {
        icon: IconUser,
        title: 'Profile',
        description: 'Your profile',
        to: "/users/profile"
    },
];

interface Props {
    onClick?: () => void;
}

export const UserMenu = (props: Props) => {
    const { classes, theme } = useStyles();

    return (
        <Grid>
            {items.map((item) => 
                <Grid.Col md={6} key={item.title}>
                    <UnstyledButton 
                        className={classes.subLink} 
                    >
                        <Link to={item.to} className={classes.url} onClick={props.onClick}>
                            <Group noWrap align="flex-start">
                                <ThemeIcon size={34} variant="default" radius="md">
                                    <item.icon size={rem(22)} color={theme.fn.primaryColor()} />
                                </ThemeIcon>
                                <div>
                                    <Text size="sm" fw={500}>
                                        {item.title}
                                    </Text>
                                    <Text size="xs" color="dimmed">
                                        {item.description}
                                    </Text>
                                </div>
                            </Group>
                        </Link>
                    </UnstyledButton>
                </Grid.Col>
            )}
        </Grid>
    );
};
