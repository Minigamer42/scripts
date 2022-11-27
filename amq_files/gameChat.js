"use strict";

/*exported gameChat*/

function GameChat() {
    this.$view = $("#gameChatPage");
    this.open = false;
    this.MAX_MESSAGE_LENGTH = 150;
    this.MOD_BAN_MESSAGE_COMMAND_REGEX = /^\/banMessage /i;
    this.MOD_BAN_MESSAGE_LENGTH = 12;
    this.MOD_CLEAR_BAN_MESSAGE_REGEX = /^\/clearBannedMessages/i;
    this.$chatMessageContainer = $("#gcMessageContainer");
    this.$chatInputField = $("#gcInput");
    this.$spectatorView = $("#gcSpectatorListContent");
    this.$chatView = $("#gcChatContent");
    this.$gameChatButton = $("#gcGameChatButton");
    this.$spectateListButton = $("#gcSpectateListButton");
    this.$spectatorList = $("#gcSpectatorList");
    this.$spectatorCounter = $("#gcSpectatorCount");
    this.$SCROLLABLE_CONTAINERS = $(".gcScrollAbleContainer");
    this.$QUEUE_LIST_BUTTON = $("#gcQueueListButton");
    this.$QUEUE_TAB = $("#gcQueueListContent");
    this.$QUEUE_LIST = $("#gcQueueList");
    this.$QUEUE_COUNT = $("#gcQueueCount");
    this.$QUEUE_JOIN_BUTTON_TEXT = $("#gcQueueActionButtonText");
    this._$CHAT_MENU = $("#gcChatMenu");
    this.$SPECTATE_HOST_ICON = $("#gcSpectateListButtonHostIcon");

    this.$CHAT_TEXTAREA_CONTAINER = $(".gcInputContainer > .textAreaContainer");

    this.$SPECTATE_BUTTON = $("#gcSpectatorListContent > .gcInputContainer");
    this.$QUEUE_BUTTON = $("#gcQueueListContent > .gcInputContainer");

    this.$PLAYER_ONLY_MESSAGE = $("#gcPlayerOnlyMessage");
    this.playerOnlyMode = false;

    this.noEmoteMode = false;

    this.spectators = [];
    this.queueMap = {};
    this.lastChatCursorPosition = 0;
    this.atSelfRegex; //Set in setup
    this.emoteBubler; //Set in setup
    this.displayJoinLeaveMessages = true;

    this.MAX_CHAT_MESSAGES = 200;
    this.currentMessageCount = 0;

    this.CHAT_COOLDOWN_LENGTH = 3650; //ms
    this.lastMessageCooldown = 0;
    this.slowModeActive = false;
    this.$cooldownBar = $("#gcInputCooldownBar");
    this.$cooldownBarContainer = $("#gcInputCooldownContainer");
    this.$cooldownBarContainer.popover({
        content: "Chat in slowmode",
        trigger: "manual",
        html: true,
        placement: "top"
    });
    this.cooldownPopoverTimeout;
    this.COOLDOWN_POPOVER_DISPLAY_TIME = 1000; //ms

    this.SPAM_COOLDOWN = 30000; //ms
    this.lastMessageInfo = null;

    this.MINIMUM_LEVEL_TO_CHAT_IN_SLOW_MODE = 15;

    this._TABS = {
        CHAT: 1,
        SPECTATORS: 2,
        QUEUE: 3
    };
    this.currentTab = this._TABS.CHAT;

    this.serverMsgTemplate = $("#gcServerMsgTemplate").html();
    this.playerMsgTemplate = $("#gcPlayerMsgTemplate").html();
    this.playerMsgBadgeTemplate = $("#gcPlayerMsgBadgeTemplate").html();
    this.spectatorListItemTemplate = $("#gcSpectatorListItem").html();
    this._PLAYER_COMMANDS_TEMPLATE = $("#chatPlayerCommandsTemplate").html();
    this._QUEUE_ENTRY_TEMPLATE = $("#gcQueueEntryTemplate").html();

    this.$teamChatSwitchContainer = $("#gcTeamChatSwitchContainer");
    this.teamChatSwitch = new Switch($("#gcTeamChatSwitch"));

    this.emoteSelectorWrapper = new EmoteSelectorInputWrapper(this.$chatInputField, "#gcInput");

    this.$chatInputField.keypress(
        function (e) {
            if (e.which == 13) {
                //On enter
                if (isGameAdmin && this.MOD_BAN_MESSAGE_COMMAND_REGEX.test(this.$chatInputField.val())) {
                    this.banMessage();
                } else if (isGameAdmin && this.MOD_CLEAR_BAN_MESSAGE_REGEX.test(this.$chatInputField.val())) {
                    this.clearBannedMessages();
                } else {
                    if (!this.playerOnlyMode) {
                        this.sendMessage();
                    }
                }
                e.preventDefault();
            }

            this.updateChatScroll();

            quiz.setInputInFocus(false);
        }.bind(this)
    );

    this.$chatInputField.keyup(() => {
        if (this.getTeamChatToggleSwitchActive()) {
            let inputValue = this.$chatInputField.val();
            if (inputValue === "/team" && !this.teamChatSwitch.on) {
                this.teamChatSwitch.setOn(true);
                this.$chatInputField.val("");
                return;
            } else if (inputValue === "/all" && this.teamChatSwitch.on) {
                this.teamChatSwitch.setOn(false);
                this.$chatInputField.val("");
                return;
            }
        }
        this.updateChatScroll();
        if (isGameAdmin) {
            if (this.MOD_BAN_MESSAGE_COMMAND_REGEX.test(this.$chatInputField.val())) {
                this.$chatInputField.attr("maxlength", this.MAX_MESSAGE_LENGTH + this.MOD_BAN_MESSAGE_LENGTH);
            } else {
                this.$chatInputField.attr("maxlength", this.MAX_MESSAGE_LENGTH);
            }
        }
        this.emoteSelectorWrapper.handleKeypress();
    });

    this.$chatInputField.click(() => {
        if (guestRegistrationController.isGuest) {
            displayMessage("Unavailable for Guess Accounts", "Guest accounts are not able to send chat messages");
        } else {
            quiz.setInputInFocus(false);
        }
    });
    this.$chatInputField.focus(() => {
        if (guestRegistrationController.isGuest) {
            this.$chatInputField.blur();
        }
    });


    this.$chatInputField.on("focusout", () => {
        this.lastChatCursorPosition = this.$chatInputField[0].selectionStart;
    });

    $(window).resize(() => {
        this.updateChatScroll();
        this.emoteBubler.resize();
        this.$SCROLLABLE_CONTAINERS.perfectScrollbar("update");
        if (this.currentTab === this._TABS.SPECTATORS) {
            this.spectators.forEach((spectator) => {
                this.updateSpectatorNameFontSize(spectator.name);
            });
        }
    });

    this.$CHAT_TEXTAREA_CONTAINER.perfectScrollbar({
        suppressScrollX: true,
        scrollYMarginOffset: 5
    });

    //LISTNERS
    this._newMessageListner = new Listener(
        "Game Chat Message",
        function (payload) {
            this.chatMessage(payload);
        }.bind(this)
    );

    this._newSystemMessageListner = new Listener(
        "Game System Chat Message",
        function (payload) {
            this.systemMessage(payload.message);
        }.bind(this)
    );

    this._chatUpdateListener = new Listener(
        "game chat update",
        function (payload) {
            payload.messages.forEach(message => {
                this.chatMessage(message);
            });
            if (payload.bubles.length && !options.disableEmojis) {
                this.emoteBubler.newBubbleEventList(payload.bubles);
            }
        }.bind(this)
    );

    this._newSpectatorListner = new Listener(
        "New Spectator",
        function (spectator) {
            this.addSpectator(spectator);
            if (this.displayJoinLeaveMessages) {
                this.systemMessage(spectator.name + " has started spectating.", "");
            }
        }.bind(this)
    );

    this._spectatorLeftListner = new Listener(
        "Spectator Left",
        function (payload) {
            if (payload.kicked) {
                gameChat.systemMessage(payload.spectator + " kicked from the room.");
            } else {
                let hostMessage = "";
                if (payload.newHost) {
                    hostMessage = payload.newHost + " is the new host";
                    this.$SPECTATE_HOST_ICON.addClass("hidden");
                    if (payload.newHost === selfName) {
                        this.enableHostOptions(payload.newHost);
                    } else {
                        this.disableHostOptions();
                    }
                }
                if (this.displayJoinLeaveMessages) {
                    this.systemMessage(payload.spectator + " has stopped spectating.", hostMessage);
                }
            }
            this.removeSpectator(payload.spectator);
            this.removePlayerFromQueue(payload.spectator);
        }.bind(this)
    );

    this._playerLeaveListner = new Listener(
        "Player Left",
        function (change) {
            if (change.kicked) {
                gameChat.systemMessage(change.player.name + " kicked from the room.");
            } else {
                let hostMessage = "";
                if (change.newHost) {
                    hostMessage = change.newHost + " is the new host";
                    if (change.newHost === selfName) {
                        this.enableHostOptions(change.newHost);
                    } else {
                        this.disableHostOptions();
                    }
                }
                if (this.displayJoinLeaveMessages) {
                    let baseMessage = change.disconnect ? ' disconnected.' : " left the room.";
                    gameChat.systemMessage(change.player.name + baseMessage, hostMessage);
                }
            }
        }.bind(this)
    );

    this._spectatorChangeToPlayer = new Listener(
        "Spectator Change To Player",
        function (player) {
            this.removeSpectator(player.name);
            if (selfName === player.name) {
                gameChat.setSpectatorButtonState(true);
                gameChat.setQueueButtonState(false);
            }
            this.removePlayerFromQueue(player.name);
            if (lobby.hostName === player.name) {
                this.$SPECTATE_HOST_ICON.addClass("hidden");
            }
        }.bind(this)
    );

    this._kickedFromGameListner = new Listener(
        "Kicked From Game",
        function () {
            viewChanger.changeView("roomBrowser", {supressServerMsg: true});
            displayMessage("You have been kicked from the game");
        }.bind(this)
    );

    this._forceSpectatorListner = new Listener(
        "Player Changed To Spectator",
        function (payload) {
            let playerName = payload.spectatorDescription.name;
            this.addSpectator(payload.spectatorDescription, payload.isHost);
            if (this.displayJoinLeaveMessages) {
                gameChat.systemMessage(playerName + " changed to spectator", "");
            }
            if (selfName === playerName) {
                gameChat.setSpectatorButtonState(false);
                gameChat.setQueueButtonState(true);
            }
        }.bind(this)
    );

    this._settingChangeListener = new Listener("Room Settings Changed", (changes) => {
        Object.keys(changes).forEach((key) => {
            if (key === "modifiers") {
                this.toggleQueueTab(changes.modifiers.queueing);
                if (!changes.modifiers.queueing) {
                    this.resetQueue();
                }
            }
        });
    });

    this._newQueueEntryListener = new Listener("new player in game queue", (newEntry) => {
        this.addPlayerToQueue(newEntry.name);
    });

    this._playerLeftQueueListener = new Listener("player left queue", (payload) => {
        this.removePlayerFromQueue(payload.name);
    });

    this._hostPromotionListner = new Listener(
        "Host Promotion",
        function (payload) {
            this.$spectatorList.find(".gcSpectatorHostIcon").addClass("hidden");
            let $hostEntry = this.$spectatorList.find("#gcSpectatorItem-" + payload.newHost);
            if ($hostEntry.length > 0) {
                $hostEntry.find(".gcSpectatorHostIcon").removeClass("hidden");
                this.$SPECTATE_HOST_ICON.removeClass("hidden");
            } else {
                this.$SPECTATE_HOST_ICON.addClass("hidden");
            }
            if (payload.newHost === selfName) {
                this.enableHostOptions(payload.newHost);
            } else {
                this.disableHostOptions();
            }
        }.bind(this)
    );

    this._playerNameChangeListner = new Listener(
        "player name change",
        function (payload) {
            this.updateNameInChat(payload.oldName, payload.newName);
        }.bind(this)
    );

    this._spectatorNameChangeListner = new Listener(
        "spectator name change",
        function (payload) {
            this.updateNameInChat(payload.oldName, payload.newName);
            this.spectators.find((spectator) => {
                return spectator.name === payload.oldName;
            }).name = payload.newName;
            let $entry = $("#gcSpectatorItem-" + payload.oldName);
            $("#gcSpectatorItem-" + payload.oldName + " > h3 > span").text(payload.newName);
            this.bindSpectatorClickFunctions($entry, payload.newName, payload.oldName);
            $entry.attr("id", "gcSpectatorItem-" + payload.newName);
            this.updateSpectatorNameFontSize(payload.newName);
        }.bind(this)
    );

    this._deletePlayerMessagesListener = new Listener(
        "delete player messages",
        function (payload) {
            this.deletePlayersMessagesInChat(payload.playerName);
        }.bind(this)
    );

    this._deleteChatMessageListener = new Listener(
        "delete chat message",
        function (payload) {
            $("#gcPlayerMessage-" + payload.messageId)
                .find(".gcMessage")
                .text("[deleted]");
        }.bind(this)
    );

    this._pauseTriggerListener = new Listener(
        "quiz pause triggered",
        function (payload) {
            if (payload.noPlayerPause) {
                this.systemMessage("All players disconnected, pausing while waiting for reconnects", "");
            } else {
                this.systemMessage(payload.playerName + " has paused the game", "");
            }
        }.bind(this)
    );

    this._unpauseTriggerListener = new Listener(
        "quiz unpause triggered",
        function (payload) {
            this.systemMessage(payload.playerName + " has unpaused the game", "");
        }.bind(this)
    );

    this._playerRejoiningListener = new Listener(
        "Rejoining Player",
        function ({name}) {
            if (this.displayJoinLeaveMessages) {
                gameChat.systemMessage(name + " has reconnected", "");
            }
        }.bind(this)
    );

    this._answerResultsListener = new Listener(
        "answer results",
        function (payload) {
            if (payload.lateJoinPlayers) {
                payload.lateJoinPlayers.forEach(({name}) => {
                    this.removeSpectator(name);
                    this.removePlayerFromQueue(name);
                });
            }
        }.bind(this)
    );

    this._playerLateJoinListener = new Listener(
        "player late join",
        function (payload) {
            this.removeSpectator(payload.newPlayer.name);
            this.removePlayerFromQueue(payload.newPlayer.name);
        }.bind(this)
    );
}

GameChat.prototype.setup = function () {
    this.$SCROLLABLE_CONTAINERS.perfectScrollbar({
        suppressScrollX: true
    });
    this.atSelfRegex = new RegExp("(\\s|^)@" + selfName + "(\\b|$)", "i");
    this.emoteBubler = new EmoteBubler();
};

GameChat.prototype.openView = function () {
    //Check if already open
    if (!this.open) {
        this._newMessageListner.bindListener();
        this._newSystemMessageListner.bindListener();
        this._chatUpdateListener.bindListener();
        this._newSpectatorListner.bindListener();
        this._spectatorLeftListner.bindListener();
        this._playerLeaveListner.bindListener();
        this._spectatorChangeToPlayer.bindListener();
        this._kickedFromGameListner.bindListener();
        this._forceSpectatorListner.bindListener();
        this._settingChangeListener.bindListener();
        this._newQueueEntryListener.bindListener();
        this._playerLeftQueueListener.bindListener();
        this._hostPromotionListner.bindListener();
        this._playerNameChangeListner.bindListener();
        this._spectatorNameChangeListner.bindListener();
        this._deletePlayerMessagesListener.bindListener();
        this._deleteChatMessageListener.bindListener();
        this._pauseTriggerListener.bindListener();
        this._unpauseTriggerListener.bindListener();
        this._playerRejoiningListener.bindListener();
        this._answerResultsListener.bindListener();
        this._playerLateJoinListener.bindListener();

        this.$view.removeClass("hidden");
        this.$SCROLLABLE_CONTAINERS.perfectScrollbar("update");
        this.emoteBubler.resize();

        window.onbeforeunload = function () {
            return "Leaving the page will leave the game. Sure you want to continue?";
        };

        this.open = true;
    }
};

GameChat.prototype.closeView = function () {
    this._newMessageListner.unbindListener();
    this._newSystemMessageListner.unbindListener();
    this._chatUpdateListener.unbindListener();
    this._newSpectatorListner.unbindListener();
    this._spectatorLeftListner.unbindListener();
    this._playerLeaveListner.unbindListener();
    this._spectatorChangeToPlayer.unbindListener();
    this._kickedFromGameListner.unbindListener();
    this._forceSpectatorListner.unbindListener();
    this._settingChangeListener.unbindListener();
    this._newQueueEntryListener.unbindListener();
    this._playerLeftQueueListener.unbindListener();
    this._hostPromotionListner.unbindListener();
    this._playerNameChangeListner.unbindListener();
    this._spectatorNameChangeListner.unbindListener();
    this._deletePlayerMessagesListener.unbindListener();
    this._deleteChatMessageListener.unbindListener();
    this._pauseTriggerListener.unbindListener();
    this._unpauseTriggerListener.unbindListener();
    this._playerRejoiningListener.unbindListener();
    this._answerResultsListener.unbindListener();
    this._playerLateJoinListener.unbindListener();

    this.$view.addClass("hidden");

    //remove active items in the view
    this.spectators = [];
    this.$spectatorCounter.text(0);
    this.$spectatorList.html("");
    this.$chatMessageContainer.find("li").remove();
    this.currentMessageCount = 0;
    this.$SPECTATE_HOST_ICON.addClass("hidden");
    this.toggleShowTeamChatSwitch(false);
    this.resetQueue();
    this.viewChat();
    this.lastMessageInfo = null;
    this.setPlayerOnlyMode(false);
    emojiSelector.setLockInMode(false);
    this.emoteSelectorWrapper.hide();
    this.noEmoteMode = false;

    window.onbeforeunload = function () {
        return;
    };

    this.open = false;
};

GameChat.prototype.systemMessage = function (title, msg, teamMessage) {
    if (!msg) {
        msg = "";
    }

    let $msg = $(format(this.serverMsgTemplate, title, msg));

    if (teamMessage) {
        $msg.find(".gcTeamMessageIcon").removeClass("hide");
    }

    this.insertMsg($msg);
};

GameChat.prototype.chatMessage = function ({
                                               sender,
                                               modMessage,
                                               message,
                                               emojis,
                                               badges,
                                               messageId,
                                               atEveryone,
                                               teamMessage
                                           }) {
    if (socialTab.isBlocked(sender) && !modMessage) {
        return;
    }
    let $chatMessage = $(format(this.playerMsgTemplate, escapeHtml(sender), passChatMessage(message, emojis), messageId));
    popoutEmotesInMessage($chatMessage, "#gcChatContent");
    let $badgeContainer = $chatMessage.find(".chatBadges");
    badges.forEach((badge) => {
        let $badge = $(this.playerMsgBadgeTemplate);
        new PreloadImage($badge, cdnFormater.newBadgeSrc(badge.fileName), cdnFormater.newBadgeSrcSet(badge.fileName));
        $badge.popover({
            content: createBadgePopoverHtml(badge.fileName, badge.name),
            html: true,
            delay: 50,
            placement: "auto top",
            trigger: "hover",
            container: "#gcChatContent"
        });
        $badgeContainer.append($badge);
    });

    if (teamMessage) {
        $chatMessage.find(".gcTeamMessageIcon").removeClass("hide");
    }

    if (selfName !== sender) {
        let $username = $chatMessage.find(".gcUserName");
        $username.addClass("clickAble");
        let openProfileFunction = () => {
            playerProfileController.loadProfileIfClosed(sender, $username, {}, () => {
            }, false, true);
        };
        if (!isGameAdmin) {
            $username.click(openProfileFunction);
        } else {
            let hoverFucntion = createHoverablePopoverHandlers($chatMessage, sender);
            $username
                .popover({
                    html: true,
                    content: this._PLAYER_COMMANDS_TEMPLATE,
                    placement: "auto top",
                    trigger: "click",
                    container: "#gcChatContent"
                })
                .on("mouseleave", hoverFucntion.onMouseLeave)
                .on("inserted.bs.popover", () => {
                    let $entry = $("#gcChatContent .popover");
                    $entry.find(".playerModCommandIcon").removeClass("hide");
                    $entry.find(".playerCommandFlagIcon").click(() => {
                        socket.sendCommand({
                            type: "lobby",
                            command: "mod message flag",
                            data: {
                                messageId: messageId
                            }
                        });
                    });
                    $entry.find(".playerCommandBanSpamIcon").click(() => {
                        displayOption(
                            "Issue Chat Ban/Warning to " + sender + "?",
                            "Reason for ban/warning: Spam",
                            "Ok",
                            "Cancel",
                            () => {
                                socket.sendCommand({
                                    type: "lobby",
                                    command: "instant mod flag",
                                    data: {
                                        type: this.MOD_INSTANT_FLAG_TYPES.SPAM,
                                        targetName: sender,
                                        messageId: messageId
                                    }
                                });
                            }
                        );
                    });
                    $entry.find(".playerCommandBanSpoilIcon").click(() => {
                        displayOption(
                            "Issue Chat Ban/Warning to " + sender + "?",
                            "Reason for ban/warning: Spoiling/Hinting",
                            "Ok",
                            "Cancel",
                            () => {
                                socket.sendCommand({
                                    type: "lobby",
                                    command: "instant mod flag",
                                    data: {
                                        type: this.MOD_INSTANT_FLAG_TYPES.SPOILING,
                                        targetName: sender,
                                        messageId: messageId
                                    }
                                });
                            }
                        );
                    });
                    $entry.find(".playerCommandBanNegativeIcon").click(() => {
                        displayOption(
                            "Issue Chat Ban/Warning to " + sender + "?",
                            "Reason for ban/warning: Offensive Message",
                            "Ok",
                            "Cancel",
                            () => {
                                socket.sendCommand({
                                    type: "lobby",
                                    command: "instant mod flag",
                                    data: {
                                        type: this.MOD_INSTANT_FLAG_TYPES.NEGATIVE,
                                        targetName: sender,
                                        messageId: messageId
                                    }
                                });
                            }
                        );
                    });
                    $entry.find(".playerCommandProfileIcon").click(openProfileFunction);
                })
                .click(hoverFucntion.onClick);
        }
    } else {
        let recentChanged = false;
        getShortCodesInMessage(message).forEach((shortCode) => {
            recentChanged = true;
            emojiSelector.insertRecentEmote(null, null, shortCode);
        });
        emojis.emotes.forEach((emoteId) => {
            recentChanged = true;
            emojiSelector.insertRecentEmote(emoteId);
        });
        emojis.customEmojis.forEach((emoji) => {
            recentChanged = true;
            emojiSelector.insertRecentEmote(null, emoji.id);
        });

        if (recentChanged) {
            emojiSelector.buildRecent();
        }
    }

    if (this.atSelfRegex.test(message) || atEveryone) {
        $chatMessage.addClass("highlight");
    }

    if (this.MAX_CHAT_MESSAGES + 1 === this.currentMessageCount) {
        this.removeTwoOldestMessages();
        this.currentMessageCount--;
    } else {
        this.currentMessageCount++;
    }

    this.insertMsg($chatMessage);
};

GameChat.prototype.removeTwoOldestMessages = function () {
    this.$chatMessageContainer.children("li:first-of-type").remove();
    this.$chatMessageContainer.children("li:first-of-type").remove();
};

GameChat.prototype.insertMsg = function (msg) {
    let atBottom =
        this.$chatMessageContainer.scrollTop() + this.$chatMessageContainer.innerHeight() >=
        this.$chatMessageContainer[0].scrollHeight - 100;
    this.$chatMessageContainer.append(msg);
    this.$SCROLLABLE_CONTAINERS.perfectScrollbar("update");
    if (atBottom) {
        this.$chatMessageContainer.scrollTop(this.$chatMessageContainer.prop("scrollHeight"));
    }
};

GameChat.prototype.sendMessage = function () {
    let msg = this.$chatInputField.val().trim();
    if (msg != "") {
        if (this.slowModeActive && this.lastMessageCooldown >= new Date().getTime()) {
            this.displaySlowModeMessage("Chat in slowmode");
        } else if (this.slowModeActive && this.messageRepeated(msg)) {
            this.displaySlowModeMessage("Repeated message too soon");
        } else if (this.slowModeActive && xpBar.level < this.MINIMUM_LEVEL_TO_CHAT_IN_SLOW_MODE) {
            this.displaySlowModeMessage("Level 15 required to use ranked chat");
        } else if (this.noEmoteMode && (messageContainsShortcodes(msg) || storeWindow.messageContainEmote(msg) || patreon.msgContainsCustomEmoji(msg))) {
            if (msg.match(/\s/g)) {
                this.displaySlowModeMessage("Emotes disabled doing ranked guessing");
            } else {
                emojiSelector.lockInEmoteInMsg(msg);
                this.$chatInputField.val("");
                this.lastChatCursorPosition = 0;
                this.displaySlowModeMessage("Emote Locked In");
            }
        } else {
            socket.sendCommand({
                type: "lobby",
                command: "game chat message",
                data: {
                    msg: msg,
                    teamMessage: this.teamChatSwitch.on
                }
            });
            this.$chatInputField.val("");
            this.lastChatCursorPosition = 0;

            if (this.slowModeActive) {
                let now = new Date().getTime();
                this.$cooldownBar.addClass("active");
                this.lastMessageCooldown = now + this.CHAT_COOLDOWN_LENGTH;
                setTimeout(() => {
                    this.$cooldownBar.removeClass("active");
                    this.$cooldownBarContainer.popover("hide");
                }, this.CHAT_COOLDOWN_LENGTH);

                this.lastMessageInfo = {
                    msg,
                    cooldownUntil: now + this.SPAM_COOLDOWN
                };
            }
        }
    }
};

GameChat.prototype.banMessage = function () {
    let bannedMessage = this.$chatInputField.val().trim().replace(this.MOD_BAN_MESSAGE_COMMAND_REGEX, "");
    socket.sendCommand({
        type: "lobby",
        command: "game chat message ban",
        data: {
            msg: bannedMessage
        }
    });
    this.$chatInputField.val("");
    this.lastChatCursorPosition = 0;
};

GameChat.prototype.clearBannedMessages = function () {
    socket.sendCommand({
        type: "lobby",
        command: "game chat clear message ban"
    });
    this.$chatInputField.val("");
    this.lastChatCursorPosition = 0;
};

GameChat.prototype.displaySlowModeMessage = function (msg) {
    this.$cooldownBarContainer.data("bs.popover").options.content = msg;
    this.$cooldownBarContainer.popover("show");
    clearTimeout(this.cooldownPopoverTimeout);
    this.cooldownPopoverTimeout = setTimeout(() => {
        this.$cooldownBarContainer.popover("hide");
    }, this.COOLDOWN_POPOVER_DISPLAY_TIME);
};

GameChat.prototype.messageRepeated = function (msg) {
    return (
        this.lastMessageInfo &&
        this.lastMessageInfo.msg === msg &&
        this.lastMessageInfo.cooldownUntil > new Date().getTime()
    );
};

GameChat.prototype.updateNameInChat = function (targetName, newName) {
    $(".gcUserName").each(function () {
        let $entry = $(this);
        if ($entry.text() === targetName) {
            $entry.text(newName);
        }
    });
};

GameChat.prototype.deletePlayersMessagesInChat = function (playerName) {
    this.$chatMessageContainer.find("li").each(function () {
        let $entry = $(this);
        if ($entry.find(".gcUserName").text() === playerName) {
            $entry.find(".gcMessage").text("[deleted]");
        }
    });
    this.$SCROLLABLE_CONTAINERS.perfectScrollbar("update");
};

GameChat.prototype.viewSpectators = function () {
    this.resetView();
    this.$spectatorView.removeClass("hidden");
    this.$spectateListButton.addClass("selected");
    this.$SCROLLABLE_CONTAINERS.perfectScrollbar("update");
    $('[data-toggle="tooltip"]').tooltip();
    this.currentTab = this._TABS.SPECTATORS;
    this.spectators.forEach((spectator) => {
        this.updateSpectatorNameFontSize(spectator.name);
    });
};

GameChat.prototype.viewChat = function () {
    this.resetView();
    this.$chatView.removeClass("hidden");
    this.$gameChatButton.addClass("selected");
    this.$SCROLLABLE_CONTAINERS.perfectScrollbar("update");
    this.$chatMessageContainer.scrollTop(this.$chatMessageContainer.prop("scrollHeight"));
    this.currentTab = this._TABS.CHAT;
    this.emoteBubler.resize();
};

GameChat.prototype.viewQueue = function () {
    this.resetView();
    this.$QUEUE_TAB.removeClass("hidden");
    this.$QUEUE_LIST_BUTTON.addClass("selected");
    this.$SCROLLABLE_CONTAINERS.perfectScrollbar("update");
    this.currentTab = this._TABS.QUEUE;
};

GameChat.prototype.resetView = function () {
    this.$spectateListButton.removeClass("selected");
    this.$gameChatButton.removeClass("selected");
    this.$QUEUE_LIST_BUTTON.removeClass("selected");
    this.$chatView.addClass("hidden");
    this.$spectatorView.addClass("hidden");
    this.$QUEUE_TAB.addClass("hidden");
};

GameChat.prototype.addSpectator = function (spectator, isHost) {
    this.spectators.push(spectator);

    let name = spectator.name;
    this.$spectatorList.append(format(this.spectatorListItemTemplate, name));
    let item = $("#gcSpectatorItem-" + name);
    this.bindSpectatorClickFunctions(item, name);
    if (isHost) {
        item.find(".gcSpectatorHostIcon").removeClass("hidden");
        this.$SPECTATE_HOST_ICON.removeClass("hidden");
    }

    let nameWidth = item.find("h3").innerWidth();
    if (!nameWidth) {
        //handle case where spectatorlist is not displayed (nameWidth 0)
        $("#measureBox").append(item.clone());
        nameWidth = $("#measureBox").find("h3").innerWidth();
        $("#measureBox").html("");
        item.find(".gcSpectatorIconContainer").css("width", "calc(100% - 15px - " + nameWidth + "px)");
    } else {
        this.updateSpectatorNameFontSize(spectator.name);
    }
    item.find(".gcSpectatorIconContainer").perfectScrollbar({
        suppressScrollY: true,
        useBothWheelAxes: true
    });

    item.find('[data-toggle="tooltip"]').tooltip();
    this.$SCROLLABLE_CONTAINERS.perfectScrollbar("update");

    if (!lobby.isHost || name === selfName) {
        item.find(".playerCommandIconKick").addClass("disabled");
        item.find(".playerCommandIconPromote").addClass("disabled");
    }

    this.$spectatorList
        .find("li")
        .sort((a, b) => {
            return $(a).attr("id") > $(b).attr("id") ? 1 : -1;
        })
        .appendTo(this.$spectatorList);
    this.$spectatorList.perfectScrollbar("update");

    //Update spectator count
    this.$spectatorCounter.text(this.spectators.length);
};

GameChat.prototype.bindSpectatorClickFunctions = function ($entry, name) {
    let $profileButton = $entry.find(".playerCommandProfileIcon");
    $profileButton.unbind("click").click(() => {
        playerProfileController.loadProfileIfClosed(name, $profileButton, {}, () => {
        }, false, true);
    });
    $entry
        .find(".playerCommandIconPromote")
        .unbind("click")
        .click(() => {
            lobby.promoteHost(name);
        });
    $entry
        .find(".playerCommandIconKick")
        .unbind("click")
        .click(() => {
            gameChat.kickSpectator(name);
        });
};

GameChat.prototype.updateSpectatorNameFontSize = function (spectatorName) {
    let $container = $("#gcSpectatorItem-" + spectatorName);
    let $nameContainer = $container.find("h3");
    let $text = $nameContainer.find("span");
    fitTextToContainer($text, $nameContainer, 24, 16);
    $container
        .find(".gcSpectatorIconContainer")
        .css("width", "calc(100% - 15px - " + $nameContainer.innerWidth() + "px)");
};

GameChat.prototype.removeSpectator = function (spectatorName) {
    let index = -1;
    for (let i = 0; i < this.spectators.length; i++) {
        if (spectatorName === this.spectators[i].name) {
            index = i;
            break;
        }
    }
    this.spectators.splice(index, 1);

    $("#gcSpectatorItem-" + spectatorName + " .playerCommandIcon").tooltip("hide");
    $("#gcSpectatorItem-" + spectatorName).remove();
    this.$spectatorList.perfectScrollbar("update");

    //Update spectator count
    this.$spectatorCounter.text(this.spectators.length);
};

GameChat.prototype.enableHostOptions = function (newHostName) {
    $(".gcSpectatorIconContainer .playerCommandIconKick").removeClass("disabled");
    $(".gcSpectatorIconContainer .playerCommandIconPromote").removeClass("disabled");
    if (newHostName === selfName) {
        let $hostEntry = this.$spectatorList.find("#gcSpectatorItem-" + newHostName);
        $hostEntry.find(".playerCommandIconKick").addClass("disabled");
        $hostEntry.find(".playerCommandIconPromote").addClass("disabled");
    }
};

GameChat.prototype.disableHostOptions = function () {
    $(".gcSpectatorIconContainer .playerCommandIconKick").addClass("disabled");
    $(".gcSpectatorIconContainer .playerCommandIconPromote").addClass("disabled");
};

GameChat.prototype.kickSpectator = function (playerName) {
    displayOption(
        "Kick " + playerName + "?",
        "Kicked players will be unable to rejoin the game",
        "Kick",
        "Cancel",
        () => {
            socket.sendCommand({
                type: "lobby",
                command: "kick player",
                data: {playerName: playerName}
            });
        }
    );
};

GameChat.prototype.isShown = function () {
    return !this.$view.hasClass("hidden");
};

GameChat.prototype.setSpectatorButtonState = function (enabled) {
    if (enabled) {
        this.$SPECTATE_BUTTON.removeClass("disabled");
    } else {
        this.$SPECTATE_BUTTON.addClass("disabled");
    }
};

GameChat.prototype.setQueueButtonState = function (enabled) {
    if (enabled) {
        this.$QUEUE_BUTTON.removeClass("disabled");
    } else {
        this.$QUEUE_BUTTON.addClass("disabled");
    }
};

GameChat.prototype.insertEmoji = function (emoji) {
    if (this.noEmoteMode) {
        emojiSelector.lockInEmoteInMsg(emoji);
    } else {
        let text = this.$chatInputField.val();
        let curserIncrease = emoji.length;

        if (text) {
            let before = text.substring(0, this.lastChatCursorPosition);
            let after = text.substring(this.lastChatCursorPosition);
            if (before && !before.match(/ $/)) {
                before += " ";
                curserIncrease++;
            }

            if (after && !after.match(/^ /)) {
                after = " " + after;
                curserIncrease++;
            }

            text = before + emoji + after;
        } else {
            text += emoji;
        }

        if (text.length <= this.MAX_MESSAGE_LENGTH) {
            this.lastChatCursorPosition += curserIncrease;
            this.$chatInputField.val(text);
            this.updateChatScroll();
        }
    }
};

GameChat.prototype.insertText = function (texToInsert) {
    let inputText = this.$chatInputField.val();
    let curserIncrease = texToInsert.length;

    if (inputText) {
        let before = inputText.substring(0, this.lastChatCursorPosition);
        let after = inputText.substring(this.lastChatCursorPosition);

        inputText = before + texToInsert + after;
    } else {
        inputText += texToInsert;
    }

    if (inputText.length <= this.MAX_MESSAGE_LENGTH) {
        this.lastChatCursorPosition += curserIncrease;
        this.$chatInputField.val(inputText);
        this.updateChatScroll();
    }
};

GameChat.prototype.focus = function () {
    this.$chatInputField.focus();
};

GameChat.prototype.updateChatScroll = function () {
    this.$chatInputField.height(1).height(this.$chatInputField[0].scrollHeight);
    this.$CHAT_TEXTAREA_CONTAINER.perfectScrollbar("update");
};

GameChat.prototype.toggleQueueTab = function (on) {
    if (on) {
        this._$CHAT_MENU.addClass("queueEnabled");
    } else {
        if (this.currentTab === this._TABS.QUEUE) {
            this.viewChat();
        }
        this._$CHAT_MENU.removeClass("queueEnabled");
    }
};

GameChat.prototype.joinLeaveQueue = function () {
    if (this.queueMap[selfName]) {
        socket.sendCommand(
            {
                type: "lobby",
                command: "leave game queue"
            },
            (result) => {
                if (result.error) {
                    displayMessage("Unable to Leave Queue", result.error);
                }
            }
        );
    } else {
        socket.sendCommand(
            {
                type: "lobby",
                command: "join game queue"
            },
            (result) => {
                if (result.error) {
                    displayMessage("Unable to Join Queue", result.error);
                }
            }
        );
    }
};

GameChat.prototype.removePlayerFromQueue = function (playerName) {
    let $entry = this.queueMap[playerName];
    if ($entry) {
        delete this.queueMap[playerName];
        $entry.remove();
        this.$QUEUE_LIST.perfectScrollbar("update");
        this.$QUEUE_COUNT.text(Object.keys(this.queueMap).length);
    }
    if (playerName === selfName) {
        this.$QUEUE_JOIN_BUTTON_TEXT.html("Join<br/>Queue");
    }
};

GameChat.prototype.resetQueue = function () {
    Object.keys(this.queueMap).forEach((key) => {
        this.queueMap[key].remove();
    });
    this.queueMap = {};
    this.$QUEUE_COUNT.text(0);
    this.$QUEUE_JOIN_BUTTON_TEXT.html("Join<br/>Queue");
};

GameChat.prototype.addPlayerToQueue = function (playerName) {
    let $entry = $(format(this._QUEUE_ENTRY_TEMPLATE, playerName));
    if (playerName === selfName) {
        $entry.addClass("highlight");
    }
    this.queueMap[playerName] = $entry;

    this.$QUEUE_LIST.append($entry);
    this.$QUEUE_LIST.perfectScrollbar("update");

    this.$QUEUE_COUNT.text(Object.keys(this.queueMap).length);
    if (playerName === selfName) {
        this.$QUEUE_JOIN_BUTTON_TEXT.html("Leave<br/>Queue");
    }
};

GameChat.prototype.toggleShowTeamChatSwitch = function (show) {
    if (show) {
        this.$teamChatSwitchContainer.removeClass("hide");
    } else {
        this.$teamChatSwitchContainer.addClass("hide");
        this.teamChatSwitch.setOn(false);
    }
};

GameChat.prototype.getTeamChatToggleSwitchActive = function () {
    return !this.$teamChatSwitchContainer.hasClass("hide");
};

GameChat.prototype.setPlayerOnlyMode = function (on) {
    this.playerOnlyMode = on;
    if (on) {
        this.$PLAYER_ONLY_MESSAGE.removeClass('hide');
    } else {
        this.$PLAYER_ONLY_MESSAGE.addClass('hide');
    }
};

GameChat.prototype.MOD_INSTANT_FLAG_TYPES = {
    SPAM: 1,
    SPOILING: 2,
    NEGATIVE: 3
};

var gameChat = new GameChat();
