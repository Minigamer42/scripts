'use strict';
/*exported StoreFilter*/

class StoreFilter {
	constructor($window) {
		this.filters = {
			locked: new StoreFilterEntry($window.find('#swLockedFilter')),
			unlocked: new StoreFilterEntry($window.find('#swUnlockedFilter')),
			avaliable: new StoreFilterEntry($window.find('#swAvailableFilter')),
			unavaliable: new StoreFilterEntry($window.find('#swUnvavaliableFilter')),
			limited: new StoreFilterEntry($window.find('#swLimitedFilter')),
			unlimited: new StoreFilterEntry($window.find('#swUnlimitedFilter')),
			premium: new StoreFilterEntry($window.find('#swPremiumFilter')),
			standard: new StoreFilterEntry($window.find('#swStandardFilter'))
		};
	}

	get currentFilter() {
		let filter = {};
		Object.keys(this.filters).map(key => {
			filter[key] = this.filters[key].checked;
		});
		return filter;
	}
}

class StoreFilterEntry {
	constructor($checkbox) {
		this.$name = name;
		this.$checkbox = $checkbox;

		this.checked = true;
		this.$checkbox.on('change', () => {
			this.checked = this.$checkbox.is(':checked');
			storeWindow.filterChangeEvent();
		});
	}
}