"use strict";
/*exported afkKicker*/

function AfkKicker() {
	this.afkWarningTimeout;
	this.hostAfkWarningTimeout;

	this.afkTriggeredOldStatus = null;

	this._AFK_TIMEOUT_TIME = 30 * 60 * 1000; //30 min, 1.800.000 ms
	this._HOST_AFK_TIMEOUT_TIME = 3 * 60 * 1000; //ms
	this.SOLO_AFK_TIMEOUT = 10 * 60 * 1000; //ms
	this.PRIVATE_AFK_TIMEOUT = 10 * 60 * 1000; //ms
	this.AFK_STATUS_TIME = 5 * 60 * 1000; //ms
}

AfkKicker.prototype.setup = function () {
	this.setupAfkTimeout();
	this.setupAfkStatusTimeout();

	$("body")
		.click(() => {
			this.resetTimers();
		})
		.keypress(() => {
			this.resetTimers();
		});
};

AfkKicker.prototype.resetTimers = function () {
	this.setupAfkTimeout();
	this.setupAfkStatusTimeout();

	if (this.hostAfkWarningTimeout) {
		this.setupHostTimeout();
	}

	if (this.afkTriggeredOldStatus != null) {
		socialTab.socialStatus.changeSocialStatus(this.afkTriggeredOldStatus);
		this.afkTriggeredOldStatus = null;
	}
};

AfkKicker.prototype.setupAfkTimeout = function () {
	clearTimeout(this.afkWarningTimeout);
	this.afkWarningTimeout = setTimeout(() => {
		displayHtmlMessage(
			"You have been detected as AFK",
			"You'll be logged out in <span id='afkLogoutWarningTime'>60</span> seconds",
			"Stay Online",
			function () {
				clearInterval(logoutInterval);
				//Next timeout setup by resetTimers
			}.bind(this)
		);
		let $timeLeft = $("#afkLogoutWarningTime");
		let logoutInterval = setInterval(() => {
			let timeLeft = parseInt($timeLeft.text()) - 1;
			if (timeLeft <= 0) {
				window.location.href = "./signout?reason=" + encodeURIComponent("Kicked Due to Inactivity");
			} else {
				$timeLeft.text(timeLeft);
			}
		}, 1000);
	}, this._AFK_TIMEOUT_TIME);
};

AfkKicker.prototype.setupHostTimeout = function (soloGame, privateGame) {
	clearTimeout(this.hostAfkWarningTimeout);
	let timeout = this._HOST_AFK_TIMEOUT_TIME;
	if (soloGame) {
		timeout = this.SOLO_AFK_TIMEOUT;
	} else if (privateGame) {
		timeout = this.PRIVATE_AFK_TIMEOUT;
	}
	this.hostAfkWarningTimeout = setTimeout(() => {
		displayHtmlMessage(
			"You have been detected as AFK",
			"You'll lost host status (and be changed to spectator, if you aren't already) in <span id='afkHostWarningTime'>10</span> seconds",
			"Stay Host",
			function () {
				clearInterval(removeHostInterval);
				//Next timeout setup by resetTimers
			}.bind(this)
		);
		let $timeLeft = $("#afkHostWarningTime");
		let removeHostInterval = setInterval(() => {
			let timeLeft = parseInt($timeLeft.text()) - 1;
			if (timeLeft <= 0) {
				socket.sendCommand({
					type: "lobby",
					command: "host afk",
				});
				this.clearHostTimeout();
				clearInterval(removeHostInterval);
				swal.close();
			} else {
				$timeLeft.text(timeLeft);
			}
		}, 1000);
	}, timeout);
};

AfkKicker.prototype.clearHostTimeout = function () {
	clearTimeout(this.hostAfkWarningTimeout);
	this.hostAfkWarningTimeout = null;
};

AfkKicker.prototype.setInExpandLibrary = function (active) {
	if (active) {
		this._AFK_TIMEOUT_TIME = 120 * 60 * 1000;
	} else {
		this._AFK_TIMEOUT_TIME = 30 * 60 * 1000;
	}
	this.resetTimers();
};

AfkKicker.prototype.setupAfkStatusTimeout = function () {
	clearTimeout(this.afkStatusTimeout);
	this.afkStatusTimeout = setTimeout(() => {
		if (
			socialTab.socialStatus.currentStatus !== socialTab.socialStatus.STATUS_IDS.AWAY &&
			socialTab.socialStatus.currentStatus !== socialTab.socialStatus.STATUS_IDS.INVISIBLE
		) {
			this.afkTriggeredOldStatus = socialTab.socialStatus.currentStatus;
			socialTab.socialStatus.changeSocialStatus(socialTab.socialStatus.STATUS_IDS.AWAY);
		}
	}, this.AFK_STATUS_TIME);
};

let afkKicker = new AfkKicker();
