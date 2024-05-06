import React, { useCallback, useEffect } from "react";
import { useMatchFindByGame } from "@hooks/matches";
import { GameResponse } from "@declarations/neuralarena_be/neuralarena_be.did";
import { MatchesGrid } from "@views/matches/Grid";
import { InfinitePaging } from "@components/InfinitePaging";
import { useUI } from "@hooks/ui";
import { DrawerPanel } from "@components/DrawerPanel";
import { useDisclosure } from "@mantine/hooks";
import { MatchCreate } from "@views/matches/match/Create";
import { Button } from "@mantine/core";
import { useAuth } from "@hooks/auth";
import { useBrowser } from "@hooks/browser";

interface Props {
    game: GameResponse|undefined;
}

const ITEMS_PER_PAGE = 6;

export const GameMatches = (props: Props) => {
    const {user} = useAuth();
    const {redirectToLogin} = useBrowser();
    const {showError} = useUI();
    const {classes} = useUI();
    const [opened, {open, close}] = useDisclosure(false);
    const matches = useMatchFindByGame(props.game?.id, ITEMS_PER_PAGE);

    const update = useCallback(async () => {
        try {
            if(matches.isFetched) {
                await matches.refetch()
            }
        }
        catch(e) {
            showError(e);
        }
    }, [matches]);

    useEffect(() => {
        const t = setInterval(() => {
            update();
        }, 10000);
        
        return () => clearInterval(t);
    }, [update]);

    return (
        <>
            <InfinitePaging
                query={matches}
                actions={[
                    <Button
                        className={classes.animatedOutline}
                        variant="gradient"
                        onClick={!user? redirectToLogin: open}
                    >
                        New
                    </Button>

                ]}
            >
                <MatchesGrid
                    matches={matches.data?.pages.flat() || []} 
                />
            </InfinitePaging>

            <DrawerPanel
                    title="Create a new match"
                    opened={opened}
                    onClose={close}
                >
                    {props.game && 
                        <MatchCreate
                            gameId={props.game.id}
                            onClose={close}
                        />
                    }
            </DrawerPanel>
        </>        
    );
  }