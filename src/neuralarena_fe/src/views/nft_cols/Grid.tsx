import { NftCollectionResponse } from "@declarations/neuralarena_be/neuralarena_be.did";
import { Grid } from "@mantine/core";
import React from "react";
import { NftCollectionCard } from "./Collection/Card";

interface Props {
    cols: NftCollectionResponse[]|undefined;
}

export const NftCollectionGrid = (props: Props) => {
    const {cols} = props;

    return (
        <Grid>
            {cols?.map((item, index) => (
                <Grid.Col 
                    key={index} 
                    sm={12}
                >
                    <NftCollectionCard 
                        col={item}
                    />
                </Grid.Col>
        ))}
        </Grid>
    );
}