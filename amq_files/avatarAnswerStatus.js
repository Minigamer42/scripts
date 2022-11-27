'use strict';

/*exported AvatarAnswerStatus*/

class AvatarAnswerStatus {
    constructor($answerContainer) {
        this.$statusContainer = $answerContainer.find(".qpAvatarStatusInnerContainer");
        this.$listBar = this.$statusContainer.find(".qpAvatarStatusBar");
        this.$typeText = this.$statusContainer.find(".qpAvatarStatusType");
        this.$scoreText = this.$statusContainer.find(".qpAvatarStatusScore");
    }

    set status(newStatus) {
        this.$typeText.text(this.convertStatusToLetter(newStatus));

        this.$listBar
            .removeClass("watching")
            .removeClass("completed")
            .removeClass("hold")
            .removeClass("dropped")
            .removeClass("planning")
            .removeClass("looted")
            .addClass(this.convertStatusToClass(newStatus));

        this.show();
    }

    set score(newScore) {
        if (newScore) {
            this.$scoreText.text(newScore);
            this.$statusContainer.addClass("showScore");
        } else {
            this.$statusContainer.removeClass("showScore");
        }
    }

    hide() {
        this.$statusContainer.addClass("hide");
    }

    show() {
        this.$statusContainer.removeClass("hide");
    }

    convertStatusToLetter(status) {
        switch (status) {
            case this.LIST_STATUS.WATCHING:
                return "W";
            case this.LIST_STATUS.COMPLETED:
                return "C";
            case this.LIST_STATUS.ON_HOLD:
                return "H";
            case this.LIST_STATUS.DROPPED:
                return "D";
            case this.LIST_STATUS.PLANNING:
                return "P";
            case this.LIST_STATUS.LOOTED:
                return "L";
            default:
                return "";
        }
    }

    convertStatusToClass(status) {
        switch (status) {
            case this.LIST_STATUS.WATCHING:
                return "watching";
            case this.LIST_STATUS.COMPLETED:
                return "completed";
            case this.LIST_STATUS.ON_HOLD:
                return "hold";
            case this.LIST_STATUS.DROPPED:
                return "dropped";
            case this.LIST_STATUS.PLANNING:
                return "planning";
            case this.LIST_STATUS.LOOTED:
                return "looted";
            default:
                return "";
        }
    }
}

AvatarAnswerStatus.prototype.LIST_STATUS = {
    WATCHING: 1,
    COMPLETED: 2,
    ON_HOLD: 3,
    DROPPED: 4,
    PLANNING: 5,
    LOOTED: 6
};