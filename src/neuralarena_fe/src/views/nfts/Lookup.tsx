import React, { useCallback, useState } from "react";
import * as yup from 'yup';
import { TextInput, Space, Button, NumberInput } from "@mantine/core";
import { useAuth } from "../../hooks/auth";
import { useUI } from "../../hooks/ui";
import { NFT, nas1FindTokenById, nas1GetTokenOwner } from "../../libs/nas1";
import { useForm, yupResolver } from "@mantine/form";
import { Nft } from "./Nft";
import { Nas1Token } from "../../../../declarations/neuralarena_be/neuralarena_be.did";
import { Principal } from "@dfinity/principal";

const schema = {
    canister_id: yup.string().required().length(27),
    token_id: yup.number().required().min(0).max(99999),
};

interface Props {
    onSelected?: (nft: NFT, owner?: Principal) => void;
}

export const Lookup = (props: Props) => {
    const {isLogged} = useAuth();
    const {showError, toggleLoading, isLoading} = useUI();
    const [token, setToken] = useState<Nas1Token|undefined>();
    const [nft, setNft] = useState<NFT|undefined>();

    const form = useForm({
        initialValues: {
            canister_id: '',
            token_id: 0
        },

        validate: yupResolver(
            yup.object().shape(schema)
        )
    });

    const handleLookup = useCallback(async (values: any) => {
        try {
            toggleLoading(true);
            const token = await nas1FindTokenById(values.canister_id, values.token_id);
            const owner = await nas1GetTokenOwner(values.canister_id, values.token_id);
            setToken(token);
            const nft = {
                canister_id: Principal.fromText(values.canister_id),
                token_id: BigInt(values.token_id)
            };
            setNft(nft);
            if(props.onSelected) {
                props.onSelected(nft, owner);
            }
        }
        catch(e) {
            setToken(undefined);
            setNft(undefined);
            showError(e)
        }
        finally {
            toggleLoading(false);
        }
    }, [form, props.onSelected]);

    if(!isLogged) {
        return null;
    }
    
    return (
        <form onSubmit={form.onSubmit(handleLookup)}>
            <TextInput
                label="Canister Id"
                placeholder="b77ix-eeaaa-aaaaa-qaada-cai"
                {...form.getInputProps('canister_id')}
            />
            <NumberInput
                label="Token Id"
                placeholder="12345"
                min={0}
                max={99999}
                {...form.getInputProps('token_id')}
            />

            <Space h="lg"/>

            {nft &&
                <Nft 
                    nft={nft} 
                />
            }

            <Space h="lg"/>
            
            <Button
                fullWidth
                type="submit"
                disabled={isLoading}
            >
                Lookup
            </Button>
        </form>      
    )
};
