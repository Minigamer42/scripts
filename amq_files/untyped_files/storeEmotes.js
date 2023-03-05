"use strict";

class StoreEmoteController {
	constructor(emoteGroups, mainContainer, unlockedEmoteIds) {
		this.$collapseButton = $("#swEmoteCollapseButton");

		this.open = false;

		this.collapseButton = new ToggleButton(
			this.$collapseButton,
			this.$collapseButton.find("div"),
			"Open All",
			"Collapse All",
			(active) => {
				this.groups.forEach((storeGroup) => {
					storeGroup.open = !active;
				});
				mainContainer.updateScroll();
			}
		);

		this._topIcon = new StoreTopIcon(
			cdnFormater.newStoreIconSrc(this.TOP_ICON_NAME),
			cdnFormater.newStoreIconSrc(this.TOP_ICON_NAME),
			(selected) => {
				if (selected) {
					this.groups.forEach((storeGroup) => {
						storeGroup.initEmotes();
					});
					mainContainer.displayContent(this.groups);
					this.$collapseButton.removeClass("hide");
					this.triggerLazyLoad();
					this.open = true;
				} else {
					mainContainer.clearSelection();
				}
			}
		);

		mainContainer.addContentChangeListener(
			function () {
				if (this.open) {
					this.$collapseButton.addClass("hide");
					this.open = false;
				}
			}.bind(this)
		);

		this.groups = emoteGroups
			.map((gruopInfo) => new StoreEmoteGroup(gruopInfo, mainContainer, unlockedEmoteIds))
			.sort((a, b) => {
				return a.orderNumber - b.orderNumber;
			});

		this.emoteMap = {};
		this.groups.forEach((group) => {
			group.emotes.forEach((emote) => {
				this.emoteMap[emote.id] = emote;
			});
		});

		this.emoteRegex = this.buildEmoteRegex();
	}

	messageContainEmote(msg) {
		return this.emoteRegex.test(msg);
	}

	buildEmoteRegex() {
		let regexStr = "\\b(";
		this.getAllEmotes().forEach(({ name }) => {
			regexStr += name + "|";
		});
		regexStr = regexStr.replace(/\|$/, ")\\b");
		return new RegExp(regexStr);
	}

	getAllEmotes() {
		let emoteDescriptions = [];
		Object.values(this.emoteMap).forEach(emote => {
			emoteDescriptions.push(emote.description);
		});
		return emoteDescriptions;
	}

	getEmote(emoteId) {
		return this.emoteMap[emoteId].description;
	}

	triggerLazyLoad() {
		let documentHeight = $(document).height();
		this.groups.some((group) => {
			let topOffset = group.offsetTop;
			if (topOffset < 0) {
				return;
			}
			if (topOffset > documentHeight) {
				return true;
			}
			group.loadImages();
		});
	}

	newUnlock(groupName, emoteId) {
		this.groups.find((group) => group.name === groupName).newUnlock(emoteId);
	}

	newLocked(groupName, emoteId) {
		this.groups.find((group) => group.name === groupName).newLocked(emoteId);
	}

	get $topIcon() {
		return this._topIcon.$topIcon;
	}
}

StoreEmoteController.prototype.TOP_ICON_NAME = "emote";

class StoreEmoteGroup {
	constructor(groupInfo, mainContainer, unlockedEmoteIds) {
		this.$group = $(format(this.GROUP_TEMPLATE, groupInfo.name));
		this.$emoteContainer = this.$group.find(".swEmoteGroupContainer");
		this.orderNumber = groupInfo.orderNumber;
		this.name = groupInfo.name;

		this.imagesLoaded = false;
		this.textSizeUpdated = false;
		this._open = true;
		this.emotesLoaded = false;

		this.emotes = groupInfo.emotes.map((emote) => new StoreEmote(emote, unlockedEmoteIds));

		this.$group.find(".swEmoteGroupNameContainer").click(() => {
			this.open = !this.open;
			mainContainer.updateScroll();
		});
	}

	get $content() {
		return this.$group;
	}

	get offsetTop() {
		return this.$group.offset().top;
	}

	get open() {
		return this._open;
	}

	set open(newValue) {
		this._open = newValue;
		if (newValue) {
			this.$group.removeClass("closed");
		} else {
			this.$group.addClass("closed");
		}
	}

	initEmotes() {
		if(!this.emotesLoaded) {
			this.emotes.forEach((storeEmote) => {
				this.$emoteContainer.append(storeEmote.tile.$tile);
			});
			this.emotesLoaded = true;
		}
	}

	loadImages() {
		if (!this.imagesLoaded && this.open) {
			this.imagesLoaded = true;
			this.emotes.forEach((emote) => {
				emote.loadImage();
			});
		}
	}

	updateTextSize() {
		//do nothing, text update when image is loaded
	}

	newUnlock(emoteId) {
		this.emotes.find((emote) => emote.id === emoteId).setUnlocked();
	}

	newLocked(emoteId) {
		this.emotes.find((emote) => emote.id === emoteId).setLocked();
	}
}

StoreEmoteGroup.prototype.GROUP_TEMPLATE = $("#swEmoteGroupTemplate").html();

class StoreEmote {
	constructor(emoteInfo, unlockedEmoteIds) {
		this.id = emoteInfo.emoteId;
		this.tier = emoteInfo.tierId;
		this.name = emoteInfo.name;

		this.unlocked = unlockedEmoteIds.includes(this.id);

		this.src = cdnFormater.newEmoteSrc(this.name);
		this.smallSrc = cdnFormater.newEmoteSmallSrc(this.name);
		this.srcSet = cdnFormater.newEmoteSrcSet(this.name);

		this.tile = new StoreEmoteTile(this);
	}

	loadImage() {
		this.tile.imagePreload.load();
		this.tile.updateTextSize();
	}

	setUnlocked() {
		this.unlocked = true;
		this.tile.addUnlockedClass();
	}

	setLocked() {
		this.unlocked = false;
		this.tile.removeUnlockedClass();
	}

	get description() {
		return {
			emoteId: this.id,
			tier: this.tier,
			name: this.name,
			unlocked: this.unlocked,
			src: this.src,
			smallSrc: this.smallSrc,
			srcSet: this.srcSet,
		};
	}
}
