import React from "react";
import { GameResponse } from "@declarations/neuralarena_be/neuralarena_be.did";
import { Grid, TextInput, Textarea, Chip, Group, Input, Box, createStyles, Tabs } from "@mantine/core";
import { useGameGetEndCredits } from "@hooks/games";
import { EndCredits } from "./EndCredits";
import { IconList, IconUsersGroup } from "@tabler/icons-react";

const useStyles = createStyles((theme) => ({
    inputbox: {
        backgroundColor: theme.colorScheme === 'dark'? theme.colors.gray: theme.white,
        border: '1px solid',
        borderColor: theme.colorScheme === 'dark'? theme.colors.gray[8]: theme.colors.gray[4],
        borderRadius: '8px',
    },
}));

interface Props {
    game: GameResponse|undefined;
}

export const GameAbout = (props: Props) => {
    const {classes} = useStyles();
    const {game} = props;

    const credits = useGameGetEndCredits(game?.id);

    return (
        <Tabs defaultValue="info">
            <Tabs.List grow>
                <Tabs.Tab value="info" icon={<IconList size="0.8rem" />}>Info</Tabs.Tab>
                <Tabs.Tab value="credits" icon={<IconUsersGroup size="0.8rem" />}>Credits</Tabs.Tab>            
            </Tabs.List>

            <Tabs.Panel value="info" mt="xl">
                <Grid>
                    <Grid.Col md={6}>
                        <TextInput
                            label="Id"
                            value={game?.id || ''}
                            readOnly
                        />
                    </Grid.Col>

                    <Grid.Col md={6}>
                        <TextInput
                            label="Canister id"
                            value={game?.canister_id.toString() || ''}
                            readOnly
                        />
                    </Grid.Col>

                    <Grid.Col md={6}>
                        <TextInput
                            label="Name"
                            value={game?.info.name || ''}
                            readOnly
                        />
                    </Grid.Col>

                    <Grid.Col md={6}>
                        <TextInput
                            label="Version"
                            value={game?.info.version.toFixed(2) || ''}
                            readOnly
                        />
                    </Grid.Col>

                    <Grid.Col md={6}>
                        <TextInput
                            label="Category"
                            value={game?.info.category || ''}
                            readOnly
                        />
                    </Grid.Col>

                    <Grid.Col md={6}>
                        <TextInput
                            label="Min/Max players"
                            value={`${game?.info.min_players||0}/${game?.info.max_players||0}`}
                            readOnly
                        />
                    </Grid.Col>

                    <Grid.Col md={12}>
                        <Textarea
                            label="Description"
                            value={game?.info.description || ''}
                            minRows={6}
                            readOnly
                        />
                    </Grid.Col>

                    <Grid.Col md={12}>
                        <Input.Wrapper label="Skills needed">
                            <Chip.Group>
                                <Group>
                                    {game?.info.skills.map((skill, index) => 
                                        <Chip key={index} readOnly>
                                            {skill}
                                        </Chip>
                                    )}
                                </Group>
                            </Chip.Group>
                        </Input.Wrapper>
                    </Grid.Col>

                    <Grid.Col md={12}>
                        <Input.Wrapper label="Animations required">
                            <Chip.Group>
                                <Group>
                                    {game?.info.animations.map((anim, index) => 
                                        <Chip key={index} readOnly>
                                            {anim}
                                        </Chip>
                                    )}
                                </Group>
                            </Chip.Group>
                        </Input.Wrapper>
                    </Grid.Col>
                </Grid>
            </Tabs.Panel>

            <Tabs.Panel value="credits" mt="xl">
                <Box className={classes.inputbox}>
                    <EndCredits 
                        credits={credits.data} 
                        level={0}
                    />
                </Box>
            </Tabs.Panel>
        </Tabs>
    )
};