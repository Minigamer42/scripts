'use strict';

/*exported StandardButton*/

class StandardButton {
    constructor($body, clickHandler) {
        this.$body = $body;

        this.$body.click(() => {
            clickHandler();
        });
    }

    hide() {
        this.$body.addClass('hide');
    }

    show() {
        this.$body.removeClass('hide');
    }

    disable() {
        this.$body.addClass('disabled');
    }

    enable() {
        this.$body.removeClass('disabled');
    }
}