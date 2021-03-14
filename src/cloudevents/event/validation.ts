export const isString = (v: unknown): boolean => typeof v === "string";
export const isObject = (v: unknown): boolean => typeof v === "object";
export const isBuffer = (v: unknown): boolean => v instanceof Buffer;
export const isDefined = (v: unknown): boolean => {
    if (v && typeof v !== "undefined") return true;
    return false;
}

export const isDefinedOrThrow = (v: unknown, t: Error): boolean =>
    isDefined(v)
        ? true
        : (() => {
            throw t;
        })();

export const isBufferOrStringOrObjectOrThrow = (v: unknown, t: Error): boolean =>
    isBuffer(v)
        ? true
        : isString(v)
            ? true
            : isObject(v)
                ? true
                : (() => {
                    throw t;
                })();