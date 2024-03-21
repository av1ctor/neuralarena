import React from "react";
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

interface Props {
}

const ITEMS_PER_PAGE = 6;

export const AllMatches = (props: Props) => {
    const {user} = useAuth();
    const [opened, {open, close}] = useDisclosure(false);

    const matches = useMatchFindAll(ITEMS_PER_PAGE);

    return (
        <>
            <PageTitle 
                title="All Matches"
                icon={IconDeviceGamepad}
            >
                <Button
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