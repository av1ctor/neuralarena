import React from 'react';
import { Anchor, Box, Center, Container, Divider, Grid, Space, Stack, Text } from '@mantine/core';
import { IconBrandCSharp, IconBrandGithubFilled, IconBrandTwitterFilled } from '@tabler/icons-react';
import poweredBy from "@assets/powered-by.svg";
import openchat from "@assets/openchat.svg";
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
                        <Grid.Col span={4}>
                            <Anchor 
                                href="https://twitter.com/neuralarena"
                                target="_blank"
                                title='twitter'
                            >
                                <IconBrandTwitterFilled size="2rem" />
                            </Anchor>
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <Anchor 
                                href="https://oc.app/community/av5g3-4iaaa-aaaar-bck2q-cai/?ref=7qarg-ziaaa-aaaar-afqpq-cai"
                                target="_blank"
                                title='openchat'
                            >
                                <img 
                                    width="32"
                                    src={openchat} 
                                />
                            </Anchor>
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <Anchor
                                href="https://github.com/av1ctor/neuralarena"
                                target="_blank"
                                title='github'
                            >
                                <IconBrandGithubFilled size="2rem" />
                            </Anchor>
                        </Grid.Col>
                    </Grid>
                </Grid.Col>
            </Grid>
            <Space />
            <Center mt="xl">
                <small>
                    © {year} neuralarena
                </small>
            </Center>
            <Box bg="pink" p="xs" mt="xl">
                <Center>
                    <Text color='white' size="xs">Notice: this site is under development and should be used for testing and demonstration only.</Text>
                </Center>
            </Box>
        </Container>
    );
}

export default AppFooter;