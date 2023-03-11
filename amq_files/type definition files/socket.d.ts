
type SocketActions =
    'beforeunload'
    | 'command'
    | 'disconnect'
    | 'reconnect'
    | 'reconnect_attempt'
    | 'reconnect_failed';

declare class Socket {
    private _socket: {
        on: (action: SocketActions, cb: (payload: any) => {}) => void
    };
    private listners: Record<keyof ListenerCommandParamMap, Listener<keyof ListenerCommandParamMap>>;
    private _disconnected: boolean;
    private _sessionId: string;
    private _attempReconect: boolean;
    setup: () => void;
    addListerner: (command: keyof ListenerCommandParamMap, listner: Listener<keyof ListenerCommandParamMap>) => void;
    removeListener: (command: keyof ListenerCommandParamMap, listner: Listener<keyof ListenerCommandParamMap>) => void;
    sendCommand: (content: {
        type: string,
        command: Lowercase<keyof ListenerCommandParamMap>,
        data?: object
    }, responseHandler?: any) => void;

    constructor();
}
