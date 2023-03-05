'use strict';
/*exported EmojiPreviewTab*/

function EmojiPreviewTab() {

	this._MAXIMUM_FILE_SIZE = 256 * 1024;
	this._MAX_EMOJI_NAME_LENGH = 15;
	this._PREVIEW_EMOJI_AMOUNT = 6;

	this._EMOJI_TYPES = {
		STANDARD: 1,
		ANIMATED: 2
	};

	this._EMOJI_SLOTS_FOR_BACKERLEVEL = {
		0: {
			1: 0,
			2: 0
		},
		1: {
			1: 2,
			2: 0
		},
		2: {
			1: 6,
			2: 0
		},
		3: {
			1: 12,
			2: 2
		},
		4: {
			1: 24,
			2: 6
		},
		5: {
			1: 25,
			2: 15
		},
		6: {
			1: 30,
			2: 20
		},
	};

	this._EMOJI_TEMPLATE = $("#emojiTemplate").html();
	this._EMOJI_IMAGE_PREVIEW_TEMPLATE = $("#emojiImagePreviewTemplate").html();

	this.emojiRegex;

	this._backerLevel = 0;
	this._standardEmojis = [];
	this._animatedEmojis = [];

	this.newAvatarListener = new Listener('emoji deleted', (payload) => {
		if (payload.success) {
			this.setEmojiEmpty(payload.emojiId);
			emojiSelector.buildEntries();
			emojiSelector.removeRecentEmoji(payload.emojiId);
			this.buildEmojiRegex();
		} else {
			displayMessage("Error Deleting Emoji");
		}
	}).bindListener();

	this.newAvatarListener = new Listener('emoji approved', (payload) => {
		this._standardEmojis.concat(this._animatedEmojis).some((emojiEntry) => {
			if (emojiEntry.getEmojiId() === payload.emojiId) {
				emojiEntry.updateValidation(true, payload.active);
				emojiSelector.buildEntries();
				emoteSelector.buildEmoteRegex();
				this.buildEmojiRegex();
				return true;
			}
			
		});
	}).bindListener();
}

EmojiPreviewTab.prototype.updateContent = function (emojis, backerLevel) {
	this._$EMOJI_LIST = $("#pmEmojiList");
	this._$EMOJI_LIST_CONTAINER = $("#pmEmojiListContainer");
	this._$INNER_CONTAINER = $("#pmEmojiContainerInner");
	this._$MANAGE_BUTTON = $("#pmEmojiManageButton");
	this._$CLOSE_BUTTON = $("#pmEmojiCloseButton");
	this._$UPLOAD_BUTTON = $("#pmEmojiAddButton");
	this._$USED_EMOJI_SLOT_LIST = $("#pmEmojiUsedSlotsList");
	this._$EMPTY_EMOJI_SLOT_LIST = $("#pmEmojiEmptySlotsList");
	this._$EMOJI_PREVIEW_LIST = $("#pmEmojiPreviewList");

	this._$EMOJI_LIST_CONTAINER.perfectScrollbar({
		suppressScrollX: true
	});

	this.clearEmojis();

	this._backerLevel = backerLevel;
	this._standardEmojis = [];
	this._animatedEmojis = [];

	emojis.forEach(emoji => {
		this.addEmojiEntry(emoji);
	});
	this.addEmptySlots();
	this.updatePreviewEmojis();
	this.buildEmojiRegex();

	this._$EMOJI_LIST_CONTAINER.perfectScrollbar('update');

	this._$MANAGE_BUTTON.click(() => {
		this.open();
	});

	this._$CLOSE_BUTTON.click(() => {
		this.close();
	});

	this._$UPLOAD_BUTTON.click(() => {
		swal({
			title: 'Upload Emoji',
			html: "<b>Slots Left</b><br/>Standard: " + this.getOpenSlotsForType(this._EMOJI_TYPES.STANDARD) + "<br/>Animated: " + this.getOpenSlotsForType(this._EMOJI_TYPES.ANIMATED),
			input: 'file',
			inputAttributes: {
				'accept': 'image/png, image/gif',
				'aria-label': 'Upload your profile picture'
			},
			showCancelButton: true,
			confirmButtonColor: '#204d74',
			confirmButtonText: 'Select File',
			footer: 'Accepted File Formats: png (Standard), gif (Animated). Max Filesize: 256kb'
		}).then(result => {
			if (result.value) {
				let file = result.value;
				if (file.size > this._MAXIMUM_FILE_SIZE) {
					displayMessage('File too big', 'Maximum size: 256kb. Actual Size: ' + Math.ceil(file.size / 1024) + 'kb');
				} else if (file.type === "image/png" && this.getOpenSlotsForType(this._EMOJI_TYPES.STANDARD) <= 0) {
					displayMessage('No Standard Slots Open', 'All standard emoji slots are already in use');
				} else if (file.type === "image/gif" && this.getOpenSlotsForType(this._EMOJI_TYPES.ANIMATED) <= 0) {
					displayMessage('No Animated Slots Open', 'All animated emoji slots are already in use');
				} else {
					let image = new Image();
					let tabObject = this;
					image.onload = function () {
						let img = this;
						swal({
							title: 'Selected Image',
							html: format(tabObject._EMOJI_IMAGE_PREVIEW_TEMPLATE, img.src),
							input: 'text',
							inputPlaceholder: 'Emoji Name',
							inputValidator: (value) => {
								if (!value) {
									return 'You must provide an emoji name';
								} else if (!/^\w+$/.test(value)) {
									return 'Name must only contain letters and numbers';
								} else if (value.length > tabObject._MAX_EMOJI_NAME_LENGH) {
									return 'Name must be at most ' + tabObject._MAX_EMOJI_NAME_LENGH + ' characters';
								}
								return false;
							},
							showCancelButton: true,
							confirmButtonColor: '#204d74',
							confirmButtonText: 'Upload',
						}).then((result) => {
							if (result.value) {
								let formData = new FormData();
								formData.append('emoji', file);
								formData.append('name', result.value);
								return fetch('/uploadEmoji', { method: 'POST', body: formData });
							}
						}).then((result) => {
							if (result.status === 400) {
								displayMessage("Error Uploading", "Server rejected file");
							} else if (result.status === 200) {
								result.json().then((resultJson) => {
									if (resultJson.success) {
										displayMessage("Emoji Uploaded!");
										tabObject.updateEmptyEmoji({
											id: resultJson.emojiId,
											name: resultJson.name,
											type: resultJson.type,
											validated: false,
											active: false
										});
									} else {
										displayMessage("Server Rejected File", resultJson.issue);
									}
								});
							}
						});
					};

					image.src = window.URL.createObjectURL(file);
				}
			}
		});

	});
};

EmojiPreviewTab.prototype.open = function () {
	this._$INNER_CONTAINER.addClass('open');
	setTimeout(() => {
		this._$EMOJI_LIST_CONTAINER.perfectScrollbar('update');
	}, 700);
};

EmojiPreviewTab.prototype.close = function () {
	this._$INNER_CONTAINER.removeClass('open');
};

EmojiPreviewTab.prototype.getOpenSlotsForType = function (type) {
	let list;
	if (type === this._EMOJI_TYPES.STANDARD) {
		list = this._standardEmojis;
	} else {
		list = this._animatedEmojis;
	}
	let inUse = 0;
	list.forEach((emoji) => {
		if (!emoji.empty) {
			inUse++;
		}
	});

	return this._EMOJI_SLOTS_FOR_BACKERLEVEL[this._backerLevel][type] - inUse;
};

EmojiPreviewTab.prototype.addEmojiEntry = function (emoji) {
	let animatedType = emoji.type === this._EMOJI_TYPES.ANIMATED;
	let emojiEntry = new EmojiTabEntry(emoji, animatedType);
	this._$USED_EMOJI_SLOT_LIST.append(emojiEntry.$body);
	if (animatedType) {
		this._animatedEmojis.push(emojiEntry);
	} else {
		this._standardEmojis.push(emojiEntry);
	}
};

EmojiPreviewTab.prototype.addEmptySlots = function () {
	for (let i = this._standardEmojis.length; i < this._EMOJI_SLOTS_FOR_BACKERLEVEL[this._backerLevel][this._EMOJI_TYPES.STANDARD]; i++) {
		let emojiEntry = new EmojiTabEntry(null, false);
		this._$EMPTY_EMOJI_SLOT_LIST.append(emojiEntry.$body);
		this._standardEmojis.push(emojiEntry);
	}
	for (let i = this._animatedEmojis.length; i < this._EMOJI_SLOTS_FOR_BACKERLEVEL[this._backerLevel][this._EMOJI_TYPES.ANIMATED]; i++) {
		let emojiEntry = new EmojiTabEntry(null, true);
		this._$EMPTY_EMOJI_SLOT_LIST.append(emojiEntry.$body);
		this._animatedEmojis.push(emojiEntry);
	}
};

EmojiPreviewTab.prototype.updateEmptyEmoji = function (emoji) {
	let emojiArray;
	if (emoji.type === this._EMOJI_TYPES.STANDARD) {
		emojiArray = this._standardEmojis;
	} else {
		emojiArray = this._animatedEmojis;
	}
	let emptyEntry = emojiArray.find((entry => { return entry.empty; }));
	emptyEntry.remove();
	emptyEntry.updateEmoji(emoji);
	this._$USED_EMOJI_SLOT_LIST.append(emptyEntry.$body);
	this.updatePreviewEmojis();
	emojiSelector.buildEntries();
	this.buildEmojiRegex();
};

EmojiPreviewTab.prototype.setEmojiEmpty = function (emojiId) {
	let entry = this._standardEmojis.concat(this._animatedEmojis).find((entry) => { return entry.getEmojiId() === emojiId; });
	entry.remove();
	entry.updateEmoji(null);
	if (entry.isAnimated) {
		if(this._animatedEmojis.length <= this._EMOJI_SLOTS_FOR_BACKERLEVEL[this._backerLevel][this._EMOJI_TYPES.ANIMATED]) {
			this._$EMPTY_EMOJI_SLOT_LIST.append(entry.$body);
		} else {
			let index = this._animatedEmojis.findIndex(emojiEntry => {return emojiEntry.getEmojiId() === entry.getEmojiId();});
			this._animatedEmojis.splice(index, 1);
		}
	} else {
		if(this._standardEmojis.length <= this._EMOJI_SLOTS_FOR_BACKERLEVEL[this._backerLevel][this._EMOJI_TYPES.STANDARD]) {
			this._$EMPTY_EMOJI_SLOT_LIST.prepend(entry.$body);
		} else {
			let index = this._standardEmojis.findIndex(emojiEntry => {return emojiEntry.getEmojiId() === entry.getEmojiId();});
			this._standardEmojis.splice(index, 1);
		}
	}
	this.updatePreviewEmojis();
	this.buildEmojiRegex();
};

EmojiPreviewTab.prototype.updatePreviewEmojis = function () {
	let selected = 0;
	this._$EMOJI_PREVIEW_LIST.html('');
	this._standardEmojis.concat(this._animatedEmojis).some((emojiEntry) => {
		if (!emojiEntry.empty) {
			this._$EMOJI_PREVIEW_LIST.append(format(this._EMOJI_TEMPLATE, getCustomEmojiPath(emojiEntry.getEmojiId()), ''));
			selected++;
		}
		return selected === this._PREVIEW_EMOJI_AMOUNT;
	});

	if (selected === 0) {
		this._$EMOJI_PREVIEW_LIST.html('<span class="pmEmojiEmpty">Empty</span>');
	}
};

EmojiPreviewTab.prototype.getEmojiDescriptoins = function () {
	let emojiDescriptions = [];
	this._standardEmojis.concat(this._animatedEmojis).forEach((emojiEntry) => {
		if (!emojiEntry.empty) {
			emojiDescriptions.push(emojiEntry.getEmojiDescription());
		}
	});
	return emojiDescriptions;
};

EmojiPreviewTab.prototype.getEmojiDescription = function (emojiId) {
	return this._standardEmojis.concat(this._animatedEmojis).find(emote => emote.getEmojiId() === emojiId).getEmojiDescription();
};

EmojiPreviewTab.prototype.clearEmojis = function () {
	this._standardEmojis.concat(this._animatedEmojis).forEach(emojiEntry => {
		emojiEntry.remove();
	});
};

EmojiPreviewTab.prototype.buildEmojiRegex = function() {
	let regexStr = '\\b(';
	let gotActive = false;
	this.getEmojiDescriptoins().forEach(({name, active}) => {
		if(active) {
			regexStr += name + '|';
			gotActive = true;
		}
	});
	if(gotActive) {
		regexStr = regexStr.replace(/\|$/, ')\\b');
		this.emojiRegex = new RegExp(regexStr);
	} else {
		this.emojiRegex = null;
	}
};

function EmojiTabEntry(emoji, isAnimated) {
	this._EMPTY_EMOJI_PREVIEW_TEMPLATE = $("#pmEmptyEmojiPreviewTemplate").html();
	this._EMOJI_PREVIEW_TEMPLATE = $("#pmEemojiPreviewTemplate").html();

	this._emoji = emoji;
	this.enabled = false;
	this.empty = false;
	this.isAnimated = isAnimated;

	this.updateBody();
}

EmojiTabEntry.prototype.updateBody = function () {
	if (this._emoji) {
		this.$body = $(format(this._EMOJI_PREVIEW_TEMPLATE, getCustomEmojiPath(this._emoji.id), this._emoji.name));

		this.$body.find('.pmEmojiDelete').popover({
			content: 'Delete',
			delay: 50,
			placement: 'top',
			trigger: 'hover',
			container: '#pmEmojiContainerInner'
		});

		this.$body.find('.pmEmojiDelete').click(() => {
			socket.sendCommand({
				type: "patreon",
				command: "delete emoji",
				data: {
					emojiId: this.getEmojiId()
				}
			});
		});

		this.$body.find('.pmEmojiPreviewName').popover({
			content: this._emoji.name,
			delay: 50,
			placement: 'top',
			trigger: 'hover',
			container: '#pmEmojiContainerInner'
		});
		this.empty = false;
		this.updateState();
	} else {
		this.$body = $(format(this._EMPTY_EMOJI_PREVIEW_TEMPLATE));
		this.empty = true;
		if (this.isAnimated) {
			this.$body.find('.pmEmojiNoIcon')
				.removeClass('fa-square-o')
				.addClass('fa-circle-o-notch')
				.addClass('fa-spin');
		}
	}
};

EmojiTabEntry.prototype.updateState = function () {
	let color;
	let message;
	let symbol;
	if (!this._emoji.validated) {
		color = '#4497ea';
		message = 'Waiting Approval';
		symbol = 'W';
	} else if (this._emoji.active) {
		color = '#5cb85c';
		message = 'Active';
		symbol = 'A';
		this.enabled = true;
	} else {
		color = '#ac2925';
		message = 'Disabled';
		symbol = 'D';
	}
	this.$body.find('.pmEmojiState')
		.css('color', color)
		.text(symbol)
		.popover({
			content: message,
			delay: 50,
			placement: 'top',
			trigger: 'hover',
			container: '#pmEmojiContainerInner'
		});
};

EmojiTabEntry.prototype.getEmojiId = function () {
	return this._emoji == null ? null : this._emoji.id;
};

EmojiTabEntry.prototype.updateEmoji = function (newEmoji) {
	this._emoji = newEmoji;
	this.updateBody();
};

EmojiTabEntry.prototype.remove = function () {
	this.$body.find('.pmEmojiDelete').popover('hide');
	this.$body.find('.pmEmojiPreviewName').popover('hide');
	this.$body.remove();
};

EmojiTabEntry.prototype.updateValidation = function (validated, active) {
	this._emoji.validated = validated;
	this._emoji.active = active;
	this.updateState();
};

EmojiTabEntry.prototype.getEmojiDescription = function () {
	return this._emoji;
};