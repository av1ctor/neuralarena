import React, { ReactElement, useCallback } from "react";
import { createStyles, rem, Card } from "@mantine/core";
import { useNavigate } from "react-router-dom";

const useStyles = createStyles((theme) => ({
    card: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
    },
    on_hover: {
        ":hover": {
            backgroundColor: theme.colors.grape,
            backgroundBlendMode: theme.colorScheme === "dark"? 'soft-light': 'hard-light',
            cursor: 'pointer',
        },
    }
}));

interface Props {
    cover: string,
    navigateTo?: string;
    height?: number;
    children?: ReactElement | ReactElement[];
}
  
export const CoverCard = (props: Props) => {
    const { classes, cx } = useStyles();
    const navigate = useNavigate();

    const handleNavigate = useCallback(() => {
        if(props.navigateTo) {
            navigate(props.navigateTo)
        }
    }, [props.navigateTo]);

    return (
        <Card
            shadow="md"
            p="xl"
            radius="md"
            style={{ 
                backgroundImage: `url(${props.cover})`,
                height: rem(props.height || 121),
            }}
            className={cx(classes.card, {[classes.on_hover]: props.navigateTo})}
            onClick={handleNavigate}
        >
            {props.children}
        </Card>
    );
};