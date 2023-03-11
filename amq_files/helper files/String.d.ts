interface String {
    split<TLimit extends number, TDelimiter extends string>(splitter: { [Symbol.split](string: TDelimiter, limit?: TLimit): string[]; }, limit?: number):
        TDelimiter extends '' ? string[] :
            TLimit extends 0 ? [] :
                [string, ...string[]];
}