import React, { ReactElement } from "react";
import { Drawer } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

interface Props {
    opened: boolean,
    title?: ReactElement | string,
    position?: "top" | "left" | "bottom" | "right",
    desc?: ReactElement,
    children?: ReactElement | ReactElement[],
    onClose: () => void;
}

export const DrawerPanel = (props: Props) => {
    return (
        <Drawer 
            opened={props.opened} 
            title={props.title}
            position={props.position}
            size="xl"
            onClose={props.onClose} 
        >
            {props.children}
        </Drawer>
    );
};