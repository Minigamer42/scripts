'use strict';

class ProfileStatsLine {
    constructor($line, fieldName, hide, adminDisplay) {
        this.$line = $line;
        this.fieldName = fieldName;

        this.$hider = this.$line.find('.ppStatsHider');
        this.$hideToogle = this.$line.find('.ppHideToogle');
        this.$hideTooglIcon = this.$line.find('.ppHideToogle > i');

        this._hide;
        this.hide = hide;

        if (adminDisplay) {
            this.$hider.addClass('adminDisplay');
        }

        this.$hideToogle.click(() => {
            this.hide = !this.hide;
            socket.sendCommand({
                type: 'social',
                command: 'player profile toggle hide',
                data: {
                    fieldName: fieldName
                }
            });
        });
    }

    set hide(newValue) {
        this._hide = newValue;
        if (newValue) {
            this.$hider.addClass('active');
            this.$hideTooglIcon.removeClass(this.HIDE_TOOGLE_ICON_CLASSES.INACTIVE);
            this.$hideTooglIcon.addClass(this.HIDE_TOOGLE_ICON_CLASSES.ACTIVE);
        } else {
            this.$hider.removeClass('active');
            this.$hideTooglIcon.removeClass(this.HIDE_TOOGLE_ICON_CLASSES.ACTIVE);
            this.$hideTooglIcon.addClass(this.HIDE_TOOGLE_ICON_CLASSES.INACTIVE);
        }
    }

    get hide() {
        return this._hide;
    }
}

ProfileStatsLine.prototype.HIDE_TOOGLE_ICON_CLASSES = {
    ACTIVE: 'fa-eye-slash',
    INACTIVE: 'fa-eye'
};

class ListProfileStatsLine extends ProfileStatsLine {
    constructor($line, fieldName, hide, adminView, listId, username, urlUsername) {
        super($line, fieldName, hide, adminView);

        this.$lineName = this.$line.find('.ppStatsName');
        this.$lineValue = this.$line.find('.ppStatsValue');
        this.$listToogle = this.$line.find('.ppListToggle');

        this._listId;
        this._userName;
        this._urlUsername;

        this.updateList(listId, username, urlUsername);

        this.$listToogle.click(() => {
            let nextId = this.nextListId;
            let nextUsername = options.getListUsername(nextId);
            this.updateList(nextId, nextUsername, nextUsername);
            socket.sendCommand({
                type: 'social',
                command: 'player profile set list',
                data: {
                    listId: nextId
                }
            });
        });
    }

    get listName() {
        return this.LIST_ID_NAME_MAP[this._listId];
    }

    get listUrl() {
        return this.LIST_ID_BASE_URL_MAP[this._listId] + encodeURIComponent(escapeHtml(this._urlUsername));
    }

    get nextListId() {
        let nextId = this._listId + 1;
        if (nextId > Object.keys(this.LIST_ID_NAME_MAP).length) {
            nextId = 1;
        }
        return nextId;
    }

    updateList(listId, username, urlUsername) {
        this._listId = listId;
        this._userName = username;
        this._urlUsername = urlUsername;

        this.$lineName.text(this.listName);
        if (this._userName) {
            this.$lineValue.html(format(this.LINK_TEMPLATE, this.listUrl, escapeHtml(this._userName)));
        } else {
            this.$lineValue.text('-');
        }
    }
}

ListProfileStatsLine.prototype.LIST_ID_NAME_MAP = {
    1: 'AniList',
    2: 'Kitsu',
    3: 'MyAnimeList'
};

ListProfileStatsLine.prototype.LIST_ID_BASE_URL_MAP = {
    1: 'https://anilist.co/user/',
    2: 'https://kitsu.io/users/',
    3: 'https://myanimelist.net/profile/'
};

ListProfileStatsLine.prototype.LINK_TEMPLATE = '<a href="{0}" target="_blank">{1}</a>';