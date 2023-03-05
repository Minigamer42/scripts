'use strict';
/*exported TickController*/

class TickController {
	constructor(tickHandler, stopCheck = () => false, stopHandler = () => {}) {
		this.tickHandler = tickHandler;
		this.stopCheck = stopCheck;
		this.stopHandler = stopHandler;

		this.lastTickTime;
		this.running = false;
	}

	start() {
		this.lastTickTime = new Date().valueOf();
		this.running = true;
		requestAnimationFrame(() => {
			this.tick();
		});
		this.tick();
	}

	stop() {
		this.running = false;
	}

	tick() {
		if(!this.running) {
			return;
		}

		let newTickTime = new Date().valueOf();
		let deltaTimeMs = newTickTime - this.lastTickTime;
		this.lastTickTime = newTickTime;
		this.tickHandler(deltaTimeMs);

		if(this.stopCheck()) {
			this.stop();
			this.stopHandler();
		} else {
			requestAnimationFrame(() => {
				this.tick();
			});
		}
	}
}