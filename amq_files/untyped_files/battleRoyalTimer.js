'use strict';

function BattleRoyalTimer() {
	this.$timerText = $("#brTimeLeft");
	
	this.endMoment;
	this.runInterval;

	this.STANDBY_TEXT = '--:--';
}

BattleRoyalTimer.prototype.reset = function () {
	this.stop();
	this.$timerText.text(this.STANDBY_TEXT);
};

BattleRoyalTimer.prototype.start = function (lengthSeconds) {
	this.endMoment = moment().add(lengthSeconds, 's');

	this.stop();
	this.runInterval = setInterval(() => {
		if(moment().isAfter(this.endMoment)) {
			this.$timerText.text('00:00');
			this.stop();
		} else {
			this.updateTime();
		}
	}, 1000);
	this.updateTime();
};

BattleRoyalTimer.prototype.stop = function () {
	clearInterval(this.runInterval);
};

BattleRoyalTimer.prototype.updateTime = function () {
	let secondsLeft = this.endMoment.diff(moment(), 'seconds');
	let minutesLeft = 0;
	while(secondsLeft >= 60) {
		secondsLeft -= 60;
		minutesLeft++;
	}
	let minuteString = minutesLeft > 9 ? "" + minutesLeft : "0" + minutesLeft;
	let secondString = secondsLeft > 9 ? "" + secondsLeft : "0" + secondsLeft;
	this.$timerText.text(minuteString + ':' + secondString);
};