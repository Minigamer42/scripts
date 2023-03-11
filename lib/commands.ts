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
        if (event.key !== 'Enter' || !(event.target instanceof HTMLTextAreaElement)) {
            return;
        }
        const args = event.target.value.trim().split(/\s+/);
        let cmd = args.shift();
        if (cmd.substring(0, 1) !== '/') {
            return;
        } else if (cmd.substring(0, 2) === '//') {
            event.target.value = cmd.substring(1);
            return;
        }

        event.preventDefault();
        event.target.value = '';

        cmd = cmd.substring(1);
        if (!(cmd in commands)) {
            // @ts-ignore
            gameChat.systemMessage(`command /${cmd} not found. Send //${cmd} to send the literal string instead.`);
            return;
        }

        commands[cmd]['callback'](...args);
    });
}

var AMQ_addCommand = function ({command, callback, description}: typeof commands[string]) {
    commands[command] = {command, callback, description};
};

AMQ_addCommand({
    command: 'help',
    callback: () => {
        // @ts-ignore
        gameChat.systemMessage('Command overview:');
        // @ts-ignore
        gameChat.systemMessage('//&lt;command&gt;: send literal \'/&lt;command&gt;\'');
        for (const commandKey in commands) {
            const command = commands[commandKey];
            // @ts-ignore
            gameChat.systemMessage(`/${command.command}: ${command.description}`);
        }
    },
    'description': 'Displays this help'
});