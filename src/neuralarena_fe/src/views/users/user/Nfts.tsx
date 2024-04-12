import React, { useCallback, useContext, useEffect, useState } from "react";
import { NftCard } from "@views/nfts/nft/Card";
import { useAuth } from "@hooks/auth";
import { ActionIcon, Button, Center, Grid, Group, Space } from "@mantine/core";
import { IconPhoto, IconTrash } from "@tabler/icons-react";
import { ConfirmDialog } from "@components/ConfirmDialog";
import { DrawerPanel } from "@components/DrawerPanel";
import { useDisclosure } from "@mantine/hooks";
import { NFT } from "@libs/nas1";
import { SelectNft } from "@views/nfts/Select";
import { useUser } from "@hooks/users";
import { useUI } from "@hooks/ui";
import { UserNftRequest } from "@declarations/neuralarena_be/neuralarena_be.did";
import { AuthActionType, AuthContext } from "@stores/auth";
import { PageTitle } from "@components/PageTitle";
import { NftDetails } from "@views/nfts/nft/Details";

interface Props {
}

export const UserNfts = (props: Props) => {
    const {user} = useAuth();
    const [, dispatch] = useContext(AuthContext);
    const {toggleLoading, showError, showSuccess} = useUI();
    const [delOpened, {open: delOpen, close: delClose}] = useDisclosure(false);
    const [addOpened, {open: addOpen, close: addClose}] = useDisclosure(false);
    const [showOpened, {open: showOpen, close: showClose}] = useDisclosure(false);
    const [nfts, setNfts] = useState<UserNftRequest[]|undefined>();
    const [toShow, setToShow] = useState<NFT|undefined>();
    const [toDelete, setToDelete] = useState<number|undefined>();
    const [toAdd, setToAdd] = useState<NFT|undefined>();

    const handleSetCurrent = useCallback((nft: NFT) => {
        setToAdd(nft);
    }, [user]);

    const {updateNfts} = useUser()
    
    const handleAdd = useCallback(async () => {
        if(toAdd && user && nfts) {
            // check for dups
            if(nfts.find(n => 
                n.collection_id.compareTo(toAdd.collection_id) === 'eq' && 
                n.token_id === toAdd.token_id)) {
                showError("Duplicated token");
                return;
            }
            
            const nftsUpdated = Array.from(nfts);
            nftsUpdated.push({
                collection_id: toAdd.collection_id,
                token_id: toAdd.token_id,
            });
            
            try {
                toggleLoading(true);
                const userUpded = await updateNfts(user.id, {
                    nfts: nftsUpdated
                });
                dispatch({
                    type: AuthActionType.SET_USER,
                    payload: userUpded,
                });
                setNfts(nftsUpdated);
                addClose();
                showSuccess("NFT added!");
            }
            catch(e) {
                showError(e);
            }
            finally {
                toggleLoading(false);
            }
        }
    }, [nfts, toAdd, user]);

    const handleDelete = useCallback(async () => {
        if(toDelete !== undefined && nfts && user) {
            const nftsUpdated = Array.from(nfts);
            nftsUpdated.splice(toDelete, 1);
            
            try {
                toggleLoading(true);
                const userUpded = await updateNfts(user.id, {
                    nfts: nftsUpdated
                });
                dispatch({
                    type: AuthActionType.SET_USER,
                    payload: userUpded,
                });
                setNfts(nftsUpdated);
                showSuccess("NFT removed!");
            }
            catch(e) {
                showError(e);
            }
            finally {
                toggleLoading(false);
            }
        }
    }, [nfts, user, toDelete]);

    const handleConfirm = useCallback((e: any, index: number) => {
        e.stopPropagation();
        setToDelete(index);
        delOpen();
    }, [nfts]);

    const handleShow = useCallback((nft: NFT) => {
        setToShow(nft);
        showOpen();
    }, []);

    const handleShowClosed = useCallback(() => {
        setToShow(undefined);
        showClose();
    }, []);

    useEffect(() => {
        if(user) {
            setNfts(
                user.nfts.map(n => ({
                    collection_id: n.collection_id, 
                    token_id: n.token_id
                }))
            );
        }
    }, [user?.id]);

    useEffect(() => {
        if(!addOpened) {
            setToAdd(undefined);
        }
    }, [addOpened]);

    return (
        <>
            <PageTitle 
                title="Your NFT's"
                icon={IconPhoto}
            >
            </PageTitle>

            <Grid>
                {nfts?.map((nft, index) => 
                    <Grid.Col 
                        key={index} 
                        sm={6}
                        md={4}
                    >
                        <NftCard 
                            nft={nft}
                            selected={toShow?.token_id === nft.token_id && toShow?.collection_id === nft.collection_id}
                            onClick={handleShow}
                        >
                            <Group mt="md" position="right">
                                <ActionIcon
                                    onClick={(e) => handleConfirm(e, index)}
                                >
                                    <IconTrash />
                                </ActionIcon>
                            </Group>
                        </NftCard>
                    </Grid.Col>
                )}
            </Grid>

            <Space h="lg" />

            <Center>
                <Button 
                    onClick={addOpen}
                >
                    Add
                </Button>
            </Center>

            <DrawerPanel
                title="Details"
                opened={showOpened}
                onClose={handleShowClosed}
            >
                {toShow && 
                    <NftDetails 
                        nft={toShow}
                    />
                }
            </DrawerPanel>

            <DrawerPanel
                title="Select a NFT to add"
                opened={addOpened}
                onClose={addClose}
            >
                <SelectNft
                    owner={user?.id}
                    selected={toAdd}
                    onSelect={handleSetCurrent}
                />

                <Space h="xs" />
                 
                <Button 
                    color="red"
                    fullWidth
                    disabled={!toAdd}
                    onClick={handleAdd}
                >
                    Submit
                </Button>
            </DrawerPanel>

            <ConfirmDialog  
                opened={delOpened}
                desc="Are you sure you want to remove this NFT from your account?"
                onClose={delClose}
                onConfirm={handleDelete}
            />
        </>
    );
}