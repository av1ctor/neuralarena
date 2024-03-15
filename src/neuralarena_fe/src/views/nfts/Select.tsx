import React, { forwardRef, useMemo } from "react";
import * as yup from 'yup';
import { Space, Select, Group, Avatar, Text } from "@mantine/core";
import { useAuth } from "@hooks/auth";
import { NFT } from "@libs/nas1";
import { useForm, yupResolver } from "@mantine/form";
import { Principal } from "@dfinity/principal";
import { useNftCollectionFindActive } from "@hooks/nft_cols";
import { useNAS1FindTokensOf } from "@hooks/nas1";
import { ListNfts } from "./List";

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
            .flatMap(p => p)
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

        return user_tokens.data.pages.flatMap((p) => p);
    }, [user_tokens.data]);

    if(!isLogged) {
        return null;
    }

    const nfts = user_tokens_data.map(token => ({
        collection_id: Principal.fromText(form.values.collection_id),
        token_id: token.tokenId
    }));
    
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
