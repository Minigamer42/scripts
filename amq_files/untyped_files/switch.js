"use strict";
/*exported Switch*/

class Switch {
	constructor($switch) {
		this.$switch = $switch;
		this._on = false;

		this.$switch.click(() => {
			this.setOn(!this._on);
		});

		this._listeners = [];
	}

	get on() {
		return this._on;
	}

	setOn(on) {
		this._on = on;

		if (on) {
			this.$switch.addClass("active");
		} else {
			this.$switch.removeClass("active");
		}

		this._listeners.forEach((listener) => {
			listener(on);
		});
	}

	setDisabled(disabled) {
		if (disabled) {
			this.$switch.addClass("disabled");
		} else {
			this.$switch.removeClass("disabled");
		}
	}

	addListener(listener) {
		this._listeners.push(listener);
	}

	addContainerToggle($onContainer, $offContainer) {
		this.addListener((on) => {
			if (on) {
				$offContainer.addClass("hidden");
				$onContainer.removeClass("hidden");
			} else {
				$onContainer.addClass("hidden");
				$offContainer.removeClass("hidden");
			}
		});
	}

	getOn() {
		return this._on;
	}
}
