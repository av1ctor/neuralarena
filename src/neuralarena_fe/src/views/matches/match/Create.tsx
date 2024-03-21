import React, { useCallback, useMemo } from "react";
import { Button, NumberInput, Select, Space } from "@mantine/core";
import * as yup from 'yup';
import { useUI } from "@hooks/ui";
import { useForm, yupResolver } from "@mantine/form";
import { useGameFindActive } from "@hooks/games";
import { SelectItem } from "@components/SelectItem";
import { useMatch } from "@hooks/matches";
import { FPS } from "@libs/games";
import { 
    MAX_DURATION, MAX_OPENED, MAX_PLAYERS, MIN_OPENED, MIN_PLAYERS 
} from "@libs/matches";

const schema = {
    game_id: yup.string().required(),
    map_id: yup.string().required(),
    min_players: yup.number().required().min(MIN_PLAYERS),
    max_players: yup.number().required().min(MIN_PLAYERS).max(MAX_PLAYERS),
    max_duration: yup.number().required().min(1).max(MAX_DURATION),
    opened_for: yup.number().required().min(MIN_OPENED).max(MAX_OPENED),
};

interface Props {
    onClose: () => void;
}

export const MatchCreate = (props: Props) => {
    const {toggleLoading, showError, showSuccess} = useUI();

    const gamesQuery = useGameFindActive(32);
    const {create} = useMatch()

    const form = useForm({
        initialValues: {
            game_id: '',
            map_id: '',
            min_players: MIN_PLAYERS,
            max_players: MAX_PLAYERS,
            max_duration: MAX_DURATION / 2,
            opened_for: 60*60*24,
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
            await create({
                game: {
                    id: values.game_id,
                    map_id: BigInt(values.map_id),
                    min_players: values.min_players,
                    max_players: values.max_players,
                    max_steps: BigInt(values.max_duration * FPS),
                    options: []
                },
                opened_for: BigInt(values.opened_for)
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
    }, [props.onClose]);

    const games = useMemo(() => {
        if(!gamesQuery.data) {
            return [];
        }

        return gamesQuery.data.pages
            .flat()
            .map(g => ({
                label: g.info.name,
                value: g.id,
                description: g.info.description,
                image: g.info.urls.cover,
            }));
    }, [gamesQuery.data]);

    const maps = useMemo(() => {
        if(!gamesQuery.data) {
            return []
        };

        return (gamesQuery.data.pages
            .flat()
            .find(g => g.id === form.values.game_id)
            ?.info.maps || [])
            .map(m => ({
                label: m.name,
                value: m.id.toString(),
                description: m.description,
                image: m.image_url,
            }));
    }, [gamesQuery, form.values.game_id]);

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
            />

            <NumberInput
                label="Max players"
                placeholder="Set maximum number of players"
                {...form.getInputProps('max_players')}
                min={1}
                max={100}
            />

            <NumberInput
                label="Max duration (in secs)"
                placeholder="Set maximum duration"
                {...form.getInputProps('max_duration')}
                min={1}
                max={MAX_DURATION}
            />

            <NumberInput
                label="Remain opened for (in secs)"
                placeholder="Set how long to wait for player to join"
                {...form.getInputProps('opened_for')}
                min={MIN_OPENED}
                max={MAX_OPENED}
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