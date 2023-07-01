"use strict";
function AMQ_addCommand({ command, callback, description }) {
    document.commandHandlerCommands[command] = { command, callback, description };
}
if (!document.commandHandlerCommands) {
    const gameChatInput = document.getElementById('gcInput');
    if (gameChatInput) {
        document.commandHandlerCommands = {};
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
            if (!(cmd in document.commandHandlerCommands)) {
                // @ts-ignore
                // gameChat.systemMessage(`command /${cmd} not found. Send //${cmd} to send the literal string instead.`);
                return;
            }
            event.preventDefault();
            event.target.value = '';
            document.commandHandlerCommands[cmd]['callback'](...args);
        });
        function getArgs(func) {
            return func.toString()
                .replace(/\/\/.*$/mg, '') // strip single-line comments
                .replace(/\s+/g, '') // strip white space
                .replace(/\/[*][^/*]*[*]\//g, '') // strip multi-line comments
                .split('){', 1)[0].replace(/^[^(]*[(]/, '') // extract the parameters
                .replace(/=[^,]+/g, '') // strip any ES6 defaults
                .split(',')
                // .split(/,(?![^{]*})/g)
                .filter(Boolean); // split & filter [""]
        }
        function sendHelp() {
            // @ts-ignore
            gameChat.systemMessage('Command overview:');
            // @ts-ignore
            gameChat.systemMessage('//&lt;command&gt;: send literal \'/&lt;command&gt;\'');
            for (const commandKey in document.commandHandlerCommands) {
                const command = document.commandHandlerCommands[commandKey];
                const args = getArgs(command.callback).reduce((initial, current) => {
                    initial.push(`&lt;${current}&gt;`);
                    return initial;
                }, []);
                // @ts-ignore
                gameChat.systemMessage(`/${command.command}${args.length > 0 ? ` ${args.join(', ')}` : ''}: ${command.description}`);
            }
        }
        AMQ_addCommand({
            command: 'help',
            callback: sendHelp,
            'description': 'Displays this help'
        });
    }
}
