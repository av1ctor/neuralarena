import React from "react";
import { GameResponse, MatchResponse } from "@declarations/neuralarena_be/neuralarena_be.did";
import { Grid, TextInput } from "@mantine/core";
import { principalToString } from "@libs/icp";
import { timeToNow } from "@libs/time";
import { matchStatusToString } from "@libs/matches";
import { FPS } from "@libs/games";

interface Props {
    match: MatchResponse|undefined;
    game: GameResponse|undefined;
}

export const MatchAbout = (props: Props) => {
    const {match, game} = props;

    return (
        <Grid>
            <Grid.Col md={6}>
                <TextInput
                    label="Id"
                    value={match?.id || ''}
                    readOnly
                />
            </Grid.Col>

            <Grid.Col md={6}>
                <TextInput
                    label="Status"
                    value={matchStatusToString(match?.state.status)}
                    readOnly
                />
            </Grid.Col>

            <Grid.Col md={6}>
                <TextInput
                    label="Game id"
                    value={match?.game.id || ''}
                    readOnly
                />
            </Grid.Col>

            <Grid.Col md={6}>
                <TextInput
                    label="Game name"
                    value={game?.info.name || ''}
                    readOnly
                />
            </Grid.Col>

            <Grid.Col md={6}>
                <TextInput
                    label="Map id"
                    value={match?.game.map_id.toString() || ''}
                    readOnly
                />
            </Grid.Col>

            <Grid.Col md={6}>
                <TextInput
                    label="Map name"
                    value={(match && game?.info.maps[Number(match.game.map_id)].name) || ''}
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
                    label="Deadline"
                    value={match? 
                        match.deadline.toString() + 's': 
                        ''
                    }
                    readOnly
                />
            </Grid.Col>

            <Grid.Col md={6}>
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

            <Grid.Col md={6}>
                <TextInput
                    label="Max Duration"
                    value={match? 
                        (Number(match.game.max_steps) / FPS).toFixed(0).toString() + 's': 
                        ''
                    }
                    readOnly
                />
            </Grid.Col>

            <Grid.Col md={6}>
                <TextInput
                    label="Total Duration"
                    value={match? 
                        (Number(match.state.num_steps) / FPS).toFixed(2).toString() + 's': 
                        ''
                    }
                    readOnly
                />
            </Grid.Col>
            
            <Grid.Col md={6}>
                <TextInput
                    label="Min/Max players"
                    value={match? 
                        `${match.game.min_players}/${match.game.max_players}`: 
                        '0/0'
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