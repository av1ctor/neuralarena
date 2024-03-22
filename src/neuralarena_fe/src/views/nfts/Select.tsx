import React, { useMemo } from "react";
import * as yup from 'yup';
import { Space, Select } from "@mantine/core";
import { useAuth } from "@hooks/auth";
import { NFT } from "@libs/nas1";
import { useForm, yupResolver } from "@mantine/form";
import { Principal } from "@dfinity/principal";
import { useNftCollectionFindActive } from "@hooks/nft_cols";
import { useNAS1FindTokensOf } from "@hooks/nas1";
import { ListNfts } from "./List";
import { SelectItem } from "@components/SelectItem";

const schema = {
    collection_id: yup.object().required(),
};

interface Props {
    owner?: Principal,
    selected?: NFT;
    onSelect?: (nft: NFT) => void;
}

export const SelectNft = (props: Props) => {
    const {isLogged} = useAuth();
    
    const form = useForm({
        initialValues: {
            collection_id: '',
        },

        validate: yupResolver(
            yup.object().shape(schema)
        ),

        transformValues(values) {
            return {
                collection_id: values.collection_id
            }
        },
    });

    const nft_cols = useNftCollectionFindActive(100);

    const user_tokens = useNAS1FindTokensOf(
        form.values.collection_id?
            Principal.fromText(form.values.collection_id):
            undefined, 
        props.owner, 
        32
    );

    const nft_cols_data = useMemo(() => {
        if(!nft_cols.data) {
            return [];
        }

        return nft_cols.data.pages
            .flat()
            .map(c => ({
                label: c.meta.name,
                value: c.id.toString(),
                description: c.meta.desc,
                image: c.meta.logo,
            }));
    }, [nft_cols.data]);

    const user_tokens_data = useMemo(() => {
        if(!user_tokens.data) {
            return [];
        }

        return user_tokens.data.pages
            .flat();
    }, [user_tokens.data]);

    if(!isLogged) {
        return null;
    }

    const nfts = useMemo(() => { 
        return user_tokens_data.map(token => ({
            collection_id: Principal.fromText(form.values.collection_id),
            token_id: token.tokenId
        }));
    }, [user_tokens_data, form.values.collection_id]);
    
    return (
        <form>
            <Select
                label="NFT Collection"
                placeholder="Select a NFT collection"
                {...form.getInputProps('collection_id')}
                itemComponent={SelectItem}
                data={nft_cols_data}
            />
            <Space h="lg"/>

            <ListNfts 
                nfts={nfts}
                selected={props.selected}
                onClick={props.onSelect}
            />
        </form>      
    )
};
