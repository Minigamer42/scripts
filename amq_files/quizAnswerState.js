'use strict';

/*exported QuizAnswerState*/

function QuizAnswerState($input) {
    this.$SENDING_CONTAINER = $("#qpAnswerStateSendingContainer");
    this.$ANSWER_CHECK = $("#qpAnswerStateCheck");
    this.$OUTER_CONTAINER = $("#qpAnswerStateContainerOuter");
    this.$INNER_CONTAINER = $("#qpAnswerStateContainerInner");
    this.$INPUT = $input;

    this.loadingInterval;
    this.currentAnswer;
    this.submittedAnswer;

    this.$INNER_CONTAINER.popover({
        title: "Current Answer",
        placement: 'top',
        trigger: 'hover',
        container: $("#qpAnswerInputContainer"),
        template: '<div class="popover" role="tooltip" style="width: 150px;"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
    });
    this.popoverContent = this.$INNER_CONTAINER.data('bs.popover');

    this.answerListener = new Listener("quiz answer", function (payload) {
        if (payload.answer === this.currentAnswer) {
            this.showCheck();
        }
        this.submittedAnswer = payload.answer;
    }.bind(this));

    this.$INPUT.keyup(() => {
        if (this.currentAnswer) {
            if (this.currentAnswer === $input.val()) {
                this.toggleFade(false);
            } else {
                this.toggleFade(true);
            }
        }
    });

    this.$INNER_CONTAINER.click(() => {
        this.setInputToAnswer();
    });
}

QuizAnswerState.prototype.startListner = function () {
    this.answerListener.bindListener();
};

QuizAnswerState.prototype.stopListener = function () {
    this.answerListener.unbindListener();
};

QuizAnswerState.prototype.startLoad = function () {
    clearInterval(this.loadingInterval);
    this.hideCheck();
    this.$SENDING_CONTAINER.find('.show').removeClass('show');
    this.$SENDING_CONTAINER.removeClass('hide');

    let dotCount = this.$SENDING_CONTAINER.find('.loadingDot').length;
    let currentDot = 0;
    this.loadingInterval = setInterval(() => {
        if (currentDot === dotCount) {
            currentDot = 0;
            this.$SENDING_CONTAINER.find('.show').removeClass('show');
        } else {
            this.$SENDING_CONTAINER.find('.loadingDot:eq(' + currentDot + ')').addClass('show');
            currentDot++;
        }
    }, 500);
};

QuizAnswerState.prototype.stopLoad = function () {
    clearInterval(this.loadingInterval);
    this.$SENDING_CONTAINER.addClass('hide');
};

QuizAnswerState.prototype.show = function () {
    this.$OUTER_CONTAINER.removeClass('hide');
};

QuizAnswerState.prototype.hide = function () {
    this.$OUTER_CONTAINER.addClass('hide');
};

QuizAnswerState.prototype.showCheck = function () {
    this.stopLoad();
    this.$ANSWER_CHECK.removeClass('hide');
};

QuizAnswerState.prototype.hideCheck = function () {
    this.$ANSWER_CHECK.addClass('hide');
};

QuizAnswerState.prototype.submitAnswer = function (answer, showState, noLoad) {
    this.currentAnswer = answer;
    if (!noLoad) {
        this.startLoad();
    } else {
        this.showCheck();
    }
    this.popoverContent.options.content = answer;
    if (showState) {
        this.show();
    }
};

QuizAnswerState.prototype.reset = function () {
    this.stopLoad();
    this.hide();
    this.toggleFade(false);
    this.currentAnswer = null;
    this.submittedAnswer = null;
};

QuizAnswerState.prototype.toggleFade = function (on) {
    if (on) {
        this.$OUTER_CONTAINER.addClass("fade");
    } else {
        this.$OUTER_CONTAINER.removeClass("fade");
    }

};

QuizAnswerState.prototype.setInputToAnswer = function () {
    if (this.currentAnswer) {
        this.$INPUT.val(this.currentAnswer);
        this.$INPUT.focus();
        this.toggleFade(false);
    }
};

QuizAnswerState.prototype.answerSubmited = function () {
    return this.currentAnswer != undefined;
};