"use strict";
/*exported popoutMessages*/

function PopoutMessages() {
	this.$restartMessageContainer = $("#restartMessageContainer");
	this.$popoutMessageContainer = $("#popoutMessageContainer");

	this.DONATION_TEMPALTE = $("#donatinoMessageTemplate").html();
	this.STANDARD_TEMPLATE = $("#standardPopoutMessageTemplate").html();
	this.RANKRED_REWARD_TEMPLATE = $("#rankedRewardTemplate").html();

	this.POPOUT_CLOSE_TIMEOUT = 5000; //ms
	this.POPOUT_CLOSE_TIME = 1000; //ms

	this.restartCountdownInterval;
	this.restartAt;
	new Listener("server restart", (payload) => {
		this.displayRestartMessage(payload.msg, payload.time);
	}).bindListener();

	new Listener("new donation", (payload) => {
		let donation = payload.donation;
		popoutMessages.displayDonationMessage(donation.username, donation.amount, donation.avatarName);
	}).bindListener();

	new Listener("popout message", (payload) => {
		this.displayStandardMessage(payload.header, payload.message);
	}).bindListener();

	new Listener("ranked score update", (payload) => {
		let oldScore = payload.oldState ? payload.oldState.score : 0;
		let oldRank = payload.oldState ? payload.oldState.rank : "-";
		this.displayRankedRewardMessage(
			payload.position,
			oldScore,
			oldRank,
			payload.newState.score,
			payload.newState.rank,
			payload.oldBadge,
			payload.newBadge
		);
	}).bindListener();

	this.popoutMessageCloseTimeout;
	this.popoutMessageQueue = [];
}

PopoutMessages.prototype.closeRestartMessage = function () {
	this.$restartMessageContainer.removeClass("open");
};

PopoutMessages.prototype.displayRestartMessage = function (msg, time) {
	this.$restartMessageContainer.find("p").text(msg);
	this.$restartMessageContainer.find(".timeLeft").text(time);

	if (!this.restartCountdownInterval) {
		clearInterval(this.restartCountdownInterval);
	}
	this.restartAt = moment().add(time, "m");
	this.restartCountdownInterval = setInterval(() => {
		this.$restartMessageContainer.find(".timeLeft").text(this.restartAt.fromNow());
	}, 1000);

	this.$restartMessageContainer.addClass("open");
};

PopoutMessages.prototype.displayDonationMessage = function (donator, amount, target) {
	let messageHtml = format(
		this.DONATION_TEMPALTE,
		escapeHtml(donator),
		escapeHtml(amount),
		escapeHtml(target)
	);
	this.displayPopoutMessage(messageHtml);
};

PopoutMessages.prototype.displayStandardMessage = function (header, message) {
	let messageHtml = format(this.STANDARD_TEMPLATE, escapeHtml(header), escapeHtml(message));
	this.displayPopoutMessage(messageHtml);
};

PopoutMessages.prototype.displayRankedRewardMessage = function (
	position,
	oldScore,
	oldRank,
	newScore,
	newRank,
	oldBadge,
	newBadge
) {
	let messageHtml = format(
		this.RANKRED_REWARD_TEMPLATE,
		position,
		oldScore,
		oldRank,
		cdnFormater.newBadgeSrc(oldBadge),
		cdnFormater.newBadgeSrcSet(oldBadge),
		cdnFormater.newBadgeSrc(newBadge),
		cdnFormater.newBadgeSrcSet(newBadge)
	);
	this.displayPopoutMessage(messageHtml, false, () => {
		let $score = this.$popoutMessageContainer.find(".rankedPoputScore");
		let $rank = this.$popoutMessageContainer.find(".rankedPoputRank");
		let $rankGlow = this.$popoutMessageContainer.find(".rankedPoputRankGlow");
		let $badgeImageOld = this.$popoutMessageContainer.find(".rankedResultPopoutBadge.old");
		let $badgeImageNew = this.$popoutMessageContainer.find(".rankedResultPopoutBadge.new");
		let scoreTicks = 90;
		let scoreTickTime = 1500 / scoreTicks; //1500 ms
		let scoreTickIncrement = (newScore - oldScore) / scoreTicks; //90 ticks
		let currentScore = oldScore;
		setTimeout(() => {
			let scoreInterval = setInterval(() => {
				currentScore = currentScore + scoreTickIncrement;
				$score.text(Math.round(currentScore));
				if (currentScore >= newScore) {
					clearInterval(scoreInterval);
					$score.text(newScore);
				}
			}, scoreTickTime);
		}, 1500);
		setTimeout(() => {
			$rankGlow.css("opacity", 1);
		}, 3000);
		setTimeout(() => {
			$rank.text(newRank);
			$rankGlow.text(newRank);
		}, 3200);
		setTimeout(() => {
			$rankGlow.css("opacity", 0);
			$badgeImageOld.addClass('hide');
			$badgeImageNew.removeClass('hide');
		}, 4000);
	});
};

PopoutMessages.prototype.displayPopoutMessage = function (htmlBody, force, onDisplay = () => {}) {
	if (!force && (this.$popoutMessageContainer.hasClass("open") || this.popoutMessageQueue.length !== 0)) {
		this.popoutMessageQueue.push(htmlBody);
	} else {
		this.$popoutMessageContainer.addClass("open").find(".popoutContent").html(htmlBody);
		onDisplay();
		this.popoutMessageCloseTimeout = setTimeout(() => {
			this.closePopoutMessage();
		}, this.POPOUT_CLOSE_TIMEOUT);
	}
};

PopoutMessages.prototype.closePopoutMessage = function () {
	clearTimeout(this.popoutMessageCloseTimeout);
	this.$popoutMessageContainer.removeClass("open");
	setTimeout(() => {
		if (this.popoutMessageQueue.length) {
			let nextMessage = this.popoutMessageQueue.shift();
			this.displayPopoutMessage(nextMessage, true);
		}
	}, this.POPOUT_CLOSE_TIME);
};

var popoutMessages = new PopoutMessages();
