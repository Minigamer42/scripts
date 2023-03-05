"use strict";
/*exported VideoOverlay*/

function VideoOverlay() {
	this.$hider = $("#qpVideoHider");
	this.$hiderText = $("#qpHiderText");

	this.$extraTimeCounter = $("#qpExtraTimeCounter");

	this.$bufferingScreen = $("#qpWaitBuffering");

	this.$overlayTextContainers = $(".qpVideoOverlay > div");

	this.$userVideoHider = $("#qpVideosUserHidden");

	this.$textOverlay = $("#qpVideoMainTextOverlay");
	this.$returnToLobbyOverlay = $("#qpReturnToLobbyOverlay");

	this.loadingInterval;
	this.timerInterval;

	$(window).resize(this.setFontSize.bind(this));
}

VideoOverlay.prototype.showLoadingText = function () {
	this.show();
	this.stopLoadingText();
	this.$extraTimeCounter.text("");
	this.$hiderText.text('Loading');
	this.loadingInterval = setInterval(() => {
		let nextDotCount = (this.$hiderText.text().replace('Loading', '').length % 3) + 1;
		let nextText = 'Loading';
		for (let i = 0; i < nextDotCount; i++){
			nextText += '.';
		}
		this.$hiderText.text(nextText);
	}, 500);
};

VideoOverlay.prototype.stopLoadingText = function () {
	if (this.loadingInterval) {
		clearInterval(this.loadingInterval);
	}
};

VideoOverlay.prototype.showAnswerText = function() {
	this.show();
	this.stopTimer();
	this.stopExtraTimer();
	this.$hiderText.text("Answers");
	this.$extraTimeCounter.text("");
};

VideoOverlay.prototype.showCheatTestText = function() {
	this.show();
	this.stopTimer();
	this.stopExtraTimer();
	this.$hiderText.text("Cheat Test");
	this.$extraTimeCounter.text("");
};

VideoOverlay.prototype.showWaitingBuffering = function () {
	this.$bufferingScreen.removeClass('hide');
};

VideoOverlay.prototype.hideWaitingBuffering = function () {
	this.$bufferingScreen.addClass('hide');
	this.hideTextOverlay();
};

VideoOverlay.prototype.startTimer = function (time, extraTime) {
	this.stopLoadingText();
	this.show();

	this.stopTimer();
	this.stopExtraTimer();

	this.extraTime  = extraTime;
	if(extraTime > 0) {
		this.$extraTimeCounter.text(extraTime);
	} else {
		this.$extraTimeCounter.text("");
	}

	this.totaltTime = time;
	this.startTime = getTime();
	this.tickTimer();
	this.timerInterval = setInterval(this.tickTimer.bind(this), 500);
};

VideoOverlay.prototype.tickTimer = function () {
	let timeLeft = this.totaltTime - (getTime() - this.startTime) / 1000;
	this.$hiderText.text(Math.round(timeLeft));
	if (timeLeft < 0.5) {
		this.stopTimer();
	}
};

VideoOverlay.prototype.stopTimer = function () {
	if (this.timerInterval) {
		clearInterval(this.timerInterval);
	}
};

VideoOverlay.prototype.startExtraTimer = function () {
	this.stopTimer();
	this.extraStartTime = getTime();
	this.$hiderText.text("0");
	this.tickExtraTimer();
	this.extraTimerInterval = setInterval(this.tickExtraTimer.bind(this), 500);
};

VideoOverlay.prototype.tickExtraTimer = function () {
	let timeLeft = this.extraTime - (getTime() - this.extraStartTime) / 1000;
	this.$extraTimeCounter.text(Math.round(timeLeft));
	if (timeLeft < 0.5) {
		this.stopExtraTimer();
	}
};

VideoOverlay.prototype.stopExtraTimer = function () {
	if (this.extraTimerInterval) {
		clearInterval(this.extraTimerInterval);
	}
};

VideoOverlay.prototype.setFontSize = function () {
	let width = this.$hiderText.width();
	let newSize = 0.11594202898551 * width + 20.231884057971;
	this.$overlayTextContainers.css('font-size', newSize);
};

VideoOverlay.prototype.show = function () {
	this.$hider.removeClass('hide');
	this.setFontSize();
};

VideoOverlay.prototype.hide = function () {
	this.$hider.addClass('hide');
	this.hideUserVideoHidder();
};

VideoOverlay.prototype.showTextOverlay = function (message) {
	this.$textOverlay.text(message);
	this.$textOverlay.removeClass('hide');
};

VideoOverlay.prototype.hideTextOverlay = function (){
	this.$textOverlay.text("");
	this.$textOverlay.addClass('hide');
};

VideoOverlay.prototype.toogleUserVideoHidder = function(autoHidden = false) {
	if (this.$userVideoHider.hasClass('active')){
		this.hideUserVideoHidder();
		this.sendUserHiddenFeedback(false, autoHidden);
	}else{
		this.$userVideoHider.addClass('active');
		this.$userVideoHider.popover('destroy');
		this.sendUserHiddenFeedback(true, autoHidden);
	}
};

VideoOverlay.prototype.hideUserVideoHidder = function () {
	this.$userVideoHider.removeClass('active');
	this.$userVideoHider.popover({
		content: "Click to Hide Video",
		trigger: "hover",
		placement: "top",
		container: "#qpVideoContainer"
	});
};

VideoOverlay.prototype.sendUserHiddenFeedback = function (hidden, autoHidden) {
	if(quizVideoController.getCurrentResolution() !== 0) {
		socket.sendCommand({
			type: "quiz",
			command: "video hidden feedback",
			data: {
				hidden,
				autoHidden
			}
		});
	}
};

VideoOverlay.prototype.showReturnToLobbyText = function() {
	this.$returnToLobbyOverlay.removeClass('hide');
};

VideoOverlay.prototype.hideReturnToLobbyText = function() {
	this.$returnToLobbyOverlay.addClass('hide');
};

VideoOverlay.prototype.reset = function () {
	this.stopTimer();
	this.stopExtraTimer();
	this.hideReturnToLobbyText();
};