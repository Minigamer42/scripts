'use strict';
/*exported Timer*/

class Timer {
	constructor() {
		this.startTime;
		this.start();
	}

	start() {
		this.startTime = moment();
	}

	getTimePassedMs() {
		return Math.round(moment.duration(moment().diff(this.startTime)).asMilliseconds());
	}
}