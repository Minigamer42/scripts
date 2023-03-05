"use strict";

class ScoreBoardEntry {
	constructor(name, score, standing, guessCount, scoreTitle, scoreBoardPosition, active, teamNumber, hidden) {
		this.$entry = $(format(this.TEMPLATE, name, standing, score, scoreTitle));

		this.isSelf = name === selfName;
		this.positionSlot = scoreBoardPosition;
		this.currentPosition = standing;
		this.disabled = !active;
		this.teamNumber = teamNumber;

		this.$scoreBoardEntry = this.$entry.find('.qpScoreBoardEntry');
		this.$scoreBoardEntryTextContainer = this.$entry.find('.qpScoreBoardEntry > p');
		this.$guessCount = this.$entry.find('.qpsPlayerGuessCount');
		this.$score = this.$entry.find('.qpsPlayerScore');
		this.$position = this.$entry.find('.qpScoreBoardNumber');
		this.$hiddenIcon = this.$entry.find('.qpScoreBoardEntryHidden');

		this.$entry.find('[data-toggle="popover"]').popover();

		if (guessCount !== undefined) {
			this.$guessCount.removeClass('hide');
			this.guessCount = guessCount;
		} else {
			this.$guessCount.addClass('hide');
		}

		if (this.isSelf) {
			this.$entry.find('.qpsPlayerName').addClass('self');
		}

		if(hidden) {
			this.displayHidden();
		}

		this.updateLayout();
	}

	set boardPosition(newValue) {
		let topOffset = newValue * this.ENTRY_HEIGHT;
		this.$entry.css('transform', 'translateY(' + topOffset + 'px)');
	}

	set score(newValue) {
		this.$score.text(newValue);
	}

	set position(newValue) {
		this.$position.text(newValue);
		let sizeUpdated = newValue.toString().length !== this.currentPosition.toString().length;
		this.currentPosition = newValue;
		if (sizeUpdated) {
			this.updateLayout();
		}
	}

	set guessCount(newValue) {
		this.$guessCount.text(newValue);
	}

	get positionFromTop() {
		return this.$entry.position().top;
	}

	get height() {
		return this.$entry.outerHeight();
	}

	set disabled(disabled) {
		if (disabled) {
			this.$entry.addClass('disabled');
		} else {
			this.$entry.removeClass('disabled');
		}
	}

	set correct(correct) {
		if (correct) {
			this.$score.addClass('rightAnswer');
		} else {
			this.$score.removeClass('rightAnswer');
		}
	}

	remove() {
		this.$entry.remove();
	}

	updateLayout() {
		let positionWidth;
		switch (this.currentPosition.toString().length) {
			case 1: positionWidth = 25; break;
			case 2: positionWidth = 32; break;
			case 3: positionWidth = 42; break;
			default: positionWidth = 52;
		}

		this.$position.width(positionWidth);
		this.$scoreBoardEntry.width('calc(100% - ' + (positionWidth + this.POSITION_RIGHT_MARGIN) + 'px)');
		fitTextToContainer(this.$scoreBoardEntryTextContainer, this.$scoreBoardEntry, 14, 9);
	}

	displayHidden() {
		this.$hiddenIcon.removeClass('hide');
		this.$hiddenIcon.popover({
			content: 'Hidden from other players',
			delay: 50,
			placement: 'top',
			trigger: 'hover'
		});
	}
}
ScoreBoardEntry.prototype.TEMPLATE = $("#quizScoreboardEntryTemplate").html();
ScoreBoardEntry.prototype.ENTRY_HEIGHT = 30; //px
ScoreBoardEntry.prototype.POSITION_RIGHT_MARGIN = 8; //px
