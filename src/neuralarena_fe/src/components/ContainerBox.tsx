import { Box, createStyles } from "@mantine/core";
import React, { ReactElement } from "react";

const useStyles = createStyles(theme => ({
    container: {
        border: '1px solid',
        borderColor: theme.colors.dark[theme.colorScheme === 'dark'? 5: 0],
        borderRadius: theme.radius.md,
        padding: '2rem 1.25rem',
        backgroundColor: theme.colorScheme === 'dark'? 
            theme.colors.dark[8]: 
            theme.colors.gray[1],
    }
}));

interface Props {
    children: ReactElement | ReactElement[] | undefined;
}

export const ContainerBox = ({children}: Props) => {
    const {classes} = useStyles();

    return (
        <Box
            className={classes.container}
        >
            {children}
        </Box>
    );
};
