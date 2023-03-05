'use strict';
/*exported BaseVoteContainer*/

class BaseVoteContainer {
	constructor($container, resultPackageName, resultCallback = () => {}) {
		this.$VOTE_COTNAINER = $container;
		this.$BUTTON_CONTAINER = this.$VOTE_COTNAINER.find(".leftVoteReturnButtonContainer");
		this.$RESULT_TEXT = this.$VOTE_COTNAINER.find(".leftVoteResultText");

		this.$VOTE_YES_BUTTON = this.$VOTE_COTNAINER.find(".leftVoteButtonYes");
		this.$VOTE_NO_BUTTON = this.$VOTE_COTNAINER.find(".leftVoteButtonNo");

		this.timerBar = new TimerBar(this.$VOTE_COTNAINER.find(".leftVoteTimerBar"));

		this.$VOTE_YES_BUTTON.click(() => {
			this.buttonSelected(this.$VOTE_YES_BUTTON);
			this.vote(true);
		});

		this.$VOTE_NO_BUTTON.click(() => {
			this.buttonSelected(this.$VOTE_NO_BUTTON);
			this.vote(false);
		});

		this._voteEndTimeout;
		this._VOTE_RESULT_LISTNER = new Listener(
			resultPackageName,
			function (payload) {
				let reset = false;
				if (payload.passed) {
					this.showResult("Vote Passed");
				} else {
					this.showResult(payload.reason);
					reset = true;
				}
				resultCallback(payload.passed);

				this._voteEndTimeout = setTimeout(() => {
					this.closeVote();
					if (reset && !quiz.onLastSong) {
						setTimeout(() => {
							this.reset();
						}, 1000);
					}
				}, payload.timeout - 1000);
	
				this.timerBar.reset();
			}.bind(this)
		);
	}

	startVote(defaultYes, disableVote, duration, timeAlreadyPlayed) {
		if (!timeAlreadyPlayed) {
			timeAlreadyPlayed = 0;
		}
	
		this.reset();
		this._VOTE_RESULT_LISTNER.bindListener();
		this.timerBar.start(duration, timeAlreadyPlayed);
		
		this.openVote();
	
		if (defaultYes) {
			this.buttonSelected(this.$VOTE_YES_BUTTON);
		}
		if (disableVote) {
			this.showResult("Waiting Votes");
		}
	}

	openVote() {
		this.$VOTE_COTNAINER.addClass("open");
	}

	closeVote() {
		this.$VOTE_COTNAINER.removeClass("open");
	}

	reset() {
		this.$VOTE_COTNAINER.removeClass("open");
		this.$VOTE_YES_BUTTON.removeClass("selected");
		this.$VOTE_NO_BUTTON.removeClass("selected");
		this.$VOTE_COTNAINER.removeClass("voted");
		this.$BUTTON_CONTAINER.removeClass("hide");
		this.$RESULT_TEXT.addClass("hide");
	
		this.timerBar.reset();
	
		this._VOTE_RESULT_LISTNER.unbindListener();
	
		clearTimeout(this._voteEndTimeout);
	}

	buttonSelected($button) {
		$button.addClass("selected");
		this.$VOTE_COTNAINER.addClass("voted");
	}

	vote() {
		throw new Error("Should be implemented by subclass");
	}

	showResult(resultMessage) {
		this.$BUTTON_CONTAINER.addClass("hide");
		this.$RESULT_TEXT.text(resultMessage);
		this.$RESULT_TEXT.removeClass("hide");
	}
}