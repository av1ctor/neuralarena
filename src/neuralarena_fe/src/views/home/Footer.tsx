import React from 'react';
import { Anchor, Center, Container, Divider, Grid, Space, Stack, Text } from '@mantine/core';
import { IconBrandGithubFilled, IconBrandTwitterFilled } from '@tabler/icons-react';
import poweredBy from "@assets/powered-by.svg";
import { config } from '../../config';

interface Props {
}

const AppFooter = (props: Props) => {
    
    const year = new Date().getFullYear();
    
    return (
        <Container pt="10rem">
            <Divider pb="xl" />
            <Grid>
                <Grid.Col span={12}>
                    <Center>
                        <a href="https://dfinity.org" target="_blank">
                            <img src={poweredBy} />
                        </a>
                    </Center>
                </Grid.Col>
            </Grid>
            <Grid pt="md">
                <Grid.Col span={4}>
                    <Stack>
                        <Anchor 
                            href={config.WHITEPAPER_URL} 
                            target="_blank"
                        >
                            Whitepaper
                        </Anchor>
                        <Anchor 
                            href={config.DEVDOCS_URL} 
                            target="_blank"
                        >
                            Dev docs
                        </Anchor>
                    </Stack>
                </Grid.Col>
                <Grid.Col span={4}>
                    <Stack>
                        <Anchor href="#/policies">
                            Policies
                        </Anchor>
                        <Anchor href="#/privacy">
                            Privacy
                        </Anchor>
                    </Stack>
                </Grid.Col>
                <Grid.Col span={4}>
                    <Grid>
                        <Grid.Col span={6}>
                            <Anchor 
                                href="https://twitter.com/neuralarena"
                                target="_blank"
                            >
                                <IconBrandTwitterFilled size="2rem" />
                            </Anchor>
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <Anchor
                                href="https://github.com/av1ctor/neuralarena"
                                target="_blank"
                            >
                                <IconBrandGithubFilled size="2rem" />
                            </Anchor>
                        </Grid.Col>
                    </Grid>
                </Grid.Col>
            </Grid>
            <Space />
            <Center>
                © {year} neuralarena
            </Center>
            <Center>
                <Text color='pink' size="xs">Notice: this is a demo site</Text>
            </Center>
        </Container>
    );
}

export default AppFooter;