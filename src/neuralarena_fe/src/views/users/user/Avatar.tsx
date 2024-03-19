import React from "react";
import { Principal } from "@dfinity/principal";
import { Avatar as Avatar_, Indicator, Tooltip } from "@mantine/core";
import { useUserFindById } from "@hooks/users";
import { principalToString } from "@libs/icp";
import { IconHourglassEmpty, IconX } from "@tabler/icons-react";

interface Props {
    id?: Principal;
    isWinner?: boolean;
    onClick?: () => void;
};

export const Avatar = (props: Props) => {
    const profile = useUserFindById(props.id);

    const title = props.id? 
        `${profile.data?.nick}\n(${principalToString(profile.data?.id)}) ${props.isWinner? '🏆': ''}`:
        'Empty';
    
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
                    style={{'cursor': props.onClick? 'pointer': undefined}}
                    onClick={props.onClick}
                >
                    {props.id? profile.data?.nick.substring(0, 2).toLocaleUpperCase(): <IconX/>}
                </Avatar_>
            </Indicator>
        </Tooltip>
    );
};