interface Window {
    commandHandlerCommands: {
        [command: string]: {
            command: string;
            callback: (...args: string[]) => void;
            description: string;
        };
    };
}
declare function AMQ_addCommand({ command, callback, description }: typeof window.commandHandlerCommands[string]): void;
