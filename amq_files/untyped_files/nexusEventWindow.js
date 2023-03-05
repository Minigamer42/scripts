"use strict";
/*exported NexusEventWindow*/

class NexusEventWindow extends NexusDungeonBaseWindow{
	constructor(mapController) {
		super($("#nexusEventContainer"));
		this.$nameContainer = this.$window.find("#nexusEventName");
		this.$text = this.$window.find("#nexusEventText");
		this.$optionContainer = this.$window.find("#nexusEventOptionContainer");
		this.$timer = this.$window.find("#nexusEventTimer");

		this.videoController = new NexusEventVideoController();
		this.volumeController = new NexusEventWindowVolumeController(this.videoController);
		this.loadingDisplay = new NexusEventLoadingDisplay();

		this.timerInterval;
		this.mapController = mapController;

		this.activeOptions = {};

		this.graceCurrentHovers = [];

		this._nexusMapEventListener = new Listener("nexus map event", (payload) => {
			this.displayContent(payload);
			this.open();
		});
		this._nexusMapEventListener.bindListener();

		this._nexusMapEventUpdateListener = new Listener("nexus map event update", (payload) => {
			mapController.clearPlayerVotes();
			this.displayContent(payload);
		});
		this._nexusMapEventUpdateListener.bindListener();

		this._nexusMapEventStartTimer = new Listener("nexus map event start timer", (payload) => {
			this.startTimer(payload.length);
		});
		this._nexusMapEventStartTimer.bindListener();

		this._nexusMapEventEndListener = new Listener("nexus map event end", () => {
			mapController.clearPlayerVotes();
			this.close();
		});
		this._nexusMapEventEndListener.bindListener();

		this._nexusMapEventEnableOptionListener = new Listener("nexus map event enable option", (payload) => {
			this.activeOptions[payload.optionId].enable();
			if (payload.hideLoad) {
				this.loadingDisplay.stop();
			}
		});
		this._nexusMapEventEnableOptionListener.bindListener();
	}

	close() {
		this.resetGraceHovers();
		super.close();
		this.volumeController.hide();
		this.videoController.reset();
	}

	displayContent(eventInfo) {
		this.setupContent(
			eventInfo.name,
			eventInfo.text,
			eventInfo.options,
			eventInfo.centerText,
			eventInfo.artifactHighlights
		);
		if (eventInfo.displayVolume) {
			this.displayVolume();
		} else {
			this.volumeController.hide();
		}
		if (eventInfo.videoList) {
			this.videoController.setupVideos(eventInfo.videoList);
		}
		if (eventInfo.playVideo) {
			if (!eventInfo.muteVideo) {
				this.mapController.fadeOSTTrack(100, 300);
			}
			this.videoController.playVideo();
		}
		if (eventInfo.stopVideo) {
			this.videoController.stopVideo();
			this.mapController.fadeOSTTrack(0, 300);
		}

		if (eventInfo.nextVideo) {
			this.videoController.nextVideo();
		}

		if (eventInfo.displayLoad) {
			this.loadingDisplay.start();
		} else {
			this.loadingDisplay.stop();
		}

		if (eventInfo.displayTinyVideo) {
			this.videoController.displayTinyVideo();
		} else {
			this.videoController.hideTinyVideo();
		}

		if (eventInfo.muteVideo) {
			this.videoController.updateVolume(0);
		} else {
			this.volumeController.resetVolume();
		}
	}

	resetGraceHovers() {
		this.graceCurrentHovers.forEach((grave) => {
			grave.destroy();
		});
		this.graceCurrentHovers = [];
	}

	setupContent(header, text, options, centerText, artifactHighlights) {
		this.stopTimer();
		this.activeOptions = {};

		this.resetGraceHovers();

		if (header) {
			this.$nameContainer.text(header);
		}
		if (artifactHighlights && artifactHighlights.length) {
			artifactHighlights.forEach((artifactInfo) => {
				text = text.replace(
					new RegExp(artifactInfo.name, "g"),
					`<span class="artifactHighlight ${artifactInfo.name.replace(/\s/g, "")}">${artifactInfo.name}</span>`
				);
			});
		}
		if (text) {
			this.$text.html(text.replace(/\n/g, "<br/>"));
		}
		if (artifactHighlights && artifactHighlights.length) {
			let highlightIndex = 0;
			let currentHovers = this.graceCurrentHovers;
			artifactHighlights.forEach((artifactInfo) => {
				let artifactClass = artifactInfo.name.replace(/\s/g, "");
				this.$text.find(`.${artifactClass}`).each(function () {
					let $highlight = $(this);
					let currentId = highlightIndex;
					currentHovers.push(
						new GraceHoverHandler(
							$highlight,
							250,
							50,
							() => {
								nexusArtifactPopover.displayArtifact(artifactInfo, $highlight, currentId);
							},
							() => {
								nexusArtifactPopover.hide(currentId);
							}
						)
					);
					highlightIndex++;
				});
			});
		}
		if (options) {
			this.$optionContainer.html("");
			options.forEach((option) => {
				let eventOption = new NexusEventWindowOption(option);
				this.$optionContainer.append(eventOption.$body);
				this.activeOptions[option.optionId] = eventOption;
			});
		}
		if (centerText) {
			this.$text.addClass("text-center");
		} else {
			this.$text.removeClass("text-center");
		}
	}

	startTimer(length) {
		clearInterval(this.timerInterval);
		this.$timer.text(length);
		let startTime = moment();
		this.timerInterval = setInterval(() => {
			let timeSinceStart = Math.floor(moment.duration(moment().diff(startTime)).asSeconds());
			let timeLeft = length - timeSinceStart;
			if (timeLeft < 0) {
				timeLeft = 0;
			}
			this.$timer.text(timeLeft);
			if (timeLeft === 0) {
				clearInterval(this.timerInterval);
			}
		}, 100);
		this.$timer.removeClass("hide");
	}

	stopTimer() {
		clearInterval(this.timerInterval);
		this.$timer.addClass("hide");
	}

	displayVolume() {
		this.volumeController.show();
		this.volumeController.init();
	}

	displayVote(optionId, playerVote) {
		if (this.activeOptions[optionId]) {
			this.activeOptions[optionId].displayVote(playerVote);
		}
	}
}

class NexusEventWindowOption {
	constructor({ optionId, text, active }) {
		this.$body = $(format(this.TEMPLATE, text));
		this.$voteContainer = this.$body.find(".nexusEventOptionVoteContainer");

		this.$body.click(() => {
			socket.sendCommand({
				type: "nexus",
				command: "event option select",
				data: {
					optionId,
				},
			});
		});
		if (!active) {
			this.disable();
		}
	}

	enable() {
		this.$body.removeClass("disabled");
	}

	disable() {
		this.$body.addClass("disabled");
	}

	displayVote(playerVote) {
		playerVote.detach();
		this.$voteContainer.append(playerVote.$icon);
	}
}
NexusEventWindowOption.prototype.TEMPLATE =
	'<div class="nexusEventOption nexusWindowButton clickAble">{0}<div class="nexusEventOptionVoteContainer"></div></div>';

class NexusEventWindowVolumeController {
	constructor(videoController) {
		this.$container = $("#nexusEventVolumeContainer");
		this.$slider = this.$container.find("#nexusEventVolumeSlider");
		this.videoController = videoController;

		this.$slider.slider({
			min: 0,
			max: 100,
		});

		this.$slider.on("change", (event) => {
			let newValue = event.value.newValue;
			this.videoController.updateVolume(newValue / 100);
			volumeController.volume = newValue / 100;
			volumeController.adjustVolume();
		});
	}

	init() {
		this.$slider.slider("relayout");
		this.resetVolume();
	}

	resetVolume() {
		let currentVolume = volumeController.volume;
		this.$slider.slider("setValue", Math.round(currentVolume * 100));
		this.videoController.updateVolume(currentVolume);
	}

	show() {
		this.$container.removeClass("hide");
	}

	hide() {
		this.$container.addClass("hide");
	}
}

class NexusEventVideoPlayer extends VideoPlayer {
	constructor($video, readyCallback, finishedBufferingCallback) {
		super($video);

		this.readyCallback = readyCallback;
		this.finishedBufferingCallback = finishedBufferingCallback;

		this.videoMeanVolume;
		this.startTime;

		this.videoLoadStarted = false;
		this.bufferFinished = false;
		// this.hide();
	}

	handleLoadMetaData() {
		this.player.currentTime(Math.floor(this.startTime));
		this.startBufferMonitor();
		this.player.play();
	}

	setupVideo({ videoLink, startTime, meanVolume, playLength }) {
		this.videoMeanVolume = meanVolume;
		this.startTime = startTime;
		this.bufferLength = playLength;
		this.startPoint = startTime;
		this.setVideo(videoLink);
		this.videoLoadStarted = true;
		this.bufferFinished = false;
	}

	handleError() {
		//Do nothing by default
	}

	handleVideoReady() {
		this.readyCallback(this);
	}

	handleVideoFinishedBuffering() {
		this.bufferFinished = true;
		this.finishedBufferingCallback(this);
	}

	getVideoVolume() {
		return this.videoMeanVolume;
	}

	reset() {
		this.stopVideo();
		this.videoLoadStarted = false;
		this.bufferFinished = false;
	}

	playVideo() {
		super.playVideo();
		this.$player.removeClass("hide");
	}

	stopVideo() {
		super.stopVideo();
		this.$player.addClass("hide");
	}
}

class NexusEventVideoController {
	constructor() {
		this.$container = $("#nexusEventVideoContainer");
		this.playerOne = new NexusEventVideoPlayer(
			$("#nexusEventVideoPlayerOne"),
			this.videoReady.bind(this),
			this.videoFinishedBuffering.bind(this)
		);
		this.playerTwo = new NexusEventVideoPlayer(
			$("#nexusEventVideoPlayerTwo"),
			this.videoReady.bind(this),
			this.videoFinishedBuffering.bind(this)
		);

		this.activePlayer = this.playerOne;
		this.bufferPlayer = this.playerTwo;
		this.currentVideoIndex = 0;
		this.currentVideos = [];
	}

	displayTinyVideo() {
		this.$container.removeClass("hide");
	}

	hideTinyVideo() {
		this.$container.addClass("hide");
	}

	reset() {
		this.currentVideoIndex = 0;
		this.currentVideos = [];
		this.playerOne.reset();
		this.playerTwo.reset();
	}

	videoReady(player) {
		let index = player === this.activePlayer ? this.currentVideoIndex : this.currentVideoIndex + 1;
		socket.sendCommand({
			type: "nexus",
			command: "event video ready",
			data: {
				videoId: index,
			},
		});
	}

	videoFinishedBuffering(player) {
		if (this.activePlayer === player && this.currentVideos.length > this.currentVideoIndex + 1) {
			this.startBuffering(this.currentVideoIndex + 1, this.bufferPlayer);
		}
	}

	updateVolume(newVolume) {
		this.playerOne.setVolume(newVolume);
		this.playerTwo.setVolume(newVolume);
	}

	setupVideos(videoList) {
		this.reset();
		this.currentVideos = videoList;
		this.currentVideoIndex = 0;
		this.startBuffering(0, this.activePlayer);
	}

	startBuffering(videoIndex, player) {
		let targetVideo = this.currentVideos[videoIndex];
		if (targetVideo) {
			player.setupVideo(targetVideo);
		}
	}

	playVideo() {
		this.activePlayer.playVideo();
	}

	stopVideo() {
		this.activePlayer.stopVideo();
	}

	nextVideo() {
		this.activePlayer.reset();
		this.activePlayer = this.activePlayer === this.playerOne ? this.playerTwo : this.playerOne;
		this.bufferPlayer = this.bufferPlayer === this.playerOne ? this.playerTwo : this.playerOne;
		this.currentVideoIndex++;
		if (!this.activePlayer.videoLoadStarted) {
			this.startBuffering(this.currentVideoIndex, this.activePlayer);
		} else if (this.activePlayer.bufferFinished) {
			this.startBuffering(this.currentVideoIndex + 1, this.bufferPlayer);
		}
	}
}

class NexusEventLoadingDisplay {
	constructor() {
		this.$display = $("#nexusEventLoadingContainer");

		this.runInterval;
		this.dotNumber = 0;
	}

	start() {
		clearInterval(this.runInterval);
		this.runInterval = setInterval(() => {
			this.update();
		}, this.SPEED);
	}

	stop() {
		clearInterval(this.runInterval);
		this.$display.text("");
	}

	update() {
		this.dotNumber++;
		if (this.dotNumber > this.DOT_COUNT) {
			this.dotNumber = 0;
		}
		this.$display.text(".".repeat(this.dotNumber));
	}
}
NexusEventLoadingDisplay.prototype.DOT_COUNT = 3;
NexusEventLoadingDisplay.prototype.SPEED = 350;
