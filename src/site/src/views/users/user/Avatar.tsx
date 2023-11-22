import React from "react";
import { Principal } from "@dfinity/principal";
import { Avatar as Avatar_, Indicator, Tooltip } from "@mantine/core";
import { useUserFindById } from "../../../hooks/users";
import { principalToString } from "../../../libs/icp";

interface Props {
    id?: Principal;
    size?: string;
    noName?: boolean;
    isWinner?: boolean;
    onClick?: () => void;
};

export const Avatar = (props: Props) => {
    const profile = useUserFindById(props.id);

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
                offset={12} 
                position="bottom-end"
                withBorder
                disabled={!props.isWinner}
            >
                <Avatar_ 
                    color="primary" 
                    radius="xl"
                    size="lg"
                    onClick={props.onClick}
                >
                    {profile.data?.nick.substring(0, 2).toLocaleUpperCase()}
                </Avatar_>
            </Indicator>
        </Tooltip>
    );
};