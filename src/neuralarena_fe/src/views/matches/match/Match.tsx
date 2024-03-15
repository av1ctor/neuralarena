import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Avatar as Avatar_, Space, Stack, Title, Tooltip, Container, Center } from "@mantine/core";
import { useMatchFindById, useMatch } from "@hooks/matches";
import { useGameFindById } from "@hooks/games";
import { Banner } from "@views/games/game/Banner";
import { matchStatusToString } from "@libs/matches";
import { useUI } from "@hooks/ui";
import { Watch } from "./Watch";
import { Avatar } from "@views/users/user/Avatar";
import { ListNfts } from "@views/nfts/List";
import { useAuth } from "@hooks/auth";
import { NFT } from "@libs/nas1";

interface Props {
}

export const Match = (props: Props) => {
    const {id} = useParams();
    const {user, isLogged} = useAuth();
    const {join, start, run} = useMatch()
    const {toggleLoading, showError, showSuccess} = useUI();
    const [pov, setPov] = useState<number|undefined>(undefined);
    const [nft, setNft] = useState<NFT|undefined>(undefined);
    const match = useMatchFindById(id);
    const game = useGameFindById(match?.data?.game.id);

    const handleSelectNft = useCallback(async (nft: NFT) => {
        setNft(nft);
    }, []);
        
    const handleJoin = useCallback(async () => {
        if(id && nft) {
            try {
                toggleLoading(true);
                await join({
                    id, 
                    nft: {
                        token_id: nft.token_id,
                        collection_id: nft.collection_id
                    }
                });
                showSuccess('You have joined this match!');
            }
            catch(e) {
                showError(e);
            }
            finally {
                toggleLoading(false);
            }
        }
    }, [join, id, nft]);

    const handleStartAndRun = useCallback(async () => {
        if(id) {
            try {
                toggleLoading(true);
                await start(id);
                run(id);
                showSuccess('This match is running!');
            }
            catch(e) {
                showError(e);
            }
            finally {
                toggleLoading(false);
            }
        }
    }, [join, id]);

    const handleWatch = useCallback(async () => {
        if(id) {
            try {
                toggleLoading(true);
            }
            catch(e) {
                showError(e);
            }
            finally {
                toggleLoading(false);
            }
        }
    }, [join, id]);

    const handleChangePov = useCallback(async (pov: number) => {
        setPov(pov);
    }, []);

    const updateStatus = useCallback(async () => {
        try {
            if(match.data && !('FINISHED' in match.data.status || 'CANCELLED' in match.data.status)) {
                await match.refetch()
            }
        }
        catch(e) {
            showError(e);
        }
    }, [match]);

    useEffect(() => {
        const t = setInterval(() => {
            updateStatus();
        }, 5000);
        
        return () => clearInterval(t);
    }, [updateStatus]);

    const nfts = user?.nfts || [];

    const status = matchStatusToString(match.data?.status);
    const winner = match.data && match.data.won_by.length > 0?
        match.data.won_by[0]?.toString():
        undefined;
    const joined = match.data && user && match.data.players.find(p => p.id.compareTo(user.id) === 'eq');

    return (
        <>
            <div>
                {match && match.data && game && game.data &&
                    <Banner 
                        game={game.data}
                        isHalf
                    />
                }
            </div>
            <Space h="xl" />
            <div>
                <div>
                    <div>Players:</div>
                    <Tooltip.Group 
                        openDelay={300} 
                        closeDelay={100}
                    >
                        <Avatar_.Group spacing="xs">
                            {match.data?.players.map((player, index) => 
                                <Avatar 
                                    key={player.id.toString()} 
                                    id={player.id}
                                    isWinner={winner? player.id.toString() === winner: false}
                                    onClick={() => handleChangePov(index)}
                                />
                            )}
                        </Avatar_.Group>
                    </Tooltip.Group>
                </div>
                <Space h="xl" />
                <Stack spacing="xl">
                    {isLogged?
                        status === 'OPEN' && !joined &&
                            <div>
                                <div>
                                    {nfts.length > 0?
                                        <Center>Please select a NFT to be your player in this match</Center>
                                    :
                                        <Center>You have no NFT's in your account. Please add at least one!</Center>
                                    }
                                    <ListNfts  
                                        nfts={nfts}
                                        selected={nft}
                                        onClick={handleSelectNft}
                                    />
                                </div>
                                <div>
                                    <Button
                                        variant="gradient"
                                        fullWidth
                                        disabled={!nft}
                                        onClick={handleJoin}
                                    >
                                        Join
                                    </Button>
                                </div>
                            </div>
                    :
                        status === 'OPEN' &&
                            <Center>
                                Please log in or sign up to be able to participate!
                            </Center>
                    }
                    {isLogged &&
                        status === 'OPEN' &&
                        <div>
                            <Button
                                variant="gradient"
                                fullWidth
                                onClick={handleStartAndRun}
                            >
                                Start & Run
                            </Button>
                        </div>
                    }
                    {(status === 'FINISHED' || status === 'RUNNING') &&
                        <Stack>
                            {match.data && game.data &&
                                <Watch 
                                    game={game.data}
                                    match={match.data}
                                    pov={pov}
                                />
                            }
                        </Stack>
                    }
                    {status === 'RUNNING' &&
                        <Title order={1}>
                            Waiting this match to finish...
                        </Title>
                    }
                </Stack>
            </div>
        </>
    );
};