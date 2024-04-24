import React, { Fragment, ReactElement, useCallback, useMemo } from "react";
import { Badge, Card, Group, Text, Image, Space, createStyles, Grid, TextInput, Box, Center } from "@mantine/core";
import { useNAS1FindTokenById, useNAS1GetCollectionData } from "@hooks/nas1";
import {  useIcrc7GetCollectionSymbol } from "@hooks/icrc7";
import { NFT } from "@libs/nas1";
import { Principal } from "@dfinity/principal";
import { Nas1TokenGameProps } from "@declarations/nas1_nft/nas1_nft.did";

const useStyles = createStyles((theme) => {
    const color = theme.colorScheme === "dark"? 
        theme.colors.grape: 
        '#dad';
    
    return {
        nft: {
            border: '1px solid transparent;',
        },
        selected: {
            backgroundColor: color,
            borderColor: color,
        }, 
        highlight: {
            ':hover': {
                backgroundColor: color,
                borderColor: color,
                cursor: 'pointer',
            },
        },
        collection: {
            position: 'absolute',
            top: '4px',
            right: '4px',
        },
        title: {
            fontVariant: 'all-small-caps',
            color: theme.colorScheme === "dark"? 
                theme.colors.grape[3]: 
                theme.colors.grape[8],
            overflow: "hidden",
        },
    };
});

interface Props {
    nft: NFT;
    size?: "nano" | "mini" | "full",
    selected?: boolean;
    gameId?: Principal,
    children?: ReactElement | ReactElement[] | undefined,
    onClick?: (nft: NFT) => void;
}

export const NftCard = (props: Props) => {
    const {classes, cx} = useStyles();
    const collection = useNAS1GetCollectionData(props.nft.collection_id);
    const symbol = useIcrc7GetCollectionSymbol(props.nft.collection_id);
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

    const height = useMemo((): number => {
        return props.size === 'nano' || props.size === 'mini'? 
            128: 
            props.size === 'full'? 
                768: 
                256
    }, [props.size]);

    return (
        <Card 
            shadow="sm" 
            padding={props.size === 'nano'? 'xs': 'lg'} 
            radius="md" 
            className={cx(classes.nft, {
                [classes.highlight]: props.onClick,
                [classes.selected]: props.selected
            })}
            onClick={handleClick}
            style={props.size === 'nano'? {opacity: 0.75}: undefined}
        >
            <Card.Section>
                <Image
                    src={token.data?.image_url}
                    height={height}
                    fit="cover"
                    withPlaceholder
                />
                {symbol.data &&
                    <Badge 
                        className={classes.collection}
                        color="pink" 
                        variant="light"
                        m={props.size === 'full'? 10: 0}
                        size={props.size === 'full'? "xl": props.size === 'nano'? "xs": "sm"}
                    >
                        {symbol.data}
                    </Badge>
                }
            </Card.Section>

            <Box 
                mt={2}
                mb="sm"
            >
                {token.data &&
                    <Center>
                        <Text 
                            className={classes.title}
                            size={props.size === 'nano'? 'xs': 'md'}
                            weight={500}
                            style={{maxWidth: height/1.5}}
                        >
                            {token.data.name}
                        </Text>
                    </Center>
                }
            </Box>

            {token.data &&
                <div>
                    {props.gameId && 
                        <Group position="left" mb={props.size === 'nano'? "xs": "md"}>
                            <Badge color="blue" variant="light" size={props.size === 'nano'? "sm": "md"}>
                                XP {token.data.game_props.find(e => e[0].compareTo(props.gameId!) === 'eq')?.[1].xp.toFixed(2) || 0.0}
                            </Badge>
                        </Group>                    
                    }
                    {props.size !== 'nano' &&
                        <Group position="left">
                            <Badge color="red" variant="light" size="sm">
                                SPT {(Number(token.data.steps_per_thought) / 1000.0).toFixed(2)}
                            </Badge>
                            <Badge color="blue" variant="light" size="sm">
                                EPS {token.data.epsilon.toFixed(2)}
                            </Badge>
                        </Group>                    
                    }
                    {props.size !== 'nano' && 
                        <>
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
                        </>
                    }
                    {props.size === 'full' &&
                        <>
                            <Space h="sm"/>
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
                                    <Box>
                                        {xps.length > 0? 
                                            xps.map((xp, index) => 
                                                <Box key={index}>
                                                    <Grid>
                                                        <Grid.Col md={12} m={0} pb={0}>
                                                            <Text size="xs" color="lime">
                                                                <b>#{index+1}</b>
                                                            </Text>
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
                                                                value={xp[1].xp.toFixed(2)}
                                                                size="xs"
                                                                readOnly
                                                            />
                                                        </Grid.Col>
                                                    </Grid>
                                                </Box>
                                            )
                                        :
                                            <Center>
                                                <Text size="xs">
                                                    Time to start earning some XP! Join a match and let the fun begin! 😆
                                                </Text>
                                            </Center>
                                        }
                                    </Box>
                                </Card>
                            </Box>
                            <Box mb="sm">
                                <Text size="sm" color="dimmed">
                                    <b>Neural net</b>
                                </Text>
                                <Card 
                                    radius="md" 
                                    p="xs" 
                                    bg="transparent"
                                    withBorder
                                    w="100%"
                                >
                                    {collection.data?.skills.map((skill) => 
                                        <Box key={skill}>
                                            <Grid>
                                                <Grid.Col md={12} m={0} pb={0}>
                                                    <Text size="xs" color="lime">
                                                        <b>#{skill}</b>
                                                    </Text>
                                                </Grid.Col>
                                                <Grid.Col md={6} pt={0}>
                                                    <TextInput
                                                        label="Num hidden layers"
                                                        value={token.data.num_hidden_layers.toString()}
                                                        size="xs"
                                                        readOnly
                                                    />
                                                </Grid.Col>
                                                <Grid.Col md={6} pt={0}>
                                                    <TextInput
                                                        label="Hidden layers weights len"
                                                        value={hiddenLayersWeights}
                                                        size="xs"
                                                        readOnly
                                                    />
                                                </Grid.Col>
                                            </Grid>
                                        </Box>
                                    )}  
                                </Card>
                            </Box>
                        </>
                    }
                </div>
            }
            {props.children}
        </Card>
    );
}