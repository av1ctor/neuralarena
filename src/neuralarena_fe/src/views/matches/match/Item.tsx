import React, { useCallback } from "react";
import { createStyles, rem, Badge, Container, Text, Slider, Space, Grid, Card, Image } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { MatchResponse, MatchStatus } from "@declarations/neuralarena_be/neuralarena_be.did";
import { matchCalcTimeLeft, matchStatusToString } from "@libs/matches";
import TimeFromNow from "@components/TimeFromNow";
import { useGameFindById } from "@hooks/games";
import { useBrowser } from "@hooks/browser";
import { timeLeftToString } from "@libs/time";
import { principalToString } from "@libs/icp";

const useStyles = createStyles((theme) => ({
    card: {
        display: 'flex',
        alignItems: 'center',
        height: rem(200),
        color: theme.colorScheme === "dark"? theme.white: theme.black,
        position: 'relative',
        ':hover': {
            backgroundColor: theme.colorScheme === "dark"? theme.colors.grape: '#dad',
            cursor: 'pointer',
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
  
export const MatchItem = (props: Props) => {
    const {classes} = useStyles();
    const {isMobile} = useBrowser();
    const navigate = useNavigate();

    const handleView = useCallback(() => {
        navigate(`/matches/${props.match.id}`)
    }, [props.match.id]);

    const {match} = props;
    const status = matchStatusToString(match.state.status);

    const game = useGameFindById(match.game.id);

    return (
        <Card
            shadow="md"
            p={isMobile? "xs": 'xl'}
            radius="md"
            className={classes.card}
            onClick={handleView}
        >
            <Grid w="100%">
                <Grid.Col span={4}>
                    <Image
                        width={96}
                        height={128}
                        fit="cover"
                        withPlaceholder
                        radius="md"                        
                        src={game.data?.info.urls.cover}
                    />
                </Grid.Col>
                <Grid.Col span={8}>
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
                    <Space h='xl' />
                    <Container w='100%'>
                        <div>
                            🕹 {match.players.length}/{match.game.max_players.toString()}
                        </div>
                        <div>
                            ⏰ {status === 'OPEN'? timeLeftToString(matchCalcTimeLeft(match)): '00:00:00'}
                        </div>
                        <div>
                            🏆 {match.won_by.length > 0? 
                                    principalToString(match.won_by[0]): 
                                    status === 'OPEN'?
                                        'how about you?':
                                        'nobody 😥'
                                }
                        </div>
                    </Container>
                </Grid.Col>
            </Grid>
        </Card>
    );
};