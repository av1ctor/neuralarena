import React from "react";
import { GameResponse } from "@declarations/neuralarena_be/neuralarena_be.did";
import { Grid, TextInput, Textarea, Chip, Group, Input } from "@mantine/core";

interface Props {
    game: GameResponse|undefined;
}

export const GameAbout = (props: Props) => {
    const {game} = props;

    return (
        <Grid>
            <Grid.Col span={6}>
                <TextInput
                    label="Id"
                    value={game?.id || ''}
                    readOnly
                />
            </Grid.Col>

            <Grid.Col span={6}>
                <TextInput
                    label="Canister id"
                    value={game?.canister_id.toString() || ''}
                    readOnly
                />
            </Grid.Col>

            <Grid.Col span={6}>
                <TextInput
                    label="Name"
                    value={game?.info.name || ''}
                    readOnly
                />
            </Grid.Col>

            <Grid.Col span={6}>
                <TextInput
                    label="Version"
                    value={game?.info.version.toFixed(2) || ''}
                    readOnly
                />
            </Grid.Col>

            <Grid.Col span={6}>
                <TextInput
                    label="Category"
                    value={game?.info.category || ''}
                    readOnly
                />
            </Grid.Col>

            <Grid.Col span={6}>
                <TextInput
                    label="Min/Max players"
                    value={`${game?.info.min_players||0}/${game?.info.max_players||0}`}
                    readOnly
                />
            </Grid.Col>

            <Grid.Col span={12}>
                <Textarea
                    label="Description"
                    value={game?.info.description || ''}
                    minRows={6}
                    readOnly
                />
            </Grid.Col>

            <Grid.Col span={12}>
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

            <Grid.Col span={12}>
                <Input.Wrapper label="Animations used">
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
    )
};