import React, { useMemo } from "react";
import { Box, Grid, Text, TextInput } from "@mantine/core";
import { Nas1Token } from "@declarations/nas1_nft/nas1_nft.did";
import { NeuralNetSkill } from "@components/NeuralNetSkill";
import { NeuralNetArch } from "@components/NeuralNetArch";

interface Props {
    skill: string;
    token: Nas1Token;
}

export const NftSkill = ({skill, token}: Props) => {
    const hiddenLayersWeights = useMemo(() => {
        return `[${(token.hidden_layers_weights_size as bigint[] || []).map(s => s.toString()).join(',')}]`;
    }, [token.hidden_layers_weights_size]);

    const [_, params] = useMemo(() => {
        const values = skill.split('#');
        return [
            values[0],
            new Map<string, string>(
                values[1].split('&').map(
                    p => [
                        p.substring(0, p.indexOf('@')), 
                        p.substring(p.indexOf('@')+1)
                    ]
                )
            )
        ];
        
    }, [skill]);

    const numInputLayerNeurons = params.get("in");
    const numOutputLayerNeurons = params.get("out");
    const numHiddenLayersNeurons = new Array((token.hidden_layers_weights_size as bigint[]));
    
    return (
        <Box>
            <Grid>
                <Grid.Col md={12} m={0} pb={0}>
                    <Text size="xs" color="lime">
                        <b>#<NeuralNetSkill skill={skill} /></b>
                    </Text>
                </Grid.Col>
                <Grid.Col md={12} pt={0}>
                    <TextInput
                        label="Input neurons"
                        value={numInputLayerNeurons}
                        size="xs"
                        readOnly
                    />
                </Grid.Col>
                <Grid.Col md={6} pt={0}>
                    <TextInput
                        label="Hidden layers"
                        value={token.num_hidden_layers.toString()}
                        size="xs"
                        readOnly
                    />
                </Grid.Col>
                <Grid.Col md={6} pt={0}>
                    <TextInput
                        label="Neurons on each hidden layer"
                        value={hiddenLayersWeights}
                        size="xs"
                        readOnly
                    />
                </Grid.Col>
                <Grid.Col md={12} pt={0}>
                    <TextInput
                        label="Output neurons"
                        value={numOutputLayerNeurons}
                        size="xs"
                        readOnly
                    />
                </Grid.Col>
            </Grid>
            <Box>
                <NeuralNetArch
                    inp={Number(numInputLayerNeurons)}
                    out={Number(numOutputLayerNeurons)}
                    hidden={numHiddenLayersNeurons.map(s => Number(s))}
                />
            </Box>
        </Box>
    );
};