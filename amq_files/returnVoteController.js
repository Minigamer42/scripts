'use strict';

function ReturnVoteController(videoOverlay) {
    this.$VOTE_COTNAINER = $("#qpReturnLobbyVoteContainer");
    this.$BUTTON_CONTAINER = $("#qpVoteReturnButtonContainer");
    this.$VOTE_BUTTON = $("#qpReturnToLobbyButton");
    this.$RESULT_TEXT = $("#qpVoteResultText");

    this.$VOTE_YES_BUTTON = $("#qpVoteReturnYes");
    this.$VOTE_NO_BUTTON = $("#qpVoteReturnNo");

    this.videoOverlay = videoOverlay;
    this.timerBar = new TimerBar($("#qpReturnVoteTimerBar"));

    this.$VOTE_YES_BUTTON.click(() => {
        this.buttonSelected(this.$VOTE_YES_BUTTON);
        this.vote(true);
    });

    this.$VOTE_NO_BUTTON.click(() => {
        this.buttonSelected(this.$VOTE_NO_BUTTON);
        this.vote(false);
    });

    this._voteEndTimeout;
    this._VOTE_RESULT_LISTNER = new Listener("return lobby vote result", function (payload) {
        let reset = false;
        if (payload.passed) {
            this.showResult("Vote Passed");
            this.videoOverlay.showReturnToLobbyText();
        } else {
            this.showResult(payload.reason);
            reset = true;
        }
        this._voteEndTimeout = setTimeout(() => {
            this.closeVote();
            if (reset && !quiz.onLastSong) {
                setTimeout(() => {
                    this.reset();
                }, 1000);
            }
        }, payload.timeout - 1000);

        this.timerBar.reset();
    }.bind(this));
}

ReturnVoteController.prototype.startVote = function (isHost, disableVote, duration, timeAlreadyPlayed) {
    if (!timeAlreadyPlayed) {
        timeAlreadyPlayed = 0;
    }

    this.reset();
    this._VOTE_RESULT_LISTNER.bindListener();
    this.timerBar.start(duration, timeAlreadyPlayed);
    this.toggleVoteButton(false);
    this.openVote();

    if (isHost) {
        this.buttonSelected(this.$VOTE_YES_BUTTON);
    }
    if (disableVote) {
        this.showResult("Waiting Votes");
    }
};

ReturnVoteController.prototype.toggleVoteButton = function (on) {
    if (on) {
        this.$VOTE_BUTTON.removeClass('disabled');
    } else {
        this.$VOTE_BUTTON.addClass('disabled');
    }
};

ReturnVoteController.prototype.openVote = function () {
    this.$VOTE_COTNAINER.addClass('open');
};

ReturnVoteController.prototype.closeVote = function () {
    this.$VOTE_COTNAINER.removeClass('open');
};

ReturnVoteController.prototype.reset = function () {
    this.$VOTE_BUTTON.removeClass('disabled');
    this.$VOTE_COTNAINER.removeClass('open');
    this.$VOTE_YES_BUTTON.removeClass('selected');
    this.$VOTE_NO_BUTTON.removeClass('selected');
    this.$VOTE_COTNAINER.removeClass('voted');
    this.$BUTTON_CONTAINER.removeClass('hide');
    this.$RESULT_TEXT.addClass('hide');

    this.timerBar.reset();

    this._VOTE_RESULT_LISTNER.unbindListener();

    clearTimeout(this._voteEndTimeout);
};

ReturnVoteController.prototype.buttonSelected = function ($button) {
    $button.addClass('selected');
    this.$VOTE_COTNAINER.addClass('voted');
};

ReturnVoteController.prototype.vote = function (votedFor) {
    socket.sendCommand({
        type: 'quiz',
        command: 'return lobby vote',
        data: {
            accept: votedFor
        }
    });
};

ReturnVoteController.prototype.showResult = function (resultMessage) {
    this.$BUTTON_CONTAINER.addClass('hide');
    this.$RESULT_TEXT.text(resultMessage);
    this.$RESULT_TEXT.removeClass('hide');
};

ReturnVoteController.prototype.updateState = function (newState, isSpectator) {
    if (newState.active) {
        this.startVote(false, isSpectator, newState.duration, newState.timeLeft);
    } else if (newState.returningToLobby) {
        this.videoOverlay.showReturnToLobbyText();
    }
};