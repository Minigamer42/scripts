// ==UserScript==
// @name         AMQ Mute Button Buzzer / Stunar Edition
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  try to take over the world!
// @author       Minigamer42
// @match        https://animemusicquiz.com/*
// @updateUrl    https://github.com/Minigamer42/scripts/raw/master/src/AMQ%20Mute%20Button%20Buzzer%20-%20Stunar%20Edition.user.js
// @downloadUrl  https://github.com/Minigamer42/scripts/raw/master/src/AMQ%20Mute%20Button%20Buzzer%20-%20Stunar%20Edition.user.js
// @grant        none
// ==/UserScript==

const answerInput = document.getElementById('qpAnswerInput');
const command = 'mb';
let standardTime = -1;
let time = -1;
let max = 5;
let tour = false;
let verbose = false;
let muted = false;
let timeout = null;

function setTime(newTime, standard) {
    time = newTime;
    if (time < 1) {
        time = -1;
    } else if (time > max) {
        time = max;
    }
    time = +time;
    if (standard) {
        standardTime = time;
    }
}

function sendChatMessage(message, force) {
    if (!verbose && !force) {
        gameChat.systemMessage(message);
        return;
    }
    socket.sendCommand({
        type: "lobby",
        command: "game chat message",
        data: {
            msg: message,
            teamMessage: false
        }
    });
}

const oldAdjustVolume = VolumeController.prototype.adjustVolume;
VolumeController.prototype.adjustVolume = function () {
    if (!this.muted && muted && !quiz.isSpectator) {
        setTime(time + 2);
        sendChatMessage(`Player unmuted.` + (tour ? ` Current unmuted time set to ${time}s` : ''), true);
        muted = false;
    }
    oldAdjustVolume.bind(this)();
};

function setup() {
    const answerResultsListener = new Listener('answer results', payload => {
        if (!tour || time <= 0) return;

        const selfCorrect = payload.players.find(player => +player.gamePlayerId === +quiz.ownGamePlayerId).correct;

        for (const {gamePlayerId, correct} of payload.players) {
            // ignore self
            if (+gamePlayerId === +quiz.ownGamePlayerId) {
                continue;
            }

            // team members
            if (quiz.teamMode && +quiz.players[quiz.ownGamePlayerId].teamNumber === +quiz.players[gamePlayerId].teamNumber) {
                continue;
            }

            // players with the same "correct state"
            if (selfCorrect === correct) {
                continue;
            }

            // disconnected players
            if (quiz.players[gamePlayerId].avatarSlot.disabled) {
                continue;
            }

            if (selfCorrect) {
                setTime(time - 1);
                if (time < 1) {
                    sendChatMessage(quiz.players[quiz.ownGamePlayerId].name + ' wins', true);
                } else {
                    sendChatMessage(`Correct answer. Current unmuted time set to ${time}s`, time === 1);
                }
            } else {
                setTime(time + 1);
                sendChatMessage(`Incorrect answer. Current unmuted time set to ${time}s`);
            }
            break;
        }

        muted = false;
        volumeController.setMuted(false);
        volumeController.adjustVolume();
    });
    answerResultsListener.bindListener();

    const playNextSongListener = new Listener('play next song', () => {
        clearTimeout(timeout);
        muted = false;
        if (time < 0) return;

        volumeController.setMuted(false);
        volumeController.adjustVolume();

        timeout = setTimeout(() => {
            muted = true;
            volumeController.setMuted(true);
            volumeController.adjustVolume();
        }, time * 1000);
    });
    playNextSongListener.bindListener();

    const gameChatUpdateListener = new Listener('game chat update', payload => {
        if (!quiz.teamMode) {
            return;
        }
        payload.messages.forEach(message => {
            if (!message.message.startsWith('Player unmuted. Current unmuted time set to ')) {
                return;
            }
            for (const gamePlayerId in quiz.players) {
                if (+gamePlayerId === +quiz.ownGamePlayerId) {
                    continue;
                }
                if (quiz.players[gamePlayerId].name !== message.sender) {
                    continue;
                }
                if (+quiz.players[quiz.ownGamePlayerId].teamNumber !== +quiz.players[gamePlayerId].teamNumber) {
                    continue;
                }

                setTime(time + 2);
                gameChat.systemMessage(`Team member unmuted. Current unmuted time set to ${time}s`);
            }
        });
    });
    gameChatUpdateListener.bindListener();

    const gameStartingListener = new Listener('quiz over', () => {
        time = standardTime;
        if (time > 0) {
            sendChatMessage(`Enabled Stunar Mode with settings: ${time}s unmuted, ${max}s max`, true);
        }
    });
    gameStartingListener.bindListener();

    const gameChatInput = document.getElementById("gcInput");
    gameChatInput.addEventListener("keydown", event => {
        if (event.key === 'Enter') {
            const str = event.target.value;
            if (str.startsWith("/")) {
                const args = str.substring(1).trim().split(/\s+/);
                const cmd = args.shift();
                if (cmd === 'mb') {
                    if (args[0] === 'stunar' || args[0] === 'tour') {
                        let success = false;
                        let newTime;
                        let newMax;
                        if (args[1] < 0) {
                            gameChat.systemMessage(`Please set the first parameter to a value > 0.`);
                        } else if (args[1]) {
                            if (args[2] && args[2] < args[1]) {
                                gameChat.systemMessage(`Please enter a max value above your starting value.`);
                            } else {
                                success = true;
                                newTime = args[1];
                                if (args[2]) {
                                    newMax = parseInt(args[2]);
                                }
                            }
                        } else {
                            success = true;
                            newTime = 3;
                        }
                        if (success) {
                            tour = true;
                            if (newTime) {
                                setTime(newTime, true);
                            }
                            if (newMax) {
                                max = newMax;
                            }
                            sendChatMessage(`Enabled Stunar Mode with settings: ${time}s unmuted, ${max}s max`, true);
                        }
                    } else if (args[0] === 'verbose') {
                        verbose = !verbose;
                        gameChat.systemMessage('Verbose mode ' + (verbose ? 'enabled' : 'disabled'));
                        sendChatMessage('Verbose mode enabled');
                    } else {
                        if (tour) {
                            sendChatMessage('Disabled Stunar Mode', true);
                        }
                        tour = false;
                        time = args[1] ? +args[1] : -1;
                    }
                    event.target.value = "";
                    event.preventDefault();
                }
            }
        }
    });
}

if (answerInput) {
    setup();
}
