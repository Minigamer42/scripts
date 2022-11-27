"use strict";

class PauseButton {
    constructor() {
        this.$button = $("#qpPauseButton");
        this.$icon = this.$button.find("i");
        this.$pauseTextOverlay = $("#qpPauseOverlay");
        this.$pauseCountdownOverlay = $("#qpPauseCountdownOverlay");
        this.$pauseCountdownValue = this.$pauseCountdownOverlay.find("#qpPauseCountdownValue");

        this.pauseOn = false;

        this.$button.click(() => {
            if (this.pauseOn) {
                socket.sendCommand({
                    type: "quiz",
                    command: "quiz unpause"
                });
            } else {
                socket.sendCommand({
                    type: "quiz",
                    command: "quiz pause"
                });
            }
        });

        this.$button.popover({
            content: this.PAUSE_POPOVER_MESSAGE,
            placement: 'bottom',
            trigger: 'hover'
        });
    }

    show() {
        this.$button.removeClass("hide");
    }

    hide() {
        this.$button.addClass("hide");
    }

    updateState(pauseOn) {
        this.pauseOn = pauseOn;
        if (pauseOn) {
            this.$icon.addClass(this.PLAY_ICON_CLASS).removeClass(this.PAUSE_ICON_CLASS);
            this.$button.data("bs.popover").options.content = this.PLAY_POPOVER_MESSAGE;
            this.$pauseTextOverlay.removeClass("hide");
        } else {
            this.$icon.removeClass(this.PLAY_ICON_CLASS).addClass(this.PAUSE_ICON_CLASS);
            this.$button.data("bs.popover").options.content = this.PAUSE_POPOVER_MESSAGE;
            this.$pauseTextOverlay.addClass("hide");
        }
    }

    startCountdown(lengthMs) {
        let length = lengthMs / 1000;
        this.$pauseCountdownValue.text(length);
        this.$button.addClass('disabled');
        this.$pauseCountdownOverlay.removeClass('hide');
        let interval = setInterval(() => {
            length--;
            this.$pauseCountdownValue.text(length);
            if (length <= 0) {
                clearInterval(interval);
                this.$button.removeClass('disabled');
                this.$pauseCountdownOverlay.addClass('hide');
            }
        }, 1000);
    }

    reset() {
        this.hide();
        this.updateState(false);
        this.$pauseCountdownOverlay.addClass('hide');
        this.$button.removeClass('disabled');
    }
}

PauseButton.prototype.PAUSE_ICON_CLASS = "fa-pause-circle";
PauseButton.prototype.PLAY_ICON_CLASS = "fa-play-circle";
PauseButton.prototype.PAUSE_POPOVER_MESSAGE = "Pause the game at the end of this song. All players can end the pause.";
PauseButton.prototype.PLAY_POPOVER_MESSAGE = "Unpause the game";
