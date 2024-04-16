import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, NumberInput, Select, Space } from "@mantine/core";
import * as yup from 'yup';
import { useUI } from "@hooks/ui";
import { useForm, yupResolver } from "@mantine/form";
import { useGameFindActive } from "@hooks/games";
import { SelectItem } from "@components/SelectItem";
import { useMatch } from "@hooks/matches";
import { 
    MAX_DURATION, MAX_DEADLINE, MAX_PLAYERS, MIN_DEADLINE, MIN_PLAYERS 
} from "@libs/matches";
import { GameResponse } from "@declarations/neuralarena_be/neuralarena_be.did";
import { gameFindById } from "@libs/games";
import { useActors } from "@hooks/actors";
import { Principal } from "@dfinity/principal";

const schema = {
    game_id: yup.string().required(),
    map_id: yup.string().required(),
    min_players: yup.number().required().min(MIN_PLAYERS),
    max_players: yup.number().required().min(MIN_PLAYERS).max(MAX_PLAYERS),
    max_duration: yup.number().required().min(1).max(MAX_DURATION),
    deadline: yup.number().required().min(MIN_DEADLINE).max(MAX_DEADLINE),
};

interface Props {
    onClose: () => void;
}

export const MatchCreate = (props: Props) => {
    const {main} = useActors();
    const {toggleLoading, showError, showSuccess} = useUI();
    const [game, setGame] = useState<GameResponse|undefined>();

    const gamesQuery = useGameFindActive(32);
    const {create} = useMatch()

    const form = useForm({
        initialValues: {
            game_id: '',
            map_id: '',
            min_players: MIN_PLAYERS,
            max_players: MAX_PLAYERS,
            max_duration: MAX_DURATION / 2,
            deadline: 60*60*24,
        },

        validate: yupResolver(
            yup.object().shape(schema)
        ),

        transformValues(values) {
            return values;
        },
    });

    const handleCreate = useCallback(async (values: any) => {
        try {
            toggleLoading(true);
            
            if(!game) {
                throw new Error("Game not found");
            }

            await create({
                game: {
                    id: Principal.fromText(values.game_id),
                    map_id: BigInt(values.map_id),
                    min_players: values.min_players,
                    max_players: values.max_players,
                    max_steps: BigInt(values.max_duration * game.info.fps),
                    options: []
                },
                deadline: BigInt(values.deadline)
            })
            showSuccess('Match created!');
            props.onClose()
        }
        catch(e) {
            showError(e);
        }
        finally {
            toggleLoading(false);
        }
    }, [props.onClose, game]);

    const games = useMemo(() => {
        if(!gamesQuery.data) {
            return [];
        }

        return gamesQuery.data.pages
            .flat()
            .map(g => ({
                label: g.info.name,
                value: g.id.toString(),
                description: g.info.subtitle,
                image: g.info.urls.cover,
            }));
    }, [gamesQuery.data]);

    const maps = useMemo(() => {
        if(!gamesQuery.data) {
            return []
        };

        return (gamesQuery.data.pages
            .flat()
            .find(g => g.id.toString() === form.values.game_id)
            ?.info.maps || [])
            .map(m => ({
                label: m.name,
                value: m.id.toString(),
                description: m.description,
                image: m.urls.image,
            }));
    }, [gamesQuery, form.values.game_id]);

    useEffect(() => {
        const {game_id} = form.values;
        if(game_id) {
            (async () => {
                try {
                    const game = await gameFindById(main, Principal.fromText(game_id));
                    setGame(game);
                }
                catch(e) {
                    console.error(e);
                }
            })();
        }
    }, [form.values.game_id]);

    return (
        <form onSubmit={form.onSubmit(handleCreate)}>
            <Select
                label="Game"
                placeholder="Select a game"
                {...form.getInputProps('game_id')}
                itemComponent={SelectItem}
                data={games}
            />

            <Select
                label="Map"
                placeholder="Select a map"
                {...form.getInputProps('map_id')}
                itemComponent={SelectItem}
                data={maps}
                disabled={!form.values.game_id}
            />

            <NumberInput
                label="Min players"
                placeholder="Set mininum number of players"
                {...form.getInputProps('min_players')}
                min={1}
                disabled={form.values.map_id === ''}
            />

            <NumberInput
                label="Max players"
                placeholder="Set maximum number of players"
                {...form.getInputProps('max_players')}
                min={1}
                max={100}
                disabled={form.values.map_id === ''}
            />

            <NumberInput
                label="Max duration (in secs)"
                placeholder="Set maximum duration"
                {...form.getInputProps('max_duration')}
                min={1}
                max={MAX_DURATION}
                disabled={form.values.map_id === ''}
            />

            <NumberInput
                label="Deadline (in secs)"
                placeholder="Set how long to wait for players to join"
                {...form.getInputProps('deadline')}
                min={MIN_DEADLINE}
                max={MAX_DEADLINE}
                disabled={form.values.map_id === ''}
            />

            <Space h="lg"/>

            <Button 
                color="red"
                fullWidth
                disabled={!form.values.game_id || form.values.map_id === undefined}
                type="submit"
            >
                Submit
            </Button>
        </form>
    );
  }