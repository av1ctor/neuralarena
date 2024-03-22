import React from "react";
import { useAuth } from "@hooks/auth";
import { PageTitle } from "@components/PageTitle";
import { IconPackage } from "@tabler/icons-react";
import { UserMenu } from "@views/home/menus/User";

export const UserPage = () => {
    const {user} = useAuth();

    return (
        <>
            <PageTitle 
                title="Your Page"
                icon={IconPackage}
            >
            </PageTitle>

            <div>
                <UserMenu />
            </div>
        </>
    );
};
