const commands: {
    [k: string]: {
        command: string;
        callback: (...args: string[]) => void;
        description: string;
    }
} = {};
const gameChatInput = document.getElementById('gcInput');
if (gameChatInput) {
    gameChatInput.addEventListener('keydown', event => {
        if (event.key !== 'Enter') {
            return;
        }
        const args = (event.target as HTMLInputElement).value.trim().split(/\s+/);
        let cmd = args.shift();
        const slash = cmd.substring(0, 1);
        if (slash !== '/') {
            return;
        }
        cmd = cmd.substring(1);
        if (!(cmd in commands)) {
            // @ts-ignore
            gameChat.systemMessage(`command /${cmd} not found`);
            return;
        }
        event.preventDefault();
        commands[cmd]['callback'](...args);
        (event.target as HTMLInputElement).value = '';
    });
}

var AMQ_addCommand = function ({command, callback, description}: typeof commands[string]) {
    commands[command] = {command, callback, description};
};

AMQ_addCommand({
    command: 'help',
    callback: () => {
        for (const commandKey in commands) {
            const command = commands[commandKey];
            // @ts-ignore
            gameChat.systemMessage(`/${command.command}: ${command.description}`);
        }
    },
    'description': 'Displays this help'
});