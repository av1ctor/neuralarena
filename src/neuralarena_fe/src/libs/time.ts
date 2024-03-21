import dayjs from "dayjs";

export const timeLeftToString = (
    left: Date
): string => {
    const h = left.getUTCHours().toString().padStart(2, '0');
    const m = left.getUTCMinutes().toString().padStart(2, '0');
    const s = left.getUTCSeconds().toString().padStart(2, '0');

    const d = left.getUTCDate() - 1;

    return `${d > 0? d.toString(): ''} ${h}:${m}:${s}`;
}

export const timeToNow = (
    value: Date | number | bigint | string
): [string, Date] => {
    const date = (value.constructor === Date?
        value:
        value.constructor === Number?
            new Date(value):
                value.constructor === BigInt?
                    new Date(Number(value / 1_000_000n)):
                    Date.parse(value as string)) as Date;

    const now = Date.now();
    const diff = (now - date.valueOf()) / 1_000;
    
    let str = '';
    if(diff < 1) {
        str = 'now';
    }
    if(diff < 60) {
        str = Math.floor(diff) + 's';
    }
    else if(diff < 60 * 60) {
        str = Math.floor(diff / (60)) + 'm';
    }
    else if(diff < 60 * 60 * 24) {
        str = Math.floor(diff / (60 * 60)) + 'h';
    }
    else if(diff < 60 * 60 * 24 * 30) {
        str = Math.ceil(diff / (60 * 60 * 24)) + 'd';
    }
    else {
        const then = dayjs(date);
        const diff = dayjs(now).diff(then, 'month');
        if(diff < 12) {
            str = then.format('MMM DD');
        }
        else {
            str = Math.ceil(diff / 12) + 'y';
        }
    }

    return [str, date];
};

