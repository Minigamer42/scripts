'use strict';

class ScoreBoardGroup {
    constructor(number) {
        this.$group = $(format(this.TEMPlATE, number));

        this.$group.click(() => {
            quiz.selectAvatarGroup(number);
        });
        this.topOffset;
    }

    set active(active) {
        if (active) {
            this.$group.addClass('active');
        } else {
            this.$group.removeClass('active');
        }
    }

    updatePosition(topOffset, bottomOffset) {
        topOffset = topOffset + this.OFFSET_CORRECTION;
        bottomOffset = bottomOffset + this.OFFSET_CORRECTION;
        this.$group.css('top', topOffset);
        this.$group.css('height', bottomOffset - topOffset);

        this.topOffset = topOffset;
    }

    remove() {
        this.$group.remove();
    }
}

ScoreBoardGroup.prototype.TEMPlATE = $("#quizScoreboardGroupTemplate").html();
ScoreBoardGroup.prototype.OFFSET_CORRECTION = 3; //px
ScoreBoardGroup.prototype.FULL_HEIGHT = 240; //px
ScoreBoardGroup.prototype.FINAL_TEAM_GROUP_EXTENSION = 60; //px