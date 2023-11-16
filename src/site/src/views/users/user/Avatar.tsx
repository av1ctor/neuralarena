import React, { useCallback } from "react";
import { Principal } from "@dfinity/principal";
import { Avatar as Avatar_, Indicator, Tooltip } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useUserFindById } from "../../../hooks/users";
import { principalToString } from "../../../libs/icp";

interface Props {
    id?: Principal;
    size?: string;
    noName?: boolean;
    isWinner?: boolean;
};

export const Avatar = (props: Props) => {
    const profile = useUserFindById(props.id);
    const navigate = useNavigate();

    const handleShowProfile = useCallback(() => {
    }, [profile.data]);

    const title = `${profile.data?.nick}\n(${principalToString(profile.data?.id)}) ${props.isWinner? '🏆': ''}`;
    
    return (
        <Tooltip 
            label={title} 
            color="pink"
            withArrow
        >
            <Indicator 
                inline 
                label="🏆" 
                size="xl"
                offset={7} 
                position="bottom-end"
                withBorder
                disabled={!props.isWinner}
            >
                <Avatar_ 
                    color="primary" 
                    radius="xl"
                    size="lg"
                    onClick={handleShowProfile}
                >

                    {profile.data?.nick.substring(0, 2).toLocaleUpperCase()}
                </Avatar_>
            </Indicator>
        </Tooltip>
    );
};