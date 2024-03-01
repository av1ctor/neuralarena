import React, { forwardRef, useCallback, useMemo, useState } from "react";
import * as yup from 'yup';
import { Space, Button, NumberInput, Select, Group, Avatar, Text } from "@mantine/core";
import { useAuth } from "../../hooks/auth";
import { useUI } from "../../hooks/ui";
import { NFT, nas1FindTokenById, nas1GetTokenOwner } from "../../libs/nas1";
import { useForm, yupResolver } from "@mantine/form";
import { Nft } from "./Nft";
import { Nas1Token } from "../../../../declarations/neuralarena_be/neuralarena_be.did";
import { Principal } from "@dfinity/principal";
import { useNftCollectionFindActive } from "../../hooks/nft_cols";

interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
    image: string;
    label: string;
    description: string;
}
  
const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
    ({ image, label, description, ...others }: ItemProps, ref) => (
        <div ref={ref} {...others}>
            <Group noWrap>
                <Avatar src={image} />
                <div>
                    <Text size="sm">{label}</Text>
                    <Text size="xs" opacity={0.65}>
                        {description}
                    </Text>
                </div>
            </Group>
        </div>
    )
);
  
const schema = {
    collection_id: yup.string().required().length(27),
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

    const nft_cols = useNftCollectionFindActive(100);

    const data = useMemo(() => {
        if(!nft_cols.data) {
            return [];
        }

        const cols = nft_cols.data.pages.flatMap((p) => p);
        const data = cols.map(c => ({
            label: c.meta.name,
            value: c.id.toString(),
            description: c.meta.desc,
            image: c.meta.logo,
        }));

        return data;
    }, [nft_cols.data]);

    const form = useForm({
        initialValues: {
            collection_id: '',
            token_id: 0
        },

        validate: yupResolver(
            yup.object().shape(schema)
        )
    });

    const handleLookup = useCallback(async (values: any) => {
        try {
            toggleLoading(true);
            const token = await nas1FindTokenById(values.collection_id, values.token_id);
            const owner = await nas1GetTokenOwner(values.collection_id, values.token_id);
            setToken(token);
            const nft = {
                collection_id: Principal.fromText(values.collection_id),
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
            <Select
                label="NFT Collection"
                placeholder="Select a NFT collection"
                {...form.getInputProps('collection_id')}
                itemComponent={SelectItem}
                data={data}
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
