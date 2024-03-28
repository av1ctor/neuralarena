import React, { useCallback } from "react";
import * as yup from 'yup';
import { useActors } from "@hooks/actors";
import { useAuth } from "@hooks/auth";
import { useUI } from "@hooks/ui";
import { useForm, yupResolver } from "@mantine/form";
import { Button, NumberInput, Space, TextInput } from "@mantine/core";
import { useIcrc1 } from "@hooks/icrc1";
import { icrc1GetAccount } from "@libs/icrc1";

const schema = {
    amount: yup.number().required().min(0.1),
};

interface Props {
    from: string,
    to: string,
    onClose: () => void;
}

export const WalletDeposit = (props: Props) => {
    const {icpLedger, ids} = useActors();
    const {user} = useAuth();
    const {showSuccess, showError, toggleLoading, isLoading} = useUI();

    const {transfer} = useIcrc1(icpLedger);

    const form = useForm({
        initialValues: {
            amount: 0.1,
        },
    
        validate: yupResolver(
            yup.object().shape(schema)
        ),

        transformValues: (values: any) => ({
            amount: BigInt((values.amount * 1_00000000)|0),
        }),
    });

    const handleDeposit = useCallback(async (values: any) => {
        try {
            toggleLoading(true);

            if(!user) {
                throw new Error("User undefined");
            }

            await transfer({
                to: icrc1GetAccount(ids.main, user.id),
                amount: values.amount,
                fee: [],
                memo: [],
                from_subaccount: [],
                created_at_time: []
            });

            showSuccess('Deposit successful!');
            props.onClose()
        }
        catch(e: any) {
            showError(e);
        }
        finally {
            toggleLoading(false);
        }
    }, [user, ids, transfer, props.onClose]);

    if(!user) {
        return null;
    }
    
    return (
        <form onSubmit={form.onSubmit(handleDeposit)}>
            <NumberInput
                label="Amount"
                placeholder="Deposit amount"
                step={0.1}
                precision={8}
                min={0.1}
                {...form.getInputProps('amount')}
            />
            <TextInput
                label="From account"
                value={props.from}
                readOnly
            />
            <TextInput
                label="To account"
                value={props.to}
                readOnly
            />

            <Space h="xl" />

            <Button
                type="submit"
                fullWidth
                disabled={isLoading}
            >
                Submit
            </Button>
        </form>
    );
};