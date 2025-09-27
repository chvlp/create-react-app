import dayjs from 'dayjs';
import 'dayjs/locale/th';

export const toDateThai = (date: Date | string): string => {
    if (!date) return ''
    const dayjsDate = dayjs(date).locale('th');
    const day = dayjsDate.format('D');
    const month = dayjsDate.format('MMMM');
    const buddhistYear = (dayjsDate.year() + 543).toString();
    return `${day} ${month} ${buddhistYear}`;
};

export const toDateTimeThai = (date: Date | string): string => {
    if (!date) return '';
    const dayjsDate = dayjs(date).locale("th");
    const day = dayjsDate.format("D");
    const month = dayjsDate.format("MMMM");
    const buddhistYear = (dayjsDate.year() + 543).toString();
    const time = dayjsDate.format("hh:mm A");

    return `${day} ${month} ${buddhistYear} ${time}`;
};

export const toDateToDate = (date: Date | string): string => {
    const dayjsDate = dayjs(date)

    const day = dayjsDate.format('D');
    const month = dayjsDate.format('MMMM');
    const buddhistYear = (dayjsDate.year() - 5432).toString();

    return `${buddhistYear}-${month}-${day}`;
};

export const stringToInt = (x: string): number => {
    const coin = parseInt(x, 10);
    return coin ?? 0
}
export const currencyToInt = (x: string): number => {
    const coin = parseInt(x.replace(/,/g, ""), 10);
    return coin ?? 0
}
export const intToCurrency = (x: number): string => {
    return x.toLocaleString("en-US", {maximumFractionDigits: 0});
};

export const inToCurrentFloat = (x: number): string => {
    return x.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2});
};
export type actionMode = 'add' | 'edit' | 'view' | 'delete';