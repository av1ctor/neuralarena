import React, { ReactElement, useCallback, useMemo } from "react";
import { Badge, Card, Group, Text, Image, Space, createStyles, rem, Grid, TextInput } from "@mantine/core";
import { useNAS1FindTokenById } from "@hooks/nas1";
import {  useIcrc7GetCollectionSymbol } from "@hooks/icrc7";
import { NFT } from "@libs/nas1";

const useStyles = createStyles((theme) => ({
    nft: {
        border: '1px solid transparent;',
    },
    selected: {
        backgroundColor: theme.colorScheme === "dark"? theme.colors.grape: '#dad',
        borderColor: theme.colorScheme === "dark"? theme.colors.grape: '#dad',
    }, 
    highlight: {
        ':hover': {
            backgroundColor: theme.colorScheme === "dark"? theme.colors.grape: '#dad',
            cursor: 'pointer',
            borderColor: theme.colorScheme === "dark"? theme.colors.grape: '#dad',
        },
    },
}));

interface Props {
    nft: NFT;
    size?: "mini" | "full",
    selected?: boolean;
    children?: ReactElement,
    onClick?: (nft: NFT) => void;
}

export const NftCard = (props: Props) => {
    const symbol = useIcrc7GetCollectionSymbol(props.nft.collection_id);
    const {classes, cx} = useStyles();
    const token = useNAS1FindTokenById(props.nft.collection_id, Number(props.nft.token_id));

    const handleClick = useCallback(() => {
        if(props.onClick) {
            props.onClick(props.nft);
        }
    }, [props.nft, props.onClick]);

    const hiddenLayersWeights = useMemo(() => {
        return `[${(token.data?.hidden_layers_weights_size as bigint[] || []).map(s => s.toString()).join(',')}]`;
    }, [token.data?.hidden_layers_weights_size]);

    return (
        <Card 
            shadow="sm" 
            padding="lg" 
            radius="md" 
            className={cx(classes.nft, {
                [classes.highlight]: props.onClick,
                [classes.selected]: props.selected
            })}
            onClick={handleClick}
        >
            <Card.Section>
                <Image
                    src={token.data?.image_url}
                    height={props.size === 'mini'? 128: props.size === 'full'? 1024: 256}
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
                    {props.size === 'full' &&
                        <div>
                            <Text size="sm" color="dimmed">
                                Neural net
                            </Text>
                            <Grid>
                                <Grid.Col md={6}>
                                    <TextInput
                                        label="Num hidden layers"
                                        value={token.data.num_hidden_layers.toString()}
                                        readOnly
                                    />
                                </Grid.Col>
                                <Grid.Col md={6}>
                                    <TextInput
                                        label="Hidden layers weights len"
                                        value={hiddenLayersWeights}
                                        readOnly
                                    />
                                </Grid.Col>
                            </Grid>
                        </div>
                    }
                </div>
            }

            {props.children}
        </Card>
    );
}