"use strict";

/*exported cheatTestGame*/

class CheatTestGame {
    constructor() {
        this._quizController;
        this.songEntries = [];
        this.gamePlayer;
        this.challengeId;
        this.modView = false;
        this.$challengeContainer = $("#qpcChallengeContainer");
        this.$selector = $("#qpCheatTestSelector");
        this.$note = $("#qpcNote");
        this.$modContainers = $(".cheatTestShow");

        this.$selector.perfectScrollbar({
            suppressScrollX: true
        });

        this.targetJoinListener = new Listener(
            "Target Join",
            function (player) {
                this.displayPlayer(player);
                this.avatarContainer.updateAvatarLayout();
            }.bind(this)
        );

        this.targetLeftListener = new Listener(
            "Target Left",
            function () {
                this.avatarContainer.reset();
                this.gamePlayer = null;
                gameChat.systemMessage("Challenge Player Left the Game");
            }.bind(this)
        );

        this.gameClosedListner = new Listener(
            "game closed",
            function (payload) {
                displayMessage("Room Closed", payload.reason);
                viewChanger.changeView("roomBrowser", {supressServerMsg: true});
                if (this.modView && (payload.reason === 'Player Not Banned' || payload.reason === "Target Player Banned")) {
                    cheatTestModal.removeEntry(this.challengeId);
                } else if (!this.modView && payload.reason === 'Player Not Banned') {
                    cheatTestModal.hideContainer();
                }
            }.bind(this)
        );

        this.playSongListner = new Listener(
            "Play Song",
            function ({songId, linkId}) {
                quizVideoController.stopVideo();
                quizVideoController.nextVideoInfo(
                    {id: 0, videoMap: {catbox: {0: linkId}, openingsmoe: null}},
                    999,
                    0,
                    true,
                    0,
                    1
                );
                quizVideoController.loadNextVideo();
                this.songEntries.forEach((entry) => {
                    entry.setPlaying(entry.songId === songId);
                });
            }.bind(this)
        );

        this.newAnswerListener = new Listener(
            "New Answer",
            function ({answer}) {
                this.gamePlayer.answer = answer;
                if (!this.modView) {
                    this.answerInput.quizAnswerState.showCheck();
                }
            }.bind(this)
        );

        this.resetAnswerListener = new Listener(
            "Reset Answer",
            function () {
                if (!this.modView) {
                    this.answerInput.resetAnswerState();
                    this.answerInput.clear();
                }
                this.gamePlayer.answer = null;
            }.bind(this)
        );
    }

    get $view() {
        return this._quizController.$view;
    }

    get answerInput() {
        return this._quizController.answerInput;
    }

    get inQuiz() {
        return this._quizController.inQuiz;
    }

    set inQuiz(newValue) {
        this._quizController.inQuiz = newValue;
    }

    get videoOverlay() {
        return this._quizController.videoOverlay;
    }

    get avatarContainer() {
        return this._quizController.avatarContainer;
    }

    get skipController() {
        return this._quizController.skipController;
    }

    setup(originalQuiz) {
        this._quizController = originalQuiz;
    }

    openView(callback) {
        this.$view.addClass("cheatTest").removeClass("hidden");
        if (!gameChat.isShown()) {
            gameChat.openView();
        }

        this.targetJoinListener.bindListener();
        this.targetLeftListener.bindListener();
        this.gameClosedListner.bindListener();
        this.playSongListner.bindListener();
        this.newAnswerListener.bindListener();
        this.resetAnswerListener.bindListener();

        this.answerInput.clear();
        this.inQuiz = true;

        callback();
        this.videoOverlay.setFontSize();
        this.videoOverlay.showCheatTestText();
        this.$selector.perfectScrollbar("update");
        this.avatarContainer.updateAvatarLayout();
    }

    closeView(args) {
        this.answerInput.active = false;

        if (!args.supressServerMsg) {
            socket.sendCommand({
                type: "lobby",
                command: "leave game"
            });
        }

        this.answerInput.resetAnswerState();
        quizVideoController.reset();
        this.avatarContainer.reset();
        this.videoOverlay.reset();

        this.targetJoinListener.unbindListener();
        this.targetLeftListener.unbindListener();
        this.gameClosedListner.unbindListener();
        this.playSongListner.unbindListener();
        this.newAnswerListener.unbindListener();
        this.resetAnswerListener.unbindListener();

        this.songEntries = [];
        this.inQuiz = false;
        this.$view.addClass("hidden").removeClass("cheatTest");
        gameChat.closeView();
    }

    setupModMode(songs, note, challengeId) {
        this.challengeId = challengeId;
        this.modView = true;
        this.$challengeContainer.html("");
        this.$modContainers.removeClass("hide");
        this.skipController.disable(true);
        songs.forEach((entry) => {
            let songEntry = new CheatTestSongEntry(entry, challengeId);
            this.$challengeContainer.append(songEntry.$body);
            this.songEntries.push(songEntry);
        });
        this.$note.val(note);
    }

    setupTargetMode(challengeId, player) {
        this.challengeId = challengeId;
        this.modView = false;
        this.$modContainers.addClass("hide");
        this.skipController.disable(true);
        this.answerInput.updateAutocomplete();
        this.answerInput.resetAnswerState();
        this.answerInput.clear();
        this.answerInput.enable();
        this.displayPlayer(player);
    }

    invitePlayer() {
        socket.sendCommand({
            type: "cheatTest",
            command: "invite target player",
            data: {
                challengeId: this.challengeId
            }
        });
    }

    resetAnswer() {
        socket.sendCommand({
            type: "cheatTest",
            command: "reset answer"
        });
    }

    issueBan() {
        displayOption("Ban Player", "Issue a ban to the player in question", "Ban", "Cancel", () => {
            socket.sendCommand({
                type: "cheatTest",
                command: "issue ban",
                data: {
                    challengeId: this.challengeId
                }
            });
        });
    }

    issueNoBan() {
        displayOption("Don't Ban Player", "Do not issue a ban to the player in question", "No Ban", "Cancel", () => {
            socket.sendCommand({
                type: "cheatTest",
                command: "issue no ban",
                data: {
                    challengeId: this.challengeId
                }
            });
        });
    }

    displayPlayer(player) {
        let gamePlayer = new QuizPlayer(
            player.name,
            player.level,
            1,
            player.host,
            player.avatar,
            0,
            cdnFormater.AVATAR_POSE_IDS.BASE,
            player.inGame === false,
            false,
            0
        );
        this.gamePlayer = gamePlayer;
        this.avatarContainer.setupAvatars([this.gamePlayer], {1: [1]});
    }
}

var cheatTestGame = new CheatTestGame();

class CheatTestSongEntry {
    constructor({songId, videoLink, songName, artist, animeNames, note, correct}, challengeId) {
        this.$body = $(format(this.TEMPLATE, songName, artist, escapeHtml(videoLink), escapeHtml(note)));
        this.$animeContainer = this.$body.find(".qpcChallengeItemAnime");
        this.$note = this.$body.find('.qpcChallengeItemNote');
        animeNames.forEach(({annId, name}) => {
            this.$animeContainer.append(
                format(
                    '<div><a href="https://www.animenewsnetwork.com/encyclopedia/anime.php?id={0}" target="_blank">{1}</a></div>',
                    annId,
                    name
                )
            );
        });

        this.songId = songId;
        this.challengeId = challengeId;

        if (correct) {
            this.$body.addClass('correct');
        } else if (correct === 0) {
            this.$body.addClass('wrong');
        }

        this.$body.find(".playButton").click(() => {
            socket.sendCommand({
                type: "cheatTest",
                command: "play song",
                data: {
                    challengeId,
                    songId
                }
            });
        });

        this.$body.find(".correctButton").click(() => {
            socket.sendCommand({
                type: "cheatTest",
                command: "mark correct",
                data: {
                    challengeId,
                    songId
                }
            });
            this.$body.addClass('correct');
            this.$body.removeClass('wrong');
        });

        this.$body.find(".wrongButton").click(() => {
            socket.sendCommand({
                type: "cheatTest",
                command: "mark wrong",
                data: {
                    challengeId,
                    songId
                }
            });
            this.$body.addClass('wrong');
            this.$body.removeClass('correct');
        });

        this.$body.find(".resetButton").click(() => {
            socket.sendCommand({
                type: "cheatTest",
                command: "mark unset",
                data: {
                    challengeId,
                    songId
                }
            });
            this.$body.removeClass('wrong');
            this.$body.removeClass('correct');
        });

        let currentNote = this.$note.val();
        this.$note.on('focusout', () => {
            let newNote = this.$note.val();
            if (newNote != currentNote) {
                socket.sendCommand({
                    type: "cheatTest",
                    command: "update note",
                    data: {
                        challengeId,
                        songId,
                        note: newNote
                    }
                });
                currentNote = newNote;
            }
        });
    }

    setPlaying(playing) {
        if (playing) {
            this.$body.addClass("playing");
        } else {
            this.$body.removeClass("playing");
        }
    }
}

CheatTestSongEntry.prototype.TEMPLATE = $("#cheatTestSongEntryTemplate").html();
