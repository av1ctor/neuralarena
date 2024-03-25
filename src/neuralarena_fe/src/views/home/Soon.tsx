import { Center, createStyles } from "@mantine/core";
import React from "react";

const useStyles = createStyles((theme) => ({
    soon: {
        fontSize: '4rem'
    },
}));

export const Soon = () => {
    const {classes} = useStyles();

    return (
        <>
            <Center className={classes.soon} mt="6rem">
                Soon...
            </Center>
        </>
    )
};