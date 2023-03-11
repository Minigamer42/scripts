declare const commands: {
    [k: string]: {
        command: string;
        callback: (...args: string[]) => void;
        description: string;
    };
};
declare const gameChatInput: HTMLElement | null;
declare var AMQ_addCommand: ({ command, callback, description }: (typeof commands)[string]) => void;
