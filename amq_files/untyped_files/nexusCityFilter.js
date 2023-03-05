"use strict";
/*exported NexusCityFilter*/

class NexusCityFilter {
	constructor(filterEntries, defaultSortFunction, $nameSearch, callbackFunction, initialSortFunction, toggleFilter) {
		this.filterEntries = filterEntries;
		this.defaultSortFunction = defaultSortFunction;
		this.initialSortFunction = initialSortFunction;
		this.$nameSearch = $nameSearch;
		this.toggleFilter = toggleFilter;
		this.searchString;

		this.filterEntries.forEach((entry) => {
			entry.setOnStateChangeCallback(() => {
				if (this.filterEntries[0] === entry) {
					return;
				}
				this.filterEntries = this.filterEntries.filter((targetEntry) => targetEntry !== entry);
				this.filterEntries.unshift(entry);
			});
		});

		let callbackTimeout;
		$nameSearch.on("input", () => {
			clearTimeout(callbackTimeout);

			let newString = $nameSearch.val();
			if (newString) {
				this.searchString = newString.toLowerCase();
			} else {
				this.searchString = null;
			}
			callbackTimeout = setTimeout(callbackFunction, this.TEXT_INPUT_UPDATE_DELAY);
		});
	}

	reset() {
		this.filterEntries.forEach((entry) => entry.reset());
		this.searchString = null;
		this.$nameSearch.val("");
	}

	sortList(list) {
		return list
			.filter(
				(entry) =>
					(!this.searchString || entry.name.toLowerCase().includes(this.searchString)) &&
					(!this.toggleFilter || this.toggleFilter.checkFilter(entry))
			)
			.sort((a, b) => {
				let initialSortValue = this.initialSortFunction ? this.initialSortFunction(a, b) : 0;
				if (initialSortValue !== 0) {
					return initialSortValue;
				}
				let targetFilter = this.filterEntries.find((filter) => filter.shouldSort(a, b));
				if (targetFilter) {
					return targetFilter.calculateSortValue(a, b);
				} else {
					return this.defaultSortFunction(a, b);
				}
			});
	}
}
NexusCityFilter.prototype.TEXT_INPUT_UPDATE_DELAY = 50; //ms
