import React from "react";
import { useMemo } from "react";

interface Props {
    skill: string;
}

export const NeuralNetSkill = ({skill}: Props) => {
    const [name, params] = useMemo(() => {
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
    
    return (
        <span>{name} <small>(in:{numInputLayerNeurons}, out:{numOutputLayerNeurons})</small></span>
    );
};