"use strict";

/*exported quiz*/

class Quiz {
    constructor() {
        this.$view = $("#quizPage");
        this.$inputContainer = $("#qpAnswerInputContainer");
        this.$startReturnToLobbyButton = $("#qpReturnToLobbyButton");

        this.lateJoinButton;

        this.inputFocused = false;
        this.onLastSong = false;
        this.settingUpFirstSong = false;
        this.inQuiz = false;
        this.soloMode = false;
        this.isHost = false;
        this._groupSlotMap = {};

        this.infoContainer;
        this.returnVoteController;
        this.videoTimerBar;
        this.answerInput;
        this.skipController;
        this.avatarContainer;
        this.scoreboard;
        this.videoOverlay;

        this.nextSongPlayLength;
        this.autoVoteSkipTimeout;
        this.players;
        this.isSpectator;
        this.skipSettings;

        this.$inputContainer.click(() => {
            if (!this.isSpectator) {
                this.setInputInFocus(true);
            }
        });

        $(window).resize(() => {
            if (this.inQuiz) {
                this.scoreboard.updateLayout();
                this.avatarContainer.updateAvatarLayout();
            }
        });

        this._noSongsListner = new Listener("Quiz no songs", function () {
            gameChat.systemMessage("No songs matches quiz settings, returning to lobby", "");
        });

        this._quizOverListner = new Listener(
            "quiz over",
            function (roomSettings) {
                lobby.setupLobby(roomSettings, this.isSpectator);
                viewChanger.changeView("lobby", {
                    supressServerMsg: true,
                    keepChatOpen: true
                });
            }.bind(this)
        );

        this._sendFeedbackListner = new Listener(
            "send feedback",
            function () {
                this.infoContainer.sendSongFeedback();
            }.bind(this)
        );

        this._playerLeaveListner = new Listener(
            "Player Left",
            function (change) {
                this.players[change.player.gamePlayerId].avatarDisabled = true;
                this.scoreboard.disableEntry(change.player.gamePlayerId);
                if (Object.keys(this.players).length === 0) {
                    //all players left, tell spectators game is closed
                    displayMessage("All players have left", "Game room closed.");
                    viewChanger.changeView("roomBrowser");
                } else if (change.newHost) {
                    this.players[change.player.gamePlayerId].host = false;
                    this.promoteHost(change.newHost);
                }
            }.bind(this)
        );

        this._playerRejoiningListener = new Listener(
            "Rejoining Player",
            function (payload) {
                this.players[payload.gamePlayerId].avatarDisabled = false;
                this.scoreboard.enableEntry(payload.gamePlayerId);
            }.bind(this)
        );

        this._spectatorLeftListener = new Listener(
            "Spectator Left",
            function (payload) {
                if (payload.newHost) {
                    this.promoteHost(payload.newHost);
                }
            }.bind(this)
        );

        this._quizreadyListner = new Listener(
            "quiz ready",
            function (data) {
                this.infoContainer.setTotalSongCount(data.numberOfSongs);
                this.infoContainer.setCurrentSongCount(0);
                quizVideoController.loadNextVideo();
            }.bind(this)
        );

        this._nextVideoInfoListener = new Listener(
            "quiz next video info",
            function (data) {
                quizVideoController.nextVideoInfo(
                    data.videoInfo,
                    data.playLength,
                    data.startPont,
                    true,
                    null,
                    data.playbackSpeed
                );
                this.nextSongPlayLength = data.playLength;
            }.bind(this)
        );

        this._playNextSongListner = new Listener(
            "play next song",
            function (data) {
                if (!this.settingUpFirstSong) {
                    this.infoContainer.sendSongFeedback();
                }
                this.settingUpFirstSong = false;

                this.videoOverlay.hideTextOverlay();
                this.videoOverlay.hideWaitingBuffering();

                this.infoContainer.setCurrentSongCount(data.songNumber);
                this.infoContainer.hideContent();
                this.infoContainer.resetFeedbackSelects();

                this.scoreboard.resetCorrect();

                Object.values(this.players).forEach((quizPlayer) => {
                    quizPlayer.answer = null;
                    quizPlayer.avatarPose = cdnFormater.AVATAR_POSE_IDS.THINKING;
                });

                if (!this.isSpectator) {
                    this.answerInput.resetAnswerState();
                    this.answerInput.clear();
                    this.answerInput.enable();
                }

                if (this.skipSettings.guessing) {
                    this.skipController.reset();
                    this.skipController.enable();
                } else {
                    this.skipController.disable();
                }

                quizVideoController.playNextVideo();

                this.onLastSong = data.onLastSong;

                if (this.onLastSong) {
                    this.returnVoteController.toggleVoteButton(false);
                    this.pauseButton.reset();
                    this.lateJoinButton.hide();
                }

                this.videoTimerBar.updateState(data.progressBarState);
                this.videoOverlay.startTimer(data.time);
                this.handlePlayerOnlyChatPoint(true);
                this.handleNoEmotePoint(true);
            }.bind(this)
        );

        this._playerAnswerListner = new Listener(
            "player answers",
            function (data) {
                data.answers.forEach((answer) => {
                    let quizPlayer = this.players[answer.gamePlayerId];
                    if (quizPlayer) {
                        quizPlayer.answer = answer.answer;
                        quizPlayer.unknownAnswerNumber = answer.answerNumber;
                        quizPlayer.toggleTeamAnswerSharing(false);
                    }
                });

                if (!this.isSpectator) {
                    this.answerInput.showSubmitedAnswer();
                    this.answerInput.resetAnswerState();
                }

                this.videoTimerBar.updateState(data.progressBarState);
            }.bind(this)
        );

        this._resultListner = new Listener(
            "answer results",
            function (result) {
                quizVideoController.replayVideo();
                this.videoOverlay.hide();
                this.handleAutoHide(result.songInfo.type, result.watched, result.songInfo.highRisk);

                let oldGroupNumber = this.ownGroupSlot;

                if (result.lateJoinPlayers) {
                    let newQuizPlayers = [];

                    result.lateJoinPlayers.forEach((player) => {
                        let quizPlayer = this.addLateJoinPlayer(player);
                        newQuizPlayers.push(quizPlayer);
                    });
                    this.avatarContainer.addLateJoinAvatars(newQuizPlayers, result.groupMap);
                    this.scoreboard.setupLatePlayers(result.lateJoinPlayers, Object.keys(this.players).length);
                    this.scoreboard.resetupGroups(result.groupMap);
                    this.avatarContainer.updateAvatarLayout();
                    this.avatarContainer.updateCurrentGroup();

                    this.groupSlotMap = result.groupMap;
                    if (result.lateJoinPlayers.some(entry => entry.name === selfName)) {
                        this.selectAvatarGroup(this.ownGroupSlot);
                    }
                }

                if (!this.isSpectator) {
                    this.skipController.highlight = true;
                }
                if (this.skipSettings.replay) {
                    this.skipController.enable();
                }
                if (!this.isSpectator && options.autoVoteSkipReplay) {
                    this.skipController.autoVoteSkip(2000);
                }

                this.videoTimerBar.updateState(result.progressBarState);

                result.players.forEach((playerResult) => {
                    this.players[playerResult.gamePlayerId].updateAnswerResult(playerResult);
                });
                this.scoreboard.updateStandings(result.players, result.groupMap);

                let groupUpdateTimeout = (QuizAvatarSlot.prototype.GROUP_CHANGE_ANIMATION_LENGTH / 2) * 1000;
                this.avatarContainer.updateGroupSlotWithDelay(result.groupMap, groupUpdateTimeout);

                this.groupSlotMap = result.groupMap;
                let newGroupNumber = this.ownGroupSlot;
                setTimeout(() => {
                    if (oldGroupNumber === this.avatarContainer.currentGroup && oldGroupNumber !== newGroupNumber) {
                        this.selectAvatarGroup(newGroupNumber);
                    }
                }, groupUpdateTimeout);
                let songInfo = result.songInfo;
                this.infoContainer.showInfo(
                    songInfo.animeNames,
                    songInfo.songName,
                    songInfo.artist,
                    songInfo.type,
                    songInfo.typeNumber,
                    songInfo.urlMap,
                    songInfo.siteIds,
                    songInfo.animeScore,
                    songInfo.animeType,
                    songInfo.vintage,
                    songInfo.animeDifficulty,
                    songInfo.animeTags,
                    songInfo.animeGenre,
                    songInfo.altAnimeNames,
                    songInfo.altAnimeNamesAnswers
                );
                quizVideoController.loadNextVideo();
            }.bind(this)
        );

        this._endResultListner = new Listener(
            "quiz end result",
            function (payload) {
                this.skipController.disable();
                this.videoOverlay.hideTextOverlay();

                this.scoreboard.resetCorrect();

                Object.values(this.players).forEach((quizPlayer) => {
                    quizPlayer.answer = null;
                });

                payload.resultStates.forEach((result) => {
                    let quizPlayer = this.players[result.gamePlayerId];
                    if (quizPlayer) {
                        quizPlayer.avatarPose = result.pose;
                        if (result.endPosition <= 3) {
                            quizPlayer.finalPosition = result.endPosition;
                        }
                    }
                });

                this.videoTimerBar.updateState(payload.progressBarState);
            }.bind(this)
        );

        this._waitingForBufferingListner = new Listener(
            "quiz waiting buffering",
            function () {
                if (this.settingUpFirstSong) {
                    this.videoOverlay.showWaitingBuffering();
                } else {
                    this.videoOverlay.showTextOverlay("Waiting Buffering");
                }
            }.bind(this)
        );

        this._xpCreditGainListner = new Listener(
            "quiz xp credit gain",
            function (data) {
                this.players[data.gamePlayerId].fireRewardEvent(data.xpInfo, data.level, data.credit, data.tickets);
            }.bind(this)
        );

        this._noPlayersListner = new Listener("quiz no players", function () {
            displayMessage("All players have left", "Game room closed.");
            viewChanger.changeView("roomBrowser", {supressServerMsg: true});
        });

        this._playerAnswerListener = new Listener(
            "player answered",
            function (payload) {
                payload.forEach((gamePlayerId) => {
                    if (this.players[gamePlayerId]) {
                        this.players[gamePlayerId].avatarPose = cdnFormater.AVATAR_POSE_IDS.WAITING;
                    }
                });
            }.bind(this)
        );

        this._skippingVideoListener = new Listener(
            "quiz overlay message",
            function (message) {
                this.videoOverlay.showTextOverlay(message);
                this.skipController.stateMessage = "Voted<br/>Skip";
            }.bind(this)
        );

        this._skipMessageListener = new Listener(
            "quiz skip message",
            function (message) {
                this.skipController.stateMessage = message;
            }.bind(this)
        );

        this._returnVoteStartListner = new Listener(
            "return lobby vote start",
            function (payload) {
                this.returnVoteController.startVote(payload.invokingHost === selfName, this.isSpectator, payload.voteDuration);
            }.bind(this)
        );

        this._guessPhaseOverListner = new Listener(
            "guess phase over",
            function () {
                this.answerInput.handleGuessPhaseOver();
                this.videoOverlay.showAnswerText();
                this.videoOverlay.hideTextOverlay();
                this.skipController.disable();
                this.handlePlayerOnlyChatPoint(false);
                this.handleNoEmotePoint(false);
            }.bind(this)
        );

        this._errorListener = new Listener("quiz fatal error", function () {
            displayMessage("Fatal Server Error Doing Quiz", "Returning to lobby");
        });

        this._nameChangeListner = new Listener(
            "player name change",
            function (payload) {
                if (this.players[payload.gamePlayerId]) {
                    this.players[payload.gamePlayerId].name = payload.newName;
                }
            }.bind(this)
        );

        this._pauseTriggerListener = new Listener(
            "quiz pause triggered",
            function () {
                this.pauseButton.updateState(true);
                if (!this.isSpectator) {
                    this.pauseButton.show();
                }
            }.bind(this)
        );

        this._unpauseTriggerListener = new Listener(
            "quiz unpause triggered",
            function (payload) {
                this.pauseButton.updateState(false);
                if (!this.isSpectator && !this.isHost) {
                    this.pauseButton.hide();
                }
                if (payload.doCountDown) {
                    this.pauseButton.startCountdown(payload.countDownLength);
                }
            }.bind(this)
        );

        this._returnVoteResultListener = new Listener(
            "return lobby vote result",
            function (payload) {
                if (payload.passed) {
                    this.pauseButton.reset();
                }
            }.bind(this)
        );

        this._teamMemberAnswerListener = new Listener(
            "team member answer",
            function (payload) {
                let quizPlayer = this.players[payload.gamePlayerId];
                quizPlayer.answer = payload.answer;
                if (quizPlayer.name !== selfName) {
                    this.answerInput.gotTeamAnswer = true;
                    quizPlayer.toggleTeamAnswerSharing(true);
                    if (
                        options.showTeamAnswersState !== this.TEAM_ANSWER_IN_CHAT_STATES.NEVER &&
                        ((options.showTeamAnswersState === this.TEAM_ANSWER_IN_CHAT_STATES.OUT_OF_FOCUS &&
                                this.scoreboard.activeGroup &&
                                this.scoreboard.activeGroup !== this.ownGroupSlot) ||
                            options.showTeamAnswersState === this.TEAM_ANSWER_IN_CHAT_STATES.ALWAYS)
                    ) {
                        gameChat.systemMessage(quizPlayer.name + " answered: " + escapeHtml(payload.answer), "", true);
                    }
                }
            }.bind(this)
        );

        this._modMessageFlagListener = new Listener(
            "mod message flag",
            function (payload) {
                this.flaggedMessageContainer.addEntry(payload);
            }.bind(this)
        );

        this._messageFlagWarnedListener = new Listener(
            "message flag warned",
            function (payload) {
                this.flaggedMessageContainer.setMessageWarned(payload.messageId);
            }.bind(this)
        );

        this._messageFlagBanListener = new Listener(
            "message flag ban",
            function (payload) {
                this.flaggedMessageContainer.setMessageBanned(payload.messageId);
            }.bind(this)
        );

        this._playerHiddenListener = new Listener(
            "player hidden",
            function (payload) {
                if (isGameAdmin || payload.name === selfName) {
                    this.players[payload.gamePlayerId].avatarSlot.displayHidden();
                    this.scoreboard.setEntryHidden(payload.gamePlayerId);
                } else {
                    this.scoreboard.removeEntry(payload.gamePlayerId);
                }
            }.bind(this)
        );

        this._lateJoinTriggeredListener = new Listener(
            "late join triggered",
            function () {
                displayMessage("Joining Game", "You will be added to the game during the next result phase");
                this.lateJoinButton.disable();
            }.bind(this)
        );

        this._playerLateJoinListener = new Listener(
            "player late join",
            function (payload) {
                let oldGroupNumber = this.ownGroupSlot;

                let newQuizPlayers = [];

                let quizPlayer = this.addLateJoinPlayer(payload.newPlayer);
                newQuizPlayers.push(quizPlayer);

                this.avatarContainer.addLateJoinAvatars(newQuizPlayers, payload.groupMap);
                this.scoreboard.setupLatePlayers([payload.newPlayer], Object.keys(this.players).length);
                this.scoreboard.resetupGroups(payload.groupMap);
                this.avatarContainer.updateAvatarLayout();
                this.avatarContainer.updateCurrentGroup();
                this.scoreboard.updateEntryLayout();
                this.groupSlotMap = payload.groupMap;
                if (payload.newPlayer.name === selfName) {
                    this.selectAvatarGroup(this.ownGroupSlot);
                } else if (!this.isSpectator) {
                    let newGroupNumber = this.ownGroupSlot;

                    if (!this.isSpectator && oldGroupNumber === this.avatarContainer.currentGroup && oldGroupNumber !== newGroupNumber) {
                        this.selectAvatarGroup(newGroupNumber);
                    }
                }
            }.bind(this)
        );
    }

    setup() {
        this.videoOverlay = new VideoOverlay();
        this.infoContainer = new QuizInfoContainer();
        this.returnVoteController = new ReturnVoteController(this.videoOverlay);
        this.videoTimerBar = new TimerBar($("#qpVideoProgressBar"));
        this.skipController = new QuizSkipController();
        this.avatarContainer = new QuizAvatarContainer();
        this.scoreboard = new QuizScoreboard();
        this.answerInput = new QuizAnswerInput(this.skipController);
        this.pauseButton = new PauseButton();
        this.flaggedMessageContainer = new FlaggedMessageContainer();
        this.lateJoinButton = new StandardButton($("#qpJoinButton"), () => {
            socket.sendCommand({
                type: "quiz",
                command: "late join ranked"
            });
        });
        this.answerInput.disable();
    }

    openView(callback) {
        this.$view.removeClass("hidden");
        if (!gameChat.isShown()) {
            gameChat.openView();
        }

        this.inQuiz = true;

        this.scoreboard.updateLayout(this.groupSlotMap);
        let groupSlot = this.ownGroupSlot;
        if (groupSlot != null) {
            this.scoreboard.scrollToGroup(groupSlot);
        }
        this.avatarContainer.updateAvatarLayout();

        Object.values(this.players).forEach((quizPlayer) => {
            quizPlayer.updatePose();
        });

        this._noSongsListner.bindListener();
        this._quizOverListner.bindListener();
        this._playerLeaveListner.bindListener();
        this._playerRejoiningListener.bindListener();
        this._spectatorLeftListener.bindListener();
        this._quizreadyListner.bindListener();
        this._nextVideoInfoListener.bindListener();
        this._playNextSongListner.bindListener();
        this._playerAnswerListner.bindListener();
        this._resultListner.bindListener();
        this._endResultListner.bindListener();
        this._xpCreditGainListner.bindListener();
        this._noPlayersListner.bindListener();
        this._playerAnswerListener.bindListener();
        this._waitingForBufferingListner.bindListener();
        this._skippingVideoListener.bindListener();
        this._skipMessageListener.bindListener();
        this._quizOverListner.bindListener();
        this._sendFeedbackListner.bindListener();
        this._returnVoteStartListner.bindListener();
        this._guessPhaseOverListner.bindListener();
        this._errorListener.bindListener();
        this._nameChangeListner.bindListener();
        this._pauseTriggerListener.bindListener();
        this._unpauseTriggerListener.bindListener();
        this._returnVoteResultListener.bindListener();
        this._teamMemberAnswerListener.bindListener();
        this._modMessageFlagListener.bindListener();
        this._messageFlagWarnedListener.bindListener();
        this._messageFlagBanListener.bindListener();
        this._playerHiddenListener.bindListener();
        this._lateJoinTriggeredListener.bindListener();
        this._playerLateJoinListener.bindListener();

        callback();
        this.videoOverlay.setFontSize();
        this.infoContainer.fitTextToContainer();
    }

    closeView(args) {
        if (!args.supressServerMsg) {
            this.infoContainer.sendSongFeedback();

            socket.sendCommand({
                type: "lobby",
                command: "leave game"
            });
        }

        this._noSongsListner.unbindListener();
        this._quizOverListner.unbindListener();
        this._playerLeaveListner.unbindListener();
        this._playerRejoiningListener.unbindListener();
        this._spectatorLeftListener.unbindListener();
        this._quizreadyListner.unbindListener();
        this._quizreadyListner.unbindListener();
        this._nextVideoInfoListener.unbindListener();
        this._playNextSongListner.unbindListener();
        this._playerAnswerListner.unbindListener();
        this._resultListner.unbindListener();
        this._endResultListner.unbindListener();
        this._xpCreditGainListner.unbindListener();
        this._noPlayersListner.unbindListener();
        this._playerAnswerListener.unbindListener();
        this._waitingForBufferingListner.unbindListener();
        this._skippingVideoListener.unbindListener();
        this._skipMessageListener.unbindListener();
        this._quizOverListner.unbindListener();
        this._sendFeedbackListner.unbindListener();
        this._returnVoteStartListner.unbindListener();
        this._guessPhaseOverListner.unbindListener();
        this._errorListener.unbindListener();
        this._nameChangeListner.unbindListener();
        this._pauseTriggerListener.unbindListener();
        this._unpauseTriggerListener.unbindListener();
        this._returnVoteResultListener.unbindListener();
        this._teamMemberAnswerListener.unbindListener();
        this._modMessageFlagListener.unbindListener();
        this._messageFlagWarnedListener.unbindListener();
        this._messageFlagBanListener.unbindListener();
        this._playerHiddenListener.unbindListener();
        this._lateJoinTriggeredListener.unbindListener();
        this._playerLateJoinListener.unbindListener();

        this.answerInput.active = false;
        this.answerInput.resetAnswerState();
        this.answerInput.clear();
        quizVideoController.reset();
        this.videoOverlay.reset();
        this.videoTimerBar.reset();
        this.returnVoteController.reset();
        this.avatarContainer.reset();
        this.pauseButton.reset();
        this.flaggedMessageContainer.clear();
        this.flaggedMessageContainer.hide();
        this.lateJoinButton.hide();
        this.lateJoinButton.enable();
        this.players = null;

        this.inQuiz = false;

        if (!this.isSpectator) {
            if (options.autoSwitchFavoritedAvatars === options.AUTO_SWITCH_AVATAR_STATES.CYCLE) {
                storeWindow.topBar.favorites.toggleCycleFavoriteAvatar();
            } else if (options.autoSwitchFavoritedAvatars === options.AUTO_SWITCH_AVATAR_STATES.RANDOM) {
                storeWindow.topBar.favorites.toggleRandomFavoriteAvatar();
            }
        }

        this.$view.addClass("hidden");
        if (!args.keepChatOpen) {
            gameChat.closeView();
        }
    }

    setupQuiz(
        players,
        isSpectator,
        quizState,
        settings,
        isHost,
        groupSlotMap,
        soloMode,
        teamAnswers,
        selfAnswer,
        champGame
    ) {
        this.gameMode = settings.gameMode;
        this.soloMode = soloMode;
        let lifeCountGameMode = settings.scoreType === this.SCORE_TYPE_IDS.LIVES;
        this.players = {};
        this.ownGamePlayerId = null;
        this.teamMode = settings.teamSize > 1;
        players.forEach((player) => {
            this.players[player.gamePlayerId] = new QuizPlayer(
                player.name,
                player.level,
                player.gamePlayerId,
                player.host,
                player.avatarInfo,
                player.points,
                player.pose,
                player.inGame === false,
                lifeCountGameMode,
                settings.lives,
                player.positionSlot,
                player.teamPlayer,
                player.teamNumber,
                player.hidden
            );
            if (player.name === selfName) {
                this.ownGamePlayerId = player.gamePlayerId;
            }
        });
        this.isSpectator = isSpectator;
        this.champGame = champGame;
        this.isHost = isHost;
        this.settingUpFirstSong = true;
        this.onLastSong = false;
        this.groupSlotMap = groupSlotMap;
        this.skipSettings = {
            guessing: settings.modifiers.skipGuessing,
            replay: settings.modifiers.skipReplay
        };

        this.answerInput.inFocus = false;
        this.answerInput.active = !this.isSpectator;
        this.skipController.disable(true);
        this.skipController.votePreviewMode = isSpectator;

        this.scoreboard.reset();
        this.scoreboard.setScoreType(settings.scoreType);
        this.scoreboard.setupGroups(groupSlotMap);

        this.avatarContainer.setupAvatars(Object.values(this.players), groupSlotMap);
        if (!this.isSpectator) {
            this.answerInput.updateAutocomplete();
            this.scoreboard.setActiveGroup(this.ownGroupSlot);
            if (this.teamMode) {
                gameChat.toggleShowTeamChatSwitch(true);
            }

            if (settings.showSelection === quiz.SHOW_SELECTION_IDS.LOOTING) {
                tutorial.state.lootingPlayed = true;
            }
            if (this.teamMode) {
                tutorial.state.teamPlayed = true;
            }
            if (settings.scoreType === quiz.SCORE_TYPE_IDS.SPEED) {
                tutorial.state.speedPlayed = true;
            }
            if (settings.scoreType === quiz.SCORE_TYPE_IDS.LIVES) {
                tutorial.state.livesPlayed = true;
            }
        } else {
            this.scoreboard.setActiveGroup("1");
        }

        this.answerInput.disable();

        quizVideoController.hideAll();

        gameChat.toggleQueueTab(settings.modifiers.queueing);
        gameChat.setQueueButtonState(isSpectator);
        gameChat.slowModeActive = this.gameMode === "Ranked";
        gameChat.displayJoinLeaveMessages = this.gameMode !== "Ranked";

        if (this.gameMode === "Ranked" && isSpectator) {
            this.lateJoinButton.show();
        }

        if (isHost) {
            this.$startReturnToLobbyButton.removeClass("hide");
            this.pauseButton.show();
        } else {
            this.$startReturnToLobbyButton.addClass("hide");
        }

        if (isGameAdmin && this.gameMode === "Ranked") {
            this.flaggedMessageContainer.show();
        }

        this.videoOverlay.hideWaitingBuffering();

        this.infoContainer.reset();

        if (!quizState || Quiz.prototype.QUIZ_STATES.LOADING === quizState.state) {
            //Set up basic players, if not setting up an exsisting state
            this.scoreboard.setupPlayers(this.players, settings.lives, this.teamMode);
            this.videoOverlay.showLoadingText();
        } else {
            this.scoreboard.setupPlayersWithScore(quizState.players, this.teamMode);

            this.handlePlayerOnlyChatPoint(Quiz.prototype.QUIZ_STATES.GUESS_PHASE === quizState.state);
            this.handleNoEmotePoint(Quiz.prototype.QUIZ_STATES.GUESS_PHASE === quizState.state);

            hostModal.changeSettings(settings);

            quizState.players.forEach((playerState) => {
                let quizPlayer = this.players[playerState.gamePlayerId];
                quizPlayer.state = playerState;

                if (quizState.state === this.QUIZ_STATES.END_PHASE && playerState.pos <= 3) {
                    //TODO make sure end result is shown when players start spectating
                    quizPlayer.finalPosition = playerState.pos;
                }
            });

            this.infoContainer.setTotalSongCount(quizState.totalSongNumbers);
            this.infoContainer.setCurrentSongCount(quizState.songNumber);

            this.settingUpFirstSong = quizState.songNumber === 0;

            this.videoTimerBar.updateState(quizState.progressBarState);

            if (quizState.returnVoteState) {
                this.returnVoteController.updateState(quizState.returnVoteState, this.isSpectator);
            }

            if (quizState.lastSkipMessage) {
                this.skipController.stateMessage = quizState.lastSkipMessage;
            }
            if (this.SKIP_PHASES.includes(quizState.state)) {
                this.skipController.enable();
            }

            if (teamAnswers) {
                teamAnswers.forEach(({answer, gamePlayerId}) => {
                    let quizPlayer = this.players[gamePlayerId];
                    quizPlayer.answer = answer;
                    if (quizPlayer.name !== selfName) {
                        quizPlayer.toggleTeamAnswerSharing(true);
                    }
                });
            }

            if (
                quizState.pauseTriggered ||
                (quizState.state === Quiz.prototype.QUIZ_STATES.PAUSE && !quizState.inPauseEndTransition)
            ) {
                this.pauseButton.updateState(true);
                if (!isSpectator) {
                    this.pauseButton.show();
                }
            }

            if (!this.isSpectator && Quiz.prototype.QUIZ_STATES.GUESS_PHASE === quizState.state) {
                this.answerInput.resetAnswerState();
                this.answerInput.clear();
                this.answerInput.enable();
            }

            if (selfAnswer) {
                this.answerInput.displayAnswer(selfAnswer);
            }

            if (quizState.songInfo && quizState.songInfo.videoInfo) {
                quizVideoController.nextVideoInfo(
                    quizState.songInfo.videoInfo,
                    quizState.songInfo.playLength,
                    quizState.songInfo.startPoint,
                    true,
                    quizState.songTimer,
                    quizState.songInfo.playbackSpeed
                );
                quizVideoController.loadNextVideo();
            }

            if (this.SHOW_TIMER_PHASES.includes(quizState.state)) {
                this.videoOverlay.startTimer(quizState.guessTime - quizState.songTimer);
            } else if (quizState.state === this.QUIZ_STATES.ANSWER_PHASE) {
                this.videoOverlay.showAnswerText();
                this.videoOverlay.hideTextOverlay();
            } else if (quizState.state === this.QUIZ_STATES.LOADING) {
                this.videoOverlay.showLoadingText();
            } else if (quizState.state === this.QUIZ_STATES.WAITING_BUFFERING) {
                if (this.settingUpFirstSong) {
                    this.videoOverlay.showWaitingBuffering();
                } else {
                    this.videoOverlay.showTextOverlay("Waiting Buffering");
                }
            } else {
                this.videoOverlay.hide();
            }

            if (quizState.nextVideoInfo && quizState.nextVideoInfo.videoInfo) {
                quizVideoController.nextVideoInfo(
                    quizState.nextVideoInfo.videoInfo,
                    quizState.nextVideoInfo.playLength,
                    quizState.nextVideoInfo.startPoint,
                    true,
                    null,
                    quizState.nextVideoInfo.playbackSpeed
                );
                this.nextSongPlayLength = quizState.nextVideoInfo.playLength;
                if (!this.CURRENT_BUFFER_FOCUS_PHASES.includes(quizState.state)) {
                    quizVideoController.loadNextVideo();
                }
            }

            if (quizState.songInfo && quizState.songInfo.animeNames) {
                let songInfo = quizState.songInfo;
                this.infoContainer.showInfo(
                    songInfo.animeNames,
                    songInfo.songName,
                    songInfo.artist,
                    songInfo.type,
                    songInfo.typeNumber,
                    songInfo.urlMap,
                    songInfo.siteIds,
                    songInfo.animeScore,
                    songInfo.animeType,
                    songInfo.vintage,
                    songInfo.animeDifficulty,
                    songInfo.animeTags,
                    songInfo.animeGenre,
                    songInfo.altAnimeNames,
                    songInfo.altAnimeNamesAnswers
                );
                this.handleAutoHide(songInfo.type, quizState.watched, songInfo.highRisk);
            }
        }
    }

    setInputInFocus(inFocus) {
        this.answerInput.inFocus = inFocus;
    }

    skipClicked() {
        this.skipController.toggle();
    }

    promoteHost(newHostName) {
        Object.values(this.players).some((gamePlayer) => {
            if (gamePlayer.name === newHostName) {
                gamePlayer.host = true;
                if (newHostName === selfName) {
                    this.isHost = true;
                    this.$startReturnToLobbyButton.removeClass("hide");
                    this.pauseButton.show();
                }
                return true;
            }
        });
    }

    leave() {
        let targetPage = this.gameMode === "Ranked" || this.soloMode ? "main" : "roomBrowser";
        if (this.isSpectator) {
            viewChanger.changeView(targetPage);
        } else {
            displayOption(
                "Leave Quiz?",
                null,
                "Leave",
                "Stay",
                () => {
                    viewChanger.changeView(targetPage);
                },
                () => {
                }
            );
        }
    }

    viewSettings() {
        hostModal.setModeGameSettings(false, this.soloMode);
        hostModal.showSettings();
        $("#mhHostModal").modal("show");
    }

    videoReady(songId) {
        if (!this.isSpectator && this.inQuiz) {
            socket.sendCommand({
                type: "quiz",
                command: "video ready",
                data: {
                    songId: songId
                }
            });
        }
    }

    startReturnLobbyVote() {
        displayOption("Start Return to Lobby Vote?", "", "Start", "Cancel", () => {
            socket.sendCommand({
                type: "quiz",
                command: "start return lobby vote"
            });
        });
    }

    selectAvatarGroup(number) {
        this.avatarContainer.currentGroup = number;
        this.scoreboard.setActiveGroup(number);
        this.scoreboard.scrollToGroup(number);
    }

    handleAutoHide(type, watched, highRisk) {
        let isMp3 = quizVideoController.getCurrentResolution() === 0;
        if (isMp3) {
            return;
        }
        if (
            (options.autoHideOpenings && type === 1) ||
            (options.autoHideEndings && type === 2) ||
            (options.autoHideInserts && type === 3) ||
            (options.autoHideUnwatched && !watched) ||
            (options.autoHideHighRisk && highRisk)
        ) {
            this.videoOverlay.toogleUserVideoHidder(true);
        }
    }

    handlePlayerOnlyChatPoint(on) {
        if (this.champGame && this.isSpectator && !isGameAdmin) {
            gameChat.setPlayerOnlyMode(on);
        }
    }

    handleNoEmotePoint(on) {
        if (this.gameMode === "Ranked") {
            gameChat.noEmoteMode = on;
            emojiSelector.setLockInMode(on);
        }
    }

    addLateJoinPlayer(player) {
        let quizPlayer = new QuizPlayer(
            player.name,
            player.level,
            player.gamePlayerId,
            player.host,
            player.avatarInfo,
            player.points,
            player.pose,
            player.inGame === false,
            false,
            null,
            player.positionSlot,
            player.teamPlayer,
            player.teamNumber,
            player.hidden
        );
        this.players[player.gamePlayerId] = quizPlayer;
        if (player.name === selfName) {
            this.isSpectator = false;
            this.ownGamePlayerId = player.gamePlayerId;
            this.answerInput.active = true;
            this.skipController.votePreviewMode = false;
            this.answerInput.updateAutocomplete();
            this.scoreboard.setActiveGroup(this.ownGroupSlot);
            this.lateJoinButton.hide();
        }
        return quizPlayer;
    }

    get ownGroupSlot() {
        if (this.ownGamePlayerId != null) {
            return Object.keys(this.groupSlotMap).find((groupNumber) => {
                return this.groupSlotMap[groupNumber].includes(this.ownGamePlayerId);
            });
        } else {
            return undefined;
        }
    }

    get groupSlotMap() {
        return this._groupSlotMap;
    }

    set groupSlotMap(newMap) {
        Object.keys(newMap).forEach((groupNumber) => {
            newMap[groupNumber].forEach((gamePlayerId) => {
                this.players[gamePlayerId].groupNumber = groupNumber;
            });
        });
        this._groupSlotMap = newMap;
    }
}

Quiz.prototype.QUIZ_STATES = {
    PRESETUP: 0,
    LOADING: 1,
    WAITING_FOR_READY: 2,
    GUESS_PHASE: 3,
    ANSWER_PHASE: 4,
    SHOW_ANSWER_PHASE: 5,
    END_PHASE: 6,
    WAITING_BUFFERING: 7,
    WAITING_ANSWERS_PHASE: 8,
    BATTLE_ROYAL: 9,
    PAUSE: 10
};
Quiz.prototype.SCORE_TYPE_IDS = {
    COUNT: 1,
    SPEED: 2,
    LIVES: 3
};
Quiz.prototype.SHOW_SELECTION_IDS = {
    AUTO: 1,
    LOOTING: 2
};
Quiz.prototype.TEAM_ANSWER_IN_CHAT_STATES = {
    NEVER: 0,
    OUT_OF_FOCUS: 1,
    ALWAYS: 2
};
Quiz.prototype.SKIP_PHASES = [
    Quiz.prototype.QUIZ_STATES.GUESS_PHASE,
    Quiz.prototype.QUIZ_STATES.WAIT_SHOW_ANSWER_PHASE,
    Quiz.prototype.QUIZ_STATES.SHOW_ANSWER_PHASE,
    Quiz.prototype.QUIZ_STATES.PAUSE
];
Quiz.prototype.SHOW_TIMER_PHASES = [
    Quiz.prototype.QUIZ_STATES.GUESS_PHASE,
    Quiz.prototype.QUIZ_STATES.WAIT_SHOW_ANSWER_PHASE
];
Quiz.prototype.CURRENT_BUFFER_FOCUS_PHASES = [
    Quiz.prototype.QUIZ_STATES.GUESS_PHASE,
    Quiz.prototype.QUIZ_STATES.WAIT_SHOW_ANSWER_PHASE,
    Quiz.prototype.QUIZ_STATES.ANSWER_PHASE
];

var quiz = new Quiz();
