import React, { useCallback, useContext, useEffect, useState } from "react";
import { Nft } from "../../nfts/Nft";
import { useAuth } from "../../../hooks/auth";
import { ActionIcon, Button, Card, Divider, Grid, Group, Space, Text } from "@mantine/core";
import { IconMoneybag, IconTrash } from "@tabler/icons-react";
import { ConfirmDialog } from "../../../components/ConfirmDialog";
import { DrawerPanel } from "../../../components/DrawerPanel";
import { useDisclosure } from "@mantine/hooks";
import { NFT } from "../../../libs/nas1";
import { SelectNft } from "../../nfts/Select";
import { useUser } from "../../../hooks/users";
import { useUI } from "../../../hooks/ui";
import { UserNftRequest } from "../../../../../declarations/neuralarena_be/neuralarena_be.did";
import { AuthActionType, AuthContext } from "../../../stores/auth";

interface Props {
}

export const UserNfts = (props: Props) => {
    const {user} = useAuth();
    const [, dispatch] = useContext(AuthContext);
    const {toggleLoading, showError, showSuccess} = useUI();
    const [delOpened, {open: delOpen, close: delClose}] = useDisclosure(false);
    const [addOpened, {open: addOpen, close: addClose}] = useDisclosure(false);
    const [nfts, setNfts] = useState<UserNftRequest[]|undefined>();
    const [toDelete, setToDelete] = useState<number|undefined>();
    const [toAdd, setToAdd] = useState<NFT|undefined>();

    const handleSetCurrent = useCallback((nft: NFT) => {
        setToAdd(nft);
    }, [user]);

    const {updateNfts} = useUser()
    
    const handleAdd = useCallback(async () => {
        if(toAdd && user && nfts) {
            // check for dups
            if(nfts.find(n => n.collection_id.compareTo(toAdd.collection_id) === 'eq' && n.token_id === toAdd.token_id)) {
                showError("Token duplicated");
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

    const handleConfirm = useCallback((index: number) => {
        setToDelete(index);
        delOpen();
    }, [nfts]);

    useEffect(() => {
        if(user) {
            setNfts(
                user.nfts.map(n => ({collection_id: n.collection_id, token_id: n.token_id}))
            );
        }
    }, [user?.id]);

    return (
        <Card withBorder radius="md" p="xl" className="main-card card">
            <Group position="apart" noWrap spacing="xl">
                <div>
                    <Text fz="lg" className="card-title" fw={500}>
                        <IconMoneybag size="1rem" /> NFT's
                    </Text>
                    <Text fz="xs" c="dimmed" mt={3} mb="xl">
                        Edit your NFT's
                    </Text>
                </div>
            </Group>

            <Divider pb="xs" />

            <Grid>
                {nfts?.map((nft, index) => 
                    <Grid.Col 
                        key={index} 
                        sm={6}
                    >
                        <Nft nft={nft}>
                            <Group mt="md" position="right">
                                <ActionIcon
                                    onClick={() => handleConfirm(index)}
                                >
                                    <IconTrash />
                                </ActionIcon>
                            </Group>
                        </Nft>
                    </Grid.Col>
                )}
            </Grid>

            <Space h="lg" />

            <div>
                <Button 
                    fullWidth
                    onClick={addOpen}
                >
                    Add
                </Button>
            </div>

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
                    Add
                </Button>
            </DrawerPanel>

            <ConfirmDialog  
                opened={delOpened}
                desc="Are you sure you want to remove this NFT from your account?"
                onClose={delClose}
                onConfirm={handleDelete}
            />
        </Card>
    );
}