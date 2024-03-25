import { PageTitle } from "@components/PageTitle";
import { Center, createStyles } from "@mantine/core";
import { IconUsers } from "@tabler/icons-react";
import React from "react";

const useStyles = createStyles((theme) => ({
    soon: {
        fontSize: '4rem'
    },
}));

export const AboutUs = () => {
    const {classes} = useStyles();

    return (
        <>
            <PageTitle 
                title="About us"
                icon={IconUsers}
            />

            <Center className={classes.soon} mt="6rem">
                Soon...
            </Center>
        </>
    )
};