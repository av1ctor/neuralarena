import React, { ReactElement } from 'react';
import { Card, Center, Group, Stack, Text, ThemeIcon, useMantineTheme } from '@mantine/core';
import { TablerIconsProps } from '@tabler/icons-react';

interface Props {
    title: string;
    icon: (props: TablerIconsProps) => JSX.Element;
    children?: ReactElement|ReactElement[];
};

export const PageTitle = (props: Props) => {
    const theme = useMantineTheme();
    
    return (
        <Card radius="md" p="xl" mb="lg" shadow="sm">
            <Group noWrap spacing="xl" position="apart">
                <Stack>
                    <Center>
                        <ThemeIcon size="5rem" variant='default' radius="md">
                            <props.icon size="4rem" color={theme.fn.primaryColor()} />
                        </ThemeIcon>
                    </Center>
                    <Center>
                        <Text fz="lg" fw={500} color={theme.primaryColor}>
                            {props.title}
                        </Text>
                    </Center>
                </Stack>
                <Center>
                    {props.children}
                </Center>
            </Group>
        </Card>
    );
}