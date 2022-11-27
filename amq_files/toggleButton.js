'use strict';

/*exported ToggleButton*/

class ToggleButton {
    constructor($button, $text, onText, offText, callback = () => {
    }) {
        this.$button = $button;
        this.$text = $text;
        this.onText = onText;
        this.offText = offText;

        this._active = false;

        this.$button.click(() => {
            this.active = !this.active;
            callback(this.active);
        });
    }

    set disabled(newValue) {
        if (newValue) {
            this.$button.addClass('disabled');
        } else {
            this.$button.removeClass('disabled');
        }
    }

    get active() {
        return this._active;
    }

    set active(newValue) {
        this._active = newValue;

        if (newValue) {
            this.$button.addClass('active');
            this.$text.text(this.onText);
        } else {
            this.$button.removeClass('active');
            this.$text.text(this.offText);
        }
    }
}