import React, { useCallback } from "react";
import { Button, Paper, createStyles, rem, Badge, Container, Text, Slider, Space } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { GameResponse, MatchResponse } from "../../../../../declarations/neuralarena_be/neuralarena_be.did";
import { matchStatusToString } from "../../../libs/matches";
import TimeFromNow from "../../../components/TimeFromNow";

const useStyles = createStyles((theme) => ({
    card: {
        height: rem(440),
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        backgroundPosition: 'center',
        backgroundBlendMode: 'soft-light',
        position: 'relative',

        ':hover': {
            backgroundBlendMode: 'normal',
        },
  
    },

    statusBox: {
        position: 'absolute',
        top: '1rem',
        right: '1rem',

        ":before": {
            content: '"Status"',
            position: 'absolute',
            top: '-0.7rem',
            left: '0.5rem',
            fontSize: '0.75rem'
        }
    },

    status: {
        color: theme.white,
        fontWeight: 900,
        textTransform: 'uppercase',
        fontSize: '1.5rem',
    },

  }));

interface Props {
    game: GameResponse;
    match: MatchResponse;
    showView?: boolean;
}
  
export const Card = (props: Props) => {
    const { classes } = useStyles();
    const navigate = useNavigate();

    const handleView = useCallback(() => {
        navigate(`/matches/${props.match.id}`)
    }, [props.match.id]);

    const {game, match} = props;

    const min_players = Number(game.info.min_players);
    const max_players = Number(game.info.max_players);
    
    return (
        <Paper
            shadow="md"
            p="xl"
            radius="md"
            style={{ backgroundImage: `url(${game.info.image_url})` }}
            className={classes.card}
        >
            <div className={classes.statusBox}>
                <Badge 
                    className={classes.status} 
                    size="xl"
                >
                    {matchStatusToString(match.status)}
                </Badge>
            </div>
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