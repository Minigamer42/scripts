"use strict";
/*exported NexusCityWindowTab*/

class NexusCityWindowTab {
	constructor(window, $leftContainer, $rightContainer, $tab) {
		this.window = window;
		this.$leftContainer = $leftContainer;
		this.$rightContainer = $rightContainer;
		this.$tab = $tab;

		this.$tab.click(() => {
			window.changeTab(this);
		});
	}

	confirmTabChange(callback) {
		//Default, no check needed
		callback();
	}

	confirmClose(callback) {
		//Default, no check needed
		callback();
	}

	reset() {
		//Do nothing by default
	}

	show(noChangeHighlightTab) {
		this.$leftContainer.removeClass("hide");
		this.$rightContainer.removeClass("hide");
		if (!noChangeHighlightTab) {
			this.$tab.addClass("selected");
		}
	}

	hide(noChangeHighlightTab) {
		this.$leftContainer.addClass("hide");
		this.$rightContainer.addClass("hide");
		if (!noChangeHighlightTab) {
			this.$tab.removeClass("selected");
		}
	}
}
