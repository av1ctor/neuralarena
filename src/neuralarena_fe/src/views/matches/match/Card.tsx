import React, { useCallback } from "react";
import { Button, Paper, createStyles, rem, Badge, Container, Text, Slider, Space, Grid } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { MatchResponse } from "@declarations/neuralarena_be/neuralarena_be.did";
import { matchStatusToString } from "@libs/matches";
import TimeFromNow from "@components/TimeFromNow";
import { useGameFindById } from "@hooks/games";

const useStyles = createStyles((theme) => ({
    card: {
        height: rem(440),
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        color: theme.colorScheme === "dark"? theme.white: theme.black,
        backgroundPosition: 'center',
        backgroundBlendMode: theme.colorScheme === "dark"? 'soft-light': 'normal',
        position: 'relative',

        ':hover': {
            backgroundBlendMode: theme.colorScheme === "dark"? 'normal': 'hard-light',
        },
    },

    name: {
        position: 'relative',
        color: theme.colorScheme === "dark"? theme.white: theme.black,
        textTransform: 'uppercase',
        overflow: 'visible',
        ":before": {
            content: '"Game"',
            position: 'absolute',
            top: '-1.0rem',
            left: '1.0rem',
            fontSize: '0.66rem',
            fontWeight: 'normal',
            textTransform: 'none'
        }
    },

    status: {
        position: 'relative',
        color: theme.colorScheme === "dark"? theme.white: theme.black,
        float: 'right',
        textTransform: 'uppercase',
        overflow: 'visible',
        ":before": {
            content: '"Status"',
            position: 'absolute',
            top: '-1.0rem',
            left: '1.0rem',
            fontSize: '0.66rem',
            fontWeight: 'normal',
            textTransform: 'none'
        }
    },
  }));

interface Props {
    match: MatchResponse;
    showView?: boolean;
}
  
export const Card = (props: Props) => {
    const { classes } = useStyles();
    const navigate = useNavigate();

    const handleView = useCallback(() => {
        navigate(`/matches/${props.match.id}`)
    }, [props.match.id]);

    const {match} = props;

    const game = useGameFindById(match.game.id);

    const min_players = game.data? Number(game.data.info.min_players): 1;
    const max_players = game.data? Number(game.data.info.max_players): 10;
    
    return (
        <Paper
            shadow="md"
            p="xl"
            radius="md"
            style={{ backgroundImage: `url(${game.data?.info.urls.cover ?? "game-cover.svg"})` }}
            className={classes.card}
        >
            <Grid w="100%">
                <Grid.Col span={6}>
                    <Badge 
                        className={classes.name} 
                        size="xl"
                        variant="gradient"
                    >
                        {game.data?.info.name}
                    </Badge>
                </Grid.Col>
                <Grid.Col span={6}>
                    <Badge 
                        className={classes.status} 
                        color="yellow" 
                        variant="filled"
                        size="xl"
                    >
                        {matchStatusToString(match.status)}
                    </Badge>
                </Grid.Col>
            </Grid>
            <div>&nbsp;</div>
            <Container w='100%'>
                <div>
                    <Text>Players:</Text>
                </div>
                <div>
                    <Slider
                        value={match.players.length}
                        label={`Current: ${match.players.length}`}
                        min={0}
                        max={16}
                        marks={[
                            { value: min_players, label: `Min: ${min_players.toString()}` },
                            { value: max_players, label: `Max: ${max_players.toString()}` },
                        ]}
                    />
                </div>
                <Space h='xl' />
                <div>
                    <Text>Created: <TimeFromNow date={match.created_at} /> ago</Text>
                </div>
            </Container>
            <Container>
                {props.showView &&
                    <Button 
                        variant="gradient"
                        size="md" 
                        onClick={handleView}
                    >
                        View
                    </Button>
                }
            </Container>
        </Paper>
    );
};