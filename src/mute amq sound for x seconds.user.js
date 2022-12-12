// ==UserScript==
// @name         mute amq sound for x seconds
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       Minigamer42
// @match        https://animemusicquiz.com/*
// @grant        none
// ==/UserScript==

let command = '/mutesound';
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

    const gameChatInput = document.getElementById("gcInput");
    let keydownFunction = (event) => {
        if (event.which !== 13) {
            return;
        }

        if (event.target.value.startsWith(command)) {
            time = event.target.value.substring(command.length + 1);
            event.target.value = "";
            event.preventDefault();
        }
    };
    gameChatInput.addEventListener("keydown", keydownFunction);
}

if (answerInput) {
    setup();
}