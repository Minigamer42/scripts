"use strict";

/*exported socialTab*/
function SocialTab() {
    this._tab = $("#socialTab");
    this._friendEntryTemplate = $("#socialMenuFriendPlayerTemplate").html();
    this._onlineFriendCounter = $("#mmSocialButtonFriendsOnlineCount");

    this.$onlineFriendList = $("#friendOnlineList");
    this.$offlineFriendList = $("#friendOfflineList");

    this.$friendView = $("#friendlist");
    this.$friendsButton = $("#socailTabFriends");

    this.$allUsersView = $("#allUserList");
    this.$allUsersButton = $("#socialTabAll");

    this.$ownProfileButton = $("#socialTabProfile");
    this.ownProfileXOffset = -23; //px

    this._$SOCIAL_TAB_CONTAINER = $("#socialTabContainer");

    this.onlineFriends = {};
    this.offlineFriends = {};
    this.blockedPlayers = [];

    this._$SOCIAL_TAB_CONTAINER.bind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", () => {
        this.updateScrollbar();
    });

    this.allPlayerList;

    //Setup chatbar
    this.chatBar = undefined;

    //Setup socialStatus
    this.socialStatus = undefined;

    //LISTENERS
    this._newFriendListener = new Listener(
        "new friend",
        function (friend) {
            if (friend.online) {
                this.addToOnlineFriends(friend);
                this.updateOnline();
                //Update all add friend icons for the friend
                $(".addFriendIcon-" + friend.name).addClass("disabled");
            } else {
                friend.status = 0;
                this.addToOfflineFriends(friend);
                this.updateOffline();
            }
            this.updateScrollbar();
        }.bind(this)
    );

    this._friendStateChangeListener = new Listener(
        "friend state change",
        function (friend) {
            let currentFriend;
            if (friend.online) {
                currentFriend = this.offlineFriends[friend.name];
                delete this.offlineFriends[friend.name];
                currentFriend.detach();
                currentFriend.updateStatus(1);
                this.onlineFriends[friend.name] = currentFriend;
            } else {
                currentFriend = this.onlineFriends[friend.name];
                delete this.onlineFriends[friend.name];
                currentFriend.detach();
                currentFriend.updateStatus(0);
                this.offlineFriends[friend.name] = currentFriend;
            }
            this.updateOnline();
            this.updateOffline();
        }.bind(this)
    );

    this._friendRemoveListener = new Listener("friend removed", (target) => {
        this.removeFriend(target.name);
        this.updateScrollbar();
    });

    this._friendNameChangeListener = new Listener("friend name change", (payload) => {
        //TODO
        if (this.onlineFriends[payload.oldName]) {
            let listEntry = this.onlineFriends[payload.oldName];
            listEntry.updateName(payload.newName);
            delete this.onlineFriends[payload.oldName];
            this.onlineFriends[payload.newName] = listEntry;
            listEntry.detach();
            this.updateOnline();
        } else if (this.offlineFriends[payload.oldName]) {
            let listEntry = this.offlineFriends[payload.oldName];
            listEntry.updateName(payload.newName);
            delete this.offlineFriends[payload.oldName];
            this.offlineFriends[payload.newName] = listEntry;
            listEntry.detach();
            this.updateOffline();
        }
    });

    this._friendSocialStatusChangeListener = new Listener("friend social status change", (payload) => {
        if (this.onlineFriends[payload.name]) {
            this.onlineFriends[payload.name].updateStatus(payload.socialStatus, payload.gameState);
        }
    });

    this._friendProfilePictureChangeListener = new Listener("friend profile image change", (payload) => {
        if (this.onlineFriends[payload.name]) {
            this.onlineFriends[payload.name].updateAvatar(payload.profileImage);
        }
    });
}

SocialTab.prototype.setup = function (friends, blockedPlayers) {
    //Load other objects
    this.chatBar = new ChatBar();
    this.allPlayerList = new AllPlayersList();
    this.socialStatus = new SocialStatus($("#socialTabStatusInnerCircle"));
    //Setup friends
    friends.forEach(
        function (friend) {
            if (friend.online) {
                this.addToOnlineFriends(friend);
            } else {
                this.addToOfflineFriends(friend);
            }
        }.bind(this)
    );

    this.blockedPlayers = blockedPlayers;

    this.updateOnline();
    this.updateOffline();

    this._$SOCIAL_TAB_CONTAINER.perfectScrollbar({
        suppressScrollX: true
    });

    //Register listners
    this._newFriendListener.bindListener();
    this._friendStateChangeListener.bindListener();
    this._friendRemoveListener.bindListener();
    this._friendNameChangeListener.bindListener();
    this._friendSocialStatusChangeListener.bindListener();
    this._friendProfilePictureChangeListener.bindListener();
};

/*================CONTROLL/VISUEL====================*/
//===ENTRY

SocialTab.prototype.openClose = function () {
    if (this._tab.hasClass("open")) {
        this.close();
    } else {
        this._handleOpen();
    }
};

SocialTab.prototype.close = function () {
    if (this._tab.hasClass("open")) {
        this.allPlayerList.stopTracking();
        this._tab.removeClass("open");
    }
};

SocialTab.prototype.changeToAllUsers = function () {
    if (!this.allPlayerList.ready) {
        //If no users, then do nothing (server haven't responded yet)
        return;
    }
    this.$friendView.addClass("hide");
    this.$allUsersView.removeClass("hide");
    this.$friendsButton.removeClass("selected");
    this.$allUsersButton.addClass("selected");
    this.updateScrollbar();
};

SocialTab.prototype.changeToFriends = function () {
    this.$allUsersView.addClass("hide");
    this.$friendView.removeClass("hide");
    this.$friendsButton.addClass("selected");
    this.$allUsersButton.removeClass("selected");
    this.updateScrollbar();
    this.triggerFriendLazyLoad();
};

SocialTab.prototype.openOwnProfile = function () {
    playerProfileController.loadProfileIfClosed(selfName, this.$ownProfileButton, {x: this.ownProfileXOffset}, () => {
        this.$ownProfileButton.removeClass("selected ");
    });
    this.$ownProfileButton.addClass("selected ");
};

//===HELPER

SocialTab.prototype.triggerFriendLazyLoad = function () {
    Object.values(this.onlineFriends).concat(Object.values(this.offlineFriends)).forEach(entry => {
        entry.checkLazyLoad();
    });
};

SocialTab.prototype.updateOnline = function () {
    this.updateFriendList(this.onlineFriends, "online", this.$onlineFriendList);
    this.updateOnlineFriendCount();
};

SocialTab.prototype.updateOnlineFriendCount = function () {
    this._onlineFriendCounter.text(Object.keys(this.onlineFriends).length);
};

SocialTab.prototype.updateOffline = function () {
    this.updateFriendList(this.offlineFriends, "offline", this.$offlineFriendList);
};

SocialTab.prototype.updateFriendList = function (friendMap, type, $list) {
    let sortedFriends = Object.values(friendMap).sort(sortFriends);
    sortedFriends.forEach((entry, index) => {
        if (entry.inList !== type) {
            entry.inList = type;
            if (index === 0) {
                $list.prepend(entry.$html);
            } else {
                entry.$html.insertAfter(sortedFriends[index - 1].$html);
            }
            entry.updateTextSize();
        }
    });
    sortedFriends.forEach(entry => {
        entry.checkLazyLoad();
    });
};

SocialTab.prototype._handleOpen = function () {
    //Reset layout
    this.allPlayerList.hide();
    this.$friendView.removeClass("hide");
    this.$friendsButton.addClass("selected");
    this.$allUsersButton.removeClass("selected");

    this.allPlayerList.startTracking();


    //Open tab
    this._tab.addClass("open");
    this.triggerFriendLazyLoad();
};

/*=============MANAGE==================*/

function sortFriends(friendA, friendB) {
    return friendA.name.toLowerCase().localeCompare(friendB.name.toLowerCase());
}

SocialTab.prototype.updateScrollbar = function () {
    this._$SOCIAL_TAB_CONTAINER.perfectScrollbar("update");
};

SocialTab.prototype.addToOnlineFriends = function (friend) {
    if (!this.onlineFriends[friend.name]) {
        this.onlineFriends[friend.name] = new SocialTabFriendEntry(friend, false, this._$SOCIAL_TAB_CONTAINER);
    }
    roomBrowser.notifyFriendChange();
};

SocialTab.prototype.addToOfflineFriends = function (friend) {
    if (!this.offlineFriends[friend.name]) {
        this.offlineFriends[friend.name] = new SocialTabFriendEntry(friend, true, this._$SOCIAL_TAB_CONTAINER);
    }
    roomBrowser.notifyFriendChange();
};

SocialTab.prototype.removeFriend = function (name) {
    if (this.onlineFriends[name]) {
        this.onlineFriends[name].destroy();
        delete this.onlineFriends[name];
        //Update all add friend icons for the friend
        $(".addFriendIcon-" + name).removeClass("disabled");
        this.updateOnlineFriendCount();
    } else if (this.offlineFriends[name]) {
        this.offlineFriends[name].destroy();
        delete this.offlineFriends[name];
    }
    roomBrowser.notifyFriendChange();
};

SocialTab.prototype.sendFriendRequest = function (playerName) {
    if (this.isFriend(playerName)) {
        displayMessage("Already in friendlist");
        return;
    }

    if (guestRegistrationController.isGuest) {
        displayMessage("Unavailable for Guess Accounts", "The friend system is unavailable for guest accounts");
        return;
    }

    var responseHandler = new Listener(
        "friend request",
        function (payload) {
            if (payload.result === "error") {
                displayMessage("Error sending friend request", payload.reason);
            } else {
                this.chatBar.handleAlert(payload.name, "Friend request send");
                this.chatBar.startChat(payload.name);
            }
            responseHandler.unbindListener();
        }.bind(this)
    );

    responseHandler.bindListener();
    socket.sendCommand({
        type: "social",
        command: "friend request",
        data: {
            target: playerName
        }
    });
};

SocialTab.prototype.blockPlayer = function (playerName) {
    socket.sendCommand({
        type: "social",
        command: "block player",
        data: {
            target: playerName
        }
    });

    if (socialTab.isFriend(playerName)) {
        socialTab.removeFriend(playerName);
    }
    socialTab.addBlockedPlayer(playerName);

    //Disable possible command buttons
    $(".blockCommandIcon-" + playerName).addClass("disabled");
};

SocialTab.prototype.addBlockedPlayer = function (playerName) {
    if (this.blockedPlayers.indexOf(playerName) === -1) {
        this.blockedPlayers.push(playerName);
    }
};

SocialTab.prototype.removeBlockedPlayer = function (playerName) {
    let playerIndex = this.blockedPlayers.indexOf(playerName);
    if (playerIndex > -1) {
        this.blockedPlayers.splice(playerIndex, 1);
    }
};

SocialTab.prototype.unblockPlayer = function (playerName) {
    socket.sendCommand({
        type: "social",
        command: "unblock player",
        data: {
            target: playerName
        }
    });
    this.removeBlockedPlayer(playerName);

    $("#blockedPlayerEntry-" + playerName).remove();

    $(".blockCommandIcon-" + playerName).removeClass("disabled");
};

SocialTab.prototype.startChat = function (playerName) {
    this.chatBar.startChat(playerName);
};

/*==============GET/SET===================*/

SocialTab.prototype.getAllFriends = function () {
    return Object.keys(this.onlineFriends).concat(Object.keys(this.offlineFriends));
};

SocialTab.prototype.isFriend = function (name) {
    return this.onlineFriends[name] || this.offlineFriends[name];
};

SocialTab.prototype.isBlocked = function (name) {
    return this.blockedPlayers.indexOf(name) !== -1;
};

var socialTab = new SocialTab();
