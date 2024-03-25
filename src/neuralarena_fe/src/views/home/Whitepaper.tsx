import { PageTitle } from "@components/PageTitle";
import { Center, createStyles } from "@mantine/core";
import { IconBook } from "@tabler/icons-react";
import React from "react";

const useStyles = createStyles((theme) => ({
    soon: {
        fontSize: '4rem'
    },
}));

export const Whitepaper = () => {
    const {classes} = useStyles();

    return (
        <>
            <PageTitle 
                title="Whitepaper"
                icon={IconBook}
            />

            <Center className={classes.soon} mt="6rem">
                Soon...
            </Center>
        </>
    )
};