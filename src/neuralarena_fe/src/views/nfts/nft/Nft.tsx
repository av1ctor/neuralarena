import React, { ReactElement, useCallback } from "react";
import { Badge, Card, Group, Text, Image, Space } from "@mantine/core";
import { 
    useNAS1FindTokenById, useNAS1GetCollectionSymbol
} from "@hooks/nas1";
import { NFT } from "@libs/nas1";

interface Props {
    nft: NFT;
    mini?: boolean,
    children?: ReactElement,
    onClick?: (nft: NFT) => void;
}

export const Nft = (props: Props) => {
    const symbol = useNAS1GetCollectionSymbol(props.nft.collection_id);
    const token = useNAS1FindTokenById(props.nft.collection_id, Number(props.nft.token_id));

    const handleClick = useCallback(() => {
        if(props.onClick) {
            props.onClick(props.nft);
        }
    }, [props.nft, props.onClick]);

    return (
        <Card 
            shadow="sm" 
            padding="lg" 
            radius="md" 
            onClick={handleClick}
        >
            <Card.Section>
                <Image
                    src={token.data?.image_url}
                    height={props.mini? 128: 256}
                    fit="cover"
                    withPlaceholder
                />
            </Card.Section>

            <Group position="apart" mt="md" mb="xs">
                {token.data &&
                    <Text weight={500}>{token.data.name}</Text>
                }
                {symbol.data &&
                    <Badge color="pink" variant="light">
                        {symbol.data}
                    </Badge>
                }
            </Group>

            {token.data &&
                <div>
                    <Group position="left">
                        <Badge color="yellow" variant="light">
                            XP {token.data.xp.toString()}
                        </Badge>
                        <Badge color="red" variant="light">
                            SPT {(Number(token.data.steps_per_thought) / 1000.0).toFixed(2)}
                        </Badge>
                        <Badge color="blue" variant="light">
                            EPS {token.data.epsilon.toFixed(2)}
                        </Badge>
                    </Group>
                    <Space h="sm"/>
                    <div>
                        <Text size="sm" color="dimmed">
                            Traits
                        </Text>
                        <Group position="left" mt="xs">
                            {token.data.traits.map((trait, index) => 
                                <Badge key={index} color="green" variant="light" size="xs">
                                    {trait}
                                </Badge>
                            )}
                        </Group>
                    </div>
                </div>
            }

            {props.children}
        </Card>
    );
}