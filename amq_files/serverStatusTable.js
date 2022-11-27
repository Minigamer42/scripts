'use strict';

/*exported ServerStatusTable*/

function ServerStatusTable(serverStatuses) {
    this.$TABLE_BODY = $("#settingsServerStatusTable > tbody");

    this._rowMap = {};

    serverStatuses.forEach(serverStatus => {
        let row = new ServerStatusTableRow(serverStatus.name, serverStatus.online);
        this.$TABLE_BODY.append(row.$body);

        this._rowMap[serverStatus.name] = row;
    });

    this._SERVER_STATE_CHANGE_LISTENER = new Listener('server state change', (payload) => {
        this._rowMap[payload.name].updateOnline(payload.onlne);
    });
    this._SERVER_STATE_CHANGE_LISTENER.bindListener();
}

const SERVER_STATUS_TEMPLATE = $("#serverStatusRowTemplate").html();

function ServerStatusTableRow(name, online) {
    this.name = capitalizeFirstLetter(name);
    this.online = online;

    this.$body = $(format(SERVER_STATUS_TEMPLATE, this.name, this.getStateText()));
    this.updateStateColor();
}

ServerStatusTableRow.prototype.getStateText = function () {
    return this.online ? 'Online' : 'Offline';
};

ServerStatusTableRow.prototype.updateStateColor = function () {
    if (this.online) {
        this.$body.addClass('online');
        this.$body.removeClass('offline');
    } else {
        this.$body.addClass('offline');
        this.$body.removeClass('online');
    }
};

ServerStatusTableRow.prototype.updateOnline = function (online) {
    this.online = online;
    this.$body.find('.settingServerStatus').text(this.getStateText());
    this.updateStateColor();
};