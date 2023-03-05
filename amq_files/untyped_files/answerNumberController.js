'use strict';
/*exported AnswerNumberController*/

class AnswerNumberController {
	constructor($answerContainer) {
		this.$textContainer = $answerContainer.find('.qpAvatarAnswerText');
		this.$answerNumber = $answerContainer.find('.qpAvatarAnswerNumber');
		this.$answerContainer = $answerContainer.find('.qpAvatarAnswerNumberInnerContainer');
		this.shown = false;
	}

	showResult(number, correct) {
		this.$answerNumber.text(number);
		this.show();
		//Use timeout to workaround browser draw update limets
		setTimeout(() => {
			if (correct) {
				this.$answerContainer.addClass('correct');
			} else {
				this.$answerContainer.addClass('wrong');
			}
		}, 10);
	}

	showUnknown(number) {
		this.$answerNumber.text(number);
		this.show();
	}

	show() {
		this.$answerContainer.removeClass('hide');
		this.$textContainer.addClass('quickDraw');
	}

	hide() {
		this.$answerContainer
			.addClass('hide')
			.removeClass('correct')
			.removeClass('wrong');
			this.$textContainer.removeClass('quickDraw');
	}
}