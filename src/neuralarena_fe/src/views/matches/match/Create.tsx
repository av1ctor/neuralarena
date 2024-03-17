import React, { useCallback, useMemo } from "react";
import { Button, Select, Space } from "@mantine/core";
import * as yup from 'yup';
import { useUI } from "@hooks/ui";
import { useForm, yupResolver } from "@mantine/form";
import { useGameFindActive } from "@hooks/games";
import { SelectItem } from "@components/SelectItem";
import { useMatch } from "@hooks/matches";

const schema = {
    game_id: yup.string().required(),
    map_id: yup.string().required(),
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
                    options: []
                }
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