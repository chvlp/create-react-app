
export const intToCurrency = (x: number): string => {
    return x.toLocaleString("en-US", {maximumFractionDigits: 0});
};

export const inToCurrentFloat = (x: number): string => {
    return x.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2});
};
