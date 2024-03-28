import React from "react";
import { NftCollectionResponse } from "@declarations/neuralarena_be/neuralarena_be.did";
import { Grid, TextInput, Textarea, Chip, Group, Input } from "@mantine/core";
import { 
    useIcrc7GetCollectionSupplyCap, 
    useIcrc7GetCollectionSupportedStandards, 
    useIcrc7GetCollectionTotalSupply 
} from "@hooks/icrc7";

interface Props {
    col: NftCollectionResponse|undefined;
}

export const NftCollectionAbout = (props: Props) => {
    const {col} = props;

    const supplyCap = useIcrc7GetCollectionSupplyCap(col?.id);
    const totalSupply = useIcrc7GetCollectionTotalSupply(col?.id);
    const standards = useIcrc7GetCollectionSupportedStandards(col?.id);

    return (
        <Grid>
            <Grid.Col md={6}>
                <TextInput
                    label="Id/Canister id"
                    value={col?.id.toString() || ''}
                    readOnly
                />
            </Grid.Col>

            <Grid.Col md={6}>
                <TextInput
                    label="Asset canister id"
                    value={col?.meta.nas1.assets_canister_id.toString() || ''}
                    readOnly
                />
            </Grid.Col>

            <Grid.Col md={12}>
                <Input.Wrapper label="Supported standards">
                    <Chip.Group>
                        <Group>
                            {standards.data?.map((std, index) => 
                                <Chip key={index} readOnly>
                                    {std.name}
                                </Chip>
                            )}
                        </Group>
                    </Chip.Group>
                </Input.Wrapper>
            </Grid.Col>

            <Grid.Col md={6}>
                <TextInput
                    label="Supply cap"
                    value={supplyCap.data?.toString() || ''}
                    readOnly
                />
            </Grid.Col>

            <Grid.Col md={6}>
                <TextInput
                    label="Total supply"
                    value={totalSupply.data?.toString() || ''}
                    readOnly
                />
            </Grid.Col>

            <Grid.Col md={6}>
                <TextInput
                    label="Name"
                    value={col?.meta.name || ''}
                    readOnly
                />
            </Grid.Col>

            <Grid.Col md={6}>
                <TextInput
                    label="Version"
                    value={col?.meta.nas1.version.toFixed(2) || ''}
                    readOnly
                />
            </Grid.Col>

            <Grid.Col md={12}>
                <Textarea
                    label="Description"
                    value={col?.meta.desc || ''}
                    minRows={6}
                    readOnly
                />
            </Grid.Col>

            <Grid.Col md={12}>
                <Input.Wrapper label="Trained skills">
                    <Chip.Group>
                        <Group>
                            {col?.meta.nas1.skills.map((skill, index) => 
                                <Chip key={index} readOnly>
                                    {skill}
                                </Chip>
                            )}
                        </Group>
                    </Chip.Group>
                </Input.Wrapper>
            </Grid.Col>

            <Grid.Col md={12}>
                <Input.Wrapper label="Supported animations">
                    <Chip.Group>
                        <Group>
                            {col?.meta.nas1.animations.map((anim, index) => 
                                <Chip key={index} readOnly>
                                    {anim}
                                </Chip>
                            )}
                        </Group>
                    </Chip.Group>
                </Input.Wrapper>
            </Grid.Col>
        </Grid>
    )
};