'use strict';

class BubbleTextController {
	constructor($spawnRow) {
		this.$spawnRow = $spawnRow;
	}

	spawnText(text, extraClass) {
		if (options.disableFloatingText) {
			return;
		}
		let horizontalStartPosition = this.generateRandomPosition();
		let floatHeight = this.generateRandomFloatHeight();

		let $text = $(format(this.TEXT_TEMPLATE, text));
		if(extraClass) {
			$text.addClass(extraClass);
		}
		$text.css('left', horizontalStartPosition + '%');
		this.$spawnRow.append($text);
		$text.bind('transitionend', () => {
			$text.remove();
		});

		$text.position(); //Force layout render
		$text.css({
			transform: 'translateY(-' + floatHeight + 'px)',
			opacity: 0
		});
	}

	generateRandomPosition() {
		return Math.random() * this.HORIZONTAL_POS_RANGE + this.MIN_HORIZONTAL_POS;
	}

	generateRandomFloatHeight() {
		return Math.random() * this.FLOAT_HEIGHT_RANGE + this.MIN_FLOAT_HEIGHT;
	}
}

BubbleTextController.prototype.TEXT_TEMPLATE = "<div class='bubbleText'>{0}</div>";
BubbleTextController.prototype.MIN_HORIZONTAL_POS = 20; //%
BubbleTextController.prototype.HORIZONTAL_POS_RANGE = 60; //%
BubbleTextController.prototype.MIN_FLOAT_HEIGHT = 120; //px
BubbleTextController.prototype.FLOAT_HEIGHT_RANGE = 80; //px

