"use strict";
/*exported TextCounter*/

class TextCounter {
	constructor($textContainer, speedMs, tickCallback, defaultValue = 0, finishedCallback = null) {
		this.$textContainer = $textContainer;

		this.currentValue = defaultValue;
		this.targetValue = defaultValue;

		this.speedMs = speedMs;
		this.tickCallback = tickCallback;
		this.finishedCallback = finishedCallback;

		this.currentInterval;
	}

	set currentValue(newValue) {
		this._currentValue = newValue;
		this.$textContainer.text(newValue);
	}

	get currentValue() {
		return this._currentValue;
	}

	get finished() {
		return this.currentValue === this.targetValue;
	}

	countToValue(value) {
		let targetChange = value - this.currentValue;
		let startValue = this.currentValue;
		this.targetValue = value;

		if (targetChange === 0) {
			if (this.finishedCallback) {
				this.finishedCallback();
			}
		} else {
			clearInterval(this.currentInterval);
			let timer = new Timer();
			this.currentInterval = setInterval(() => {
				let percentPassed = timer.getTimePassedMs() / this.speedMs;
				if (percentPassed > 1) {
					percentPassed = 1;
					clearInterval(this.currentInterval);
				}
				let change = Math.floor(targetChange * percentPassed);
				this.currentValue = startValue + change;
				if (this.tickCallback) {
					this.tickCallback(this.currentValue);
				}
				if (this.finishedCallback && percentPassed === 1) {
					this.finishedCallback();
				}
			}, this.TICK_SPEED);
		}
	}
}

TextCounter.prototype.TICK_SPEED = 1000 / 60; //60 FPS
