import React from "react";
import { Button } from "@mantine/core";
import { useAuth } from "@hooks/auth";
import { useUserFindMatches } from "@hooks/users";
import { IconDeviceGamepad } from "@tabler/icons-react";
import { PageTitle } from "@components/PageTitle";
import { DrawerPanel } from "@components/DrawerPanel";
import { MatchCreate } from "@views/matches/match/Create";
import { useDisclosure } from "@mantine/hooks";
import { MatchesGrid } from "@views/matches/Grid";
import { InfinitePaging } from "@components/InfinitePaging";
import { useUI } from "@hooks/ui";

interface Props {
}

const ITEMS_PER_PAGE = 6;

export const UserMatches = (props: Props) => {
    const {user} = useAuth();
    const {classes} = useUI();
    const [opened, {open, close}] = useDisclosure(false);

    const matches = useUserFindMatches(user?.id, ITEMS_PER_PAGE);

    return (
        <>
            <PageTitle 
                title="Your Matches"
                icon={IconDeviceGamepad}
            >
                <Button
                    className={classes.animatedOutline}
                    disabled={!user}
                    onClick={open}
                >
                    New
                </Button>
            </PageTitle>

            <InfinitePaging
                query={matches}
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
                <MatchCreate
                    onClose={close}
                />
            </DrawerPanel>
        </>
    );
  }