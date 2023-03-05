'use strict';

class NexusCityOrderFilter {
	constructor($triggerElement, useSortFunction, sortValueFunction, triggerCallback) {
		this.useSortFunction = useSortFunction;
		this.sortValueFunction = sortValueFunction;

		this.$triggerElement = $triggerElement;
		this.$directionElement = this.$triggerElement.find(".nexusCityFilterDirection > i");

		this.onStateChangeCallback;
		this.state = this.STATES.OFF;

		let stateCount = Object.values(this.STATES).length;
		this.$triggerElement.click(() => {
			this.state = (this.state % stateCount) + 1;
			triggerCallback();
		});
	}

	setOnStateChangeCallback(callback) {
		this.onStateChangeCallback = callback;
	}

	shouldSort(a, b) {
		if (this.state === this.STATES.OFF) {
			return false;
		}
		return this.useSortFunction(a, b);
	}

	calculateSortValue(a, b) {
		let modifier = this.state === this.STATES.REVERSE ? -1 : 1;
		return this.sortValueFunction(a, b) * modifier;
	}

	reset() {
		this.state = this.STATES.OFF;
	}

	get state() {
		return this._state;
	}

	set state(newState) {
		this._state = newState;

		if (newState !== this.STATES.OFF) {
			this.$triggerElement.addClass("active");
		} else {
			this.$triggerElement.removeClass("active");
		}

		if (newState === this.STATES.REVERSE) {
			this.$directionElement.removeClass("fa-caret-down").addClass("fa-caret-up");
		} else {
			this.$directionElement.removeClass("fa-caret-up").addClass("fa-caret-down");
		}

		if (this.onStateChangeCallback) {
			this.onStateChangeCallback();
		}
	}
}
NexusCityOrderFilter.prototype.STATES = {
	ACTIVE: 1,
	REVERSE: 2,
	OFF: 3,
};