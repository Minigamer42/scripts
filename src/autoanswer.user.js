// ==UserScript==
// @name         AMQ Auto Answer
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  try to take over the world!
// @author       mshift20
// @match        https://animemusicquiz.com/
// @icon         https://www.google.com/s2/favicons?domain=animemusicquiz.com
// @updateUrl    https://github.com/Minigamer42/scripts/blob/master/src/autoanswer.user.js
// @downloadUrl  https://github.com/Minigamer42/scripts/blob/master/src/autoanswer.user.js
// @require      https://github.com/Minigamer42/scripts/raw/master/lib/commands.js
// @grant        none
// ==/UserScript==

// Command /autoanswer to toggle it
// Enabled by default

(function () {
    'use strict';

    let enabled = true;

    document.getElementById('qpAnswerInput').addEventListener('input', (event) => {
        let answer = event.target.value || ' ';
        if (enabled) {
            socket.sendCommand({
                type: "quiz",
                command: "quiz answer",
                data: {
                    answer,
                    isPlaying: true,
                    volumeAtMax: false
                }
            });
        }
    });

    function toggleAutoanswer() {
        enabled = !enabled;
        gameChat.systemMessage(`Autoanswer ${enabled ? 'enabled' : 'disabled'}`);
    }

    AMQ_addCommand({
        command: 'autoanswer',
        callback: toggleAutoanswer,
        description: 'Toggle Autoanswer'
    });
})();
