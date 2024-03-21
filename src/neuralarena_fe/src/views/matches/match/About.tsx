import React from "react";
import { GameResponse, MatchResponse } from "@declarations/neuralarena_be/neuralarena_be.did";
import { Grid, TextInput } from "@mantine/core";
import { principalToString, timeToNow } from "@libs/icp";
import { matchStatusToString } from "@libs/matches";
import { FPS } from "@libs/games";

interface Props {
    match: MatchResponse|undefined;
    game: GameResponse|undefined;
}

export const AboutMatch = (props: Props) => {
    const {match, game} = props;

    return (
        <Grid>
            <Grid.Col span={6}>
                <TextInput
                    label="Id"
                    value={match?.id || ''}
                    readOnly
                />
            </Grid.Col>

            <Grid.Col span={6}>
                <TextInput
                    label="Status"
                    value={matchStatusToString(match?.state.status)}
                    readOnly
                />
            </Grid.Col>

            <Grid.Col span={6}>
                <TextInput
                    label="Game id"
                    value={match?.game.id || ''}
                    readOnly
                />
            </Grid.Col>

            <Grid.Col span={6}>
                <TextInput
                    label="Game name"
                    value={game?.info.name || ''}
                    readOnly
                />
            </Grid.Col>

            <Grid.Col md={6}>
                <TextInput
                    label="Created by"
                    value={principalToString(match?.created_by)}
                    readOnly
                />
            </Grid.Col>

            <Grid.Col md={6}>
                <TextInput
                    label="Created at"
                    value={match? 
                        timeToNow(match.created_at)[1].toLocaleString():
                        ''
                    }
                    readOnly
                />
            </Grid.Col>

            <Grid.Col md={6}>
                <TextInput
                    label="Initial seed"
                    value={match? 
                        match.state.initial_seed[0]?.toString(16) || '': 
                        ''
                    }
                    readOnly
                />
            </Grid.Col>

            <Grid.Col md={6}>
                <TextInput
                    label="Run slices"
                    value={match? 
                        match.state.run_slices.length: 
                        '0'
                    }
                    readOnly
                />
            </Grid.Col>

            <Grid.Col span={6}>
                <TextInput
                    label="Remain opened for"
                    value={match? 
                        match.opened_for.toString() + 's': 
                        ''
                    }
                    readOnly
                />
            </Grid.Col>

            <Grid.Col span={6}>
                <TextInput
                    label="Started at"
                    value={match && match.started_at.length > 0? 
                        timeToNow(match.started_at[0]!)[1].toLocaleString(): 
                        ''
                    }
                    readOnly
                />
            </Grid.Col>

            <Grid.Col md={6}>
                <TextInput
                    label="Max Duration"
                    value={match? 
                        (Number(match.game.max_steps) / FPS).toString() + 's': 
                        ''
                    }
                    readOnly
                />
            </Grid.Col>

            <Grid.Col md={6}>
                <TextInput
                    label="Total Duration"
                    value={match? 
                        (Number(match.state.num_steps) / FPS).toString() + 's': 
                        ''
                    }
                    readOnly
                />
            </Grid.Col>
            
            <Grid.Col md={6}>
                <TextInput
                    label="Min players"
                    value={match? 
                        match.game.min_players.toString(): 
                        '0'
                    }
                    readOnly
                />
            </Grid.Col>

            <Grid.Col md={6}>
                <TextInput
                    label="Total players"
                    value={match? 
                        match.players.length: 
                        '0'
                    }
                    readOnly
                />
            </Grid.Col>

            <Grid.Col md={6}>
                <TextInput
                    label="Won by"
                    value={match && match.won_by.length > 0? 
                        principalToString(match.won_by[0]): 
                        ''
                    }
                    readOnly
                />
            </Grid.Col>

            <Grid.Col md={6}>
                <TextInput
                    label="Won at"
                    value={match && match.won_at.length > 0? 
                        timeToNow(match.won_at[0]!)[1].toLocaleString(): 
                        ''
                    }
                    readOnly
                />
            </Grid.Col>
        </Grid>
    )
};