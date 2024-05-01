import React, { useCallback, useEffect } from "react";
import { Button } from "@mantine/core";
import { IconDeviceGamepad } from "@tabler/icons-react";
import { useMatchFindAll } from "@hooks/matches";
import { PageTitle } from "@components/PageTitle";
import { DrawerPanel } from "@components/DrawerPanel";
import { useDisclosure } from "@mantine/hooks";
import { MatchCreate } from "./match/Create";
import { MatchesGrid } from "./Grid";
import { InfinitePaging } from "@components/InfinitePaging";
import { useAuth } from "@hooks/auth";
import { useUI } from "@hooks/ui";
import { useBrowser } from "@hooks/browser";

interface Props {
}

const ITEMS_PER_PAGE = 6;

export const AllMatches = (props: Props) => {
    const {user} = useAuth();
    const {classes, showError} = useUI();
    const {redirectToLogin} = useBrowser();
    const [opened, {open, close}] = useDisclosure(false);

    const matches = useMatchFindAll(ITEMS_PER_PAGE);

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
            <PageTitle 
                title="All Matches"
                icon={IconDeviceGamepad}
            >
                <Button
                    className={classes.animatedOutline}
                    onClick={!user? redirectToLogin: open}
                >
                    New
                </Button>
            </PageTitle>

            <InfinitePaging
                query={matches}
            >
                <MatchesGrid 
                    matches={matches.data?.pages.flat()} 
                />
            </InfinitePaging>

            <DrawerPanel
                title="Create a new match"
                opened={opened}
                onClose={close}
            >
                <MatchCreate
                    onClose={close}
                />
            </DrawerPanel>        
        </>
    );
  }