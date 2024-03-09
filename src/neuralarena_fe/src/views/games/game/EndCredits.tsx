import React from "react";
import { createStyles } from "@mantine/core";
import { GameEndCredits } from "../../../../../declarations/neuralarena_be/neuralarena_be.did";

const useStyles = createStyles((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
    },
    level_0: {
        fontSize: '2rem',
    },
    level_1: {
        fontSize: '1.5rem',
    },
    level_2: {
        fontSize: '1.25rem',
    },
    level_3: {
        fontSize: '1rem',
    },
    level_4: {
        fontSize: '0.75rem',
    },
    title: {
    },
    titleDivider: {
        marginTop: '0.25rem',
        borderTop: '2px solid #fff4',
        width: '33%'
    },
    people: {
        display: 'flex',
        width: '80%',
        alignItems: 'center'
    },
    role: {
        flex: '0 0 50%',
        textAlign: 'center',
        overflow: 'hidden',
    },
    name: {
        flex: '0 0 50%',
        textAlign: 'center',
        overflow: 'hidden',
    },
    divisor: {
        height: '3rem',
    }
}));

interface Props {
    credits?: GameEndCredits;
    level: number,
}

export const EndCredits = (props: Props) => {
    const {classes, cx} = useStyles();
    const {credits, level} = props;

    return (
        credits && 
            <div className={cx(
                classes.container, 
                {
                    [classes.level_0]: level === 0,
                    [classes.level_1]: level === 1,
                    [classes.level_2]: level === 2,
                    [classes.level_3]: level === 3,
                    [classes.level_4]: level === 4,
                }
            )}>
                <div className={classes.title}>
                    {credits.title}
                </div>
                <div className={classes.titleDivider}>
                </div>
                {credits.people.map((people, index) => 
                    <div 
                        key={index} 
                        className={classes.people}
                    >
                        <div className={classes.role}>
                            {people[0]}
                        </div>
                        <div className={classes.name}>
                            {people[1]}
                        </div>
                    </div>
                )}
                <div className={classes.divisor}>
                </div>
                {credits.sub.map((sub, index) => 
                    <EndCredits 
                        key={index} 
                        credits={sub} 
                        level={props.level + 1} 
                    />
                )}
            </div>
    );}
