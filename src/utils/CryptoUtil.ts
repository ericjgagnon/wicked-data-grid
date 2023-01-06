/**
 * @format
 */
function uuidv4(): string {
    return `${1e7}-${1e3}-${4e3}-${8e3}-${1e11}`.replace(/[018]/g, (c) => {
        const digit = Number(c);
        return (
            digit ^
            (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (digit / 4)))
        ).toString(16);
    });
}

export { uuidv4 };
