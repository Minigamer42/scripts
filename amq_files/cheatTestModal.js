"use strict";

/*exported cheatTestModal*/

class CheatTestModal {
    constructor() {
        this.$modal = $("#cheatTest");
        this.$modView = this.$modal.find("#ctmModInfoView");
        this.$modEntries = this.$modal.find("#ctmModEntries");
        this.$testeeView = this.$modal.find("#ctmTesteeInfoView");
        this.$triggerContainer = $("#cheatChallengeNoticeContainer");
        this.$testTimeContainer = $("#ctmTestTime");
        this.$triggerHighlight = $("#cheatChallengeTextHighlight");

        this.messageController;
        this.modEntries = {};
        this.targetMode = false;
        this.open = false;

        let initialOpen = false;
        this.$modal.on('shown.bs.modal', () => {
            this.open = true;
            this.messageController.updateScroll(!initialOpen);
            initialOpen = true;
            if (this.targetMode) {
                this.toggleHighlight(false);
                this.updateTargetLastViewMessageIndex(this.messageController.currentChallengeId, this.messageController.messageCount);
            }
        });

        this.$modal.on('hide.bs.modal', () => {
            this.open = false;
        });

        this.setupCheatTestGameListener = new Listener(
            "setup cheat test game",
            function ({songs, note, challengeId}) {
                cheatTestGame.setupModMode(songs, note, challengeId);
                viewChanger.changeView('cheatTestGame');
                this.$modal.modal('hide');
            }.bind(this)
        );
        this.setupCheatTestGameListener.bindListener();

        this.cheatTestGameIniteListener = new Listener(
            "cheat test game invite",
            function ({challengeId}) {
                displayOption("Cheat Test Invite", "A moderator have invited you to a cheat test game", "Join", "Reject", () => {
                    socket.sendCommand({
                        type: "cheatTest",
                        command: "join game",
                        data: {
                            challengeId
                        }
                    });
                }, () => {
                    socket.sendCommand({
                        type: "cheatTest",
                        command: "reject invite",
                        data: {
                            challengeId
                        }
                    });
                });
            }.bind(this)
        );
        this.cheatTestGameIniteListener.bindListener();

        this.cheatTestGameIniteListener = new Listener(
            "Join Cheat Test",
            function ({challengeId, player}) {
                cheatTestGame.setupTargetMode(challengeId, player);
                viewChanger.changeView('cheatTestGame', {supressServerMsg: true});
            }.bind(this)
        );
        this.cheatTestGameIniteListener.bindListener();
    }

    setup(isMod, testInfo) {
        this.messageController = new CheatTestChatController();

        if (isMod) {
            this.$modView.removeClass("hide");
            testInfo.forEach((entry) => {
                this.modEntries[entry.challengeId] = new CheatTestModEntry(entry);
                this.$modEntries.append(this.modEntries[entry.challengeId].$row);
            });
            if (testInfo.length) {
                this.$triggerContainer.removeClass("hide");
            }
            this.updateModHighlightToggle();
        } else {
            this.$testeeView.removeClass("hide");
            this.targetMode = true;
            if (testInfo) {
                this.messageController.setupForChallenge(testInfo.challengeId, testInfo.messages);
                this.$testTimeContainer.text(testInfo.time);
                this.$triggerContainer.removeClass("hide");
                this.toggleHighlight(testInfo.lastMessageIndex < testInfo.messages.length);
            }
        }
    }

    toggleHighlight(on) {
        if (on) {
            this.$triggerHighlight.removeClass('hide');
        } else {
            this.$triggerHighlight.addClass('hide');
        }
    }

    updateTargetLastViewMessageIndex(challengeId, newIndex) {
        socket.sendCommand({
            type: "cheatTest",
            command: "message view update",
            data: {
                challengeId,
                viewIndex: newIndex
            }
        });
    }

    updateModHighlightToggle() {
        this.toggleHighlight(Object.values(this.modEntries).some(entry => entry.highlightOn));
    }

    removeEntry(challengeId) {
        this.modEntries[challengeId].$row.remove();
        delete this.modEntries[challengeId];
        if (Object.keys(this.modEntries).length === 0) {
            this.hideContainer();
        }
    }

    hideContainer() {
        this.$triggerContainer.addClass("hide");
    }
}

class CheatTestModEntry {
    constructor({challengeId, name, status, time, messages, lastMessageIndex}) {
        this.challengeId = challengeId;
        this.messages = messages;
        this.$row = $(format(this.MODAL_ROW_TEMPLATE, name, status, time));
        this.$highlight = this.$row.find('.ctmModRowHighlight');
        this.highlightOn = false;
        if (status !== "Scheduled") {
            this.$row.find("button").addClass("disbaled");
        }
        this.$row.click(() => {
            if (status === 'Scheduled') {
                cheatTestModal.messageController.setupForChallenge(this.challengeId, this.messages);
                cheatTestModal.$modEntries.find("tr.active").removeClass("active");
                this.$row.addClass("active");
            }
            if (status !== 'Pending') {
                this.toggleHighlight(false);
                cheatTestModal.updateTargetLastViewMessageIndex(this.challengeId, this.messages.length);
                cheatTestModal.updateModHighlightToggle();
            }
        });
        this.$row.find("button").click(() => {
            if (lobby.inLobby || quiz.inQuiz) {
                displayMessage("Leave Game Before Setting up Challenge Game");
            } else {
                socket.sendCommand({
                    type: "cheatTest",
                    command: "setup cheat test",
                    data: {
                        challengeId: this.challengeId
                    }
                });
            }
        });

        if (status !== "Pending" && lastMessageIndex < this.messages.length) {
            this.toggleHighlight(true);
        }

        this.newMessageListener = new Listener(
            "cheat test chat message",
            function (result) {
                if (result.challengeId === this.challengeId) {
                    this.messages.push(result);
                    if (cheatTestModal.open) {
                        cheatTestModal.updateTargetLastViewMessageIndex(this.challengeId, this.messages.length);
                    } else {
                        this.toggleHighlight(true);
                        cheatTestModal.updateModHighlightToggle();
                    }
                }
            }.bind(this)
        );
        this.newMessageListener.bindListener();
    }

    toggleHighlight(on) {
        this.highlightOn = on;
        if (on) {
            this.$highlight.removeClass('hide');
        } else {
            this.$highlight.addClass('hide');
        }
    }
}

CheatTestModEntry.prototype.MODAL_ROW_TEMPLATE = $("#ctmModRowTemplate").html();

class CheatTestChatController {
    constructor() {
        this.$messageContainer = $("#ctmMessageContainer");
        this.$messageInput = $("#ctmMessageInput");
        this.currentChallengeId;

        this.$messageContainer.perfectScrollbar({
            suppressScrollX: true
        });

        this.messageCount = 0;

        this.$messageInput.keypress(
            function (e) {
                if (e.which == 13) {
                    let message = this.$messageInput.val();
                    if (message) {
                        socket.sendCommand({
                            type: "cheatTest",
                            command: "chat message",
                            data: {
                                message,
                                challengeId: this.currentChallengeId
                            }
                        });
                        this.$messageInput.val("");
                    }
                    e.preventDefault();
                }
            }.bind(this)
        );

        this.newMessageListener = new Listener(
            "cheat test chat message",
            function (result) {
                if (result.challengeId === this.currentChallengeId) {
                    this.insertMessage(result.name, result.message);
                    if (cheatTestModal.targetMode) {
                        if (cheatTestModal.open) {
                            cheatTestModal.updateTargetLastViewMessageIndex(this.currentChallengeId, this.messageCount);
                        } else {
                            cheatTestModal.toggleHighlight(true);
                        }
                    }
                }
            }.bind(this)
        );
        this.newMessageListener.bindListener();
    }

    get scrollAtBottom() {
        return this.$messageContainer.scrollTop() + this.$messageContainer.innerHeight() >=
            this.$messageContainer[0].scrollHeight - 100;
    }

    setupForChallenge(challengeId, messages) {
        this.messageCount = 0;
        this.currentChallengeId = challengeId;
        this.$messageContainer.find(".ctmMessage").remove();
        messages.forEach(({name, message}) => {
            this.insertMessage(name, message);
        });
        this.$messageContainer.perfectScrollbar("update");
        this.$messageContainer.scrollTop(this.$messageContainer.prop("scrollHeight"));
        this.$messageInput.removeClass("disabled");
    }

    insertMessage(name, message) {
        let atBottom = this.scrollAtBottom;

        this.$messageContainer.append(format(this.MESSAGE_TEMPLATE, name, message));
        this.$messageContainer.perfectScrollbar("update");
        if (atBottom) {
            this.$messageContainer.scrollTop(this.$messageContainer.prop("scrollHeight"));
        }
        this.messageCount++;
    }

    updateScroll(forceBottom) {
        if (this.scrollAtBottom || forceBottom) {
            this.$messageContainer.scrollTop(this.$messageContainer.prop("scrollHeight"));
        }
    }
}

CheatTestChatController.prototype.MESSAGE_TEMPLATE = $("#ctmCheatTestMessageTemplate").html();

var cheatTestModal = new CheatTestModal();
