import React, { useCallback, useState } from "react";
import { Nft } from "../../nfts/Nft";
import { useAuth } from "../../../hooks/auth";
import { ActionIcon, Button, Card, Divider, Group, Space, Text } from "@mantine/core";
import { IconMoneybag, IconTrash } from "@tabler/icons-react";
import { ConfirmDialog } from "../../../components/ConfirmDialog";
import { DrawerPanel } from "../../../components/DrawerPanel";
import { useDisclosure } from "@mantine/hooks";
import { NFT } from "../../../libs/nas1";
import { Lookup } from "../../nfts/Lookup";
import { useUser } from "../../../hooks/users";
import { useUI } from "../../../hooks/ui";
import { Principal } from "@dfinity/principal";

interface Props {
}

export const UserNfts = (props: Props) => {
    const {user} = useAuth();
    const {toggleLoading, showError, showSuccess} = useUI();
    const [delOpened, {open: delOpen, close: delClose}] = useDisclosure(false);
    const [addOpened, {open: addOpen, close: addClose}] = useDisclosure(false);
    const [nfts, setNfts] = useState(user?.nfts);
    const [toDelete, setToDelete] = useState<number|undefined>();
    const [nft, setNft] = useState<NFT|undefined>();

    const handleSelected = useCallback((nft: NFT, owner?: Principal) => {
        if(owner !== user?.id) {
            if(owner) {
                showError("Your are not the owner of the NFT");
            }
            return;
        }
        setNft(nft);
    }, [user]);

    const {updateNfts} = useUser()
    
    const handleAdd = useCallback(async () => {
        if(nft && user && nfts) {
            const nftsUpdated = Array.from(nfts);
            nftsUpdated.push({
                std: {'ICRC1': null},
                canister_id: nft.canister_id,
                token_id: nft.token_id,
            });
            
            try {
                toggleLoading(true);
                await updateNfts(user.id, {
                    nfts: nftsUpdated
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
    }, [nfts, nft, user]);

    const handleDelete = useCallback(() => {
        if(toDelete !== undefined) {
            nfts?.splice(toDelete, 1);
            setNfts(nfts);
        }
    }, [nfts, toDelete]);

    const handleConfirm = useCallback((index: number) => {
        setToDelete(index);
        delOpen();
    }, [nfts]);

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

            {nfts?.map((nft, index) => 
                <Nft
                    key={index} 
                    nft={nft}
                >
                    <ActionIcon
                        onClick={() => handleConfirm(index)}
                    >
                        <IconTrash />
                    </ActionIcon>
                </Nft>
            )}

            <div>
                <Button 
                    fullWidth
                    onClick={addOpen}
                >
                    New
                </Button>
            </div>

            <DrawerPanel
                title="Select a NFT to add"
                opened={addOpened}
                onClose={addClose}
            >
                <Lookup
                    onSelected={handleSelected}
                />

                <Space h="xs" />
                 
                <Button 
                    color="red"
                    fullWidth
                    disabled={!nft}
                    onClick={handleAdd}
                >
                    Add
                </Button>
            </DrawerPanel>

            <ConfirmDialog  
                opened={delOpened}
                onClose={delClose}
                onConfirm={handleDelete}
            />
        </Card>
    );
}