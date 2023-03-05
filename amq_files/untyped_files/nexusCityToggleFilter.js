"use strict";
/*exported NexusCityToggleFilter NexusCityToggleFilterCategory NexusCityToggleFilterCategoryEntry*/

class NexusCityToggleFilter {
	constructor($toggle, $container, filterCategories) {
		this.$toggle = $toggle;
		this.$container = $container;

		this.filterCategories = filterCategories;

		this.displayed = false;

		this.closeHandler = () => {
			this.close();
		};

		this.$toggle.click((event) => {
			if (this.displayed) {
				this.close();
			} else {
				this.open();
			}
			event.stopPropagation();
		});
		this.$container.click((event) => {
			this.updateActive();
			event.stopPropagation();
		});
	}

	updateActive() {
		let filterActive = this.filterCategories.some(filter => filter.activeFilter);
		if(filterActive) {
			this.$toggle.addClass('active');
		} else {
			this.$toggle.removeClass('active');
		}
	}

	checkFilter(entry) {
		return !this.filterCategories.some((filter) => !filter.checkFilter(entry));
	}

	open() {
		this.$container.removeClass("hide");
		$(document).click(this.closeHandler);
		this.displayed = true;
	}

	close() {
		this.$container.addClass("hide");
		$(document).off("click", this.closeHandler);
		this.displayed = false;
	}
}

class NexusCityToggleFilterCategory {
	constructor(targetParameters, filterEntries) {
		this.targetParameters = targetParameters;
		this.filterEntries = filterEntries;
	}

	get activeFilter() {
		return this.filterEntries.some(filter => !filter.on);
	}

	checkFilter(entry) {
		return this.filterEntries
			.filter((filter) => filter.on)
			.map((filter) => filter.value)
			.includes(entry[this.targetParameters]);
	}
}

class NexusCityToggleFilterCategoryEntry {
	constructor($toggle, value, changeCallback) {
		this.$toggle = $toggle;
		this.$box = this.$toggle.find(".nexusCityFilterListOptionBox");
		this.value = value;
		this.on = true;

		this.$toggle.click(() => {
			if (this.on) {
				this.disable();
			} else {
				this.enable();
			}
			changeCallback();
		});
	}

	enable() {
		this.$box.addClass("selected");
		this.on = true;
	}

	disable() {
		this.$box.removeClass("selected");
		this.on = false;
	}
}
