'use strict';
/*exported NexusCityWindow*/

class NexusCityWindow {
	constructor($window) {
		this.$window = $window;
		this.$exitButton = this.$window.find(".ncwExitButton");
		this.$backButton = this.$window.find(".ncwBackButton");

		this.currentTab;
		this.backClickCallback;

		this.$exitButton.click(() => {
			this.close();
		});

		this.$backButton.click(() => {
			this.backClickCallback();
		});
	}

	get isOpen() {
		return this.$window.hasClass("open");
	}

	trigger() {
		this.open();
	}

	open() {
		this.$window.addClass("open");
	}

	close() {
		if(this.currentTab) {
			this.currentTab.confirmClose(() => {
				this.executeClose();
			});
		} else {
			this.executeClose();
		}	
	}

	executeClose() {
		this.$window.removeClass("open");
	}

	changeTab(newTab, noChangeHighlightTab) {
		if(newTab === this.currentTab) {
			return;
		}

		this.$backButton.addClass("hide");

		if(this.currentTab) {
			this.currentTab.confirmTabChange(() => {
				this.executeTabChange(newTab, noChangeHighlightTab);
			});
		} else {
			this.executeTabChange(newTab, noChangeHighlightTab);
		}
	}

	executeTabChange(newTab, noChangeHighlightTab) {
		if(this.currentTab) {
			this.currentTab.hide(noChangeHighlightTab);
		}
		this.currentTab = newTab;
		newTab.show(noChangeHighlightTab);
	}

	enableBackForTab(callback) {
		this.$backButton.removeClass("hide");
		this.backClickCallback = callback;
	}
}