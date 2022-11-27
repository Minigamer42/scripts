'use strict';

/*exported QuizSkipController*/

class QuizSkipController {
    constructor() {
        this.$container = $("#qpSkipContainer");
        this.$button = $("#qpVoteSkip");
        this.$voteStateText = $("#qpVoteState > p");

        this.autoVoteTimeout;

        this._toggled = false;
        this.enabled = false;
    }

    set highlight(on) {
        if (on) {
            //Timeout to fix a bug with chrome, sometimes causing it not the render the update width of the change.
            setTimeout(() => {
                this.$container.addClass('highlight');
            }, 50);
        } else {
            this.$container.removeClass('highlight');
        }
    }

    get toggled() {
        return this._toggled;
    }

    set toggled(newValue) {
        this._toggled = newValue;
        if (newValue) {
            this.$button.addClass('toggled');
            this.$container.addClass('toggled');
        } else {
            this.$button.removeClass('toggled');
            this.$container.removeClass('toggled');
        }
    }

    set stateMessage(newValue) {
        this.$voteStateText.html(newValue);
    }

    set votePreviewMode(on) {
        if (on) {
            this.$container.addClass('votePreview');
        } else {
            this.$container.removeClass('votePreview');
        }
    }

    toggle() {
        if (this.enabled) {
            this.toggled = !this.toggled;
            this.sendSkipVote();
        }
    }

    voteSkip() {
        if (this.enabled) {
            this.toggled = true;
            this.sendSkipVote();
        }
    }

    sendSkipVote() {
        clearTimeout(this.autoVoteTimeout);
        socket.sendCommand({
            type: 'quiz',
            command: 'skip vote',
            data: {
                skipVote: this.toggled
            }
        });
    }

    autoVoteSkip(timeout) {
        this.toggled = true;
        this.autoVoteTimeout = setTimeout(() => {
            this.voteSkip();
        }, timeout);
    }

    reset() {
        this.highlight = false;
        this.toggled = false;
        this.stateMessage = 'No<br/>Votes';
    }

    disable(skipTimeout) {
        this.enabled = false;
        if (skipTimeout) {
            this.$container.addClass('disabled');
            this.reset();
        } else {
            this.$container.addClass('preDisable');
            setTimeout(() => {
                this.$container.addClass('disabled');
                this.$container.removeClass('preDisable');
                this.reset();
            }, 1000);
        }
    }

    enable() {
        this.enabled = true;
        this.$container.removeClass('disabled');
    }
}