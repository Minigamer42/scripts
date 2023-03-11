"use strict";
const commands = {};
const gameChatInput = document.getElementById('gcInput');
if (gameChatInput) {
    gameChatInput.addEventListener('keydown', event => {
        if (event.key !== 'Enter') {
            return;
        }
        const args = event.target.value.trim().split(/\s+/);
        const cmd = args.shift().substring(1);
        if (!(cmd in commands)) {
            // @ts-ignore
            gameChat.systemMessage(`command /${cmd} not found`);
            return;
        }
        event.preventDefault();
        commands[cmd]['callback'](...args);
    });
}
var AMQ_addCommand = function ({ command, callback, description }) {
    commands[command] = { command, callback, description };
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
