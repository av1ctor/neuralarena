import React from "react";
import { Button, Center, createStyles } from "@mantine/core";
import { IconGoGame } from "@tabler/icons-react";
import { useGameFindAll } from "@hooks/games";
import { PageTitle } from "@components/PageTitle";
import { GamesGrid } from "./Grid";
import { InfinitePaging } from "@components/InfinitePaging";
import { DrawerPanel } from "@components/DrawerPanel";
import { useDisclosure } from "@mantine/hooks";
import { useUI } from "@hooks/ui";
import { useBrowser } from "@hooks/browser";
import { useAuth } from "@hooks/auth";

const useStyles = createStyles((theme) => ({
    soon: {
        fontSize: '4rem'
    },
}));

interface Props {
}

const ITEMS_PER_PAGE = 12;

export const Games = (props: Props) => {
    const {classes} = useUI();
    const {user} = useAuth();
    const {redirectToLogin} = useBrowser();
    const {classes: local} = useStyles();
    const [opened, {open, close}] = useDisclosure(false);
    
    const games = useGameFindAll(ITEMS_PER_PAGE);

    return (
        <>
            <InfinitePaging
                query={games}
            >
                <PageTitle 
                    title="All Games"
                    icon={IconGoGame}
                >
                    <Button
                        className={classes.animatedOutline}
                        onClick={!user? redirectToLogin: open}
                    >
                        Publish
                    </Button>
                </PageTitle>

                <GamesGrid 
                    games={games.data?.pages.flat() || []}
                />
            </InfinitePaging>

            <DrawerPanel
                opened={opened}
                title="Publish your game"
                onClose={close}
            >
                <Center className={local.soon} mt="6rem">
                    Soon...
                </Center>
            </DrawerPanel>    
        </>
    );
  }