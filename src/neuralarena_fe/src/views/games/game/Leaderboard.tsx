import React from "react";
import { GameId } from "@libs/games";
import { useGameGetLeaderboard } from "@hooks/games";
import { Table } from "@mantine/core";
import { principalToString } from "@libs/icp";

interface Props {
    id: GameId|undefined;
}

export const GameLeaderboard = (props: Props) => {
    const query = useGameGetLeaderboard(props.id, 20);
    
    return (
        <Table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Player</th>
                    <th>Score</th>
                </tr>
            </thead>
            <tbody>
                {query.data?.map((e, index) =>
                    <tr key={index}>
                        <td>
                            <b>{1+index}</b>
                        </td>
                        <td>
                            {principalToString(e[0])}
                        </td>
                        <td>
                            {e[1].toFixed(2)}
                        </td>
                    </tr>
                )}
            </tbody>
        </Table>
    );
};