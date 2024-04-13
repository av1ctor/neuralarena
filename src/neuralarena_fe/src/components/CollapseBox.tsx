import React, { ReactElement } from "react"
import { ActionIcon, Card, Collapse, Text, createStyles } from "@mantine/core"
import { IconCircleArrowDown, IconCircleArrowUp, IconMaximize, IconMinimize } from "@tabler/icons-react";

const useStyles = createStyles((theme) => ({
    header: {
        position: 'relative',
        height: '1.85rem',
        marginBottom: '1rem',
        borderBottom: `1px solid ${theme.colorScheme === 'dark'? theme.colors.gray[8]: theme.colors.gray[4]}`,
        ":hover": {
            cursor: 'pointer',
        },
    },
    button: {
        position: 'absolute',
        right: '2px',
        top: '2px',
    }
}));

interface Props {
    opened: boolean;
    title?: string;
    toggle: () => void;
    children: ReactElement | ReactElement[] | undefined;
}

export const CollapseBox = ({opened, title, children, toggle}: Props) => {
    const {classes} = useStyles();
    
    return (
        <>
            <div
                className={classes.header}
                onClick={toggle}
            >
                <Text size="md" weight={500}>{title}</Text>
                <ActionIcon 
                    className={classes.button}
                    variant="filled"
                    size="xs"
                    color="grape"
                >
                    {opened? <IconCircleArrowUp />: <IconCircleArrowDown />}
                </ActionIcon>
            </div>
            <Collapse in={opened}>
                <Card 
                    radius="md" 
                    p="md" 
                    bg="transparent"
                    withBorder

                >
                    {children}
                </Card>
            </Collapse>
        </>
    )
};  