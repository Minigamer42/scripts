"use strict";
function AMQ_addCommand({ command, callback, description }) {
    window.commandHandlerCommands[command] = { command, callback, description };
}
if (!window.commandHandlerCommands) {
    const gameChatInput = document.getElementById('gcInput');
    if (gameChatInput) {
        window.commandHandlerCommands = {};
        gameChatInput.addEventListener('keydown', event => {
            if (event.key !== 'Enter' || !(event.target instanceof HTMLTextAreaElement)) {
                return;
            }
            const args = event.target.value.trim().split(/\s+/);
            let cmd = args.shift();
            if (cmd.substring(0, 1) !== '/') {
                return;
            }
            else if (cmd.substring(0, 2) === '//') {
                event.target.value = cmd.substring(1);
                return;
            }
            cmd = cmd.substring(1);
            if (!(cmd in window.commandHandlerCommands)) {
                // @ts-ignore
                // gameChat.systemMessage(`command /${cmd} not found. Send //${cmd} to send the literal string instead.`);
                return;
            }
            event.preventDefault();
            event.target.value = '';
            window.commandHandlerCommands[cmd]['callback'](...args);
        });
    }
    AMQ_addCommand({
        command: 'help',
        callback: () => {
            // @ts-ignore
            gameChat.systemMessage('Command overview:');
            // @ts-ignore
            gameChat.systemMessage('//&lt;command&gt;: send literal \'/&lt;command&gt;\'');
            for (const commandKey in window.commandHandlerCommands) {
                const command = window.commandHandlerCommands[commandKey];
                // @ts-ignore
                gameChat.systemMessage(`/${command.command}: ${command.description}`);
            }
        },
        'description': 'Displays this help'
    });
}
