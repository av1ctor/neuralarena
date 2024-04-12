import { DrawerPanel } from "@components/DrawerPanel";
import { PageTitle } from "@components/PageTitle";
import { useActors } from "@hooks/actors";
import { useAuth } from "@hooks/auth";
import { useIcrc1GetBallance } from "@hooks/icrc1";
import { 
    e8sToDecimal, 
    principalToAccountDefaultId, 
    principalToAccountId, 
    principalToSubAccount 
} from "@libs/icp";
import { 
    icrc1GetAccountId, icrc1GetDefaultAccountId 
} from "@libs/icrc1";
import { Button, Grid, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconCoin, IconCopy, IconWallet } from "@tabler/icons-react";
import React from "react";
import { WalletDeposit } from "./Deposit";

interface Props {
}

export const UserWallet = (props: Props) => {
    const {user} = useAuth();
    const {icpLedger, ids} = useActors();
    const [opened, {open, close}] = useDisclosure(false);

    const icpLedgerAccountId = icrc1GetDefaultAccountId(user?.id);
    const neuralArenaAccountId = icrc1GetAccountId(
        ids.main, 
        principalToSubAccount(user?.id)
    );

    const icpLedgerAccBalance = useIcrc1GetBallance(
        icpLedger, 
        principalToAccountDefaultId(user?.id)
    );
    const userAccBalance = useIcrc1GetBallance(
        icpLedger, 
        principalToAccountId(
            ids.main,
            principalToSubAccount(user?.id)
        )
    );

    if(!user) {
        return null;
    }

    return (
        <>
            <PageTitle 
                title="Your Wallet"
                icon={IconWallet}
            >
                <Button
                    disabled={!user}
                    onClick={open}
                >
                    Deposit
                </Button>
            </PageTitle>

            <Grid>
                <Grid.Col md={6}>
                    <TextInput
                        label="ICP Ledger account id"
                        value={icpLedgerAccountId}
                        readOnly
                        rightSection={<IconCopy size="1rem" />}
                    />
                </Grid.Col>

                <Grid.Col md={6}>
                    <TextInput
                        label="ICP Ledger balance"
                        value={e8sToDecimal(icpLedgerAccBalance.data || 0n)}
                        readOnly
                        icon={<IconCoin size="1rem" />}
                    />
                </Grid.Col>

                <Grid.Col md={6}>
                    <TextInput
                        label="Neural Arena account id"
                        value={neuralArenaAccountId}
                        readOnly
                        rightSection={<IconCopy size="1rem" />}
                    />
                </Grid.Col>

                <Grid.Col md={6}>
                    <TextInput
                        label="Neural Arena balance"
                        value={e8sToDecimal(userAccBalance.data || 0n)}
                        readOnly
                        icon={<IconCoin size="1rem" />}
                    />
                </Grid.Col>
            </Grid>


            <DrawerPanel
                opened={opened}
                title="Deposit"
                onClose={close}
            >
                <WalletDeposit 
                    from={icpLedgerAccountId}
                    to={neuralArenaAccountId}
                    onClose={close}
                />
            </DrawerPanel>    

        </>
    );
};