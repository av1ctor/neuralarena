import React from "react";
import UserEdit from "./Edit";
import { userGetKind } from "@libs/users";
import { useAuth } from "@hooks/auth";
import { PageTitle } from "@components/PageTitle";
import { IconUser } from "@tabler/icons-react";

const Profile = () => {
    const {user} = useAuth();

    const kind = userGetKind(user);

    return (
        <>
            <PageTitle 
                title="Your Profile"
                icon={IconUser}
            >
            </PageTitle>

            <UserEdit />
        </>
    );
};

export default Profile;