'use strict';

function ExpandQuestionBox() {
	this.videoExamples;
	this.currentInput;
	this.currentExampleRes;
	this.inputResolution;
	this.submitingUrl = false;

	this.$STATE_CONTAINER = $("#elQuestionInputState");
	this.$STATE_WARNING = $("#elQuestionInputWarning");
	this.$STATE_SPINNER = $("#elQuestionInputSpinner");
	this.$SUBMIT_BUTTON = $("#elQuestionSubmitButton");
	this.$STATE_CONTAINER.popover({
		content: '',
		placement: 'top',
		trigger: 'hover'
	});

	this.$SUBMIT_BUTTON.click(() => {
		expandLibrary.submitAnswer(this.currentInput, this.realResolution);
	});

	this.$HOST_STATUSES = {
		catbox: {
			720: $("#elCatboxStatusContainer > .eLRes720 > .elResStatus"),
			480: $("#elCatboxStatusContainer > .elRes480 > .elResStatus"),
			mp3: $("#elCatboxStatusContainer > .elResMp3 > .elResStatus"),
		},
		openingsmoe: $('#elOpeningsMoeStatusContainer > .elStatusName > .elResStatus')
	};

	this._VERSION_STATES = {
		APPROVED: 1,
		PENDING: 2,
		MISSING: 3,
		BLOCKED: 4
	};

	this.supportedResolutions = ['mp3', 480, 720];

	Object.values(this.$HOST_STATUSES.catbox)
		.forEach(($status) => {
			$status.parent().popover({
				content: '',
				placement: 'top',
				trigger: 'hover',
				container: '#expandLibraryPage'
			});
		});
	this.$HOST_STATUSES.openingsmoe.parent().popover({
		title: 'Openings.moe',
		content: '',
		placement: 'top',
		trigger: 'hover',
		container: '#expandLibraryPage'
	});

	this.$PREVIEW_SOUND_ONLY_TEXT_CONTAINER = $("#elQuestionSoundOnly");
	this.$PREVIEW_VIDEO = $("#elInputVideo");
	this.$INPUT_PREVIEW_VIDEO = $("#elInputPreviewVideo");
	this.$PREVIEW_CONTAINER = $("#elInputVideoPreviewContainer");
	this.$ACTIVE_PREVIEW_TEXT = $("#elSelectedResolution");
	this.$ALL_PREVIEW_SELECTORS = $(".elSelectorOption");
	this.$VIDEO_PREVIEW_SELECTOR = {
		mp3: $("#elSelectorOptionMp3"),
		480: $("#elSelectorOption480"),
		720: $("#elSelectorOption720"),
		preview: $("#elSelectorOptionPreview")
	};
	this.$INPUT_PREVIEW_VIDEO.on('loadedmetadata', () => {
		let resolution = this.$INPUT_PREVIEW_VIDEO[0].videoHeight;
		if (resolution === 0) {
			this.inputResolution = 'mp3';
		} else if (resolution <= 480) {
			this.inputResolution = 480;
		} else if (resolution <= 720) {
			this.inputResolution = 720;
		} else {
			this.inputResolution = resolution;
		}
		this.realResolution = resolution;
		this.updateSubmitButton();
	});

	this.$VIDEO_PREVIEW_SELECTOR.preview.click(() => {
		this.showVideoPreview(undefined, 'preview', true);
	});

	this.$INPUT = $("#elQuestionInput");
	this.$INPUT.on('input', () => {
		let newInput = this.$INPUT.val();
		let trimInput = newInput.trim();
		if (newInput !== trimInput) {
			this.$INPUT.val(trimInput);
		}
		if (this.currentInput !== trimInput) {
			this.inputResolution = null;
			this.realResolution = null;
			this.currentInput = trimInput;
			if (this.getVideoHost(this.currentInput)) {
				this.showVideoPreview(this.currentInput, 'preview');
				this.$VIDEO_PREVIEW_SELECTOR.preview.addClass('active');
				this.$PREVIEW_CONTAINER.removeClass('hide');
			} else {
				this.$VIDEO_PREVIEW_SELECTOR.preview.removeClass('active');
				if (this.currentExampleRes) {
					this.showVideoPreview(this.videoExamples[this.currentExampleRes], this.currentExampleRes, true);
				} else {
					this.$PREVIEW_CONTAINER.addClass('hide');
					this.$INPUT_PREVIEW_VIDEO[0].pause();
				}
			}
			this.updateSubmitButton();
		}
	});

	this.$ANIME_NAME_CONTAINER = $("#elQuestionInputAnimeName");
	this.$ANIME_NAME_LINK = $("#elQuestionInputAnimeName > a");
	this.$SONG_NAME = $("#elQuestionInputSongName");
	this.$ARTIST_NAME = $("#elQuestionInputArtistName");
	this.$SONG_TYPENAME = $("#elQuestionInputNumber");

	this.$SONG_NAME.popover({
		content: '',
		placement: 'top',
		delay: { "show": 150, "hide": 0 },
		trigger: 'hover'
	});
	this.$ARTIST_NAME.popover({
		content: '',
		placement: 'top',
		delay: { "show": 150, "hide": 0 },
		trigger: 'hover'
	});

	let $copyBox = $("#copyBox");
	$("#elQuestionSongCopy").click(() => {
		$copyBox.val(this.$SONG_NAME.text())
			.select();
		document.execCommand("copy");
		$copyBox.val('')
			.blur();
	}).popover({
		content: 'Copy to Clipboard',
		placement: 'top',
		trigger: 'hover'
	});

	$("#elQuestionArtistCopy").click(() => {
		$copyBox.val(this.$ARTIST_NAME.text())
			.select();
		document.execCommand("copy");
		$copyBox.val('')
			.blur();
	}).popover({
		content: 'Copy to Clipboard',
		placement: 'top',
		trigger: 'hover'
	});

	this.$NO_SONG_SELECTED_CONTAINER = $("#elQuestionNoSongSelectedContainer");

	this._ANN_BASE_ENTRY_URL = 'https://www.animenewsnetwork.com/encyclopedia/anime.php?id=';
}

ExpandQuestionBox.prototype.showSong = function (animeId, animeName, songName, songArtist, songTypeName, songUploadStatus, videoExamples) {
	this.reset();
	this.$ANIME_NAME_LINK
		.attr('href', this._ANN_BASE_ENTRY_URL + animeId)
		.text(animeName);
	fitTextToContainer(this.$ANIME_NAME_LINK, this.$ANIME_NAME_CONTAINER, 24, 12);

	this.$ARTIST_NAME.text(songArtist);
	this.$SONG_NAME.text(songName);
	this.$ARTIST_NAME.data('bs.popover').options.content = songArtist;
	this.$SONG_NAME.data('bs.popover').options.content = songName;

	this.$SONG_TYPENAME.text(songTypeName);
	this.setSongSelected(true);
	this.videoExamples = videoExamples;
	this.songUploadStatus = songUploadStatus;
	this.currentExampleRes = null;

	let versionApproved = false;
	let missingResolutionMap = {};
	Object.keys(songUploadStatus.open).forEach(host => {
		let hostResolutionStates = songUploadStatus.open[host];
		Object.keys(hostResolutionStates).forEach(resolution => {
			let status = hostResolutionStates[resolution];
			this.setHostStatus(this.$HOST_STATUSES[host][resolution], status);
			if (status === this._VERSION_STATES.MISSING) {
				missingResolutionMap[resolution] = true;
			} else if (status === this._VERSION_STATES.APPROVED) {
				versionApproved = true;
			}
		});
	});

	Object.keys(songUploadStatus.closed).forEach(host => {
		this.setHostStatus(this.$HOST_STATUSES[host], songUploadStatus.closed[host].status);
		if (songUploadStatus.closed[host].status === this._VERSION_STATES.APPROVED) {
			versionApproved = true;
		}
	});

	if (!versionApproved) {
		Object.keys(songUploadStatus.open).forEach(host => {
			this.songUploadStatus.open[host]['mp3'] = this._VERSION_STATES.BLOCKED;
			this.setHostStatus(this.$HOST_STATUSES[host]['mp3'], this._VERSION_STATES.BLOCKED);
		});
	}

	this.$ALL_PREVIEW_SELECTORS.removeClass('active');
	if (Object.keys(this.videoExamples).length) {
		Object.keys(this.videoExamples).forEach((key) => {
			let url = this.videoExamples[key];
			let $selector = this.$VIDEO_PREVIEW_SELECTOR[key];
			$selector.addClass('active');
			$selector.unbind('click');
			$selector.click(() => {
				this.showVideoPreview(url, key);
			});
		});

		let initResSelected = false;
		let missingResolutionList = Object.keys(missingResolutionMap);

		missingResolutionList.some(resolution => {
			if (this.videoExamples[resolution]) {
				this.showVideoPreview(this.videoExamples[resolution], resolution);
				initResSelected = true;
				return true;
			}
		});

		if (!initResSelected) {
			let firstRes = Object.keys(this.videoExamples)[0];
			this.showVideoPreview(this.videoExamples[firstRes], firstRes);
		}

		this.$PREVIEW_CONTAINER.removeClass('hide');
	} else {
		this.$PREVIEW_CONTAINER.addClass('hide');
	}

	this.updateSubmitButton();
};

ExpandQuestionBox.prototype.setHostStatus = function ($statusEntry, status) {
	let statusClass;
	let statusMessage;
	switch (status) {
		case this._VERSION_STATES.APPROVED:
			statusClass = 'uploaded';
			statusMessage = 'Already Uploaded';
			break;
		case this._VERSION_STATES.PENDING:
			statusClass = 'pending';
			statusMessage = 'Pending Approval';
			break;
		case this._VERSION_STATES.MISSING:
			statusClass = '';
			statusMessage = 'Missing';
			break;
		case this._VERSION_STATES.BLOCKED:
			statusClass = 'blocked';
			statusMessage = 'Video Version must be Approved First';
	}
	$statusEntry.removeClass('uploaded')
		.removeClass('pending')
		.removeClass('blocked')
		.addClass(statusClass)
		.parent().data('bs.popover').options.content = statusMessage;
};

ExpandQuestionBox.prototype.setSongUploadStatusPending = function (host, resolution) {
	if (this.songUploadStatus.open[host]) {
		this.songUploadStatus.open[host][resolution] = this._VERSION_STATES.PENDING;
		this.setHostStatus(this.$HOST_STATUSES[host][resolution], this._VERSION_STATES.PENDING);
	} else {
		this.songUploadStatus.closed[host].resolution = this._VERSION_STATES.PENDING;
		this.setHostStatus(this.$HOST_STATUSES[host], this._VERSION_STATES.PENDING);
	}
};

ExpandQuestionBox.prototype.setSongSelected = function (songSelected) {
	if (songSelected) {
		this.$NO_SONG_SELECTED_CONTAINER.addClass('hide');
	} else {
		this.$NO_SONG_SELECTED_CONTAINER.removeClass('hide');
	}
};

ExpandQuestionBox.prototype.showVideoPreview = function (url, previewType, noLoad) {
	this.$ACTIVE_PREVIEW_TEXT.text(previewType === 'preview' ? 'Preview' : previewType);
	this.$INPUT_PREVIEW_VIDEO[0].pause();
	this.$PREVIEW_VIDEO[0].pause();

	if (!noLoad && this.currentExampleRes !== previewType) {
		if (previewType === 'preview') {
			this.$INPUT_PREVIEW_VIDEO.attr('src', url);
		} else {
			this.$PREVIEW_VIDEO.attr('src', url);
		}
	}

	if (previewType === 'preview') {
		this.$INPUT_PREVIEW_VIDEO.removeClass('hide');
		this.$PREVIEW_VIDEO.addClass('hide');
	} else {
		this.currentExampleRes = previewType;
		this.$PREVIEW_VIDEO.removeClass('hide');
		this.$INPUT_PREVIEW_VIDEO.addClass('hide');
	}

	if (previewType === 'mp3') {
		this.$PREVIEW_SOUND_ONLY_TEXT_CONTAINER.removeClass('hide');
	} else {
		this.$PREVIEW_SOUND_ONLY_TEXT_CONTAINER.addClass('hide');
	}
};

ExpandQuestionBox.prototype.getVideoHost = function (url) {
	if (/^https:\/\/files\.catbox\.moe\/\w+\.(webm|mp3)$/i.test(url)) {
		return 'catbox';
	} else if (/^https:\/\/openings\.moe\/video\/[^/]+\.(webm|mp3)$/i.test(url)) {
		return 'openingsmoe';
	} else {
		return null;
	}
};

ExpandQuestionBox.prototype.isClosedHost = function (host) {
	return host === 'openingsmoe';
};

ExpandQuestionBox.prototype.checkVersionStatus = function (host, resolution, expectedStatus) {
	if (this.songUploadStatus.open[host]) {
		return this.songUploadStatus.open[host][resolution] === expectedStatus;
	} else {
		return this.songUploadStatus.closed[host].status === expectedStatus;
	}
};

ExpandQuestionBox.prototype.updateSubmitButton = function () {
	let message;
	let showSpinner;
	let warning;

	if (this.submitingUrl) {
		message = "Submiting Url";
		showSpinner = true;
	} else if (this.currentInput) {
		let videoHost = this.getVideoHost(this.currentInput);
		if (videoHost) {
			if (this.inputResolution !== null && this.inputResolution !== undefined) {
				if (this.isClosedHost(videoHost) || this.supportedResolutions.includes(this.inputResolution)) {
					if (this.checkVersionStatus(videoHost, this.inputResolution, this._VERSION_STATES.BLOCKED)) {
						warning = true;
						message = 'A video version must be uploaded before mp3';
					} else if (!this.checkVersionStatus(videoHost, this.inputResolution, this._VERSION_STATES.MISSING)) {
						warning = true;
						message = 'Version already uploaded';
					}
				} else {
					warning = true;
					message = 'Unsuported Resolution: ' + this.inputResolution + 'p';
				}
			} else {
				showSpinner = true;
				message = 'Loading resolution';
			}
		} else {
			message = 'Url must be to a valid host and in webm/mp3 format';
		}
	} else {
		message = 'Provide a link to a missing version';
	}

	if (showSpinner) {
		this.$STATE_SPINNER.removeClass('hide');
		this.$STATE_WARNING.addClass('hide');
	} else {
		this.$STATE_SPINNER.addClass('hide');
		this.$STATE_WARNING.removeClass('hide');
	}

	if (warning) {
		this.$STATE_WARNING.addClass('warning');
	} else {
		this.$STATE_WARNING.removeClass('warning');
	}

	if (message) {
		this.$SUBMIT_BUTTON.addClass('disabled');
		this.$STATE_CONTAINER.data('bs.popover').options.content = message;
	} else {
		this.$SUBMIT_BUTTON.removeClass('disabled');
		this.$STATE_SPINNER.addClass('hide');
		this.$STATE_WARNING.addClass('hide');
	}
};

ExpandQuestionBox.prototype.setSubmitting = function (newState) {
	this.submitingUrl = newState;
	this.updateSubmitButton();
};

ExpandQuestionBox.prototype.clearInput = function () {
	this.$INPUT.val("");
	this.$INPUT.trigger('input');
};

ExpandQuestionBox.prototype.reset = function () {
	this.setSongSelected(false);
	this.$INPUT_PREVIEW_VIDEO[0].pause();
	this.$PREVIEW_VIDEO[0].pause();
	this.clearInput();
};
