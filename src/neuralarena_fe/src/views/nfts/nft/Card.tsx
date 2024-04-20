import React, { Fragment, ReactElement, useCallback, useMemo } from "react";
import { Badge, Card, Group, Text, Image, Space, createStyles, Grid, TextInput, Box } from "@mantine/core";
import { useNAS1FindTokenById } from "@hooks/nas1";
import {  useIcrc7GetCollectionSymbol } from "@hooks/icrc7";
import { NFT } from "@libs/nas1";
import { Principal } from "@dfinity/principal";
import { Nas1TokenGameProps } from "@declarations/nas1_nft/nas1_nft.did";

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
    gameId?: Principal,
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

    const xps = useMemo((): [Principal, Nas1TokenGameProps][] => {
        if(!token.data) {
            return [];
        }
        let res = new Array<[Principal, Nas1TokenGameProps]>();
        for(const e of token.data?.game_props) {
            res.push(e);
        }
        return res;
    }, [token]);

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
                    height={props.size === 'mini'? 128: props.size === 'full'? 768: 256}
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
                        {props.gameId &&
                            <Badge color="blue" variant="light">
                                XP {token.data.game_props.find(e => e[0].compareTo(props.gameId!) === 'eq')?.[1].xp || 0.0}
                            </Badge>
                        }
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
                            <b>Traits</b>
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
                        <>
                            <Box mb="sm">
                                <Text size="sm" color="dimmed">
                                    <b>XPs</b>
                                </Text>
                                <Card 
                                    radius="md" 
                                    p="xs" 
                                    bg="transparent"
                                    withBorder
                                    w="100%"
                                >
                                    <Grid>
                                        {xps.length > 0? 
                                            xps.map((xp, index) => 
                                                <Fragment key={index}>
                                                    <Grid.Col md={12}>
                                                        <Grid>
                                                            <Grid.Col md={12} m={0} pb={0}>
                                                                <Text size="xs"><b>#{index+1}</b></Text>
                                                            </Grid.Col>
                                                            <Grid.Col md={6} pt={0}>
                                                                <TextInput
                                                                    label="Game canister id"
                                                                    value={xp[0].toString()}
                                                                    size="xs"
                                                                    readOnly
                                                                />
                                                            </Grid.Col>
                                                            <Grid.Col md={6} pt={0}>
                                                                <TextInput
                                                                    label="XP"
                                                                    value={xp[1].xp}
                                                                    size="xs"
                                                                    readOnly
                                                                />
                                                            </Grid.Col>
                                                        </Grid>
                                                    </Grid.Col>
                                                </Fragment>
                                            )
                                        :
                                            <Text size="sm" p="lg">
                                                Time to start earning some XP! Join a match and let the fun begin! 😆
                                            </Text>
                                        }
                                    </Grid>
                                </Card>
                            </Box>
                            <div>
                                <Text size="sm" color="dimmed">
                                    <b>Neural net</b>
                                </Text>
                                <Grid>
                                    <Grid.Col md={6}>
                                        <TextInput
                                            label="Num hidden layers"
                                            value={token.data.num_hidden_layers.toString()}
                                            size="xs"
                                            readOnly
                                        />
                                    </Grid.Col>
                                    <Grid.Col md={6}>
                                        <TextInput
                                            label="Hidden layers weights len"
                                            value={hiddenLayersWeights}
                                            size="xs"
                                            readOnly
                                        />
                                    </Grid.Col>
                                </Grid>
                            </div>
                        </>
                    }
                </div>
            }

            {props.children}
        </Card>
    );
}