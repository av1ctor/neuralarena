import { CollapseBox } from "@components/CollapseBox";
import { MatchWalletLog } from "@declarations/neuralarena_be/neuralarena_be.did";
import { e8sToDecimal } from "@libs/icp";
import { matchWalletLogAccToString, matchWalletLogOpToString } from "@libs/matches";
import { Grid, Text, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import React from "react";

interface Props {
    logs: MatchWalletLog[]|undefined;
}

export const WalletLogs = ({logs}: Props) => {
    const [opened, { toggle }] = useDisclosure(false);

    return (
        <Grid.Col span={12}>
            <CollapseBox 
                opened={opened}
                title="Wallet logs"
                toggle={toggle}
            >
                {logs && logs.map((log, index) =>
                    <Grid key={index} mb="md">
                        <Grid.Col md={12}>
                            <Text size="sm"><b>#{index+1}</b></Text>
                        </Grid.Col>
                        <Grid.Col md={6}>
                            <TextInput
                                label="Op"
                                value={matchWalletLogOpToString(log)}
                                readOnly
                            />
                        </Grid.Col>
                        <Grid.Col md={6}>
                            <TextInput
                                label="Account"
                                value={matchWalletLogAccToString(log)}
                                readOnly
                            />
                        </Grid.Col>
                        {'Ok' in log.res &&
                            <>
                                <Grid.Col md={6}>
                                    <TextInput
                                        label="Value"
                                        value={e8sToDecimal(log.res.Ok.value)}
                                        readOnly
                                    />
                                </Grid.Col>
                                <Grid.Col md={6}>
                                    <TextInput
                                        label="Index"
                                        value={log.res.Ok.tx.toString()}
                                        readOnly
                                    />
                                </Grid.Col>
                            </>
                        }
                        {'Err' in log.res &&
                            <>
                                <Grid.Col md={12}>
                                    <TextInput
                                        label="Error"
                                        value={log.res.Err}
                                        readOnly
                                    />
                                </Grid.Col>
                            </>
                        }
                    </Grid>
                )}
            </CollapseBox>
        </Grid.Col>
    );
};