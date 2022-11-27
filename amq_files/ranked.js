'use strict';

/*exported ranked*/

class Ranked {
    constructor() {
        this.$button = $("#mpRankedButton");
        this.$buttonStateMessage = $("#mpRankedButton > h3");
        this.$buttonStatusText = $("#mpRankedButton > h3");
        this.$buttonRankedTimer = $("#mpRankedTimer");
        this.$buttonTimerSerie = $("#mpRankedTimer > h3");
        this.$buttonTimer = $("#mpRankedTimer > h4");
        this.$descriptionButton = $("#mpRankedDescriptionButton");
        this.$descriptionModal = $("#rankedDescriptionModal");
        this.timers = {};
        this.currentTimerId;

        this.$descriptionButton.click((event) => {
            this.$descriptionModal.modal('show');
            event.stopPropagation();
        });

        this._stateChangeListener = new Listener('ranked game state change', (payload) => {
            this.updateState(payload.state, payload.serieId);
        });
    }

    setup(state, serieId) {
        Object.keys(this.GAME_SERIES_IDS).forEach(serieName => {
            let seriesId = this.GAME_SERIES_IDS[serieName];
            this.timers[seriesId] = new RankedTimer(this.$buttonTimer, this.$buttonTimerSerie, this.GAME_HOST_TIME_OBJECT, this.GAME_TIME_ZONES[seriesId], this.GAME_SERIES_SYMBOL[seriesId]);
        });
        this.showNextTimer();
        this.updateState(state, serieId);

        this._stateChangeListener.bindListener();
    }

    updateState(state, serieId) {
        this.$buttonStateMessage.text(this.STATE_MESSAGES[state]);
        Object.values(this.timers).forEach(timer => {
            timer.breakMode = state === this.RANKED_STATE_IDS.BREAK_DAY;
        });
        if (state === this.RANKED_STATE_IDS.OFFLINE || state === this.RANKED_STATE_IDS.CHAMP_OFFLINE || state === this.RANKED_STATE_IDS.BREAK_DAY) {
            this.$button.addClass('off');
            this.$button.off("click");
        } else {
            this.$button.removeClass('off');
            this.$button.off("click");

            if (state !== this.RANKED_STATE_IDS.RUNNING && state !== this.RANKED_STATE_IDS.CHAMP_RUNNING) {
                this.$button.click(() => {
                    if (guestRegistrationController.isGuest) {
                        displayMessage(
                            "Unavailable for Guest Accounts",
                            "Ranked matches are unavailable for guest accounts"
                        );
                        return;
                    }
                    let joinGameListner, spectateGameListner;
                    joinGameListner = new Listener("Join Game", function (response) {
                        if (response.error) {
                            displayMessage(response.errorMsg);
                        } else {
                            lobby.setupLobby(response);
                            response.spectators.forEach((spectator) => {
                                gameChat.addSpectator(spectator);
                            });
                            viewChanger.changeView("lobby");
                            if (tutorial.state.rankedCompleted) {
                                displayMessage("Ranked Rules", "By playing ranked, you agree that you won't share hints or answers with other players, or use any tool, method or software that grants you an unfair advantage.");
                            } else {
                                lobby.showRules();
                            }
                        }
                        joinGameListner.unbindListener();
                        spectateGameListner.unbindListener();
                    }.bind(this));
                    joinGameListner.bindListener();
                    spectateGameListner = new Listener("Spectate Game", function (response) {
                        if (response.error) {
                            displayMessage(response.errorMsg);
                        } else {
                            roomBrowser.joinLobby(response, true);
                        }
                        spectateGameListner.unbindListener();
                        joinGameListner.unbindListener();
                    }.bind(this));
                    spectateGameListner.bindListener();

                    socket.sendCommand({
                        type: "roombrowser",
                        command: "join ranked game"
                    });
                });
                this.showNextTimer();
            } else {
                this.$button.click(() => {
                    if (guestRegistrationController.isGuest) {
                        displayMessage(
                            "Unavailable for Guest Accounts",
                            "Ranked matches are unavailable for guest accounts"
                        );
                        return;
                    }
                    let joinGameListner, spectateGameListner;
                    spectateGameListner = new Listener("Spectate Game", function (response) {
                        if (response.error) {
                            displayMessage(response.errorMsg);
                        } else {
                            response.spectators.forEach((spectator) => {
                                gameChat.addSpectator(spectator);
                            });

                            quiz.setupQuiz(response.quizState.players, true, response.quizState, response.settings, false, response.quizState.groupSlotMap, false, null, null, response.champGame);
                            viewChanger.changeView("quiz");
                        }
                        spectateGameListner.unbindListener();
                        joinGameListner.unbindListener();
                    }.bind(this));
                    spectateGameListner.bindListener();
                    joinGameListner = new Listener("Join Game", function (response) {
                        if (response.error) {
                            displayMessage(response.errorMsg);
                        } else {
                            response.spectators.forEach((spectator) => {
                                gameChat.addSpectator(spectator);
                            });

                            quiz.setupQuiz(response.quizState.players, false, response.quizState, response.settings, false, response.quizState.groupSlotMap, false, null, null, response.champGame);
                            viewChanger.changeView("quiz");
                        }
                        spectateGameListner.unbindListener();
                        joinGameListner.unbindListener();
                    }.bind(this));
                    joinGameListner.bindListener();

                    socket.sendCommand({
                        type: "roombrowser",
                        command: "join ranked game"
                    });
                });

                this.showTimer("" + serieId);
                this.timers[this.currentTimerId].zeroMode();
            }
        }
    }

    showNextTimer() {
        let nextId;
        Object.keys(this.timers).forEach(seriesId => {
            if (!nextId || this.timers[seriesId].timeLeft < this.timers[nextId].timeLeft) {
                nextId = seriesId;
            }
        });
        if (nextId !== this.currentTimerId) {
            if (this.currentTimerId != undefined) {
                this.timers[this.currentTimerId].stop();
            }

            this.currentTimerId = nextId;
            this.timers[nextId].show();
            this.timers[nextId].start();
        }
    }

    showTimer(targetId) {
        if (targetId !== this.currentTimerId) {
            if (this.currentTimerId != undefined) {
                this.timers[this.currentTimerId].stop();
            }

            this.currentTimerId = targetId;
            this.timers[targetId].show();
            this.timers[targetId].start();
        }
    }

    getCurrentTargetTime() {
        return this.timers[this.currentTimerId].targetTime;
    }
}

Ranked.prototype.GAME_HOST_TIME_OBJECT = {
    hours: 20,
    minutes: 30,
    seconds: 0
};
Ranked.prototype.GAME_TIME_ZONES = {
    1: 'Europe/Copenhagen',
    2: 'America/Chicago',
    3: 'Asia/Tokyo'
};
Ranked.prototype.GAME_SERIES_IDS = {
    CENTRAL: 1,
    WEST: 2,
    East: 3
};
Ranked.prototype.GAME_SERIES_SYMBOL = {
    1: 'C',
    2: 'W',
    3: 'E'
};
Ranked.prototype.GAME_SERIES_NAMES = {
    1: 'Central',
    2: 'West',
    3: 'East'
};
Ranked.prototype.STATE_MESSAGES = {
    0: 'Offline',
    1: 'Lobby Up',
    2: 'Playing',
    3: 'Completed',
    4: 'Championship - Offline',
    5: 'Championship - Lobby',
    6: 'Championship - Playing',
    7: 'Completed',
    8: 'Ranked Rest Day'
};
Ranked.prototype.RANKED_STATE_IDS = {
    OFFLINE: 0,
    LOBBY: 1,
    RUNNING: 2,
    FINISHED: 3,
    CHAMP_OFFLINE: 4,
    CHAMP_LOBBY: 5,
    CHAMP_RUNNING: 6,
    CHAMP_FINISHED: 7,
    BREAK_DAY: 8
};

class RankedTimer {
    constructor($timer, $message, targetTimeObject, timeZone, serieSymbol) {
        this.$timer = $timer;
        this.$message = $message;
        this.targetTimeObject = targetTimeObject;
        this.timeZone = timeZone;
        this.serieSymbol = serieSymbol;
        this.interval;
        this.breakMode = false;
    }

    get targetTime() {
        if (!this._targetTime) {
            this._targetTime = moment().tz(this.timeZone);
            this._targetTime.set(this.targetTimeObject);
        }
        if (this._targetTime.isBefore(new Date())) {
            this._targetTime.add(1, 'days');
        }
        if (this.breakMode && this._targetTime.day() === 4) {
            this._targetTime.add(1, 'days');
        }
        return this._targetTime;
    }

    get timeLeft() {
        let duration = this.calculateDurationLeft();
        return duration.asSeconds();
    }

    getTimeLeftString() {
        let duration = this.calculateDurationLeft();
        return convertDurationToCountdownString(duration);
    }

    zeroMode() {
        this.stop();
        this.$timer.text('00:00');
    }

    show() {
        this.$message.text(this.serieSymbol);
        this.updateTimer();
    }

    start() {
        this.stop();
        this.interval = setInterval(() => {
            this.updateTimer();
        }, this.UPDATE_INTERVAL);
    }

    stop() {
        clearInterval(this.interval);
    }

    updateTimer() {
        let timeString = this.getTimeLeftString();
        if (this.$timer.text() !== timeString) {
            this.$timer.text(timeString);
        }
    }

    calculateDurationLeft() {
        return moment.duration(this.targetTime.diff(new Date()));
    }
}

RankedTimer.prototype.UPDATE_INTERVAL = 1000; //ms

var ranked = new Ranked();
