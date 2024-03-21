import React from 'react';
import { timeToNow } from '@libs/time';

interface Props {
    date: Date | number | bigint | string;
};

const TimeFromNow = (props: Props) => {
    const [str, date] = timeToNow(props.date);

    return <span title={date.toLocaleString()}>{str}</span>;
}

export default TimeFromNow;