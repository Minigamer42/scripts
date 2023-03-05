declare class Listener<T extends keyof ListenerCommandParamMap | string> {
    public bound: boolean;
    public command: T;
    public callback: (payload: T extends keyof ListenerCommandParamMap ? ListenerCommandParamMap[T] : any) => void;

    constructor(command: T, callback?: (payload: T extends keyof ListenerCommandParamMap ? ListenerCommandParamMap[T] : any) => void);

    fire(payload: T extends keyof ListenerCommandParamMap ? ListenerCommandParamMap[T] : unknown): void;

    bindListener(): void;

    unbindListener(): void;
}