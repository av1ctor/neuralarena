import React, { useCallback } from "react";
import { createStyles, rem, Badge, Container, Space, Grid, Card, Image, Center, Stack } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { MatchResponse, MatchStatus } from "@declarations/neuralarena_be/neuralarena_be.did";
import { matchCalcTimeLeft, matchStatusToString } from "@libs/matches";
import { useGameFindById } from "@hooks/games";
import { useBrowser } from "@hooks/browser";
import { timeLeftToString } from "@libs/time";
import { principalToString } from "@libs/icp";
import { useUI } from "@hooks/ui";

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
        color: theme.colorScheme === "dark"? theme.white: theme.black,
        fontSize: '.6rem',
        textTransform: 'uppercase',
    },

    status: {
        position: 'relative',
        color: theme.colorScheme === "dark"? theme.white: theme.black,
        float: 'right',
        fontSize: '.8rem',
        textTransform: 'uppercase',
    },
}));

const statusToColor = (status: MatchStatus) => {
    switch(matchStatusToString(status)) {
        case 'OPEN':
            return 'green';
        case 'FINISHED':
            return 'blue';
        case 'CANCELLED':
            return 'red';
        default:
            return 'yellow';
    }
}

interface Props {
    match: MatchResponse;
    showView?: boolean;
}
  
export const MatchItem = (props: Props) => {
    const {classes} = useUI();
    const {classes: local, cx} = useStyles();
    const {isMobile} = useBrowser();
    const navigate = useNavigate();

    const handleView = useCallback(() => {
        navigate(`/matches/${props.match.id}`)
    }, [props.match.id]);

    const {match} = props;
    const status = matchStatusToString(match.state.status);

    const game = useGameFindById(match.game.id);
    const map = game.data?.info.maps[Number(match.game.map_id)];

    return (
        <Card
            shadow="md"
            p={isMobile? "xs": 'xl'}
            radius="md"
            className={cx(local.card, {[classes.animatedOutline]: status === 'OPEN'})}
            onClick={handleView}
        >
            <Grid w="100%">
                <Grid.Col span={4}>
                    <Stack>
                        <Center>
                            <Image
                                height={128}
                                fit="cover"
                                withPlaceholder
                                radius="md"
                                title="Cover"
                                src={game.data?.info.urls.cover}
                            />
                        </Center>
                        <Badge 
                            className={local.name} 
                            size="sm"
                            color="grape"
                            variant="filled"
                        >
                            {game.data?.info.name}
                        </Badge>
                    </Stack>
                </Grid.Col>
                <Grid.Col span={8}>
                    <Badge 
                        className={local.status} 
                        color={statusToColor(match.state.status)} 
                        variant={status === 'OPEN'? "filled": 'light'}
                        size="xl"
                    >
                        {matchStatusToString(match.state.status)}
                    </Badge>

                    <Space h='xl' />
                    <Container w='100%'>
                        <div>
                            <span title="Map">🗺 {map?.name}</span>
                        </div>
                        <div>
                            <span title="Number of players">🕹 {match.players.length}/{match.game.max_players.toString()}</span>
                        </div>
                        <div>
                            <span title="Deadline">⏰ {status === 'OPEN'? timeLeftToString(matchCalcTimeLeft(match)): '00:00:00'}</span>
                        </div>
                        <div>
                            <span title="Winner">🏆 {match.won_by.length > 0? 
                                    principalToString(match.won_by[0]): 
                                    status === 'OPEN'?
                                        'how about you?':
                                        'nobody 😥'
                                }
                            </span>
                        </div>
                    </Container>
                </Grid.Col>
            </Grid>
        </Card>
    );
};