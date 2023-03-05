"use strict";

/*exported NexusCityInnWindow*/

class NexusCityInnWindow extends NexusCityWindow {
	constructor(statBaseMax) {
		super($("#nexusCityInnWindow"));

		this.avatarInfoDisplay = new NexusCityAvatarInfoDisplay(
			this.$window.find("#nciwAvatarSelectionContainer"),
			statBaseMax,
			true
		);

		this.avatarSelectionTab = new NexusCityAvatarSelector(
			this,
			this.$window.find("#nciwLeftAvatarSelectorContainer"),
			this.$window.find("#nciwAvatarSelectionContainer"),
			this.$window.find("#nciwAvatarsTab"),
			this.avatarInfoDisplay,
			NexusCityAvatarEntry,
			(avatarEntry) => {
				this.avatarSetupTab.displayAvatar(avatarEntry);
				this.changeTab(this.avatarSetupTab);
			},
			[],
			false,
			() => {
				this.teamSelectionTab.clearSelectedSlot();
				this.changeTab(this.teamSelectionTab);
			}
		);
		this.badgeSelectionTab = new NexusCityBadgeSelector(
			this,
			this.$window.find("#nciwLeftBadgeSelectorContainer"),
			this.$window.find("#nciwAvatarSelectionContainer"),
			this.$window.find("#nciwTeamsTab"),
			(badgeEntry) => {
				this.teamSelectionTab.badgeSelected(badgeEntry.avatarId);
				this.changeTab(this.teamSelectionTab);
			},
			() => {
				this.teamSelectionTab.clearBadgeSelected();
				this.changeTab(this.teamSelectionTab);
			}
		);

		this.avatarSetupTab = new NexusCityInnAvatarSetupTab(this);
		this.avatarSkinSelectTab = new NexusCitySkinSelectTab(this);
		this.backgroundSelectTab = new NexusCityInnBackgroundSelectTab(this);
		this.teamSelectionTab = new NexusCityInnTeamSetupTab(this);

		this.$window.bind("transitionend", () => {
			if (this.isOpen) {
				this.avatarSelectionTab.triggerImageLoads();
			}
		});

		this._nexusWorkshopBaseInfoListener = new Listener("nexus inn base info", (payload) => {
			this.avatarSelectionTab.displayAvatars(payload.avatars);
			this.teamSelectionTab.setupTeams(payload.teams);
			this.badgeSelectionTab.displayBadges(payload.badges);
			this.open();
		});
		this._nexusWorkshopBaseInfoListener.bindListener();

		this._defaultUpdateListener = new Listener(
			"nexus updated default avatar skin",
			function (payload) {
				this.avatarSelectionTab.updateDefaultAvatarSkin(
					payload.avatarId,
					payload.colorId,
					payload.backgroundAvatarId,
					payload.backgroundColorId,
					payload.optionActive
				);
			}.bind(this)
		);
		this._defaultUpdateListener.bindListener();
	}

	open() {
		super.open();
		this.changeTab(this.avatarSelectionTab);
	}

	executeClose() {
		super.executeClose();
		this.avatarSelectionTab.reset();
	}

	trigger() {
		socket.sendCommand({
			type: "nexus",
			command: "nexus open inn",
		});
	}

	selectSkin(avatarId) {
		this.avatarSkinSelectTab.displaySkinOptions(avatarId);
		this.changeTab(this.avatarSkinSelectTab);
		this.enableBackForTab(() => {
			this.changeTab(this.avatarSetupTab);
		});
	}

	updateSelectedSkin(colorId, src, srcSet, backgroundSrc, sizeModClass) {
		this.avatarSetupTab.updateAvatar(colorId, src, srcSet, backgroundSrc, sizeModClass);
		this.changeTab(this.avatarSetupTab);
	}

	selectBackground() {
		this.backgroundSelectTab.setupContent();
		this.changeTab(this.backgroundSelectTab);
		this.enableBackForTab(() => {
			this.changeTab(this.avatarSetupTab);
		});
	}

	updateSelectedBackground(avatarId, colorId, backgroundVert) {
		this.avatarSetupTab.updateBackground(avatarId, colorId, backgroundVert);
		this.changeTab(this.avatarSetupTab);
	}

	changeTeamAvatarSelect(teamId, slotId, displayClear) {
		this.avatarSelectionTab.setSelectionCallback((avatarEntry) => {
			this.teamSelectionTab.avatarSelectedForTeam(teamId, slotId, avatarEntry);
			this.changeTab(this.teamSelectionTab);
		});
		if (displayClear) {
			this.avatarSelectionTab.displayClear();
		}
		this.changeTab(this.avatarSelectionTab, true);
		this.enableBackForTab(() => {
			this.changeTab(this.teamSelectionTab);
		});
	}

	changeTeamBadgeSelect(teamCharacters, displayClear) {
		if (this.badgeSelectionTab.gotBadges) {
			this.badgeSelectionTab.resetActiveCharacters();
			this.badgeSelectionTab.updateActiveCharacters([], teamCharacters);
			if (displayClear) {
				this.badgeSelectionTab.displayClear();
			}
			this.changeTab(this.badgeSelectionTab);
			this.enableBackForTab(() => {
				this.changeTab(this.teamSelectionTab);
			});
		} else {
			displayMessage(
				"No Avatar Badges Unlocked",
				"Unlock avatar badges by leveling up avatars, and user them to power up other avatars"
			);
		}
	}

	changeAvatarSetTeam(avatarInfo) {
		this.teamSelectionTab.setAvatarTarget(avatarInfo);
		this.changeTab(this.teamSelectionTab, true);
		this.enableBackForTab(() => {
			this.changeTab(this.avatarSetupTab);
		});
	}
}

class NexusCityInnAvatarSetupTab extends NexusCityWindowTab {
	constructor(window) {
		super(
			window,
			window.$window.find("#nciwLeftAvatarSetupContainer"),
			window.$window.find("#nciwAvatarSelectionContainer"),
			window.$window.find("#nciwAvatarSetupTab")
		);

		this.$image = window.$window.find("#nciwAvatarSetupPreviewImage");
		this.$imageContainer = window.$window.find("#nciwAvatarSetupPreview");
		this.$skinSelectButton = window.$window.find("#nciwAvatarSetupChangeVersion");
		this.$backgroundSelectButton = window.$window.find("#nciwAvatarSetupChangeBackground");
		this.$toggleOptionButton = window.$window.find("#nciwAvatarSetupToggleOption");
		this.$setDefaultButton = window.$window.find("#nciwAvatarSetupSetDefault");
		this.$addToTeamTeamButton = window.$window.find("#nciwAvatarSetupAddToTeam");

		this.defaultColorId;
		this.defaultBackgroundAvatarId;
		this.defaultBackgroundColorId;
		this.defaultOptionActive;

		this.currentAvatarId;
		this.currentCharacterId;
		this.currentColorId;
		this.currentOptionActive;

		this.currentBackgroundAvatarId;
		this.currentBackgroundColorId;

		this.imagePreload;

		this.$skinSelectButton.click(() => {
			window.selectSkin(this.currentAvatarId);
		});

		this.$backgroundSelectButton.click(() => {
			window.selectBackground();
		});

		this.$toggleOptionButton.click(() => {
			this.toggleOption();
		});

		this.$setDefaultButton.click(() => {
			socket.sendCommand({
				type: "nexus",
				command: "set default avatar skin",
				data: this.currentAvatarInfo,
			});
		});

		this.$addToTeamTeamButton.click(() => {
			window.changeAvatarSetTeam(this.currentAvatarInfo);
		});

		this.defaultUpdateListener = new Listener(
			"nexus updated default avatar skin",
			function (payload) {
				if (this.currentAvatarId === payload.avatarId) {
					this.defaultColorId = payload.colorId;
					this.defaultBackgroundAvatarId = payload.backgroundAvatarId;
					this.defaultBackgroundColorId = payload.backgroundColorId;
					this.defaultOptionActive = payload.optionActive;
					this.updateSetDefaultButton();
				}
			}.bind(this)
		);
		this.defaultUpdateListener.bindListener();
	}

	get currentAvatarInfo() {
		return {
			avatarId: this.currentAvatarId,
			colorId: this.currentColorId,
			backgroundAvatarId: this.currentBackgroundAvatarId,
			backgroundColorId: this.currentBackgroundColorId,
			optionActive: this.currentOptionActive,
		};
	}

	displayAvatar({
		avatarId,
		characterId,
		backgroundAvatarId,
		backgroundColorId,
		colorId,
		sizeModClass,
		src,
		srcSet,
		backgroundSrc,
		optionName,
		optionActive,
	}) {
		this.currentAvatarId = avatarId;
		this.currentCharacterId = characterId;
		this.currentColorId = colorId;
		this.defaultColorId = colorId;
		this.defaultOptionActive = optionActive;
		this.currentOptionActive = optionActive;

		this.defaultBackgroundAvatarId = backgroundAvatarId;
		this.defaultBackgroundColorId = backgroundColorId;

		this.currentBackgroundAvatarId = backgroundAvatarId;
		this.currentBackgroundColorId = backgroundColorId;

		if (optionName === "None") {
			this.$toggleOptionButton.text("No Toggle");
			this.$toggleOptionButton.addClass("disabled");
		} else {
			this.$toggleOptionButton.text("Toggle " + optionName);
			this.$toggleOptionButton.removeClass("disabled");
		}

		this.loadAvatar(src, srcSet, sizeModClass);
		this.loadBackground(backgroundSrc);
		this.updateSetDefaultButton();
	}

	toggleOption() {
		this.currentOptionActive = !this.currentOptionActive;

		let targetAvatar = storeWindow.getAvatarFromAvatarId(this.currentAvatarId);
		let targetAvatarColor = targetAvatar.colorMap[this.currentColorId];

		let { src, srcSet } = targetAvatarColor.getAvatarBaseSrcInfo(this.currentOptionActive);

		this.loadAvatar(src, srcSet, targetAvatarColor.sizeModifierClass);
		this.updateSetDefaultButton();
	}

	loadAvatar(src, srcSet, sizeModClass) {
		this.$image.removeClass();
		this.$image.addClass(sizeModClass);

		if (this.imagePreload) {
			this.imagePreload.cancel();
		}
		this.imagePreload = new PreloadImage(this.$image, src, srcSet, true);

		this.$image.attr("src", src);
		this.$image.attr("srcset", srcSet);
	}

	loadBackground(backgroundSrc) {
		this.$imageContainer.css("background-image", `url(${backgroundSrc})`);
	}

	updateAvatar(colorId, src, srcSet, backgroundSrc, sizeModClass) {
		this.loadAvatar(src, srcSet, sizeModClass);

		if (
			this.currentBackgroundAvatarId === this.currentAvatarId &&
			this.currentBackgroundColorId === this.currentColorId
		) {
			this.loadBackground(backgroundSrc);
			this.currentBackgroundColorId = colorId;
		}

		this.currentColorId = colorId;
		this.updateSetDefaultButton();
	}

	updateBackground(avatarId, colorId, backgroundVert) {
		this.currentBackgroundAvatarId = avatarId;
		this.currentBackgroundColorId = colorId;

		let backgroundSrc = cdnFormater.newAvatarBackgroundSrc(backgroundVert, 250);

		this.loadBackground(backgroundSrc);
		this.updateSetDefaultButton();
	}

	updateSetDefaultButton() {
		if (
			this.currentColorId === this.defaultColorId &&
			this.currentBackgroundAvatarId === this.defaultBackgroundAvatarId &&
			this.currentBackgroundColorId === this.defaultBackgroundColorId &&
			this.currentOptionActive === this.defaultOptionActive
		) {
			this.$setDefaultButton.addClass("disabled");
		} else {
			this.$setDefaultButton.removeClass("disabled");
		}
	}
}

class NexusCitySkinSelectTab extends NexusCityWindowTab {
	constructor(window) {
		super(
			window,
			window.$window.find("#nciwLeftAvatarSkinSelectContainer"),
			window.$window.find("#nciwAvatarSelectionContainer"),
			window.$window.find("#nciwAvatarSetupTab")
		);

		this.skinEntries = [];

		this.$leftContainer.perfectScrollbar({
			suppressScrollX: true,
		});

		this.unlockListner = new Listener(
			"unlock avatar",
			function (payload) {
				if (payload.succ) {
					payload.unlockedAvatars.forEach(({ avatarId, colorId }) => {
						this.skinEntries
							.filter((entry) => entry.avatarId === avatarId && entry.colorId === colorId)
							.forEach((entry) => {
								entry.setUnlocked();
							});
					});
				}
			}.bind(this)
		);
	}

	displaySkinOptions(avatarId) {
		let avatarEntry = storeWindow.getAvatarFromAvatarId(avatarId);

		this.$leftContainer.html("");

		this.skinEntries = avatarEntry.colors.map((avatarColor) => {
			let entry = new NexusCitySkinSelectEntry(avatarColor, this.$leftContainer, this.window);
			this.$leftContainer.append(entry.$body);
			return entry;
		});
	}

	show() {
		super.show();
		this.$leftContainer.perfectScrollbar("update");
		this.skinEntries.forEach((entry) => {
			entry.imagePreload.lazyLoadEvent();
		});
		this.unlockListner.bindListener();
	}

	hide() {
		super.hide();
		this.unlockListner.unbindListener();
	}
}

class NexusCitySkinSelectEntry {
	constructor(
		{ avatarId, colorId, name, sizeModifierClass, src, srcSet, backgroundSrc, unlocked },
		$container,
		window
	) {
		this.$body = $(format(this.template, capitalizeMajorWords(name)));
		this.$image = this.$body.find(".nciwAvatarSkinSelectImg");

		this.avatarId = avatarId;
		this.colorId = colorId;

		this.unlocked = unlocked;

		this.imagePreload = new PreloadImage(
			this.$image,
			src,
			srcSet,
			false,
			"250px",
			null,
			false,
			$container,
			false,
			this.$body
		);
		this.$image.addClass(sizeModifierClass);

		this.$body.css("background-image", `url(${backgroundSrc})`);

		if (!unlocked) {
			this.$body.addClass("locked");
		}

		this.$body.click(() => {
			if (this.unlocked) {
				window.updateSelectedSkin(colorId, src, srcSet, backgroundSrc, sizeModifierClass);
			}
		});
	}

	setUnlocked() {
		this.unlocked = true;
		this.$body.removeClass("locked");
	}
}
NexusCitySkinSelectEntry.prototype.template = $("#nciwAvatarSkinSelectEntryTemplate").html();

class NexusCityInnBackgroundSelectTab extends NexusCityWindowTab {
	constructor(window) {
		super(
			window,
			window.$window.find("#nciwLeftAvatarBackgroundSelectContainer"),
			window.$window.find("#nciwAvatarSelectionContainer"),
			window.$window.find("#nciwAvatarSetupTab")
		);
		this.$contentContainer = this.$leftContainer.find("#nciwLeftAvatarBackgroundSelectMainContainer");
		this.$searchContainer = this.$leftContainer.find(".nexusCityFilterSearchInput");

		this.loadList = [];
		this.backgroundEntries = [];
		this.loadTimeout = null;

		this.$contentContainer.perfectScrollbar({
			suppressScrollX: true,
			minScrollbarLength: 60,
		});

		let callbackTimeout;
		this.$searchContainer.on("input", () => {
			clearTimeout(callbackTimeout);
			callbackTimeout = setTimeout(() => {
				this.applySearchFilter();
			}, NexusCityFilter.prototype.TEXT_INPUT_UPDATE_DELAY);
		});

		this.unlockListner = new Listener(
			"unlock avatar",
			function (payload) {
				if (payload.succ) {
					payload.unlockedAvatars.forEach(({ avatarId, colorId }) => {
						this.backgroundEntries.forEach((entry) => {
							entry.handleNewUnlock(avatarId, colorId);
						});
					});
				}
			}.bind(this)
		);
	}

	show() {
		super.show();
		this.updateScroll();
		this.backgroundEntries.forEach((entry) => {
			entry.imagePreload.lazyLoadEvent();
		});
		this.unlockListner.bindListener();
	}

	hide() {
		super.hide();
		this.unlockListner.unbindListener();
	}

	updateScroll() {
		this.$contentContainer.perfectScrollbar("update");
	}

	setupContent() {
		this.$contentContainer.html("");
		this.backgroundEntries = [];
		this.$searchContainer.val("");
		clearTimeout(this.loadTimeout);

		this.loadList = storeWindow.getAllAvatars().sort((a, b) => {
			if (a.backgroundUnlocked !== b.backgroundUnlocked) {
				if (a.backgroundUnlocked) {
					return -1;
				} else {
					return 1;
				}
			} else if (a.colorUnlocked !== b.colorUnlocked) {
				if (a.colorUnlocked) {
					return -1;
				} else {
					return 1;
				}
			} else if (a.characterId !== b.characterId) {
				return a.characterId - b.characterId;
			} else {
				return a.avatarId - b.avatarId;
			}
		});

		this.loadSection();
	}

	loadSection() {
		let avatarList = this.loadList.splice(0, this.LOAD_SECTION_SIZE);
		avatarList.forEach((avatar) => {
			let entry = new NexusCityInnBackgroundGroup(avatar, this.$contentContainer, this.window);
			this.$contentContainer.append(entry.$body);
			this.backgroundEntries.push(entry);
		});
		this.updateScroll();
		if (this.loadList.length) {
			this.loadTimeout = setTimeout(this.loadSection.bind(this), this.LOAD_SECTION_DELAY);
		}
	}

	applySearchFilter() {
		let searchFilter = this.$searchContainer.val().toLowerCase();
		this.backgroundEntries.forEach((entry) => {
			entry.applySearchfilter(searchFilter);
		});
		this.updateScroll();
	}
}
NexusCityInnBackgroundSelectTab.prototype.LOAD_SECTION_SIZE = 5;
NexusCityInnBackgroundSelectTab.prototype.LOAD_SECTION_DELAY = 1; //ms

class NexusCityInnBackgroundGroup {
	constructor(avatarEntry, $scrolLContainer, window) {
		this.$body = $(format(this.TEMPLATE, capitalizeMajorWords(avatarEntry.completeName)));
		this.$avatarImg = this.$body.find(".nciwAvatarBackgroundSelectEntryImage");
		this.$lockedMessage = this.$body.find(".nciwAvatarBackgroundSelectEntryLockedContainer");
		this.$backgroundScrollContainer = this.$body.find(".nciwAvatarBackgroundSelectEntryContainer");
		this.$backgroundContainer = this.$body.find(".nciwAvatarBackgroundSelectEntryContainerInner");

		this.fullName = avatarEntry.completeName;
		this.imageLoadTriggered = false;

		let { avatarName, outfitName, colorName, optionName, optionActive, avatarId } =
			avatarEntry.colorMap[avatarEntry.defaultColorId].fullDescription;

		this.avatarId = avatarId;

		let avatarSrc = cdnFormater.newAvatarHeadSrc(avatarName, outfitName, optionName, optionActive, colorName);
		let avatarSrcSet = cdnFormater.newAvatarHeadSrcSet(avatarName, outfitName, optionName, optionActive, colorName);

		this.imagePreload = new PreloadImage(
			this.$avatarImg,
			avatarSrc,
			avatarSrcSet,
			false,
			"52px",
			() => {
				this.backgroundEntries.forEach((entry) => {
					entry.triggerImageLoad();
				});
				this.$backgroundScrollContainer.perfectScrollbar("update");
				this.imageLoadTriggered = true;
			},
			false,
			$scrolLContainer,
			false,
			this.$body
		);

		this.locked = avatarEntry.unlockedColorCount < 10;

		if (this.locked) {
			this.$lockedMessage.removeClass("hide");
		}

		this.backgroundEntries = avatarEntry.colors.map((color) => {
			let entry = new NexusCityInnBackgroundEntry(color, this.$backgroundScrollContainer, window);
			this.$backgroundContainer.append(entry.$body);
			return entry;
		});

		this.$backgroundScrollContainer.perfectScrollbar({
			suppressScrollY: true,
		});
	}

	show() {
		this.$body.removeClass("hide");
	}

	hide() {
		this.$body.addClass("hide");
	}

	handleNewUnlock(avatarId, colorId) {
		if (this.avatarId === avatarId) {
			this.backgroundEntries.filter((entry) => entry.colorId === colorId).forEach((entry) => entry.setUnlocked());
			if (this.locked) {
				let avatarEntry = storeWindow.getAvatarFromAvatarId(avatarId);
				this.locked = avatarEntry.unlockedColorCount < 10;
				if (!this.locked) {
					this.$lockedMessage.addClass("hide");
				}
			}
		}
	}

	applySearchfilter(searchFilter) {
		if (this.fullName.toLowerCase().includes(searchFilter)) {
			this.show();
			this.backgroundEntries.forEach((entry) => {
				entry.show();
				if (this.imageLoadTriggered) {
					entry.imagePreload.lazyLoadEvent();
				}
			});
		} else {
			let entryShown = false;
			this.backgroundEntries.forEach((entry) => {
				let inFilter = entry.name.toLowerCase().includes(searchFilter);
				if (inFilter) {
					entryShown = true;
					entry.show();
					if (this.imageLoadTriggered) {
						entry.imagePreload.lazyLoadEvent();
					}
				} else {
					entry.hide();
				}
			});
			entryShown ? this.show() : this.hide();
		}
	}
}
NexusCityInnBackgroundGroup.prototype.TEMPLATE = $("#nciwAvatarBackgroundGroupTemplate").html();

class NexusCityInnBackgroundEntry {
	constructor({ colorId, avatarId, backgroundVert, name, unlocked }, $scrollContainer, window) {
		this.$body = $(format(this.TEMPLATE, capitalizeMajorWords(name)));
		this.$image = this.$body.find(".nciwAvatarBackgroundImage");

		this.name = name;
		this.colorId = colorId;

		this.unlocked = unlocked;

		this.imagePreload = new PreloadImage(
			this.$image,
			cdnFormater.newAvatarBackgroundSrc(backgroundVert, 200),
			null,
			false,
			null,
			null,
			false,
			$scrollContainer,
			false,
			this.$body,
			true,
			true,
			this.LAZY_LOAD_OFFSET_MOD
		);

		if (!unlocked) {
			this.$body.addClass("locked");
		}

		this.$body.click(() => {
			if (this.unlocked) {
				window.updateSelectedBackground(avatarId, colorId, backgroundVert);
			}
		});
	}

	show() {
		this.$body.removeClass("hide");
	}

	hide() {
		this.$body.addClass("hide");
	}

	triggerImageLoad() {
		this.imagePreload.enableLazyLoadCheck();
	}

	setUnlocked() {
		this.unlocked = true;
		this.$body.removeClass("locked");
	}
}
NexusCityInnBackgroundEntry.prototype.TEMPLATE = $("#nciwAvatarBackgroundSelectEntryTemplate").html();
NexusCityInnBackgroundEntry.prototype.LAZY_LOAD_OFFSET_MOD = -80;

class NexusCityInnTeamSetupTab extends NexusCityTeamSetupTab {
	constructor(window) {
		super(
			window,
			window.$window.find("#nciwLeftTeamSetupContainer"),
			window.$window.find("#nciwAvatarSelectionContainer"),
			window.$window.find("#nciwTeamsTab"),
			window.$window.find("#nciwTeamSetupOuterContainer"),
			NexusCityInnTeamRow,
			window.avatarInfoDisplay
		);
		this.$newTeamButton = window.$window.find("#nciwTeamSetupAddTeam");

		this.avatarTarget = null;
		this.selectedSlot = null;

		this.$newTeamButton.click(() => {
			this.displayTeamNameInput("Create Team", (name) => {
				if (name) {
					socket.sendCommand({
						type: "nexus",
						command: "nexus create team",
						data: {
							name,
						},
					});
				}
			});
		});

		this._nexusCreateTeamListener = new Listener("nexus create team", (payload) => {
			if (payload.success) {
				this.addTeam(payload.teamInfo);
				this.$leftContainer.perfectScrollbar("update");
				this.updateCreateTeamButtonState();
			} else {
				displayMessage("Error Creating Team", payload.message);
			}
		});
		this._nexusCreateTeamListener.bindListener();

		this._nexusTeamAvatarUpdate = new Listener("nexus team avatar update", (payload) => {
			let { avatars, teamId, badges } = payload.teamInfo;
			if (this.teamMap[teamId]) {
				this.teamMap[teamId].updateAvatars(avatars);
				this.teamMap[teamId].updateBadges(badges);
				this.teamMap[teamId].triggerLazyLoad();
			}
		});
		this._nexusTeamAvatarUpdate.bindListener();

		this._nexusRenameTeamListener = new Listener("nexus rename team", (payload) => {
			let { name, teamId } = payload;
			if (this.teamMap[teamId]) {
				this.teamMap[teamId].rename(name);
			}
		});
		this._nexusRenameTeamListener.bindListener();

		this._nexusDeleteTeamListener = new Listener("nexus delete team", (payload) => {
			let { teamId } = payload;
			if (this.teamMap[teamId]) {
				this.teamMap[teamId].delete();
				delete this.teamMap[teamId];
				this.updateCreateTeamButtonState();
			}
		});
		this._nexusDeleteTeamListener.bindListener();

		this._nexusTeamAvatarClearListener = new Listener("nexus team avatar clear", ({ teamId, slotId }) => {
			if (this.teamMap[teamId]) {
				this.teamMap[teamId].clearSlot(slotId);
			}
		});
		this._nexusTeamAvatarClearListener.bindListener();

		this._nexusTeamBadgeClearListener = new Listener("nexus team badge clear", ({ teamId, slotId }) => {
			if (this.teamMap[teamId]) {
				this.teamMap[teamId].clearBadge(slotId);
			}
		});
		this._nexusTeamBadgeClearListener.bindListener();
	}

	hide(noChangeHighlightTab) {
		super.hide(noChangeHighlightTab);
		this.avatarTarget = null;
	}

	setAvatarTarget(avatarInfo) {
		this.avatarTarget = avatarInfo;
	}

	handleTeamAvatarSlotClick(slot) {
		if (this.avatarTarget) {
			this.avatarSelectedForTeam(slot.teamId, slot.slotId, this.avatarTarget);
		} else {
			this.selectedSlot = slot;
			this.window.changeTeamAvatarSelect(
				this.selectedSlot.teamId,
				this.selectedSlot.slotId,
				this.selectedSlot.gotAvatar
			);
		}
	}

	handleTeamAvatarSlotHover(slot) {
		if (slot.avatarInfo && !this.avatarTarget) {
			this.window.avatarInfoDisplay.displayAvatar(slot.avatarInfo);
		}
	}

	avatarSelectedForTeam(teamId, slotId, { avatarId, colorId, backgroundAvatarId, backgroundColorId, optionActive }) {
		let teamRow = this.teamMap[teamId];
		let targetSlot = teamRow.slots[slotId];
		if (targetSlot.checkNewAvatarDescription(avatarId, colorId, backgroundAvatarId, backgroundColorId)) {
			targetSlot.displayLoading();
			socket.sendCommand({
				type: "nexus",
				command: "new team avatar",
				data: {
					teamId: teamId,
					slotId: slotId,
					avatarId: avatarId,
					colorId: colorId,
					backgroundAvatarId: backgroundAvatarId,
					backgroundColorId: backgroundColorId,
					optionActive: optionActive == true,
				},
			});
		}
	}

	clearSelectedSlot() {
		if (this.selectedSlot) {
			socket.sendCommand({
				type: "nexus",
				command: "clear team avatar",
				data: {
					teamId: this.selectedSlot.teamId,
					slotId: this.selectedSlot.slotId,
				},
			});
		}
	}

	handleTeamAvatarBadgeClick(slot) {
		this.selectedSlot = slot;
		let teamCharacters = this.teamMap[slot.teamId].getTeamCharacterIds();
		this.window.changeTeamBadgeSelect(teamCharacters, this.selectedSlot.gotAvatar);
	}

	badgeSelected(avatarId) {
		if (this.selectedSlot) {
			socket.sendCommand({
				type: "nexus",
				command: "new team badge",
				data: {
					teamId: this.selectedSlot.teamId,
					slotId: this.selectedSlot.slotId,
					avatarId: avatarId,
				},
			});
		}
	}

	clearBadgeSelected() {
		if (this.selectedSlot) {
			socket.sendCommand({
				type: "nexus",
				command: "clear team badge",
				data: {
					teamId: this.selectedSlot.teamId,
					slotId: this.selectedSlot.slotId,
				},
			});
		}
	}

	displayTeamNameInput(title, callback) {
		swal({
			title: title,
			input: "text",
			inputPlaceholder: "Team Name",
			inputValidator: (value) => {
				if (!value) {
					return "You must provide a team name";
				} else if (value.length > this.TEAM_NAME_MAX_LENGTH) {
					return "Name must be at most " + this.TEAM_NAME_MAX_LENGTH + " characters";
				}
				return false;
			},
			showCancelButton: true,
			confirmButtonColor: "#204d74",
			confirmButtonText: "Create",
		}).then((result) => {
			callback(result.value);
		});
	}

	updateCreateTeamButtonState() {
		if (Object.values(this.teamMap).length >= this.MAX_TEAM_COUNT) {
			this.$newTeamButton.addClass("disabled");
		} else {
			this.$newTeamButton.removeClass("disabled");
		}
	}
}
NexusCityInnTeamSetupTab.prototype.TEAM_NAME_MAX_LENGTH = 20;
NexusCityInnTeamSetupTab.prototype.MAX_TEAM_COUNT = 40;

class NexusCityInnTeamRow extends NexusCityTeamRow {
	constructor(teamInfo, window, tab, $container, teamNumber) {
		super(teamInfo, window, tab, $container, teamNumber);

		this.$renameButton = this.$body.find(".nciwTeamSetupRenameOption");
		this.$deleteButton = this.$body.find(".nciwTeamSetupDeleteOption");
		this.$optionContainer = this.$body.find(".nciwTeamSetupOptionContainer");
		this.$name = this.$body.find(".nciwTeamSetupName");

		this.$optionContainer.removeClass("hide");
		this.$body.removeClass("clickAble");

		this.$renameButton.popover({
			content: "Rename Team",
			delay: { show: 100, hide: 0 },
			container: "#nexusCityInnWindow",
			placement: "top",
			trigger: "hover",
		});

		this.$deleteButton.popover({
			content: "Delete Team",
			delay: { show: 100, hide: 0 },
			container: "#nexusCityInnWindow",
			placement: "top",
			trigger: "hover",
		});

		this.$renameButton.click(() => {
			tab.displayTeamNameInput("Rename Team", (name) => {
				if (name) {
					socket.sendCommand({
						type: "nexus",
						command: "rename team",
						data: {
							teamId: this.teamId,
							name,
						},
					});
				}
			});
		});

		this.$deleteButton.click(() => {
			displayOption("Delete Team", null, "Delete", "Cancel", () => {
				socket.sendCommand({
					type: "nexus",
					command: "delete team",
					data: {
						teamId: this.teamId,
					},
				});
			});
		});
	}

	get editableBadge() {
		return true;
	}

	rename(newName) {
		this.$name.text(newName);
	}

	delete() {
		this.$body.remove();
	}

	clearSlot(slotId) {
		this.slots[slotId].displayEmpty();
	}

	clearBadge(slotId) { 
		this.slots[slotId].clearBadge();
	}
}
