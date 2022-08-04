// ==UserScript==
// @name         amq song history (with localStorage)
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  try to take over the world!
// @author       Minigamer42
// @match        https://animemusicquiz.com/*
// @downloadURL  https://raw.githubusercontent.com/Minigamer42/scripts/master/src/amq%20song%20history%20(with%20localStorage).js
// @updateURL    https://raw.githubusercontent.com/Minigamer42/scripts/master/src/amq%20song%20history%20(with%20localStorage).js
// @grant        none
// ==/UserScript==

const infoDiv = document.createElement('div');
infoDiv.className = "rowPlayCount";

if (window.quiz) {
    setup();
}

function setup() {
    let boxDiv = document.querySelector('div.qpSideContainer > div.row').parentElement;
    boxDiv.insertBefore(infoDiv, boxDiv.children[4]);

    if (!localStorage.getItem('songHistory')) {
        localStorage.setItem('songHistory', '{}');
    }
    const l = new Listener("answer results");
    l.callback = async (data) => {
        const webm = data.songInfo.urlMap?.catbox?.[720]?.match(/https:\/\/files\.catbox\.moe\/(\w{6})/)?.[1] ?? data.songInfo.urlMap?.catbox?.[480]?.match(/https:\/\/files\.catbox\.moe\/(\w{6})/)?.[1];
        if (!webm) {
            infoDiv.innerHTML = '';
            return;
        }

        const songHistory = JSON.parse(localStorage.getItem('songHistory'));
        const current = songHistory[webm] ?? {count: 0, correctCount: 0.0, spectatorCount: 0, lastPlayed: 0};
        const isCorrect = data.players.find(player => player.gamePlayerId === quiz.ownGamePlayerId)?.correct;
        localStorage.setItem('songHistory', JSON.stringify({
            ...songHistory,
            [webm]: {
                count: current.count + 1,
                correctCount: +isCorrect + current.correctCount,
                spectatorCount: +quiz.isSpectator + current.spectatorCount,
                lastPlayed: Date.now()
            }
        }));

        if (current.count === 0) {
            infoDiv.innerHTML = '';
            return;
        }

        let s = current.count > 1 ? "s" : "";
        let correctRatio = current.correctCount / (current.count - current.spectatorCount);
        infoDiv.innerHTML = `Played <b>${current.count} time${s}</b>`;
        infoDiv.innerHTML += `<br>Previous answer rate: <b>${current.correctCount}/${current.count} (+ ${current.spectatorCount} in spec)</b> (${(correctRatio * 100).toFixed(2)}%)`;
        infoDiv.innerHTML += `<br>Last played <b>${timeAgo(current.lastPlayed)}</b>`;
    };
    l.bindListener();
}

function timeAgo(time) {
    if (time === 0) {
        return 'never';
    }
    switch (typeof time) {
        case 'number':
            break;
        case 'string':
            time = +new Date(time);
            break;
        case 'object':
            if (time.constructor === Date) time = time.getTime();
            break;
        default:
            time = +new Date();
    }
    const time_formats = [
        [60, 'seconds', 1], // 60
        [120, '1 minute ago', '1 minute from now'], // 60*2
        [3600, 'minutes', 60], // 60*60, 60
        [7200, '1 hour ago', '1 hour from now'], // 60*60*2
        [86400, 'hours', 3600], // 60*60*24, 60*60
        [172800, 'Yesterday', 'Tomorrow'], // 60*60*24*2
        [604800, 'days', 86400], // 60*60*24*7, 60*60*24
        [1209600, 'Last week', 'Next week'], // 60*60*24*7*4*2
        [2419200, 'weeks', 604800], // 60*60*24*7*4, 60*60*24*7
        [4838400, 'Last month', 'Next month'], // 60*60*24*7*4*2
        [29030400, 'months', 2419200], // 60*60*24*7*4*12, 60*60*24*7*4
        [58060800, 'Last year', 'Next year'], // 60*60*24*7*4*12*2
        [2903040000, 'years', 29030400], // 60*60*24*7*4*12*100, 60*60*24*7*4*12
        [5806080000, 'Last century', 'Next century'], // 60*60*24*7*4*12*100*2
        [58060800000, 'centuries', 2903040000] // 60*60*24*7*4*12*100*20, 60*60*24*7*4*12*100
    ];
    let seconds = (+new Date() - time) / 1000,
        token = 'ago',
        list_choice = 1;

    if (seconds === 0) {
        return 'Just now';
    }
    if (seconds < 0) {
        seconds = Math.abs(seconds);
        token = 'from now';
        list_choice = 2;
    }
    let i = 0, format;
    while (format = time_formats[i++]) {
        if (seconds < format[0]) {
            if (typeof format[2] == 'string') {
                return format[list_choice];
            } else {
                return Math.floor(seconds / format[2]) + ' ' + format[1] + ' ' + token;
            }
        }
    }
    return time;
}