import React, { useCallback, useEffect } from "react";
import * as yup from 'yup';
import { useAuth } from "../../../hooks/auth";
import { useUI } from "../../../hooks/ui";
import { useForm, yupResolver } from "@mantine/form";
import { Button, Space, TextInput } from "@mantine/core";
import { UserKind, userGetKind } from "../../../libs/users";
import { useActors } from "../../../hooks/actors";
import { useUser } from "../../../hooks/users";
import { userGetPrincipal } from "../../../libs/users";

const schema = {
    nick: yup.string().min(3).max(64),
    name: yup.string().optional().max(64),
    email: yup.string().email().optional().max(128),
};

const playerSchema = {
};

interface Props {
}

const UserEdit = (props: Props) => {
    const {main} = useActors();
    const {isLogged, user, update: userUpdate} = useAuth();
    const {showSuccess, showError, toggleLoading} = useUI();
    const {update} = useUser();

    const kind = userGetKind(user);

    const form = useForm({
        initialValues: {
            nick: '',
            name: '',
            email: '',
            kind: '',
        },
    
        validate: yupResolver(
            yup.object().shape({...(
                kind === UserKind.Player? 
                    playerSchema
                :   
                    {}), 
                ...schema
            })),

        transformValues: (values: any) => ({
            nick: values.nick,
            name: values.name? [values.name]: [],
            email: values.email? [values.email]: [],
            kind: 
                kind === UserKind.Player? 
                    {Player: {
                    }}
                :   
                    {Staff: {
                        kind: {[values.kind]: null},
                    }},
        }),
    });

    const handleUpdate = useCallback(async (values: any) => {
        try {
            toggleLoading(true);

            const res = await update(userGetPrincipal(user), values);
            showSuccess('User updated!');

            await userUpdate(main, res);
        }
        catch(e: any) {
            showError(e);
        }
        finally {
            toggleLoading(false);
        }
    }, [main, user]);

    useEffect(() => {
        if(!user) {
            return;
        }

        const kind = userGetKind(user);

        form.setValues({
            nick: user.nick,
            name: user.name,
            email: user.email,
            ...(kind === UserKind.Player? 
                    {
                    }
                :
                    {

                    }
            ), 
        } as any);
    }, [user]);

    if(!isLogged) {
        return null;
    }

    return (
        <form onSubmit={form.onSubmit(handleUpdate)}>
            <TextInput
                label="Nick"
                placeholder="Your nick"
                {...form.getInputProps('nick')}
            />
            <TextInput
                label="Name (optional)"
                placeholder="Your name"
                {...form.getInputProps('name')}
            />
            <TextInput
                label="Email (optional)"
                placeholder="Your e-mail"
                {...form.getInputProps('email')}
            />

            {kind === UserKind.Player && 
                <>
                </>
            }
            {kind === UserKind.Staff && 
                <>
                </>
            }
            <Space h="lg"/>
            <Button
                color="red"
                fullWidth
                type="submit"
            >
                Submit
            </Button>
        </form>      
    );
};

export default UserEdit;