'use strict';
/*exported QuizAnswerInput*/

class QuizAnswerInput {
	constructor(skipController) {
		this.$input = $("#qpAnswerInput");
		this.$inputContainer = $("#qpAnswerInputContainer");

		this.skipController = skipController;
		this.quizAnswerState = new QuizAnswerState(this.$input);
		this.autoCompleteController = new AutoCompleteController(this.$input);

		this.gotTeamAnswer = false;

		this._inFocus = false;

		this.$input.keypress((event) => {
			//On Enter
			if (event.which === 13) {
				this.submitAnswer(true);
			}
		});
	}

	get inFocus() {
		return this._inFocus;
	}

	set inFocus(newValue) {
		this._inFocus = newValue;
		if (newValue) {
			this.$inputContainer.addClass('focused');
		} else {
			this.$inputContainer.removeClass('focused');
		}
	}

	set active(newValue) {
		if (newValue) {
			this.quizAnswerState.startListner();
		} else {
			this.quizAnswerState.stopListener();
		}
	}

	displayAnswer(answer) {
		this.$input.val(answer);
		this.quizAnswerState.submitAnswer(answer, true, true);
	}

	setNewAnswer(answer) {
		this.$input.val(answer);
		this.submitAnswer(true);
	}

	submitAnswer(showState) {
		let answer = this.$input.val();
		if (answer == "") {
			return;
		} else {
			this.quizAnswerState.submitAnswer(answer, showState);
			socket.sendCommand({
				type: "quiz",
				command: "quiz answer",
				data: { 
					answer: answer,
					isPlaying: quizVideoController.currentVideoPlaying(),
					volumeAtMax: getVolumeAtMax()
				}
			});
			this.skipController.highlight = true;
			if (options.autoVoteSkipGuess) {
				this.skipController.voteSkip();
			}
		}
	}

	showSubmitedAnswer() {
		this.$input.val(this.quizAnswerState.submittedAnswer);
	}

	handleGuessPhaseOver() {
		if (options.autoSubmit && !this.quizAnswerState.answerSubmited() && !this.gotTeamAnswer) {
			this.submitAnswer();
		}
		this.disable();
	}

	disable() {
		//Work around for disabling backspace in firefox. When disabling a focused textinput, not possible to catch backspace event
		if (this.$input.is(':focus')) {
			this.$input.blur();
		}
		this.$input.attr('disabled', true);
	}

	enable() {
		this.$input.attr('disabled', false);
		if (this.inFocus) {
			this.$input.focus();
		}
	}

	clear() {
		this.$input.val('');
	}

	updateAutocomplete() {
		this.autoCompleteController.updateList();
	}

	resetAnswerState() {
		this.quizAnswerState.reset();
		this.gotTeamAnswer = false;
	}
}