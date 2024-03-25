import { PageTitle } from "@components/PageTitle";
import { Center, createStyles } from "@mantine/core";
import { IconLock } from "@tabler/icons-react";
import React from "react";

const useStyles = createStyles((theme) => ({
    soon: {
        fontSize: '4rem'
    },
}));

export const Privacy = () => {
    const {classes} = useStyles();

    return (
        <>
            <PageTitle 
                title="Privacy"
                icon={IconLock}
            />

            <Center className={classes.soon} mt="6rem">
                Soon...
            </Center>
        </>
    )
};