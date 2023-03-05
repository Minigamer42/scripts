'use strict';
/*exported NexusCityWindowButton*/

class NexusCityWindowButton {
	constructor($button, clickFunction, popoverTitle) {
		this.$button = $button;

		this.$button.click(clickFunction);

		if(popoverTitle) {
			this.$button.popover({
				title: popoverTitle,
				delay: 120,
				placement: "auto",
				trigger: "hover",
			});
		}
	}

	disable() {
		this.$button.addClass('disabled');
	}

	enable() {
		this.$button.removeClass('disabled');
	}
}