'use strict';

/*exported LobbyPlayerCounter*/

class LobbyPlayerCounter {
    constructor() {
        this.$topCount = $("#lobbyTopCount");
        this.$bottomCount = $("#lobbyBottomCount");
        this.$centerCount = $("#lobbyCenterCount");
        this.$load = $("#lobbyCountLoad");
        this.$readyLoad = $("#lobbyReadyCountLoad");
        this.countMode = false;
    }

    toggleCountMode(on) {
        this.countMode = on;
        if (on) {
            this.$load.css('height', '100%');
            this.$centerCount.removeClass('hide');
            this.$topCount.addClass('hide');
            this.$bottomCount.addClass('hide');
        } else {
            this.$centerCount.addClass('hide');
            this.$topCount.removeClass('hide');
            this.$bottomCount.removeClass('hide');
        }
    }

    updateCount(max, current) {
        if (this.countMode) {
            this.$centerCount.text(current);
        } else {
            this.$topCount.text(current);
            this.$bottomCount.text(max);
            let percent = (current / max) * 100;
            this.$load.css('height', percent + '%');
        }
    }

    updateReadyCount(max, current) {
        let percent = (current / max) * 100;
        this.$readyLoad.css('height', percent + '%');
    }
}