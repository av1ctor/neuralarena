import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Center, Grid, NumberInput, Select, Space, Stepper, TextInput } from "@mantine/core";
import * as yup from 'yup';
import { useUI } from "@hooks/ui";
import { useForm, yupResolver } from "@mantine/form";
import { useGameFindActive } from "@hooks/games";
import { SelectItem } from "@components/SelectItem";
import { useMatch } from "@hooks/matches";
import { 
    MAX_DURATION, MAX_DEADLINE, MAX_PLAYERS, MIN_DEADLINE, MIN_PLAYERS 
} from "@libs/matches";
import { GameResponse } from "@declarations/neuralarena_be/neuralarena_be.did";
import { gameCostToPlay, gameFindById } from "@libs/games";
import { useActors } from "@hooks/actors";
import { Principal } from "@dfinity/principal";
import { NFT } from "@libs/nas1";
import { ListNfts } from "@views/nfts/List";
import { e8sToDecimal, principalToAccountId, principalToSubAccount } from "@libs/icp";
import { IconCoin } from "@tabler/icons-react";
import { useIcrc1GetBallance } from "@hooks/icrc1";
import { TRANSFER_FEE } from "@libs/icrc1";
import { useAuth } from "@hooks/auth";

const schema = {
    game_id: yup.string().required(),
    map_id: yup.string().required(),
    min_players: yup.number().required().min(MIN_PLAYERS),
    max_players: yup.number().required().min(MIN_PLAYERS).max(MAX_PLAYERS),
    max_duration: yup.number().required().min(1).max(MAX_DURATION),
    deadline: yup.number().required().min(MIN_DEADLINE).max(MAX_DEADLINE),
};

interface Props {
    gameId?: Principal;
    onClose: () => void;
}

export const MatchCreateAndJoin = (props: Props) => {
    const {user} = useAuth();
    const {main, icpLedger, ids} = useActors();
    const {toggleLoading, showError, showSuccess} = useUI();
    const [game, setGame] = useState<GameResponse|undefined>();
    const [nft, setNft] = useState<NFT|undefined>(undefined);
    const [step, setStep] = useState(0);

    const gamesQuery = useGameFindActive(32);
    const {createAndJoin} = useMatch()

    const form = useForm({
        initialValues: {
            game_id: props.gameId?.toText() ?? '',
            map_id: '',
            min_players: MIN_PLAYERS,
            max_players: MAX_PLAYERS,
            max_duration: MAX_DURATION / 2,
            deadline: 60*60*24,
        },

        validate: yupResolver(
            yup.object().shape(schema)
        ),

        transformValues(values) {
            return values;
        },
    });

    const handleSelectNft = useCallback(async (nft: NFT) => {
        setNft(nft);
    }, []);

    const handleNext = useCallback(() => {
        setStep(step => step + 1);
    }, []);

    const handleCreateAndJoin = useCallback(async (values: any) => {
        try {
            toggleLoading(true);
            
            if(!game) {
                throw new Error("Game not found");
            }

            if(!nft) {
                throw new Error("NFT not found");
            }

            await createAndJoin(
                {
                    game: {
                        id: Principal.fromText(values.game_id),
                        map_id: BigInt(values.map_id),
                        min_players: values.min_players,
                        max_players: values.max_players,
                        max_steps: BigInt(values.max_duration * game.info.fps),
                        options: []
                    },
                    deadline: BigInt(values.deadline)
                },
                {
                    token_id: nft.token_id,
                    collection_id: nft.collection_id
                }
            );
            showSuccess('Match created!');
            props.onClose()
        }
        catch(e) {
            showError(e);
        }
        finally {
            toggleLoading(false);
        }
    }, [props.onClose, game, nft]);

    const games = useMemo(() => {
        if(!gamesQuery.data) {
            return [];
        }

        return gamesQuery.data.pages
            .flat()
            .map(g => ({
                label: g.info.name,
                value: g.id.toString(),
                description: g.info.subtitle,
                image: g.info.urls.cover,
            }));
    }, [gamesQuery.data]);

    const maps = useMemo(() => {
        if(!gamesQuery.data) {
            return []
        };

        return (gamesQuery.data.pages
            .flat()
            .find(g => g.id.toString() === form.values.game_id)
            ?.info.maps || [])
            .map(m => ({
                label: m.name,
                value: m.id.toString(),
                description: m.description,
                image: m.urls.image,
            }));
    }, [gamesQuery, form.values.game_id]);

    useEffect(() => {
        const {game_id} = form.values;
        if(game_id) {
            (async () => {
                try {
                    const game = await gameFindById(main, Principal.fromText(game_id));
                    setGame(game);
                }
                catch(e) {
                    console.error(e);
                }
            })();
        }
    }, [form.values.game_id]);

    const userAccBalance = useIcrc1GetBallance(
        icpLedger, 
        principalToAccountId(
            ids.main,
            principalToSubAccount(user?.id)
        )
    );

    useEffect(() => {
        if(user?.nfts.length === 1) {
            setNft(user!.nfts[0]);
        }
    }, [user]);

    const nfts = user?.nfts || [];
    const cost = gameCostToPlay(game?.info.costs).value + (TRANSFER_FEE*(3n+1n));
    const okToJoin = cost <= (userAccBalance.data || 0n)

    return (
        <form onSubmit={form.onSubmit(handleCreateAndJoin)}>
            <Stepper 
                active={step} 
                breakpoint="sm"
                color="green"
                onStepClick={setStep}
            >
                <Stepper.Step 
                    label="Match" 
                    description="Match configuration"
                    allowStepSelect
                >
                    <Select
                        label="Game"
                        placeholder="Select a game"
                        {...form.getInputProps('game_id')}
                        itemComponent={SelectItem}
                        data={games}
                        disabled={!!props.gameId}
                    />

                    <Select
                        label="Map"
                        placeholder="Select a map"
                        {...form.getInputProps('map_id')}
                        itemComponent={SelectItem}
                        data={maps}
                        disabled={!form.values.game_id}
                    />

                    <NumberInput
                        label="Min players"
                        placeholder="Set mininum number of players"
                        {...form.getInputProps('min_players')}
                        min={1}
                        disabled={form.values.map_id === ''}
                    />

                    <NumberInput
                        label="Max players"
                        placeholder="Set maximum number of players"
                        {...form.getInputProps('max_players')}
                        min={1}
                        max={100}
                        disabled={form.values.map_id === ''}
                    />

                    <NumberInput
                        label="Max duration (in secs)"
                        placeholder="Set maximum duration"
                        {...form.getInputProps('max_duration')}
                        min={1}
                        max={MAX_DURATION}
                        disabled={form.values.map_id === ''}
                    />

                    <NumberInput
                        label="Deadline (in secs)"
                        placeholder="Set how long to wait for players to join"
                        {...form.getInputProps('deadline')}
                        min={MIN_DEADLINE}
                        max={MAX_DEADLINE}
                        disabled={form.values.map_id === ''}
                    />
                </Stepper.Step>
                <Stepper.Step 
                    label="Player" 
                    description="NFT selection"
                    allowStepSelect={false}
                >
                    <Grid>
                        <Grid.Col>
                            <Center>
                                {nfts.length > 0?
                                    <span>Please select a NFT to be your player in this match</span>
                                :
                                    <span>You have no NFT's in your account. Please add at least one!</span>
                                }
                            </Center>
                        </Grid.Col>

                        <Grid.Col>
                            <ListNfts  
                                nfts={nfts}
                                selected={nft}
                                game_id={game?.id}
                                onClick={handleSelectNft}
                            />
                        </Grid.Col>

                        <Grid.Col md={6}>
                            <TextInput
                                label="Your Neural Arena balance"
                                value={`${e8sToDecimal(userAccBalance.data || 0n)} ICP`}
                                readOnly
                                icon={<IconCoin size="1rem" />}
                            />
                        </Grid.Col>
                        <Grid.Col md={6}>
                            <TextInput
                                label="Cost to play this match"
                                value={`${e8sToDecimal(cost)} ICP`}
                                readOnly
                                icon={<IconCoin size="1rem" />}
                            />
                        </Grid.Col>
                    </Grid>
                </Stepper.Step>
            </Stepper>

            <Space h="lg"/>

            {step === 0 &&
                <Button 
                    color="blue"
                    fullWidth
                    disabled={!form.values.game_id || form.values.map_id === ''}
                    onClick={handleNext}
                >
                    Next
                </Button>
            }
            
            {step === 1 &&
                <Button 
                    color="red"
                    fullWidth
                    disabled={!nft || !okToJoin}
                    type="submit"
                >
                    Submit
                </Button>
            }
        </form>
    );
  }