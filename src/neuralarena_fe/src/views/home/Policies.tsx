import { PageTitle } from "@components/PageTitle";
import { Center, createStyles } from "@mantine/core";
import { IconTextCaption } from "@tabler/icons-react";
import React from "react";

const useStyles = createStyles((theme) => ({
    soon: {
        fontSize: '4rem'
    },
}));

export const Policies = () => {
    const {classes} = useStyles();

    return (
        <>
            <PageTitle 
                title="Policies"
                icon={IconTextCaption}
            />

            <Center className={classes.soon} mt="6rem">
                Soon...
            </Center>
        </>
    )
};