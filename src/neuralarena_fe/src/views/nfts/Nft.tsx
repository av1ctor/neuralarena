import React, { ReactElement, useCallback } from "react";
import { Badge, Card, Group, Text, Image, Space } from "@mantine/core";
import { 
    useNAS1FindTokenById, useNAS1GetCollectionSymbol, useNAS1GetTokenOwner
} from "../../hooks/nas1";
import { NFT } from "../../libs/nas1";
import { useAuth } from "../../hooks/auth";
import { principalToString } from "../../libs/icp";

interface Props {
    nft: NFT;
    children?: ReactElement,
    onClick?: (nft: NFT) => void;
}

export const Nft = (props: Props) => {
    const {user} = useAuth();
    const symbol = useNAS1GetCollectionSymbol(props.nft.canister_id);
    const token = useNAS1FindTokenById(props.nft.canister_id, Number(props.nft.token_id));
    const owner = useNAS1GetTokenOwner(props.nft.canister_id, Number(props.nft.token_id));

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
            withBorder
            onClick={handleClick}
        >
            <Card.Section>
                <Image
                    src={token.data?.image_url}
                    height={512}
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
                    <Space h="sm"/>
                    <div>
                        <Text size="sm" color="dimmed">
                            Owner
                        </Text>
                        <Group position="left" mt="xs">
                            <Badge color={user?.id === owner.data? "green": "red"} variant="light" size="xs">
                                {principalToString(owner.data)}
                            </Badge>
                        </Group>
                    </div>
                </div>
            }

            {props.children}
        </Card>
    );
}