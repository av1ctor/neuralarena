import React, { useCallback } from "react";
import { createStyles, rem, Badge, Container, Text, Slider, Space, Grid, Card, Image } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { MatchResponse, MatchStatus } from "@declarations/neuralarena_be/neuralarena_be.did";
import { matchStatusToString } from "@libs/matches";
import TimeFromNow from "@components/TimeFromNow";
import { useGameFindById } from "@hooks/games";
import { useBrowser } from "@hooks/browser";

const useStyles = createStyles((theme) => ({
    card: {
        display: 'flex',
        alignItems: 'center',
        height: rem(200),
        color: theme.colorScheme === "dark"? theme.white: theme.black,
        position: 'relative',
        ':hover': {
            backgroundColor: theme.colors.grape,
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

    const game = useGameFindById(match.game.id);

    const min_players = game.data? Number(game.data.info.min_players): 1;
    const max_players = game.data? Number(game.data.info.max_players): 10;
    
    return (
        <Card
            shadow="md"
            p={isMobile? "xs": 'xl'}
            radius="md"
            className={classes.card}
            onClick={handleView}
        >
            <Grid w="100%">
                <Grid.Col span={3} md={2}>
                    <Image
                        width={96}
                        height={128}
                        fit="cover"
                        withPlaceholder
                        radius="md"                        
                        src={game.data?.info.urls.cover}
                    />
                </Grid.Col>
                <Grid.Col span={9} md={10}>
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
                                color={statusToColor(match.status)} 
                                variant="filled"
                                size="xl"
                            >
                                {matchStatusToString(match.status)}
                            </Badge>
                        </Grid.Col>
                    </Grid>
                    <Space h='xl' />
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
                </Grid.Col>
            </Grid>
        </Card>
    );
};