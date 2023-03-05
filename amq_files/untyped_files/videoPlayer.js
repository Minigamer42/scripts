'use strict';
/*exported VideoPlayer*/

class VideoPlayer {
	constructor($player) {
		this.$player = $player;
		this.player = videojs(this.$player.attr("id"), {
			controls: false,
			autoplay: false,
			preload: "metadata",
			inactivityTimeout: 0,
		});

		this.$player.find("video").attr("disablePictureInPicture", "");
		this.$player.find("video").attr("controlsList", "nodownload nofullscreen noremoteplayback");

		this.videoVolume = 0;
		this.playOnReady = true;
		this.startPoint;
		this.readyReported;
		this.bufferLength;
		this.reloadTried = false;
		this.currentVideoUrl;
		this.forcedMute = false;

		this.bufferMonitorInterval;
		this._TIME_TO_BUFFER_BEFORE_READY = 10; //sec

		this.player.ready(() => {
			this.updateVolume(this.videoVolume);
		});

		this.player.on("canplay", () => {
			this.handleCanPlay();
		});

		//Hotfix to mute bug introduced in Chrome 86
		this.player.on("playing", () => {
			if (!this.playOnReady) {
				this.updateVolume(0);
				this.updateVolume(this.videoVolume);
			}
		});

		this.player.on("loadedmetadata", () => {
			this.handleLoadMetaData();
		});

		this.player.on("error", () => {
			if(this.reloadTried) {
				this.handleError();
			} else {
				this.reloadTried = true;
				//Make a small delay to let the server update the entry
				setTimeout(() => {
					this.player.src(this.currentVideoUrl);
				}, 100);
			}
		});

		this.player.on("stalled", () => {
			if(!this.reloadTried) {
				this.reloadTried = true;
				//Make a small delay to let the server update the entry
				setTimeout(() => {
					this.player.src(this.currentVideoUrl);
				}, 100);
			}
		});
	}

	
	startBufferMonitor() {
		this.stopBufferMonitor();
		this.readyReported = false;
		this.bufferMonitorInterval = setInterval(() => {
			let bufferedPercent = this.player.bufferedPercent();
			if (this.player.bufferedEnd() > this.startPoint + this._TIME_TO_BUFFER_BEFORE_READY || bufferedPercent === 1) {
				if (!this.readyReported) {
					this.handleVideoReady();
					this.readyReported = true;
				}
				if (this.player.bufferedEnd() >= this.startPoint + this.bufferLength || bufferedPercent === 1) {
					this.handleVideoFinishedBuffering();
					this.stopBufferMonitor();
					if (!this.playOnReady) {
						this.pauseVideo();
					}
				}
			}
		}, this.BUFFER_MONITOR_TICK_RATE);
	}

	stopBufferMonitor() {
		clearInterval(this.bufferMonitorInterval);
	}

	handleCanPlay() {
		this.updateVolume(this.videoVolume);
		if (this.playOnReady) {
			if(!this.forcedMute) {
				this.player.muted(false);
			}
			this.player.play();
		} else {
			this.player.muted(true);
		}
	}

	handleLoadMetaData() {
		//Do nothing by default
	}

	handleError() {
		//Do nothing by default
	}
	
	handleVideoReady() {
		//Do nothing by default
	}

	handleVideoFinishedBuffering() {
		//Do nothing by default
	}

	setVolume(newVolume) {
		this.videoVolume = newVolume;
		this.updateVolume(newVolume);
	}

	updateVolume(baseVolume) {
		let videoVolume = this.getVideoVolume();
		let targetVolume = equalizeVolume(baseVolume, videoVolume);
		this.player.volume(targetVolume);
	}

	hide() {
		this.player.hide();
	}

	show() {
		this.player.show();
	}

	setVideo(videoUrl) {
		this.reloadTried = false;
		this.currentVideoUrl = videoUrl;
		this.player.src(videoUrl);
	}

	getVideoVolume() {
		return null;
	}

	playVideo() {
		this.playOnReady = true;
		if(!this.forcedMute) {
			this.player.muted(false);
		}
		this.replayVideo();
	}

	mute() {
		this.forcedMute = true;
		this.player.muted(true);
	}

	unmute() {
		this.forcedMute = false;
		this.player.muted(false);
	}

	replayVideo() {
		this.pauseVideo();
		this.player.currentTime(this.startPoint);
		this.player.play();
		this.updateVolume(this.videoVolume);
	}

	pauseVideo() {
		this.player.pause();
	}

	stopVideo() {
		this.playOnReady = false;
		this.pauseVideo();
		this.stopBufferMonitor();
	}
}