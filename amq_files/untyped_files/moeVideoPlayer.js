"use strict";
/*exported MoeVideoPlayer */

class MoeVideoPlayer extends VideoPlayer {
	constructor(id) {
		let playerId = "#" + id;
		super($(playerId));

		this.firstVideo = false;
		this.songId;
		this.startPercent;
		this.startTime;
		this.playbackRate;
		this.videoMap;
		this.resolutionOrder;
		this.hostOrder;
		this.resolution;
		this.host;
		this.videoVolumeMap;

		this._SUPPORTED_RESOLUTIONS = [720, 480, 0];

		this.troubleTriggerActive = false;
	}

	handleCanPlay() {
		super.handleCanPlay();
		this.player.playbackRate(this.playbackRate);
	}

	handleLoadMetaData() {
		let startFromDuration = this.player.duration() - this.bufferLength;
		startFromDuration = startFromDuration < 0 ? 0 : startFromDuration;
		let startPoint = startFromDuration * this.startPercent;
		this.startPoint = Math.floor(startPoint);

		if (this.startTime) {
			startPoint += this.startTime;
		}

		this.player.currentTime(Math.floor(startPoint));
		this.startBufferMonitor();
		this.player.play();
	}

	handleError() {
		socket.sendCommand({
			type: "quiz",
			command: "video error",
			data: {
				songId: this.songId,
				host: this.host,
				resolution: this.resolution,
			},
		});
		this.tryNextVideo();
	}

	handleVideoReady() {
		quiz.videoReady(this.songId);
	}

	handleVideoFinishedBuffering() {
		quizVideoController.currentVideoDoneBuffering();
		troubleShooterDropDown.videoFullyBuffered();
		this.troubleTriggerActive = false;
	}

	loadVideo(id, playLength, startPoint, firstVideo, videoMap, playOnReady, startTime, playbackRate, videoVolumeMap) {
		this.stopBufferMonitor();
		this.forcedMute = false;
		if (this.troubleTriggerActive) {
			troubleShooterDropDown.videoIssueBuffering();
		}
		this.troubleTriggerActive = true;

		this.videoMap = videoMap;
		this.videoVolumeMap = videoVolumeMap;

		this.playbackRate = playbackRate;
		this.firstVideo = firstVideo;
		this.startPercent = startPoint / 100;
		this.bufferLength = (playLength + 13) * this.playbackRate; //Factor in 5 secound show answer phase, 5 secoudns of buffer space and 3 secounds to avoid hitting end of video
		this.startTime = startTime * this.playbackRate;
		this.playOnReady = playOnReady;

		this.resolution; //Set when url selected
		this.host; //Set when url selected
		this.hostOrder = options.getHostPriorityList();

		let targetResolution = qualityController.targetResolution;
		this.resolutionOrder = [targetResolution];
		let largerResolutions = [];
		this._SUPPORTED_RESOLUTIONS.forEach((resolution) => {
			if (resolution < targetResolution) {
				this.resolutionOrder.push(resolution);
			} else if (resolution > targetResolution) {
				largerResolutions.unshift(resolution);
			}
		});
		this.resolutionOrder = this.resolutionOrder.concat(largerResolutions);

		this.songId = id;

		this.startLoading();
	}

	loadAndPlayVideo(id, playLength, startPoint, firstVideo, startTime, videoMap, playbackRate, videoVolumeMap) {
		this.loadVideo(id, playLength, startPoint, firstVideo, videoMap, true, startTime, playbackRate, videoVolumeMap);
		this.troubleTriggerActive = false;
	}

	getVideoVolume() {
		return this.videoVolumeMap
			? this.videoVolumeMap[this.host]
				? this.videoVolumeMap[this.host][this.resolution]
				: null
			: null;
	}

	getVideoUrl() {
		// return "/moeVideo.webm?id=" + this.getNextVideoId(); Server load reduction change
		return this.getNextVideoId();
	}

	//Obscured function, checks if video is displayed
	isPlaying() {
		// return this.$player.css("display") === "none";
		return true;
	}

	getNextVideoId() {
		let id;
		if (options.getHostResPrio() === options.HOST_PRIO.RESOLUTION) {
			let resolutionIndex;
			this.resolutionOrder.some((resolution, index) => {
				this.hostOrder.some((host) => {
					if (this.videoMap[host]) {
						id = this.videoMap[host][resolution];
					}
					if (id !== undefined) {
						this.resolution = resolution;
						this.host = host;
						return true;
					}
				});
				if (id !== undefined) {
					resolutionIndex = index;
					return true;
				}
			});
			if (resolutionIndex) {
				this.resolutionOrder.splice(0, resolutionIndex);
			}
		} else {
			let hostIndex;
			this.hostOrder.some((host, index) => {
				this.resolutionOrder.some((resolution) => {
					if (this.videoMap[host]) {
						id = this.videoMap[host][resolution];
					}
					if (id !== undefined) {
						this.resolution = resolution;
						this.host = host;
						return true;
					}
				});
				if (id !== undefined) {
					hostIndex = index;
					return true;
				}
			});
			if (hostIndex) {
				this.hostOrder.splice(0, hostIndex);
			}
		}
		return id;
	}

	startLoading() {
		this.setVideo(this.getVideoUrl());
	}

	tryNextVideo() {
		delete this.videoMap[this.host][this.resolution];
		if (Object.keys(this.videoMap[this.host]).length === 0) {
			delete this.videoMap[this.host];
		}
		if (Object.keys(this.videoMap).length === 0) {
			// All versions tried
			return;
		}
		this.startLoading();
	}
}
MoeVideoPlayer.prototype.BUFFER_MONITOR_TICK_RATE = 333; //ms
