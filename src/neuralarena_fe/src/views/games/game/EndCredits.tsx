import React from "react";
import { Space, createStyles } from "@mantine/core";
import { GameEndCredits } from "@declarations/neuralarena_be/neuralarena_be.did";

const useStyles = createStyles((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
    },
    title: {
        fontVariant: 'small-caps',
        fontWeight: 'bold',
    },
    line: {
        marginTop: '0.25rem',
        borderTop: '2px solid',
        borderTopColor: theme.colorScheme === 'dark'? '#fff1': '#0001',
        width: '33%',
        maxWidth: '350px',
    },
    people: {
        display: 'flex',
        width: '80%',
        maxWidth: '1200px',
        alignItems: 'flex-end',
    },
    role: {
        flex: '0 0 40%',
        textAlign: 'right',
        overflow: 'hidden',
    },
    empty: {
        flex: '1 1 20%',
    },
    name: {
        flex: '0 0 40%',
        textAlign: 'left',
        overflow: 'hidden',
        fontWeight: 'bold',
    },
}));

interface Props {
    credits?: GameEndCredits;
    level: number,
}

export const EndCredits = (props: Props) => {
    const {classes} = useStyles();
    const {credits, level} = props;

    const fontSize = 2.0 / ((level+1) * 0.75);

    return (
        credits && 
            <div className={classes.container}>
                <div 
                    className={classes.title} 
                    style={{fontSize:`${fontSize}rem`}}
                >
                    {credits.title}
                </div>
                <div className={classes.line}>
                </div>
                {credits.people.map((people, index) => 
                    <div 
                        key={index} 
                        className={classes.people}
                        style={{fontSize:`${fontSize * 0.8}rem`}}
                    >
                        <div className={classes.role}>
                            {people[0]}
                        </div>
                        <div className={classes.empty}>
                        </div>
                        <div className={classes.name}>
                            {people[1]}
                        </div>
                    </div>
                )}
                <Space h={`${fontSize*1.5}rem`} />
                {credits.sub.map((sub, index) => 
                    <EndCredits 
                        key={index} 
                        credits={sub} 
                        level={props.level + 1} 
                    />
                )}
            </div>
    );}
