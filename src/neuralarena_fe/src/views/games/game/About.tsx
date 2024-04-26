import React from "react";
import { GameResponse } from "@declarations/neuralarena_be/neuralarena_be.did";
import { Grid, TextInput, Textarea, Chip, Group, Input, Box, createStyles, Tabs } from "@mantine/core";
import { useGameGetEndCredits } from "@hooks/games";
import { EndCredits } from "./EndCredits";
import { IconList, IconUsersGroup } from "@tabler/icons-react";
import { gameCostToPlay } from "@libs/games";
import { e8sToDecimal } from "@libs/icp";
import { NeuralNetSkill } from "@components/NeuralNetSkill";

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

    const costToPlay = game? 
        gameCostToPlay(game.info.costs): 
        {value: 0n, currency: ''};

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
                            value={game?.id.toString() || ''}
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

                    <Grid.Col md={12}>
                        <TextInput
                            label="Subtitle"
                            value={game?.info.subtitle || ''}
                            readOnly
                        />
                    </Grid.Col>

                    <Grid.Col md={6}>
                        <TextInput
                            label="Min players"
                            value={game?.info.min_players.toString()||'0'}
                            readOnly
                        />
                    </Grid.Col>

                    <Grid.Col md={6}>
                        <TextInput
                            label="Max players"
                            value={game?.info.max_players.toString()||'0'}
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
                            label="FPS"
                            value={game?.info.fps||60}
                            readOnly
                        />
                    </Grid.Col>

                    <Grid.Col md={6}>
                        <TextInput
                            label="Cost to play"
                            value={`${e8sToDecimal(costToPlay.value)} ${costToPlay.currency}`}
                            readOnly
                        />
                    </Grid.Col>

                    <Grid.Col md={6}>
                        <TextInput
                            label="Winner reward"
                            value={`${game?.info.rewards.winner.toString() || '0'}%`}
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
                                            <NeuralNetSkill skill={skill} />
                                        </Chip>
                                    )}
                                </Group>
                            </Chip.Group>
                        </Input.Wrapper>
                    </Grid.Col>

                    <Grid.Col md={12}>
                        <Input.Wrapper label="States required">
                            <Chip.Group>
                                <Group>
                                    {game?.info.states.map((state, index) => 
                                        <Chip key={index} readOnly>
                                            {state}
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