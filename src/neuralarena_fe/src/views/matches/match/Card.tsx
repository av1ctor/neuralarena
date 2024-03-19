import React, { useCallback } from "react";
import { Button, Paper, createStyles, rem, Badge, Container, Text, Slider, Space, Grid } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { MatchResponse, MatchStatus } from "@declarations/neuralarena_be/neuralarena_be.did";
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
        backgroundBlendMode: theme.colorScheme === "dark"? 'soft-light': 'hard-light',
        position: 'relative',
        ':hover': {
            backgroundBlendMode: 'normal',
        },
    },

    name: {
        position: 'relative',
        color: theme.colorScheme === "dark"? theme.white: theme.black,
        fontSize: '.8rem',
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
        fontSize: '.8rem',
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

const statusToColor = (status: MatchStatus) => {
    switch(matchStatusToString(status)) {
        case 'OPEN':
            return 'green';
        case 'FINISHED':
            return 'blue';
        case 'CANCELLED':
            return 'gray';
        default:
            return 'yellow';
    }
}

interface Props {
    match: MatchResponse;
    showView?: boolean;
}
  
export const MatchCard = (props: Props) => {
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
                        variant="light"
                    >
                        {game.data?.info.name}
                    </Badge>
                </Grid.Col>
                <Grid.Col span={6}>
                    <Badge 
                        className={classes.status} 
                        color={statusToColor(match.state.status)} 
                        variant="filled"
                        size="xl"
                    >
                        {matchStatusToString(match.state.status)}
                    </Badge>
                </Grid.Col>
            </Grid>
            <div>&nbsp;</div>
            <Container w='100%'>
                <div>
                    <Slider
                        value={match.players.length}
                        label={`Players: ${match.players.length}`}
                        min={0}
                        max={16}
                        marks={[
                            { value: min_players, label: `Min: ${min_players}` },
                            { value: max_players, label: `Max: ${max_players}` },
                        ]}
                    />
                </div>
                <Space h='xl' />
                <div>
                    <Text><TimeFromNow date={match.created_at} /> ago</Text>
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