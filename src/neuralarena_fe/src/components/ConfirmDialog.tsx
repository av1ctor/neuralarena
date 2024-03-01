import React, { ReactElement } from "react";
import { Button, Grid, Modal, Space, Text } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";

interface Props {
    opened: boolean,
    title?: string,
    desc?: ReactElement,
    onClose: () => void;
    onConfirm?: () => void;
}

export const ConfirmDialog = (props: Props) => {
    return (
        <Modal
            opened={props.opened}
            title={<b><IconAlertTriangle size="1rem" />{props.title}</b>}
            centered
            size="xl"
            onClose={props.onClose}
        >
            <Text size="sm" mb="xs" weight={500}>
                {props.desc}
            </Text>

            <Space h="xl" />

            <Grid>
                <Grid.Col span={6}>
                    <Button
                        color="red"
                        fullWidth
                        onClick={props.onConfirm}
                    >
                        Confirm
                    </Button>
                </Grid.Col>
                <Grid.Col span={6}>
                    <Button
                        color="gray"
                        fullWidth
                        onClick={props.onClose}
                    >
                        Cancel
                    </Button>
                </Grid.Col>
            </Grid>
        </Modal>
    );
};