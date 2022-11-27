"use strict";

/*exported roomBrowser*/

function RoomBrowser() {
    this.$view = $("#roomBrowserPage");
    this.$roomContainer = $("#rbRoomContainer");
    this.$roomHider = $("#rbRoomHider");

    this.$totalRoomCount = $("#rbTotalGameCount");
    this.$shownRoomCount = $("#rbShowGameCount");

    this.activeRooms = {};
    this.joinGameListner;
    this.hostListner;
    this.spectateGameListner;

    this.numberOfRooms = 0;

    //LISTENERS
    this._roomListner = new Listener("New Rooms", function (rooms) {
        rooms.forEach(room => {
            this.numberOfRooms++;
            this.activeRooms[room.id] = new RoomTile(room.settings, room.host, room.hostAvatar, room.id, room.numberOfPlayers, room.numberOfSpectators, room.players, room.inLobby, this, room.songLeft, false, this.$roomHider);
        });
        this.updateNumberOfRoomsText();

    }.bind(this));

}

RoomBrowser.prototype.setup = function () {
    this.$roomHider.perfectScrollbar({
        suppressScrollX: true
    });
};

RoomBrowser.prototype.closeView = function () {
    this.$view.addClass("hidden");
    roomFilter.reset();
    //Remove all listnters
    this._roomListner.unbindListener();
    socket.sendCommand({
        type: 'roombrowser',
        command: 'remove roombrowser listners'
    });
    //Remove all tiles
    for (let key in this.activeRooms) {
        if (this.activeRooms.hasOwnProperty(key)) {
            this.activeRooms[key].delete();
        }
    }
};

RoomBrowser.prototype.openView = function (callback) {
    this._roomListner.bindListener();

    //Request all active room
    socket.sendCommand({
        type: "roombrowser",
        command: "get rooms"
    });
    this.$view.removeClass("hidden");
    this.$roomHider.perfectScrollbar('update');
    $(".sliderInput").slider('relayout');
    hostModal.reset();
    callback();
};

RoomBrowser.prototype.openHostModal = function () {
    if (guestRegistrationController.isGuest) {
        displayMessage('Unavailable for Guess Accounts', 'Guest accounts are not able to create multiplayer games');
    } else {
        hostModal.setModeHostGame();
        hostModal.show();
    }
};

RoomBrowser.prototype.host = function () {
    let settings = hostModal.getSettings();
    if (!settings) {
        return;
    }

    if (this.hostListner) {
        this.hostListner.unbindListener();
    }
    this.hostListner = new Listener("Host Game", function (response) {
        hostModal.hide();
        lobby.setupLobby(response, false);
        viewChanger.changeView("lobby");
        if (this.hostListner) {
            this.hostListner.unbindListener();
        }
    }.bind(this));

    this.hostListner.bindListener();

    let command = hostModal.soloMode ? "host solo room" : "host room";

    socket.sendCommand({
        type: 'roombrowser',
        command: command,
        data: settings
    });
};

RoomBrowser.prototype.appendRoomTile = function (tileHtml) {
    this.$roomContainer.append(tileHtml);
};

RoomBrowser.prototype.removeRoomTile = function (tileId) {
    $("#rbRoom-" + tileId).remove();
    delete this.activeRooms[tileId];
    this.numberOfRooms--;
    this.updateNumberOfRoomsText();
};

RoomBrowser.prototype.updateNumberOfRoomsText = function () {
    this.$totalRoomCount.text(this.numberOfRooms);

    let shownRoomCount = $("#rbRoomContainer > .rbRoom:not(.hidden)").length;

    this.$shownRoomCount.text(shownRoomCount);
};

RoomBrowser.prototype.applyTileFilter = function () {
    for (let key in this.activeRooms) {
        if (this.activeRooms.hasOwnProperty(key)) {
            this.applyTileFilterToRoom(this.activeRooms[key]);
        }
    }

};

RoomBrowser.prototype.applyTileFilterToRoom = function (room) {
    if (roomFilter.testRoom(room)) {
        room.setHidden(false);
    } else {
        room.setHidden(true);
    }

    this.updateNumberOfRoomsText();
};

RoomBrowser.prototype.notifyFriendChange = function () {
    for (let key in this.activeRooms) {
        if (this.activeRooms.hasOwnProperty(key)) {
            this.activeRooms[key].updateFriends();
        }
    }
};

RoomBrowser.prototype.fireJoinLobby = function (gameId, password) {
    if (this.joinGameListner) {
        this.joinGameListner.unbindListener();
    }
    this.joinGameListner = new Listener("Join Game", function (response) {
        if (response.error) {
            displayMessage(response.errorMsg);
        } else {
            this.joinLobby(response, false);
        }
        if (this.joinGameListner) {
            this.joinGameListner.unbindListener();
        }
    }.bind(this));

    this.joinGameListner.bindListener();

    socket.sendCommand({
        type: "roombrowser",
        command: "join game",
        data: {
            gameId: gameId,
            password: password
        }
    });
};

RoomBrowser.prototype.spectateGameWithPassword = function (gameId) {
    swal({
        title: "Password Required",
        input: "password",
        showCancelButton: true,
        confirmButtonText: "Spectate",
        inputAttributes: {
            maxlength: 50,
            minlength: 1
        }
    }).then(
        (result) => {
            if (!result.dismiss) {
                this.fireSpectateGame(gameId, result.value);
            }
        },
        () => {
        }
    );
};

RoomBrowser.prototype.fireSpectateGame = function (gameId, password, gameInvite) {
    if (this.spectateGameListner) {
        this.spectateGameListner.unbindListener();
    }
    this.spectateGameListner = new Listener("Spectate Game", function (response) {
        if (response.error) {
            displayMessage(response.errorMsg);
        } else {
            if (response.inLobby) {
                this.joinLobby(response, true);
            } else {
                this.joinGame(response);
            }
        }
        if (this.spectateGameListner) {
            this.spectateGameListner.unbindListener();
        }
    }.bind(this));

    this.spectateGameListner.bindListener();

    socket.sendCommand({
        type: "roombrowser",
        command: "spectate game",
        data: {
            gameId: gameId,
            password: password,
            gameInvite: gameInvite
        }
    });
};

RoomBrowser.prototype.joinLobby = function (data, isSpectator) {
    lobby.setupLobby(data, isSpectator);
    data.spectators.forEach((spectator) => {
        gameChat.addSpectator(spectator, data.hostName === spectator.name);
    });
    viewChanger.changeView("lobby");
};

RoomBrowser.prototype.joinGame = function (data) {
    data.spectators.forEach((spectator) => {
        gameChat.addSpectator(spectator, data.hostName === spectator.name);
    });

    data.inQueue.forEach(playerName => {
        gameChat.addPlayerToQueue(playerName);
    });

    if (data.quizState.state === quiz.QUIZ_STATES.BATTLE_ROYAL) {
        battleRoyal.setupGame(data.quizState.players, true, data.settings, data.quizState.timeLeft, data.quizState.mapState);
        viewChanger.changeView("battleRoyal");
    } else {
        quiz.setupQuiz(data.quizState.players, true, data.quizState, data.settings, false, data.quizState.groupSlotMap);
        viewChanger.changeView("quiz");
    }
};


var roomBrowser = new RoomBrowser();