"use strict";
/*exported NexusCityDungeonSetupTab*/

class NexusCityDungeonSetupTab extends NexusCityWindowTab {
	constructor(window) {
		super(
			window,
			window.$window.find("#ncdwLeftDungeonSelectContainer"),
			window.$window.find("#ncdwRightDungeonSetupContainer"),
			window.$window.find("#ncdwSetuprTab")
		);

		this.$startButton = this.$rightContainer.find("#nsdwStartButton");
		this.$ratingContainer = this.$rightContainer.find("#nsdwConfigCategoryRatingContainer");
		this.$loadTeamButton = this.$leftContainer.find("#ncdwPartySetupLoadTeamButton");
		this.$lobbyIdContainer = this.$leftContainer.find("#ncdwPartySetupLobbyId");
		this.$lobbyIdText = this.$leftContainer.find("#ncdwPartySetupLobbyIdText");
		this.$hideIdButton = this.$leftContainer.find("#ncdwPartySetupLobbyIdHideButton");
		this.$showIdButton = this.$leftContainer.find("#ncdwPartySetupLobbyIdShowButton");
		this.$ratingRow = this.$rightContainer.find("#nsdwConfigCategoryRatingContainerOuter");
		this.$floorRow = this.$rightContainer.find("#nsdwConfigCategoryFloorContainer");

		this.inLobby = false;
		this.coopLobby = false;

		this.floorSelector = new NexusFloorSelector(this.handleSettingsUpdated.bind(this));

		this.slotMap = {
			1: new NexusCityDungeonSetupTabAvatarSlot(
				1,
				this.$leftContainer.find("#ncdwPartySlotOne"),
				(slot) => {
					window.displayAvatarSelection(slot.number, slot.avatarSelected);
				},
				(badgeEntry) => {
					window.displayBadgeSelection(badgeEntry.slotId, badgeEntry.gotBadge);
				}
			),
			2: new NexusCityDungeonSetupTabAvatarSlot(
				2,
				this.$leftContainer.find("#ncdwPartySlotTwo"),
				(slot) => {
					window.displayAvatarSelection(slot.number, slot.avatarSelected);
				},
				(badgeEntry) => {
					window.displayBadgeSelection(badgeEntry.slotId, badgeEntry.gotBadge);
				}
			),
			3: new NexusCityDungeonSetupTabAvatarSlot(
				3,
				this.$leftContainer.find("#ncdwPartySlotThree"),
				(slot) => {
					window.displayAvatarSelection(slot.number, slot.avatarSelected);
				},
				(badgeEntry) => {
					window.displayBadgeSelection(badgeEntry.slotId, badgeEntry.gotBadge);
				}
			),
			4: new NexusCityDungeonSetupTabAvatarSlot(
				4,
				this.$leftContainer.find("#ncdwPartySlotFour"),
				(slot) => {
					window.displayAvatarSelection(slot.number, slot.avatarSelected);
				},
				(badgeEntry) => {
					window.displayBadgeSelection(badgeEntry.slotId, badgeEntry.gotBadge);
				}
			),
		};

		this.avatarSelector = new NexusCityDungeonWindowAvatarSelector(this);

		this.doingReset = true;

		this.starRating = new NexusCityDungeonSetupTabRatingDisplay();

		this.typeButtonSet = new NexusCityDungeonSetupTabTypeButtonSet(() => {
			this.handleSettingsUpdated();
		});

		this.diffButtonSet = new NexusCityDungeonSetupTabDiffButtonSet(() => {
			this.handleSettingsUpdated();
		});

		this.selectionButtonSet = new NexusCityDungeonSetupTabAvatarSelectionButtonSet(() => {
			this.handleSettingsUpdated();
		});

		this.$loadTeamButton.click(() => {
			if (window.teamSelectionTab.currentTeamCount === 0) {
				displayMessage("No Teams Saved", "Teams can be setup at the inn, and quickly loaded here.");
			} else {
				window.changeToTeamSelectionView();
			}
		});

		this.$hideIdButton.click(() => {
			this.$lobbyIdContainer.addClass("hideId");
		});

		this.$showIdButton.click(() => {
			this.$lobbyIdContainer.removeClass("hideId");
		});

		this.doingReset = false;

		this.handleSettingsUpdated();

		this.$ratingContainer.popover({
			title: "Difficulty Rating",
			content:
				"Difficulty of the quiz questions. The higher the rating, the more xp and better runes are rewarded in the dungeon.",
			delay: 50,
			placement: "top",
			trigger: "hover",
			container: "#nexusCityDungeonWindow",
		});

		this.$startButton.click(() => {
			if (this.viableSettings) {
				socket.sendCommand({
					type: "nexus",
					command: "start dungeon lobby",
					data: this.settingDescription,
				});
			} else if (!this.typeButtonSet.viable) {
				displayMessage("At Least One Song Type Must be Selected");
			} else if (!this.diffButtonSet.viable) {
				displayMessage("At Least One Difficulty Must be Selected");
			} else if (!this.selectionButtonSet.viable) {
				displayMessage("At Least One Song Selection Option Must be Selected");
			} else if (!this.allSlotsInUse) {
				displayMessage("An Avatar Must be Selected for Each Slot");
			}
		});

		this.targetType;

		this._nexusDungeonFinishedListener = new Listener("nexus dungeon finished", (payload) => {
			payload.newLevelInfo.forEach(({ slot, level, soloProgress, coopProgress }) => {
				this.slotMap[slot].updateLevel(level);
				this.slotMap[slot].updateProgress(soloProgress, coopProgress);
			});
			this.inLobby = true;
		});
		this._nexusDungeonFinishedListener.bindListener();

		this._nexusUpdateLobbyPlayerSlotsListener = new Listener("nexus update lobby player slots", (payload) => {
			payload.clearPlayerSlots.forEach((slotId) => {
				this.slotMap[slotId].reset();
			});
			payload.newPlayerSlots.forEach(({ slotId, playerInfo }) => {
				this.slotMap[slotId].playerSlot.displayPlayer(playerInfo);
			});
		});
		this._nexusUpdateLobbyPlayerSlotsListener.bindListener();

		this._nexusLobbyHostChangeListener = new Listener("nexus lobby host change", (payload) => {
			let { newHost, oldHost } = payload;
			if (newHost === selfName) {
				this.enableSettings();
			} else if (oldHost === selfName) {
				this.disableSettings();
			}
		});
		this._nexusLobbyHostChangeListener.bindListener();

		this._nexusPlayerLeaveListener = new Listener("nexus player leave", (payload) => {
			if (payload.newHost === selfName) {
				this.enableSettings();
			}
		});
		this._nexusPlayerLeaveListener.bindListener();

		this._nexusLobbySettingUpdateListener = new Listener("nexus lobby settings update", (payload) => {
			this.updateSettings(payload);
		});
		this._nexusLobbySettingUpdateListener.bindListener();

		this._mapInitListener = new Listener("nexus map init", () => {
			this.inLobby = false;
		});
		this._mapInitListener.bindListener();

		this._nexusMapStateListener = new Listener("nexus map state", () => {
			this.inLobby = false;
		});
		this._nexusMapStateListener.bindListener();

		this._updatedFloorProgress = new Listener("updated floor progress", (payload) => {
			this.updateFloorProgress(payload.floorProgress);
		});
		this._updatedFloorProgress.bindListener();
	}

	get allSlotsInUse() {
		return !Object.values(this.slotMap).some((slot) => !slot.avatarSelected);
	}

	get allSlots() {
		return Object.values(this.slotMap);
	}

	get viableSettings() {
		return (
			this.typeButtonSet.viable && this.diffButtonSet.viable && this.selectionButtonSet.viable && this.allSlotsInUse
		);
	}

	get settingDescription() {
		return {
			settings: {
				songTypes: this.typeButtonSet.state,
				difficulties: this.diffButtonSet.state,
				songSelection: this.selectionButtonSet.state,
			},
			floor: this.floorSelector.floor,
		};
	}

	show(noChangeHighlightTab) {
		super.show(noChangeHighlightTab);
		this.updatePlayerNameSizes();
		if(!tutorial.state.nexusDungeonLobby) {
			nexusTutorialController.startDungeonLobbyTutorial(
				this.slotMap[1].$slot,
				this.$rightContainer,
				this.$ratingRow,
				this.$floorRow
			);
		}
	}

	updatePlayerNameSizes() {
		this.allSlots.forEach((slot) => {
			slot.updatePlayerNameSize();
		});
	}

	updateSettings({ settings: { songTypes, difficulties, songSelection }, floor }) {
		this.typeButtonSet.updateState(songTypes);
		this.diffButtonSet.updateState(difficulties);
		this.selectionButtonSet.updateState(songSelection);
		this.floorSelector.floor = floor;
		this.starRating.updateRating(this.calculateCurrentRating());
	}

	setupLayout(lobbyId, slotsInfo) {
		if (lobbyId) {
			this.$loadTeamButton.addClass("hide");
			this.$lobbyIdContainer.removeClass("hide");
			this.$lobbyIdText.text(lobbyId);
			this.coopLobby = true;
		} else {
			this.$loadTeamButton.removeClass("hide");
			this.$lobbyIdContainer.addClass("hide");
			this.coopLobby = false;
		}

		if (slotsInfo) {
			slotsInfo.forEach(({ slotId, player, avatar, badge}) => {
				if (player) {
					this.slotMap[slotId].playerSlot.displayPlayer(player);
				}
				if (avatar) {
					let storeAvatar = storeWindow.getAvatarFromAvatarId(avatar.avatarId);
					let avatarDescription = {
						name: storeAvatar.completeName,
						abilityInfo: avatar.abilityInfo,
						genreInfo: avatar.genreInfo,
						baseStats: avatar.baseStats,
						runeInfo: avatar.runeInfo,
					};
					this.slotMap[slotId].displayAvatar(avatar, avatarDescription);
				}
				if(badge){
					this.slotMap[slotId].displayBadge(badge);
				}
			});
		}

		this.inLobby = true;

		this.allSlots.forEach((slot) => {
			slot.setDisplayPlayer(lobbyId != undefined);
		});
	}

	reset() {
		Object.values(this.slotMap).forEach((slot) => {
			slot.reset();
		});
		this.avatarSelector.resetAvatars();
		this.enableSettings();
		this.inLobby = false;
		this.inCoopLobby = false;
	}

	disableSettings() {
		this.typeButtonSet.disable();
		this.diffButtonSet.disable();
		this.selectionButtonSet.disable();
		this.floorSelector.disable();
		this.$startButton.addClass("disabled");
	}

	enableSettings() {
		this.typeButtonSet.enable();
		this.diffButtonSet.enable();
		this.selectionButtonSet.enable();
		this.floorSelector.enable();
		this.$startButton.removeClass("disabled");
	}

	handleSettingsUpdated() {
		if (!this.doingReset) {
			this.starRating.updateRating(this.calculateCurrentRating());
			this.sendSettingUpdate();
			this.floorSelector.updateDungeonRating(this.calculateCurrentRating());
		}
	}

	calculateCurrentRating() {
		return this.typeButtonSet.rating + this.diffButtonSet.rating + this.selectionButtonSet.rating;
	}

	avatarChange(clearTileSlots, newAvatarSlots) {
		let removedCharacterIds = [];
		let newCharacterIds = [];
		clearTileSlots.forEach((slot) => {
			let characterId = this.slotMap[slot].characterId;
			this.slotMap[slot].reset(true);
			if (characterId) {
				removedCharacterIds.push(characterId);
			}
		});

		newAvatarSlots.forEach(({ avatarInfo, slot }) => {
			this.slotMap[slot].displayAvatar(avatarInfo);
			newCharacterIds.push(this.slotMap[slot].characterId);
		});

		return { removedCharacterIds, newCharacterIds };
	}

	badgeChange(clearBadgeSlots, newBadgeSlots) {
		clearBadgeSlots.forEach((slot) => {
			this.slotMap[slot].removeBadge();
		});

		newBadgeSlots.forEach(({ badgeInfo, slot }) => {
			this.slotMap[slot].displayBadge(badgeInfo);
		});
	}

	sendSettingUpdate() {
		if (nexusCoopChat.hostName === selfName) {
			socket.sendCommand({
				type: "nexus",
				command: "nexus update lobby settings",
				data: this.settingDescription,
			});
		}
	}

	updateFloorProgress(floorProgress) {
		this.floorSelector.updateFloorProgress(floorProgress);
	}
}

class NexusCityDungeonSetupTabAvatarSlot {
	constructor(number, $slot, clickHandler, badgeClickHandler) {
		this.$slot = $slot;
		this.$avatarImg = this.$slot.find(".ncdwPartySlotImage");
		this.$slotText = this.$slot.find(".ncdwPartySlotText");
		this.$slotSideText = this.$slot.find(".ncdwPartySlotSideNumberText");
		this.$slotLevelText = this.$slot.find(".ncdwPartySlotSideLevelText");
		this.$slotLevelTextNumber = this.$slot.find(".ncdwPartySlotSideLevelTextNumber");
		this.$playerSlot = this.$slot.find(".ncdwPartySlotPlayerContainer");
		this.$playerName = this.$slot.find(".ncdwPartySlotPlayerName");
		this.$progressContainer = this.$slot.find(".ncdwPartySlotProgressContainer");
		this.number = number;

		this.coopGame = false;

		this.characterId = null;
		this.avatarSelected = false;

		this.playerSlot = new NexusCityDungeonSetupTabAvatarPlayerSlot(this.$playerSlot, this.$playerName, number);
		this.badgeSlot = new NexusCityDungeonSetupTabAvatarBadgeSlot(
			this.$slot.find(".ncdwPartySlotBadgeContainer"),
			number,
			badgeClickHandler
		);

		this.graceHover;
		this.preloadImage;

		this.$slot.click(() => {
			clickHandler(this);
			if (this.coopGame && !this.playerSlot.claimedBySelf) {
				this.playerSlot.claimSlot();
			}
		});
	}

	updatePlayerNameSize() {
		this.playerSlot.updatePlayerNameSize();
	}

	setDisplayPlayer(displayPlayer) {
		this.coopGame = displayPlayer;
		if (displayPlayer) {
			this.playerSlot.show();
		} else {
			this.playerSlot.hide();
		}
	}

	updateLevel(level) {
		this.$slotLevelTextNumber.text(level);
	}

	displayAvatar({
		avatarId,
		colorId,
		backgroundAvatarId,
		backgroundColorId,
		level,
		baseStats,
		runeInfo,
		genreInfo,
		abilityInfo,
		soloProgress,
		coopProgress,
		optionActive,
	}) {
		let targetAvatar = storeWindow.getAvatarFromAvatarId(avatarId);
		let targetAvatarColor = targetAvatar.colorMap[colorId];
		if (this.preloadImage) {
			this.preloadImage.cancel();
		}

		let {src, srcSet} = targetAvatarColor.getAvatarBaseSrcInfo(optionActive);

		this.preloadImage = new PreloadImage(
			this.$avatarImg,
			src,
			srcSet,
			true,
			"250px"
		);
		this.$avatarImg.removeClass("sizeMod0 sizeMod20 sizeMod51").addClass(targetAvatarColor.sizeModifierClass);

		let avatarBackgroundColor = storeWindow.getAvatarFromAvatarId(backgroundAvatarId).colorMap[backgroundColorId];
		this.$slot.css(
			"background-image",
			`url(${cdnFormater.newAvatarBackgroundSrc(
				avatarBackgroundColor.backgroundVert,
				cdnFormater.BACKGROUND_ROOM_BROWSER_SIZE
			)})`
		);

		this.updateLevel(level);

		this.$slotText.addClass("hide");
		this.$slotLevelText.removeClass("hide");
		this.$slotSideText.removeClass("hide");
		this.$avatarImg.removeClass("hide");

		this.characterId = targetAvatar.characterId;
		this.avatarSelected = true;

		if (this.graceHover) {
			this.graceHover.destroy();
		}
		let { avatarName, outfitName, colorName, optionName} = targetAvatarColor.fullDescription;
		let headSrc = cdnFormater.newAvatarHeadSrc(avatarName, outfitName, optionName, optionActive, colorName);
		let headSrcSet = cdnFormater.newAvatarHeadSrcSet(avatarName, outfitName, optionName, optionActive, colorName);

		this.graceHover = new GraceHoverHandler(
			this.$slot,
			250,
			50,
			() => {
				let popoverInfo = {
					name: targetAvatar.completeName,
					baseStats,
					runeInfo,
					genreInfo,
					abilityInfo,
				};
				nexusAvatarPopover.displayAvatar(popoverInfo, headSrc, headSrcSet, this.$slot, this.number);
			},
			() => {
				nexusAvatarPopover.hide(this.number);
			}
		);

		this.updateProgress(soloProgress, coopProgress);
		this.badgeSlot.show();
	}

	updateProgress(soloProgress, coopProgress) {
		this.$progressContainer.html("");

		let displaySolo = soloProgress != null;
		let displayCoop =
			coopProgress &&
			(!displaySolo || this.calculateProgressValue(coopProgress) > this.calculateProgressValue(soloProgress));

		if (displaySolo) {
			let $soloRow = $(format(this.PROGRESS_ROW, soloProgress.rating / 2, soloProgress.floor));
			if (displayCoop) {
				$soloRow.find(".fa-user").removeClass("hide");
			}
			this.$progressContainer.append($soloRow);
		}
		if (displayCoop) {
			let $coopRow = $(format(this.PROGRESS_ROW, coopProgress.rating / 2, coopProgress.floor));
			$coopRow.find(".fa-users").removeClass("hide");
			this.$progressContainer.append($coopRow);
		}
	}

	reset(keepPlayer) {
		if (this.preloadImage) {
			this.preloadImage.cancel();
		}
		if (this.graceHover) {
			this.graceHover.destroy();
			this.graceHover = null;
		}
		this.$avatarImg.addClass("hide");
		this.$slotSideText.addClass("hide");
		this.$slotLevelText.addClass("hide");
		this.$slotText.removeClass("hide");
		this.$slot.css("background-image", "");
		this.$progressContainer.html("");

		this.badgeSlot.hide();
		this.badgeSlot.displayEmpty();

		this.characterId = null;
		this.avatarSelected = false;
		if (!keepPlayer) {
			this.playerSlot.reset();
		}
	}

	displayBadge(badgeInfo) {
		this.badgeSlot.displayBadge(badgeInfo);
	}

	removeBadge() {
		this.badgeSlot.displayEmpty();
	}

	calculateProgressValue({ rating, floor }) {
		return rating * 5 + floor;
	}
}
NexusCityDungeonSetupTabAvatarSlot.prototype.PROGRESS_ROW =
	'<div class="ncdwPartySlotProgressRow"><i class="fa fa-users hide" aria-hidden="true"></i><i class="fa fa-user hide" aria-hidden="true"></i><i class="fa fa-star" aria-hidden="true"></i>{0}<img class="ncdwPartySlotProgressFloorIcon" src="https://cdn.animemusicquiz.com/v1/ui/nexus/tile-icons/50px/entrance.webp">{1}</div>';

class NexusCityDungeonSetupTabAvatarPlayerSlot {
	constructor($container, $name, slotId) {
		this.$container = $container;
		this.$name = $name;
		this.$nameTextContainer = $name.find(".ncdwPartySlotPlayerNameInner");
		this.$img = this.$container.find(".ncdwPartySlotPlayerImg");
		this.$emptyText = this.$container.find(".ncdwPartySlotPlayerText");

		this.slotId = slotId;

		this.imagePreload = null;
		this.gotPlayer = false;

		this.currentPlayerName;

		this.$container.click((event) => {
			this.claimSlot();
			event.stopPropagation();
		});
	}

	get claimedBySelf() {
		return this.currentPlayerName === selfName;
	}

	claimSlot() {
		socket.sendCommand({
			type: "nexus",
			command: "dungeon player claim slot",
			data: {
				slotId: this.slotId,
			},
		});
	}

	hide() {
		this.$container.addClass("hide");
		this.$name.addClass("hide");
	}

	show() {
		this.$container.removeClass("hide");
		this.$name.removeClass("hide");
		this.$emptyText.removeClass("hide");
	}

	displayPlayer({
		name,
		icon: {
			emoteId,
			avatarInfo: {
				avatar: { avatarName, outfitName, colorName, optionName, optionActive },
			},
		},
	}) {
		this.$nameTextContainer.text(name);
		this.currentPlayerName = name;

		let src, srcSet;
		if (emoteId) {
			let emote = storeWindow.getEmote(emoteId);
			src = emote.src;
			srcSet = emote.srcSet;
		} else {
			src = cdnFormater.newAvatarHeadSrc(avatarName, outfitName, optionName, optionActive, colorName);
			srcSet = cdnFormater.newAvatarHeadSrcSet(avatarName, outfitName, optionName, optionActive, colorName);
		}

		if (this.imagePreload) {
			this.imagePreload.cancel();
		}
		this.imagePreload = new PreloadImage(this.$img, src, srcSet, true, "50px");
		this.$emptyText.addClass("hide");
		
		this.gotPlayer = true;
		this.updatePlayerNameSize();
	}

	updatePlayerNameSize() {
		if(this.gotPlayer) {
			fitTextToContainer(this.$nameTextContainer, this.$name, 24, 8);
		}
	}

	clearPlayer() {
		this.gotPlayer = false;
		this.$nameTextContainer.text("");
		this.$img.attr("src", "");
		this.$img.attr("srcset", "");
		this.$emptyText.removeClass("hide");
		this.currentPlayerName = null;
	}

	reset() {
		this.clearPlayer();
	}
}

class NexusCityDungeonSetupTabAvatarBadgeSlot {
	constructor($badgeContainer, slotId, clickHandler) {
		this.$badgeContainer = $badgeContainer;
		this.slotId = slotId;

		this.currentBadge = null;
		this.graceHover = null;

		this.emptyBadge = new NexusBadgeEmpty(100, ["clickAble"], "Select an avatar badge to power up the avatar", "#nexusCityDungeonWindow");

		this.displayEmpty();

		this.$badgeContainer.click((event) => {
			clickHandler(this);
			event.stopPropagation();
		});

		this.$badgeContainer.on( "mouseenter", (event) => {
			nexusAvatarPopover.hide();
			event.stopPropagation();
		});
		this.$badgeContainer.on( "mousemove", (event) => {
			event.stopPropagation();
		});
	}

	get gotBadge() {
		return this.currentBadge != null;
	}

	show() {
		this.$badgeContainer.removeClass("hide");
	}

	hide() {
		this.$badgeContainer.addClass("hide");
	}

	displayBadge(badgeInfo) {
		this.clearBadge();
		this.currentBadge = new NexusBadge(badgeInfo.level, badgeInfo, 100, ["clickAble"]);
		this.$badgeContainer.append(this.currentBadge.$body);
		
		this.graceHover = new GraceHoverHandler(
			this.currentBadge.$body,
			150,
			50,
			() => {
				nexusBadgePopover.displayBadge(badgeInfo, this.$badgeContainer, badgeInfo.avatarId);
			},
			() => {
				nexusBadgePopover.hide(badgeInfo.avatarId);
			}
		);
	}

	displayEmpty() {
		this.clearBadge();
		this.$badgeContainer.append(this.emptyBadge.$body);
	}

	clearBadge() {
		this.emptyBadge.detatch();
		this.$badgeContainer.html("");
		this.currentBadge = null;
		if(this.graceHover) {
			this.graceHover.destroy();
			this.graceHover = null;
		}
	}

	reset() {
		this.clearBadge();
		this.hide();
	}
}

class NexusCityDungeonSetupTabBaseButtonSet {
	constructor(buttonInfoList, updateRatingCallback) {
		this.buttons = buttonInfoList.map((info) => new NexusCityDungeonSetupTabConfigButton(info, updateRatingCallback));
	}

	get state() {
		throw new Error("Should be overriden");
	}

	get rating() {
		throw new Error("Should be overriden");
	}

	get selectedCount() {
		return this.buttons.filter((button) => button.selected).length;
	}

	get viable() {
		return this.buttons.some((button) => button.selected);
	}

	reset() {
		this.buttons.forEach((button) => button.reset());
	}

	disable() {
		this.buttons.forEach((button) => button.disable());
	}

	enable() {
		this.buttons.forEach((button) => button.enable());
	}
}

class NexusCityDungeonSetupTabConfigButton {
	constructor({ $element, defaultSelected }, updateRatingCallback) {
		this.$element = $element;
		this.defaultSelected = defaultSelected;
		this.updateRatingCallback = updateRatingCallback;
		this.selected = defaultSelected;

		this.$element.click(() => {
			this.selected = !this.selected;
		});
	}

	set selected(newValue) {
		this._selected = newValue;
		if (newValue) {
			this.$element.addClass("selected");
		} else {
			this.$element.removeClass("selected");
		}
		this.updateRatingCallback();
	}

	get selected() {
		return this._selected;
	}

	reset() {
		this.selected = this.defaultSelected;
	}

	disable() {
		this.$element.addClass("disabled");
	}

	enable() {
		this.$element.removeClass("disabled");
	}
}

class NexusCityDungeonSetupTabTypeButtonSet extends NexusCityDungeonSetupTabBaseButtonSet {
	constructor(updateRatingCallback) {
		super(
			[
				{
					$element: $("#nsdwConfigTypeOpButton"),
					defaultSelected: true,
				},
				{
					$element: $("#nsdwConfigTypeEndButton"),
					defaultSelected: true,
				},
				{
					$element: $("#nsdwConfigTypeInsButton"),
					defaultSelected: false,
				},
			],
			updateRatingCallback
		);
	}

	get state() {
		return {
			openings: this.buttons[0].selected,
			endings: this.buttons[1].selected,
			inserts: this.buttons[2].selected,
		};
	}

	get rating() {
		return this.selectedCount;
	}

	updateState({ openings, endings, inserts }) {
		this.buttons[0].selected = openings;
		this.buttons[1].selected = endings;
		this.buttons[2].selected = inserts;
	}
}

class NexusCityDungeonSetupTabDiffButtonSet extends NexusCityDungeonSetupTabBaseButtonSet {
	constructor(updateRatingCallback) {
		super(
			[
				{
					$element: $("#nsdwConfigTypeEasyButton"),
					defaultSelected: true,
				},
				{
					$element: $("#nsdwConfigTypeMedButton"),
					defaultSelected: true,
				},
				{
					$element: $("#nsdwConfigTypeHardButton"),
					defaultSelected: false,
				},
			],
			updateRatingCallback
		);
	}

	get state() {
		return {
			easy: this.buttons[0].selected,
			medium: this.buttons[1].selected,
			hard: this.buttons[2].selected,
		};
	}

	get rating() {
		let easySelected = this.buttons[0].selected;
		let mediumSelected = this.buttons[1].selected;
		let hardSelected = this.buttons[2].selected;
		if (easySelected && !mediumSelected && !hardSelected) {
			return 0;
		} else if (easySelected && mediumSelected && !hardSelected) {
			return 1;
		} else if ((easySelected && mediumSelected && hardSelected) || (!easySelected && mediumSelected && !hardSelected)) {
			return 2;
		} else if (!easySelected && mediumSelected && hardSelected) {
			return 3;
		} else if (!easySelected && !mediumSelected && hardSelected) {
			return 4;
		} else {
			return 0;
		}
	}

	updateState({ easy, medium, hard }) {
		this.buttons[0].selected = easy;
		this.buttons[1].selected = medium;
		this.buttons[2].selected = hard;
	}
}

class NexusCityDungeonSetupTabAvatarSelectionButtonSet extends NexusCityDungeonSetupTabBaseButtonSet {
	constructor(updateRatingCallback) {
		super(
			[
				{
					$element: $("#nsdwConfigSelectionWatchedButton"),
					defaultSelected: true,
				},
				{
					$element: $("#nsdwConfigSelectionRandomButton"),
					defaultSelected: false,
				},
			],
			updateRatingCallback
		);
	}

	get state() {
		return {
			watched: this.buttons[0].selected,
			random: this.buttons[1].selected,
		};
	}

	get rating() {
		let watchedSelected = this.buttons[0].selected;
		let randomSelected = this.buttons[1].selected;
		if (watchedSelected && !randomSelected) {
			return 0;
		} else if (watchedSelected && randomSelected) {
			return 1;
		} else if (!watchedSelected && randomSelected) {
			return 3;
		} else {
			return 0;
		}
	}

	updateState({ watched, random }) {
		this.buttons[0].selected = watched;
		this.buttons[1].selected = random;
	}
}

class NexusCityDungeonSetupTabRatingDisplay {
	constructor() {
		this.$starOne = $("#nsdwRattingStarOne");
		this.$starTwo = $("#nsdwRattingStarTwo");
		this.$starThree = $("#nsdwRattingStarThree");
		this.$starFour = $("#nsdwRattingStarFour");
		this.$starFive = $("#nsdwRattingStarFive");
	}

	updateRating(targetRating) {
		let ratingLeft = targetRating;
		[this.$starOne, this.$starTwo, this.$starThree, this.$starFour, this.$starFive].forEach(($star) => {
			$star.removeClass(`${this.FULL_STAR_CLASS} ${this.HALF_STAR_CLASS} ${this.EMPTY_STAR_CLASS}`);
			if (ratingLeft >= 2) {
				$star.addClass(this.FULL_STAR_CLASS);
			} else if (ratingLeft === 1) {
				$star.addClass(this.HALF_STAR_CLASS);
			} else {
				$star.addClass(this.EMPTY_STAR_CLASS);
			}
			ratingLeft -= 2;
		});
	}
}
NexusCityDungeonSetupTabRatingDisplay.prototype.FULL_STAR_CLASS = "fa-star";
NexusCityDungeonSetupTabRatingDisplay.prototype.HALF_STAR_CLASS = "fa-star-half-o";
NexusCityDungeonSetupTabRatingDisplay.prototype.EMPTY_STAR_CLASS = "fa-star-o";

class NexusFloorSelector {
	constructor(settingUpdateCallback) {
		this.$floorNumber = $("#nsdwFloorSelectionNumber");
		this.$leftArrow = $("#nsdwFloorSelectionLeftArrow");
		this.$rightArrow = $("#nsdwFloorSelectionRightArrow");
		this.$descrition = $("#nsdwFloorSelectionDescription");

		this._floor = 1;
		this.floorProgress = {};
		this.currentRating;

		this._disabled = false;
		this.lockMax = false;

		this.updateActiveArrows();

		this.settingUpdateCallback = settingUpdateCallback;

		this.$leftArrow.click(() => {
			this.lockMax = false;
			this.floor = this.floor - 1;
		});

		this.$rightArrow.click(() => {
			this.floor = this.floor + 1;
			if (this.floor === this.floorProgress[this.currentRating]) {
				this.lockMax = true;
			} else {
				this.lockMax = false;
			}
		});
	}

	get disabled() {
		return this._disabled;
	}

	set disabled(disabled) {
		this._disabled = disabled;
		if (!disabled) {
			this.updateDungeonRating(this.currentRating);
		}
	}

	get floor() {
		return this._floor;
	}

	set floor(newFloor) {
		if (newFloor < this.MIN_FLOOR || newFloor > this.MAX_FLOOR) {
			return;
		}
		let oldFloor = this._floor;
		this._floor = newFloor;
		this.$floorNumber.text(this._floor);
		this.$descrition.text(this.FLOOR_DESCRIPTIONS[this._floor]);
		if (!this.disabled && oldFloor !== newFloor) {
			this.settingUpdateCallback();
			this.updateActiveArrows();
		}
	}

	updateActiveArrows() {
		this.$leftArrow.toggleClass("disabled", this.floor === this.MIN_FLOOR || this.disabled);
		this.$rightArrow.toggleClass(
			"disabled",
			this.floor === this.MAX_FLOOR ||
				this.disabled ||
				!this.floorProgress[this.currentRating] ||
				this.floorProgress[this.currentRating] <= this.floor
		);
	}

	disable() {
		this.disabled = true;
		this.updateActiveArrows();
	}

	enable() {
		this.disabled = false;
		this.updateActiveArrows();
	}

	updateFloorProgress(floorProgress) {
		this.floorProgress = floorProgress;
		this.updateActiveArrows();
	}

	updateDungeonRating(rating) {
		this.currentRating = rating;
		if (!this.disabled) {
			if (
				this.lockMax ||
				(this.floorProgress && this.floorProgress[rating] && this.floorProgress[rating] < this.floor)
			) {
				this.floor = this.floorProgress[rating];
			}
			this.updateActiveArrows();
		}
	}
}
NexusFloorSelector.prototype.MAX_FLOOR = 25;
NexusFloorSelector.prototype.MIN_FLOOR = 1;
NexusFloorSelector.prototype.FLOOR_DESCRIPTIONS = {
	1: "",
	2: "Enemies have more hp",
	3: "Enemies deal more damage",
	4: "Debuffs on avatars last longer",
	5: "Reduced guessing time",
	6: "Crafting stations have fewer artifacts",
	7: "Enemies have more hp",
	8: "Party starts damaged",
	9: "Enemies deal more damage",
	10: "Reduced guessing time",
	11: "Enemies have more hp",
	12: "Buffs on avatars expire quicker",
	13: "Enemies deal more damage",
	14: "Enemies start combat with a random buff",
	15: "Reduced guessing time",
	16: "Debuffs on enemies expire quicker",
	17: "Enemies have more hp",
	18: "Avatars can equip max 3 artifacts",
	19: "Enemies deal more damage",
	20: "Reduced guessing time",
	21: "Enemies have more hp",
	22: "Enemies attacks quicker",
	23: "Enemies deal more damage",
	24: "Combat rewards have fewer artifacts",
	25: "Enemy encounters can have more enemies",
};
