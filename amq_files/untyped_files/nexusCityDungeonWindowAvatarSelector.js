"use strict";
/* exported NexusCityDungeonWindowAvatarSelector*/

class NexusCityDungeonWindowAvatarSelector {
	constructor(selectionWindow) {
		this.$container = $("#nsdwConfigAvatarSelectionContainer");
		this.$avatarContainer = this.$container.find("#nsdwConfigAvatarSelectionEntryContainer");
		this.$backButton = $("#ncdwBackButton");

		this.selectionWindow = selectionWindow;

		this.avatarsLoaded = false;

		this.availableAvatars = [];
		this.lockedAvatars = [];

		this.$container.perfectScrollbar({
			suppressScrollX: true,
		});

		this.$backButton.click(() => {
			this.hide();
		});

		this.currentSlotNumber;
	}

	get allAvatars() {
		return this.availableAvatars.concat(this.lockedAvatars);
	}

	show(slotNumber) {
		this.$container.removeClass("hide");
		this.$backButton.removeClass("hide");
		this.$container.perfectScrollbar("update");
		this.allAvatars.forEach((avatar) => {
			avatar.updateTextSize();
			avatar.updateLockedState();
		});

		this.currentSlotNumber = slotNumber;
	}

	hide() {
		this.$container.addClass("hide");
		this.$backButton.addClass("hide");
		this.selectionWindow.resetHeaderText();
	}

	loadAvatars() {
		if (!this.avatarsLoaded) {
			storeWindow
				.getAllAvatars()
				.filter((avatar) => !avatar.legacy)
				.forEach((targetAvatar) => {
					let targetArray = targetAvatar.colorUnlocked ? this.availableAvatars : this.lockedAvatars;
					let targetAvatarColor = targetAvatar.colorMap[targetAvatar.defaultColorId].fullDescription;

					let avatarSrc = cdnFormater.newAvatarHeadSrc(
						targetAvatarColor.avatarName,
						targetAvatarColor.outfitName,
						targetAvatarColor.optionName,
						targetAvatarColor.optionActive,
						targetAvatarColor.colorName
					);
					let avatarSrcSet = cdnFormater.newAvatarHeadSrcSet(
						targetAvatarColor.avatarName,
						targetAvatarColor.outfitName,
						targetAvatarColor.optionName,
						targetAvatarColor.optionActive,
						targetAvatarColor.colorName
					);

					targetArray.push(
						new NexusCityDungeonWindowAvatarSelectorEntry(
							targetAvatar,
							targetAvatar.completeName,
							avatarSrc,
							avatarSrcSet,
							this
						)
					);
				});

			this.avatarsLoaded = true;
		}
		this.relayout();
	}

	handleNewAvatarUnlock() {
		if(this.avatarsLoaded) {
			let targetAvatars = this.lockedAvatars.filter(avatar => avatar.storeAvatar.colorUnlocked);
			if(targetAvatars.length) {
				this.lockedAvatars = this.lockedAvatars.filter(avatar => !targetAvatars.includes(avatar));
				this.availableAvatars = this.availableAvatars.concat(targetAvatars);
				this.availableAvatars.sort((a,b) => {
					if(a.characterId === b.characterId) {
						return a.avatarId - b.avatarId;
					} else {
						return a.characterId - b.characterId;
					}
				});
				targetAvatars.forEach(avatar => {
					avatar.updateLockedState();
				});
				this.relayout();
			}
		}
	}

	relayout() {
		this.allAvatars.forEach((avatar) => avatar.detatch());
		this.availableAvatars.forEach((avatar) => {
			this.$avatarContainer.append(avatar.$body);
		});
		this.lockedAvatars.forEach((avatar) => {
			this.$avatarContainer.append(avatar.$body);
		});
	}

	lockCharacter(characterId) {
		this.allAvatars.forEach(avatar => {
			avatar.newCharacterLock(characterId);
		});
	}

	unlockCharacter(characterId) {
		this.allAvatars.forEach(avatar => {
			avatar.removeCharacterLock(characterId);
		});
	}

	resetAvatars() {
		this.allAvatars.forEach(avatar => {
			avatar.updateCharacterLock(false);
		});
	}
}

class NexusCityDungeonWindowAvatarSelectorEntry {
	constructor(storeAvatar, name, imgSrc, imgSrcset, selectorWindow) {
		this.$body = $(format(this.TEMPLATE, name));
		this.$img = this.$body.find(".nsdwConfigAvatarOptionImg");
		this.$nameContainer = this.$body.find(".nsdwConfigAvatarOptionNameContainer");
		this.$name = this.$body.find(".nsdwConfigAvatarOptionName");
		this.storeAvatar = storeAvatar;
		this.selectorWindow = selectorWindow;

		this.characterLocked = false;

		this.shouldAdjustTextSize = name.split(" ").length >= this.WORD_COUNT_FOR_TEXT_ADJUST;

		this.$body.click(() => {
			if(this.pickable) {
				socket.sendCommand({
					type: "nexus",
					command: "dungeon lobby select avatar",
					data: {
						avatarId: storeAvatar.avatarId,
						slot: this.selectorWindow.currentSlotNumber,
					},
				});
			}
		});

		this.imagePreload = new PreloadImage(this.$img, imgSrc, imgSrcset, true, "100px");
	}

	get characterId() {
		return this.storeAvatar.characterId;
	}

	get avatarId() {
		return this.storeAvatar.avatarId;
	}

	get pickable() {
		return this.storeAvatar.colorUnlocked && !this.characterLocked;
	}

	triggerLoad() {
		this.imagePreload.load();
	}

	detatch() {
		this.$body.detach();
	}

	updateTextSize() {
		if (this.shouldAdjustTextSize) {
			fitTextToContainer(this.$name, this.$nameContainer, 22, 12);
			this.shouldAdjustTextSize = false;
		}
	}

	updateLockedState() {
		this.$body.popover("destroy");
		if (!this.pickable) {
			this.$body.addClass("locked");
			let popoverMessage = this.characterLocked ? "Character Already in Party" : "Not Unlocked";
			this.$body.popover({
				content: popoverMessage,
				delay: 50,
				placement: "top",
				trigger: "hover",
				container: "#nexusCityDungeonWindow",
			});
		} else {
			this.$body.removeClass("locked");
		}
	}

	newCharacterLock(characterId) {
		if(this.characterId === characterId) {
			this.updateCharacterLock(true);
		}
	}

	removeCharacterLock(characterId) {
		if(this.characterId === characterId) {
			this.updateCharacterLock(false);
		}
	}

	updateCharacterLock(locked) {
		this.characterLocked = locked;
		this.updateLockedState();
	}
}
NexusCityDungeonWindowAvatarSelectorEntry.prototype.TEMPLATE = $("#nexusAvatarSelectorTemplate").html();
NexusCityDungeonWindowAvatarSelectorEntry.prototype.WORD_COUNT_FOR_TEXT_ADJUST = 3;
