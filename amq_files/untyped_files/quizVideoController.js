"use strict";
/*exported quizVideoController*/

function QuizVideoController() {
	this.moePlayers = [];
	this.nextMoePlayerId = -1;
	this.currentMoePlayerId;

	this.readyToBufferNextVideo = false;

	this._NUMBER_OF_MOE_PLAYERS = 2;
}

QuizVideoController.prototype.setup = function () {
	for (let i = 0; i < this._NUMBER_OF_MOE_PLAYERS; i++) {
		let playerId = 'qpMoePlayer-' + i;
		let newPlayerObject = $('<video id="' + playerId + '" class="qpVideoPlayer" type="video/webm"/>');
		$('#qpVideoOverflowContainer').prepend(newPlayerObject);
		this.moePlayers.push(new MoeVideoPlayer(playerId));
	}
	this.calculateNextPlayerId();
};

QuizVideoController.prototype.loadNextVideo = function () {
	let nextVideoInfo = this.popNextVideoInfo();
	if (nextVideoInfo) {
		let currentPlayer = this.getCurrentPlayer();
		if (currentPlayer) {
			currentPlayer.checkBufferedTime = false;
		}
		this.readyToBufferNextVideo = false;

		let selectedPlayer = this.getNextPlayer();
		if (nextVideoInfo.startTime != undefined) {
			this.changeToNextPlayer();
			selectedPlayer.loadAndPlayVideo(nextVideoInfo.songInfo.id, nextVideoInfo.playLength, nextVideoInfo.startPoint, nextVideoInfo.firstVideo, nextVideoInfo.startTime, nextVideoInfo.songInfo.videoMap, nextVideoInfo.playbackSpeed, nextVideoInfo.songInfo.videoVolumeMap);
			selectedPlayer.show();
		} else {
			selectedPlayer.loadVideo(nextVideoInfo.songInfo.id, nextVideoInfo.playLength, nextVideoInfo.startPoint, nextVideoInfo.firstVideo, nextVideoInfo.songInfo.videoMap, false, 0, nextVideoInfo.playbackSpeed,  nextVideoInfo.songInfo.videoVolumeMap);
		}
	}
};

QuizVideoController.prototype.playNextVideo = function () {
	let lastPlayer = this.getCurrentPlayer();
	if (lastPlayer) {
		lastPlayer.stopVideo();
		lastPlayer.hide();
	}

	this.changeToNextPlayer();

	//Start Video
	let currentPlayer = this.getCurrentPlayer();
	currentPlayer.hide();
	currentPlayer.playVideo();
};

QuizVideoController.prototype.replayVideo = function () {
	this.getCurrentPlayer().replayVideo();
	this.getCurrentPlayer().show();
};

QuizVideoController.prototype.stopVideo = function () {
	let currentPlayer = this.getCurrentPlayer();
	if (currentPlayer) {
		currentPlayer.stopVideo();
		currentPlayer.hide();
	}
};

QuizVideoController.prototype.muteVideo = function () {
	let currentPlayer = this.getCurrentPlayer();
	if (currentPlayer) {
		currentPlayer.mute();
	}
};

QuizVideoController.prototype.unmuteVideo = function () {
	let currentPlayer = this.getCurrentPlayer();
	if (currentPlayer) {
		currentPlayer.unmute();
	}
};

QuizVideoController.prototype.setVolume = function (newVolume) {
	this.moePlayers.forEach(player => {
		player.setVolume(newVolume);
	});
};

QuizVideoController.prototype.calculateNextPlayerId = function () {
	//Calculate new nextId
	/*	Algorthem, select a random player between all but the last player,
		if the selected player is the currentPlayer select the player after
		it.
		Not completly random, but will always select an unused player
	 */
	this.nextMoePlayerId = Math.floor(Math.random() * (this.moePlayers.length - 1));
	if (this.nextMoePlayerId === this.currentMoePlayerId) {
		this.nextMoePlayerId++;
	}
};

QuizVideoController.prototype.getNextPlayer = function () {
	if (this.nextMoePlayerId < 0) {
		//Bootstrap with a random playerIndex
		this.nextMoePlayerId = Math.floor(Math.random() * (this.moePlayers.length));
	}
	return this.moePlayers[this.nextMoePlayerId];
};

QuizVideoController.prototype.getCurrentPlayer = function () {
	if (this.currentMoePlayerId == undefined) {
		return undefined;
	} else {
		return this.moePlayers[this.currentMoePlayerId];
	}
};

QuizVideoController.prototype.changeToNextPlayer = function () {
	this.currentMoePlayerId = this.nextMoePlayerId;

	this.calculateNextPlayerId();
};

QuizVideoController.prototype.hideAll = function () {
	this.moePlayers.forEach(moePlayer => {
		moePlayer.hide();
	});
};

QuizVideoController.prototype.getCurrentResolution = function () {
	let currentPlayer = this.getCurrentPlayer();
	if (currentPlayer) {
		return currentPlayer.resolution;
	} else {
		return null;
	}
};

QuizVideoController.prototype.getCurrentHost = function () {
	let currentPlayer = this.getCurrentPlayer();
	if (currentPlayer) {
		return currentPlayer.host;
	} else {
		return null;
	}
};

QuizVideoController.prototype.getCurrentSongId = function () {
	let currentPlayer = this.getCurrentPlayer();
	if (currentPlayer) {
		return currentPlayer.songId;
	} else {
		return null;
	}
};

QuizVideoController.prototype.currentVideoPlaying = function() {
	let currentPlayer = this.getCurrentPlayer();
	return currentPlayer != undefined && currentPlayer.isPlaying();

};

QuizVideoController.prototype.nextVideoInfo = function (songInfo, playLength, startPoint, firstVideo, startTime, playbackSpeed) {
	this._nextVideoInfo = {
		songInfo: songInfo,
		playLength: playLength,
		startPoint: startPoint,
		playbackSpeed: playbackSpeed,
		firstVideo: firstVideo,
		startTime: startTime
	};
	if (firstVideo) {
		this.readyToBufferNextVideo = false;
	} else if (this.readyToBufferNextVideo) {
		this.loadNextVideo();
	}
};

QuizVideoController.prototype.popNextVideoInfo = function () {
	let nextVideoInfo = this._nextVideoInfo;
	this._nextVideoInfo = null;
	return nextVideoInfo;
};

QuizVideoController.prototype.currentVideoDoneBuffering = function () {
	this.readyToBufferNextVideo = true;
	this.loadNextVideo();
};

QuizVideoController.prototype.reset = function () {
	this.stopVideo();
	this.nextMoePlayerId = -1;
	this.currentMoePlayerId = null;
	this.readyToBufferNextVideo = false;
};

var quizVideoController = new QuizVideoController();