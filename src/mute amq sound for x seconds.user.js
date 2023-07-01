// ==UserScript==
// @name         AMQ Mute sound for x seconds
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  try to take over the world!
// @author       Minigamer42
// @match        https://animemusicquiz.com/*
// @updateUrl    https://github.com/Minigamer42/scripts/raw/master/src/mute%20amq%20sound%20for%20x%20seconds.user.js
// @downloadUrl  https://github.com/Minigamer42/scripts/raw/master/src/mute%20amq%20sound%20for%20x%20seconds.user.js
// @require      https://github.com/Minigamer42/scripts/raw/master/lib/commands.js
// @grant        none
// ==/UserScript==

let time = -1;
let answerInput = document.getElementById('qpAnswerInput');

function setup() {
    new MutationObserver((mutationRecord, mutationObserver) => {
        if (mutationRecord[0].target.hasAttribute('disabled')) return;

        if (time == -1) return;

        volumeController.setMuted(true);
        volumeController.adjustVolume();

        setTimeout(() => {
            volumeController.setMuted(false);
            volumeController.adjustVolume();
        }, time * 1000);
    }).observe(answerInput, {attributes: true});

    function muteSoundConfig(newTime) {
        time = newTime;
    }

    AMQ_addCommand({
        command: 'mutesound',
        callback: muteSoundConfig,
        description: 'Mute sound for x seconds in guessing phase'
    });
}

if (answerInput) {
    setup();
}
