import React from "react";
import { GameId } from "@libs/games";
import { useGameGetLeaderboard } from "@hooks/games";
import { Table, createStyles } from "@mantine/core";
import { principalToString } from "@libs/icp";

const useStyles = createStyles((theme) => ({
    table: {
        'thead tr th': {
            fontSize: '1.25rem',
        },
        'tbody tr td': {
            fontSize: '1rem',
        },
    },
}));

interface Props {
    id: GameId|undefined;
}

export const GameLeaderboard = (props: Props) => {
    const {classes} = useStyles();
    const query = useGameGetLeaderboard(props.id, 20);
    
    return (
        <Table className={classes.table}>
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