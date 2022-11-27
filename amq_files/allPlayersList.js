'use strict';

function AllPlayersList() {
    this._$CONTAINER = $("#allUserList ul");
    this._$LOADING_ICON = $("#socialTabAllLoading");
    this._$TAB = $("#allUserList");
    this._$ONLINE_PLAYER_COUNT = $("#mmSocialButtonAllOnlineCount");

    this._ALL_PLAYER_ENTRY_TEMAPLTE = $("#socialMenuPlayerTemplate").html();
    this._playerEntries = {};
    this.TRACKING_TIMEOUT = 10000; //ms

    this.allOnlineUsersListnerActive = false;
    this.ready = false;
    this.trackingTimeout;

    this._onlineUserChangeMessageListener = new Listener("online user change", function (change) {
        if (change.online) {
            this._playerEntries[change.name] = this.insertPlayer(change.name);
        } else {
            this._playerEntries[change.name].remove();
            delete this._playerEntries[change.name];
        }
        socialTab.updateScrollbar();
    }.bind(this));

    this._nameChangeListener = new Listener("all player name change", function (payload) {
        let $entry = this._playerEntries[payload.oldName];
        if ($entry) {
            $entry.attr('playerName', payload.newName);
            $entry.find('h4').text(payload.newName);
            $.contextMenu('destroy', '#' + $entry.attr('id'));
            this.attachContextMenu($entry, payload.newName);
        }
        socialTab.updateScrollbar();
    }.bind(this));
    this._nameChangeListener.bindListener();

    this._onlineCountChange = new Listener("online player count change", function (payload) {
        this._$ONLINE_PLAYER_COUNT.text(payload.count);
    }.bind(this));
    this._onlineCountChange.bindListener();
}

AllPlayersList.prototype.startTracking = function () {
    if (!this.allOnlineUsersListnerActive) {
        this._onlinePlayers = {};
        this._$LOADING_ICON.removeClass("hide");
        this.loadAllOnline();
        this.allOnlineUsersListnerActive = true;
    } else {
        clearTimeout(this.trackingTimeout);
    }
};

AllPlayersList.prototype.stopTracking = function () {
    this.trackingTimeout = setTimeout(() => {
        this._onlineUserChangeMessageListener.unbindListener();
        this.allOnlineUsersListnerActive = false;
        this.ready = false;
        socket.sendCommand({
            type: "social",
            command: "stop tracking online users"
        });
    }, this.TRACKING_TIMEOUT);
};

AllPlayersList.prototype.show = function () {
    this._$TAB.removeClass("hide");
};

AllPlayersList.prototype.hide = function () {
    this._$TAB.addClass("hide");
};

AllPlayersList.prototype.insertPlayer = function (name) {
    let $entry = this.createEntry(name);
    let $after = this.getEntryAfterPlayer(name);

    if ($after) {
        $entry.insertBefore($after);
    } else {
        this._$CONTAINER.append($entry);
    }

    this.attachContextMenu($entry, name);
    return $entry;
};

AllPlayersList.prototype.getEntryAfterPlayer = function (name) {
    let $entry;
    Object.keys(this._playerEntries).sort((playerA, playerB) => {
        return this.compareNames(playerA, playerB);
    }).some(playerName => {
        if (this.compareNames(name, playerName) < 0) {
            $entry = this._playerEntries[playerName];
            return true;
        }
    });
    return $entry;
};

AllPlayersList.prototype.compareNames = function (nameA, nameB) {
    return nameA.toLowerCase().localeCompare(nameB.toLowerCase());
};

AllPlayersList.prototype.loadAllOnline = function () {
    this._$CONTAINER.html("");
    //Bind handler
    var handleAllOnlineMessage = new Listener("all online users", function (onlineUsers) {
        onlineUsers.sort((userA, userB) => {
            return this.compareNames(userA, userB);
        }).forEach(user => {
            let $entry = this.createEntry(user);
            this._playerEntries[user] = $entry;

            this._$CONTAINER.append($entry);
            this.attachContextMenu($entry, user);
        });

        this._$LOADING_ICON.addClass("hide");

        this.ready = true;
        this._onlineUserChangeMessageListener.bindListener();
        handleAllOnlineMessage.unbindListener();
    }.bind(this));

    handleAllOnlineMessage.bindListener();

    socket.sendCommand({
        type: "social",
        command: "get online users"
    });
};

AllPlayersList.prototype.createEntry = function (name) {
    let $entry = $(format(this._ALL_PLAYER_ENTRY_TEMAPLTE, name));
    let $profileButton = $entry.find('.stPlayerProfileButton');
    $profileButton.click(() => {
        playerProfileController.loadProfileIfClosed(name, $profileButton, {x: 7}, () => {
            $entry.removeClass('profileOpen');
        });
        $entry.addClass('profileOpen');
    });
    return $entry;
};

AllPlayersList.prototype.attachContextMenu = function ($entry, name) {
    contextMenueGenerator.generateStandardContextMenu($entry, '.stPlayerName', name);
};