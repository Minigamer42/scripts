// ==UserScript==
// @name         AMQ Auto Answer
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       mshift20
// @match        https://animemusicquiz.com/
// @icon         https://www.google.com/s2/favicons?domain=animemusicquiz.com
// @updateUrl    https://github.com/Minigamer42/scripts/blob/master/src/autoanswer.user.js
// @downloadUrl  https://github.com/Minigamer42/scripts/blob/master/src/autoanswer.user.js
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

    document.getElementById("gcInput").addEventListener('keydown', (event) => {
        const commandPrefix = '/';

        if (event.which !== 13) return;
        if (!event.target.value.trim().startsWith(commandPrefix)) return;

        const args = event.target.value.trim().split(/\s+/);
        const command = args[0].substring(commandPrefix.length);

        if (command === 'autoanswer') {
            event.preventDefault();
            event.target.value = '';

            enabled = !enabled;
        }
    });
})();
