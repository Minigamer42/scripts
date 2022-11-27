"use strict";
/*exported ChatBox*/

/*================TEMPLATES===================*/
var chatBoxTemplate = $("#chatboxContainer").html();
var chatHeaderInputTemplate = $("#chatHeaderInputTemplate").html();
var chatBoxLineTemplate = $("#chatBoxLineTemplate").html();
var chatHeaderCloseTemplate = $("#chatHeaderCloseTemplate").html();

/*================CONSTANTS================*/
var CHAT_CONTENT_SIZE = 132;


function ChatBox(name, parentBar, modMessage) {
    this.name = name;
    this.id = "chatBox-" + name;
    this.modMessage = modMessage;

    this.parentBar = parentBar;

    this.update = true;
    this.moveing = false;
    this.targetOnline = true;

    this.dom = $(format(chatBoxTemplate, name));
    if (modMessage) {
        this.dom.find('.chatBoxFooterModIcon').removeClass('hide');
    }
    //Create dom
    $("#activeChatScrollContainer").append(this.dom);

    this.footer = this.dom.find(".chatBoxFooter");

    this.container = this.dom.find(".chatBoxContainer");

    this.$CHAT_INPUT_TEXTAREA = this.dom.find(".chatInput > textarea");

    this.$CHAT_INPUT = this.dom.find('.chatInput');
    this.$CHAT_CONTENT = this.dom.find(".chatContent");
    this.$HEADER = this.dom.find(".header");

    this.emoteSelectorWrapper = new EmoteSelectorInputWrapper(this.$CHAT_INPUT_TEXTAREA, `#${this.id} .chatInput > textarea`);

    this.dom.find(".chatBoxFooter").click(function () {
        this.openClose();
    }.bind(this));

    this.$CHAT_INPUT.perfectScrollbar({
        suppressScrollX: true,
        scrollYMarginOffset: 5
    });

    this.$CHAT_CONTENT.perfectScrollbar({
        suppressScrollX: true
    });

    this.updateFooterFontSize();

    //Bind the send message function
    this.$CHAT_INPUT_TEXTAREA.keyup((key) => {
        this.$CHAT_INPUT_TEXTAREA.height(1).height(this.$CHAT_INPUT_TEXTAREA[0].scrollHeight);
        this.$CHAT_INPUT.perfectScrollbar('update');
        if (!guestRegistrationController.isGuest) {
            quiz.setInputInFocus(false);
        }

        this.emoteSelectorWrapper.handleKeypress();
    });

    this.$CHAT_INPUT_TEXTAREA.click(() => {
        if (guestRegistrationController.isGuest) {
            displayMessage('Unavailable for Guess Accounts', 'Guest accounts are not able to send chat messages');
        } else {
            quiz.setInputInFocus(false);
        }
    });
    this.$CHAT_INPUT_TEXTAREA.focus(() => {
        if (guestRegistrationController.isGuest) {
            this.$CHAT_INPUT_TEXTAREA.blur();
        }
    });

    this.$CHAT_INPUT_TEXTAREA.keypress(function (key) {
        if (key.which === 13 && !key.shiftKey) {
            var msg = this.$CHAT_INPUT_TEXTAREA.val().trim();
            if (/\S/.test(msg)) {
                socket.sendCommand({
                    type: "social",
                    command: "chat message",
                    data: {
                        target: name,
                        message: msg
                    }
                });
                this.$CHAT_INPUT_TEXTAREA.val("");
                lastValue = undefined;
            }
            return false;
        }
    }.bind(this));
    //Input validation
    var lastValue;
    this.$CHAT_INPUT_TEXTAREA.on("input", () => {
        var msg = this.$CHAT_INPUT_TEXTAREA.val();
        if (lastValue && !chatValidator.validateMsg(msg)) {
            this.$CHAT_INPUT_TEXTAREA.val(lastValue);
        } else {
            lastValue = msg;
        }
    });

    //Bind selected
    this.container.click(this.selected.bind(this));

    //Bind close function
    this.container.find('.glyphicon-remove').click(function () {
        parentBar.deleteChat(name);
    }.bind(this));

    //Bind move functions
    this.container.find('.glyphicon-arrow-right').click(() => {
        this.parentBar.shiftChatRight(name);
    });
    this.container.find('.glyphicon-arrow-left').click(() => {
        this.parentBar.shiftChatLeft(name);
    });
    if (this.name === 'AMQ') {
        this.container.find('.playerProfile').addClass('hide');
    } else {
        this.container.find('.playerProfile').click(() => {
            playerProfileController.loadProfileIfClosed(name, this.container, {}, () => {
            }, !this.targetOnline);
        });
    }

    //Add socket listner for if the player goes offline
    this._playerOnlineChangeListener = new Listener("player online change", function (payload) {
        if (payload.name === this.name) {
            if (payload.online) {
                this.handleOnline();
            } else {
                this.handleOffline();
            }
        }
    }.bind(this));
    this._playerOnlineChangeListener.bindListener();
    socket.sendCommand({
        type: "social",
        command: "opened chat",
        data: {
            target: name
        }
    });

    this._messageResponseListner = new Listener("chat message response", (payload) => {
        if (payload.target === this.name) {
            this.writeMessage(selfName, payload.msg, payload.emojis, false);
        }
    });

    this._messageResponseListner.bindListener();
}

/*==========GETTERS==============*/
ChatBox.prototype.getXOffset = function () {
    return this.dom.position().left;
};

ChatBox.prototype.getOffset = function () {
    return parseInt(this.dom.css("margin-right"));
};

ChatBox.prototype.getFooterHeader = function () {
    return this.dom.find(".chatBoxFooter h4");
};

/*===========SETTERS==============*/
ChatBox.prototype.setOffset = function (value) {
    this.dom.css("margin-right", value);
};


/*=============COMMANDS===============*/
ChatBox.prototype.selected = function () {
    this.getFooterHeader().removeClass("chatHighlight");
    this.update = false;
};

ChatBox.prototype.newUpdate = function () {
    this.getFooterHeader().addClass("chatHighlight");
    this.update = true;
};

ChatBox.prototype.writeMessage = function (sender, msg, emojis, allowHtml) {
    msg = passChatMessage(msg, emojis, allowHtml);

    let atBottom = this.$CHAT_CONTENT.scrollTop() + this.$CHAT_CONTENT.innerHeight() >= this.$CHAT_CONTENT[0].scrollHeight;
    this.$CHAT_CONTENT.append(format(chatBoxLineTemplate, msg, sender));
    if (atBottom) {
        this.$CHAT_CONTENT.scrollTop(this.$CHAT_CONTENT.prop("scrollHeight"));
    }
    this.$CHAT_CONTENT.perfectScrollbar('update');
};

ChatBox.prototype.delete = function () {
    this._playerOnlineChangeListener.unbindListener();
    socket.sendCommand({
        type: "social",
        command: "closed chat",
        data: {
            target: this.name
        }
    });
    this._messageResponseListner.unbindListener();
    this.emoteSelectorWrapper.hide();
    this.dom.remove();
};

ChatBox.prototype.updateFooterFontSize = function () {
    let $containers = this.footer.find('h4');
    let $text = $containers.find('span');
    fitTextToContainer($text, $containers, 18, 12);
};

/*===============HANDLERS===================*/
ChatBox.prototype.handleAlert = function (msg, callback) {
    let atBottom = this.$CHAT_CONTENT.scrollTop() + this.$CHAT_CONTENT.innerHeight() >= this.$CHAT_CONTENT[0].scrollHeight;

    this.$HEADER.text(msg);
    if (callback) {
        this.$HEADER.append(format(chatHeaderInputTemplate));
        this.container.find(".accept").click(createFriendRequestHandler.call(this, true, callback));
        this.container.find(".reject").click(createFriendRequestHandler.call(this, false, callback));
    } else {
        this.$HEADER.append(format(chatHeaderCloseTemplate));
        this.container.find(".accept").click(this.closeHeader.bind(this));
    }
    this.$HEADER.removeClass("hidden");
    var headerHeight = this.container.find(".header").outerHeight(true);
    this.$CHAT_CONTENT.css("height", CHAT_CONTENT_SIZE - headerHeight);

    if (atBottom) {
        this.$CHAT_CONTENT.scrollTop(this.$CHAT_CONTENT.prop("scrollHeight"));
    }
    this.$CHAT_CONTENT.perfectScrollbar('update');
    this.newUpdate();
};

ChatBox.prototype.handleMessage = function (sender, msg, emojis, allowHtml) {
    this.newUpdate();
    this.writeMessage(sender, msg, emojis, allowHtml);
};

ChatBox.prototype.handleOnline = function () {
    this.targetOnline = true;
    this.container.find('.offlineLayer').addClass('invisible');
    this.$CHAT_INPUT_TEXTAREA.attr('placeholder', 'Message');
};

ChatBox.prototype.handleOffline = function () {
    this.targetOnline = false;
    this.container.find('.offlineLayer').removeClass('invisible');
    this.$CHAT_INPUT_TEXTAREA.attr('placeholder', '');
};

ChatBox.prototype.setServerMessage = function () {
    this.container.find('.serverMessageLayer').removeClass('invisible');
    this.container.find('.glyphicon-cog').addClass('disabled');
};

//===CREATORS
function createFriendRequestHandler(accept, callback) {
    /*jshint validthis:true */
    return function () {
        if (accept) {
            this.handleAlert("Accepted");
        } else {
            this.closeHeader();
        }
        callback(accept);
    }.bind(this);
}

/*================CONTROLL==================*/
ChatBox.prototype.openClose = function () {
    this.selected();
    if (this.container.hasClass("open")) {
        this.close();
    } else {
        this.open();
        this.scrollChatInView();
    }
};

ChatBox.prototype.closeHeader = function () {
    this.$HEADER.addClass("hidden");
    this.$CHAT_CONTENT.css('height', '');
    this.$CHAT_CONTENT.perfectScrollbar('update');
};

ChatBox.prototype.scrollChatInView = function () {
    this.parentBar.scrollToChat(this);
};

//===Helpers
ChatBox.prototype.close = function () {
    if (this.container.hasClass("open") && !this.moveing) {
        this.container.removeClass("open");
    }
};

ChatBox.prototype.open = function () {
    this.container.addClass("open");
};
