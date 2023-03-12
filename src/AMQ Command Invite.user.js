// ==UserScript==
// @name         AMQ Command Invite
// @version      0.3
// @description  Adds a command to invite people to your Lobby
// @author       Minigamer42
// @match        https://animemusicquiz.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=animemusicquiz.com
// @require      https://github.com/Minigamer42/scripts/raw/master/lib/commands.js
// @grant        none
// ==/UserScript==
(function () {
    'use strict';

    /** @type {Map<string, string>} */
    let userList = new Map();

    new Listener('all online users', payload => {
        userList = new Map(payload.map(username => [username.toLowerCase(), username]));
    }).bindListener();

    new Listener('online user change', payload => {
        if (payload.online) {
            userList.set(payload.name.toLowerCase(), payload.name);
        } else {
            userList.delete(payload.name.toLowerCase());
        }
    }).bindListener();

    function startTracking() {
        if (!socialTab.allPlayerList.ready) {
            socialTab.allPlayerList.startTracking();
        }
        AllPlayersList.prototype.startTracking = function () {
        };
        AllPlayersList.prototype.stopTracking = function () {
        };
    }

    new Listener('Spectate Game', startTracking).bindListener();
    new Listener('Join Game', startTracking).bindListener();

    function invitePlayer(playerToInvite) {
        if (userList.has(playerToInvite.toLowerCase())) {
            socket.sendCommand({
                type: 'social',
                command: 'invite to game',
                data: {
                    target: userList.get(playerToInvite.toLowerCase())
                }
            });
            gameChat.systemMessage(`Invited '${playerToInvite}' to your lobby.`);
        } else {
            gameChat.systemMessage(`Player '${playerToInvite}' is not online.`);
        }
    }

    AMQ_addCommand({
        command: 'invite',
        callback: invitePlayer,
        description: 'Invite a Player to your room'
    });
})();