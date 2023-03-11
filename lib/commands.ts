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

var AMQ_addCommand = function ({command, callback, description}: typeof commands[string]) {
    commands[command] = {command, callback, description};
};
