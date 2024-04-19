import React from "react";
import { GameResponse, MatchResponse } from "@declarations/neuralarena_be/neuralarena_be.did";
import { Grid, TextInput } from "@mantine/core";
import { 
    e8sToDecimal, principalToString} from "@libs/icp";
import { timeToNow } from "@libs/time";
import { matchStatusToString, matchOpenOrRunning } from "@libs/matches";
import { gameCostToPlay } from "@libs/games";
import { WalletLogs } from "./WalletLogs";

interface Props {
    match: MatchResponse|undefined;
    game: GameResponse|undefined;
}

export const MatchAbout = (props: Props) => {
    const {match, game} = props;

    const costToPlay = match? 
        gameCostToPlay(match.instance.costs): 
        {value: 0n, currency: ''};

    const openOrRunning = matchOpenOrRunning(match);

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
                    value={match?.game.id.toString() || ''}
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
                    label="Cost to play"
                    value={`${e8sToDecimal(costToPlay.value)} ${costToPlay.currency}`}
                    readOnly
                />
            </Grid.Col>

            <Grid.Col md={6}>
                <TextInput
                    label="Winner reward %"
                    value={`${match?.instance.rewards.winner.toString() || '0'}%`}
                    readOnly
                />
            </Grid.Col>

            <Grid.Col md={6}>
                <TextInput
                    label="Total balance"
                    value={match? 
                        `${e8sToDecimal(match.state.balance)} ${costToPlay.currency}`: 
                        ''
                    }
                    readOnly
                />
            </Grid.Col>

            <Grid.Col md={6}>
                <TextInput
                    label="Winner reward"
                    value={openOrRunning && match? 
                        `${e8sToDecimal(match.state.balance * (match.instance.rewards.winner || 0n) / 100n)} ${costToPlay.currency}`: 
                        ''
                    }
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
                    label="FPS"
                    value={game? 
                        game.info.fps:
                        '60'
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
                    label="Max Duration"
                    value={match? 
                        (Number(match.game.max_steps) / (game?.info.fps ?? 1)).toFixed(0).toString() + 's': 
                        ''
                    }
                    readOnly
                />
            </Grid.Col>

            <Grid.Col md={6}>
                <TextInput
                    label="Total Duration"
                    value={match? 
                        (Number(match.state.num_steps) / (game?.info.fps ?? 1)).toFixed(2).toString() + 's': 
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

            <WalletLogs
                logs={match?.state.wallet_logs}
            />
        </Grid>
    )
};