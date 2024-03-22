import React from "react";
import { Box, Center, createStyles } from "@mantine/core";
import { NftCollectionResponse } from "@declarations/neuralarena_be/neuralarena_be.did";

const useStyles = createStyles((theme) => ({
    soon: {
        fontSize: '4rem'
    },
}));

interface Props {
    col: NftCollectionResponse|undefined;
}

export const NftCollectionMarketplace = (props: Props) => {
    const {classes} = useStyles();

    return (
        <Center className={classes.soon} mt="6rem">
            Soon...
        </Center>
    );
  }