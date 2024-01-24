import React, { useEffect, useMemo, useState, useCallback } from "react";
import * as yup from 'yup';
import { Box, Button, Center, SegmentedControl, Space, Stepper, TextInput } from "@mantine/core";
import { useForm, yupResolver } from "@mantine/form";
import { IconUserCog, IconUserShield } from "@tabler/icons-react";
import { useAuth } from "../../../hooks/auth";
import { useUI } from "../../../hooks/ui";
import { useBrowser } from "../../../hooks/browser";
import { useUser } from "../../../hooks/users";
import { useActors } from "../../../hooks/actors";
import { UserKind, userStringToKind } from "../../../libs/users";
import Login from "./Login";

const schema = {
    nick: yup.string().min(3).max(64),
    name: yup.string().optional().max(64),
    email: yup.string().email().optional().max(128),
};

const playerSchema = {
};

interface Props {
}

const Signup = (props: Props) => {
    const {isAuthenticated, isLogged} = useAuth();
    const {showSuccess, showError, toggleLoading} = useUI();
    const {main} = useActors();
    const {isMobile, returnToLastPage} = useBrowser();
    const [active, setActive] = useState(0);
    const [kind, setKind] = useState(UserKind.Player);
    const [options, setOptions] = useState({
        initialValues: {
            nick: '',
            name: '',
            email: '',
            kind: '',
        }
    });
    const {update} = useAuth();
    const {create} = useUser();
    const form = useForm(options);

    const handleChangeKind = useCallback((value: string) => {
        setKind(userStringToKind(value));
    }, [setKind]);

    const handleAuthenticated = useCallback(() => {
        setActive(1);
    }, []);

    const handleCreate = useCallback(async (values: any) => {
        try {
            toggleLoading(true);

            const user = await create(values);
            showSuccess('User registered!');
            returnToLastPage();

            await update(main, user);
        }
        catch(e: any) {
            showError(e);
        }
        finally {
            toggleLoading(false);
        }
    }, [main, kind]);

    useEffect(() => {
        setOptions({
            ...options,
        
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
        } as any);
    }, [kind]);

    useEffect(() => {
        if(isLogged) {
            returnToLastPage();
        }
        else if(isAuthenticated) {
            if(active === 0) {
                setActive(1);
            }
        }
    }, [isAuthenticated, isLogged, active, setActive]);

    const kinds = useMemo(() => {
        return [
            {
                value: UserKind[UserKind.Player],
                label: (
                    <Center>
                        <IconUserShield />
                        <Box ml={10}>Player</Box>
                    </Center>
                ),
            },
            {
                value: UserKind[UserKind.Staff],
                label: (
                    <Center>
                        <IconUserCog />
                        <Box ml={10}>Staff</Box>
                    </Center>
                ),
            },
        ];
    }, []);

    return (
        <Stepper 
            active={active} 
            breakpoint="sm"
            color="green"
            onStepClick={setActive}
        >
            <Stepper.Step 
                label="Authentication" 
                description="Authenticate with your provider"
                allowStepSelect={false}
            >
                <Login 
                    authenticateOnly={true}
                    onAuthenticated={handleAuthenticated} 
                />
            </Stepper.Step>
            <Stepper.Step 
                label="Registration" 
                description="Create a new account"
                allowStepSelect={false}
            >
                <Space h="md" />
                <SegmentedControl
                    size="md"
                    orientation={isMobile? "vertical": "horizontal"}
                    fullWidth
                    color="magenta"
                    value={UserKind[kind]}
                    data={kinds}
                    onChange={handleChangeKind}
                />
                <Space h="md" />

                <form onSubmit={form.onSubmit(handleCreate)}>
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
                        fullWidth
                        variant="gradient"
                        type="submit"
                    >
                        Submit
                    </Button>
                </form>                
            </Stepper.Step>
        </Stepper>
   );
};

export default Signup;