'use strict';
/*exported NexusDungeonBaseWindow*/

class NexusDungeonBaseWindow {
	constructor($window) {
		this.$window = $window;
		this.$hideButton = this.$window.find(".ncwHideWindow");
		this.$hideButtonIcon = this.$hideButton.find("i");

		this.$hideButton.click(() => {
			this.$window.toggleClass("hideBottom");
			this.updateHideButton();
		});
	}

	open() {
		this.$window.addClass("open");
	}

	close() {
		this.$window.removeClass("hideBottom");
		this.$window.removeClass("open");
		this.updateHideButton();
	}

	updateHideButton() {
		if(this.$window.hasClass("hideBottom")) {
			this.$hideButtonIcon.removeClass("fa-chevron-down");
			this.$hideButtonIcon.addClass("fa-chevron-up");
		} else {
			this.$hideButtonIcon.removeClass("fa-chevron-up");
			this.$hideButtonIcon.addClass("fa-chevron-down");
		}
	}
}