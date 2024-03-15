import React, { ReactElement } from 'react';
import { Card, Center, Group, Stack, Text } from '@mantine/core';

interface Props {
    title: string;
    icon: ReactElement;
    children?: ReactElement|ReactElement[];
};

export const PageTitle = (props: Props) => {
    return (
        <Card withBorder radius="md" p="xl" mb="lg" shadow="sm">
            <Group noWrap spacing="xl" position="apart">
                <Stack>
                    <Center>
                        {props.icon} 
                    </Center>
                    <Center>
                        <Text fz="lg" className="card-title" fw={500}>
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