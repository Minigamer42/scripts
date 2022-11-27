"use strict";
/*=======CONSTANTS======*/
const CHAT_BOX_WIDTH = 165;
const CHAT_BASE_OFFSET = -15;

function ChatBar() {
    this.activeChatContainerDom = $("#activeChatContainer");
    this._$ACTIVE_CHAT_SCROLL_CONTAINER = $("#activeChatScrollContainer");

    this.$LEFT_INDICATOR = $("#chatLeftIndicator");
    this.$RIGHT_INDICATOR = $("#chatRightIndicator");

    this.SCROLL_CONTAINER_PADDING = parseInt(this._$ACTIVE_CHAT_SCROLL_CONTAINER.css('padding-left').replace('px', ''));
    this.AUTO_SCROLL_INTERVAL_SIZE = 25;
    this.AUTO_SCROLL_TICK_RATE = 16;

    this.scrollingChat;
    this.scrollTimeout;

    this.activeChats = [];

    this.activeChatContainerDom.perfectScrollbar({
        suppressScrollY: true,
        useBothWheelAxes: true,
        scrollXMarginOffset: 31
    });
    this.activeChatContainerDom.on('ps-scroll-x', () => {
        this.toggleIndicators();
        this.closeOutsideChats();
    });

    //Add listners for new friend requests
    this._newFriendRequestListner = new Listener("new friend request recived", function (payload) {
        this.handleAlert(payload.name, "Friend request received", function (accept) {
            socket.sendCommand({
                type: "social",
                command: "friend request response",
                data: {
                    target: payload.name,
                    accept: accept
                }
            });
        });
    }.bind(this));
    this._newFriendRequestListner.bindListener();

    this._gameInviteListner = new Listener("game invite", function (payload) {
        this.handleAlert(payload.sender, "Invite to Game #" + payload.gameId, function (accept) {
            if (accept) {
                if (lobby.inLobby || quiz.inQuiz) {
                    if (!confirm("By joining another game, you'll quit this one, you sure you want to continue?")) {
                        return;
                    } else {
                        viewChanger.changeView("roomBrowser"); //Leave the game
                    }
                }
                roomBrowser.fireSpectateGame(payload.gameId, undefined, true);
            }
        });
    }.bind(this));
    this._gameInviteListner.bindListener();


    //Add listner for alerts
    this._newChatAlertListener = new Listener("new chat alert", function (payload) {
        this.handleAlert(payload.name, payload.alert);
        this.toggleIndicators();
    }.bind(this));
    this._newChatAlertListener.bindListener();

    //Add listners for new chat messages
    this._chatMessageListener = new Listener("chat message", function (payload) {
        this.handleMessage(payload.sender, payload.message, payload.emojis, payload.modMessage);
        this.toggleIndicators();
    }.bind(this));
    this._chatMessageListener.bindListener();

    this._serverMessageListener = new Listener("server message", function (payload) {
        this.handleServerMessage(payload.message);
        this.toggleIndicators();
    }.bind(this));
    this._serverMessageListener.bindListener();
}

/*
	Contained in socialTab, no global access point
 */


/*===========HANDLERS===============*/
ChatBar.prototype.handleAlert = function (name, message, callback) {
    var chat = this.getChat(name);
    chat.handleAlert(message, callback);
};

ChatBar.prototype.handleMessage = function (name, message, emojis, modMessage) {
    this.getChat(name, modMessage).handleMessage(name, message, emojis);
};

ChatBar.prototype.handleServerMessage = function (message) {
    this.getChat('AMQ').handleMessage('AMQ', message, {
        customEmojis: [],
        emotes: []
    }, true);
    this.getChat('AMQ').setServerMessage();
};

/*=========GETTERS=================*/
ChatBar.prototype.getChat = function (playerName, modMessage) {
    var chat = this.activeChats.find((element) => {
        return element.name === playerName;
    });
    if (!chat) {
        chat = new ChatBox(playerName, this, modMessage);

        this.activeChats.push({
            name: playerName,
            object: chat
        });
        this.updateLayout();
    } else {
        chat = chat.object;
    }

    return chat;
};

ChatBar.prototype.getChatInfo = function (owner) {
    var chatObj = this.activeChats.find((ele) => {
        return ele.name === owner;
    });
    if (chatObj) {
        return {
            chatObject: chatObj,
            index: this.activeChats.indexOf(chatObj)
        };
    } else {
        return undefined;
    }
};

/*=============LAYOUT===============*/
ChatBar.prototype.updateLayout = function () {
    this._$ACTIVE_CHAT_SCROLL_CONTAINER.width(this.activeChats.length * CHAT_BOX_WIDTH);
    this.activeChatContainerDom.perfectScrollbar('update');
    this.toggleIndicators();
    this.closeOutsideChats();
};

ChatBar.prototype.getInsideOffsets = function () {
    let containerWidth = this.activeChatContainerDom.innerWidth();
    let insideLeftOffset = -this._$ACTIVE_CHAT_SCROLL_CONTAINER.position().left;
    let insideRightOffset = insideLeftOffset + containerWidth - CHAT_BOX_WIDTH;

    return {
        right: insideRightOffset,
        left: insideLeftOffset
    };
};

/*===================COMMANDS=======================*/
ChatBar.prototype.toggleIndicators = function () {
    let offsets = this.getInsideOffsets();

    offsets.left -= CHAT_BOX_WIDTH / 2;
    offsets.right += CHAT_BOX_WIDTH / 2;

    let activeOutsideLeft = false;
    let activeOutsideRight = false;
    this.activeChats.forEach(chat => {
        if (chat.object.update) {
            let position = chat.object.getXOffset();
            if (position < offsets.left) {
                activeOutsideLeft = true;
            } else if (position > offsets.right) {
                activeOutsideRight = true;
            }
        }
    });

    if (activeOutsideLeft) {
        this.$LEFT_INDICATOR.addClass("runAnimation");
    } else {
        this.$LEFT_INDICATOR.removeClass("runAnimation");
    }
    if (activeOutsideRight) {
        this.$RIGHT_INDICATOR.addClass("runAnimation");
    } else {
        this.$RIGHT_INDICATOR.removeClass("runAnimation");
    }
};

ChatBar.prototype.closeOutsideChats = function () {
    let offsets = this.getInsideOffsets();

    offsets.left += this.SCROLL_CONTAINER_PADDING;

    this.activeChats.forEach(chat => {
        let position = chat.object.getXOffset();
        if (position < offsets.left || position > offsets.right) {
            chat.object.close();
        }
    });
};

ChatBar.prototype.startChat = function (name) {
    var chat = this.getChat(name);
    this.scrollToChat(chat);
    chat.open();
};

ChatBar.prototype.scrollToChat = function (chat) {
    this.clearScroll();
    let offsets = this.getInsideOffsets();
    offsets.left += this.SCROLL_CONTAINER_PADDING;
    let chatOffset = chat.getXOffset();
    if (chatOffset < offsets.left) {
        this.scrollingChat = chat;
        this.scrollRight(offsets.left - chatOffset);
    } else if (chatOffset > offsets.right) {
        this.scrollingChat = chat;
        this.scrollLeft(chatOffset - offsets.right);
    }
};

ChatBar.prototype.scrollRight = function (scrollingLeft) {
    let tickSize = scrollingLeft < this.AUTO_SCROLL_INTERVAL_SIZE ? scrollingLeft : this.AUTO_SCROLL_INTERVAL_SIZE;

    let newScroll = this.activeChatContainerDom.scrollLeft() - tickSize;
    this.activeChatContainerDom.scrollLeft(newScroll);

    scrollingLeft -= tickSize;
    if (scrollingLeft > 0) {
        this.scrollTimeout = setTimeout(() => {
            this.scrollRight(scrollingLeft);
        }, this.AUTO_SCROLL_TICK_RATE);
    } else {
        this.scrollingChat.moveing = false;
    }
};

ChatBar.prototype.scrollLeft = function (scrollingLeft) {
    let tickSize = scrollingLeft < this.AUTO_SCROLL_INTERVAL_SIZE ? scrollingLeft : this.AUTO_SCROLL_INTERVAL_SIZE;

    let newScroll = this.activeChatContainerDom.scrollLeft() + tickSize;
    this.activeChatContainerDom.scrollLeft(newScroll);

    scrollingLeft -= tickSize;
    if (scrollingLeft > 0) {

        this.scrollTimeout = setTimeout(() => {
            this.scrollLeft(scrollingLeft);
        }, this.AUTO_SCROLL_TICK_RATE);
    } else {
        this.scrollingChat.moveing = false;
    }
};

ChatBar.prototype.clearScroll = function () {
    clearTimeout(this.scrollTimeout);
    if (this.scrollingChat) {
        this.scrollingChat.moveing = false;
    }
};

ChatBar.prototype.deleteChat = function (owner) {
    var chat;
    var chatIndex;
    this.activeChats.some((chatEle, index) => {
        if (chatEle.name === owner) {
            chat = chatEle;
            chatIndex = index;
            return true;
        } else {
            return false;
        }
    });
    if (chat) {
        this.activeChats.splice(chatIndex, 1);
        chat.object.delete();
        this.updateLayout();
    }
};

ChatBar.prototype.shiftChatRight = function (chatName) {
    var info = this.getChatInfo(chatName);
    if (info.index === 0) {
        //Already far right, can't move
        return;
    }

    //Change position of objects in array'
    var newPos = info.index - 1;
    var otherChatObject = this.activeChats[newPos];
    this.activeChats[info.index] = otherChatObject;
    this.activeChats[newPos] = info.chatObject;

    //Change order of elements
    var chat = info.chatObject.object;
    var otherChat = otherChatObject.object;

    otherChat.dom.before(chat.dom);

    //Update posible offset change
    if (otherChat.getOffset() < chat.getOffset()) {
        otherChat.setOffset(CHAT_BASE_OFFSET);
    }
};

ChatBar.prototype.shiftChatLeft = function (chatName) {
    var info = this.getChatInfo(chatName);
    if (info.index === this.activeChats.length - 1) {
        //Already far left, can't move
        return;
    }

    //Change position of objects in array'
    var newPos = info.index + 1;
    var otherChatObject = this.activeChats[newPos];
    this.activeChats[info.index] = otherChatObject;
    this.activeChats[newPos] = info.chatObject;

    //Change order of elements
    var chat = info.chatObject.object;
    var otherChat = otherChatObject.object;

    otherChat.dom.after(chat.dom);

    //Update posible offset change
    this.scrollToChat(chat);
};