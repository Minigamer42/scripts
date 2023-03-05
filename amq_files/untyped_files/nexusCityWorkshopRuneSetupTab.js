"use strict";
/*exported NexusCityWorkshopRuneSetupTab NexusCityWorkshopRuneSlot*/

class NexusCityWorkshopRuneSetupTab extends NexusCityWindowTab {
	constructor(window, statBaseMax, runeSelector) {
		super(
			window,
			window.$window.find("#ncwwRuneSetupSlotContainer"),
			window.$window.find("#ncwwRuneSetupRightColumn"),
			window.$window.find("#ncwwRuneSetuprTab")
		);

		this.$outerContainer = window.$window.find("#ncwwLeftRuneTabTypeContainer");

		this.$openSlotsCounter = window.$window.find("#ncwwRuneSetupOpenSlotCounter");

		this.currentRuneSetup = null;

		this.saveButton = new NexusCityWindowButton(
			this.$leftContainer.find("#ncwwRuneSetupSaveButton"),
			() => {
				if (this.slotHandler.validSlotSetup) {
					socket.sendCommand({
						type: "nexus",
						command: "nexus save runes",
						data: {
							runes: this.slotHandler.allRunes,
							avatarId: this.avatarId,
						},
					});
				} else {
					this.tooltip.displayMessage(this.TOOLTIPS.INVALID_SETUP);
				}
			},
			"Lock in the current rune layout"
		);

		this.unequipAllButton = new NexusCityWindowButton(this.$leftContainer.find("#ncwwRuneSetupRemoveAllButton"), () => {
			displayOption(
				"Unequp Runes?",
				"All runes will be unequiped from this avatar, and will be available to use again. Cost: 1 Ticket",
				"Unequip",
				"Cancel",
				() => {
					if (xpBar.currentTicketCount === 0) {
						displayMessage("Not Enough Tickets");
					} else {
						socket.sendCommand({
							type: "nexus",
							command: "unequip all runes",
							data: {
								avatarId: this.avatarId,
							},
						});
					}
				}
			);
		});

		this.emptyRuneSlotCount = 0;
		this.avatarId;

		this.runeSelector = runeSelector;
		this.avatarInfoDisplay = new NexusCityAvatarInfoDisplay(this.$rightContainer, statBaseMax);
		this.tooltip = new NexusCityWorkshopRuneSetupTooltip(this.$leftContainer);
		this.slotHandler = new NexusCityWorkshopRuneSelectorSlotHandler(this.$leftContainer, this, this.tooltip);
	}

	displayAvatar(avatarInfo) {
		this.reset();
		let { runeInfo, emptyRuneSlotCount, avatarId } = avatarInfo;
		this.avatarId = avatarId;
		this.emptyRuneSlotCount = emptyRuneSlotCount;
		this.avatarInfoDisplay.displayAvatar(avatarInfo);
		this.setupRunes(runeInfo, true);
		this.updateOpenSlots();
	}

	setupRunes(runeInfo, noDisplayUpdate) {
		let runeEntries = runeInfo.map(({ runeId, level, slot }) => {
			return {
				rune: this.runeSelector.getRune(runeId, level),
				slot,
			};
		});
		this.slotHandler.displayRunes(runeEntries);
		if (!noDisplayUpdate) {
			this.avatarInfoDisplay.setRuneBoosts(runeEntries.map((entry) => entry.rune));
		}
		if (runeInfo.length) {
			this.unequipAllButton.enable();
		} else {
			this.unequipAllButton.disable();
		}
		this.currentRuneSetup = this.slotHandler.allRunes;
	}

	show() {
		super.show();
		this.$outerContainer.removeClass("hide");
		this.$rightContainer.width(); //force dom to render
		this.avatarInfoDisplay.relayout();
		this.runeSelector.changeToNormalSize();
		this.runeSelector.loadImages();

		if (!tutorial.state.nexusRuneSetup) {
			nexusTutorialController.startRuneSetupTutorial(
				this.runeSelector.$runeContainer,
				this.$leftContainer,
				this.slotHandler.offensiveStandardTopContainer.$container,
				this.slotHandler.offensiveStandardBottomContainer.$container,
				this.slotHandler.sharedAdvancedContainer.$container,
				this.$openSlotsCounter,
				this.saveButton.$button,
				this.unequipAllButton.$button,
				$("#ncwwRuneSetupPageContainer")
			);
		}
	}

	hide() {
		super.hide();
		this.$outerContainer.addClass("hide");
	}

	slotInRune(slot) {
		let targetRune = this.runeSelector.selectedRune;
		if (targetRune) {
			if (
				slot.targetType === NEXUS_RUNE_TYPES.ADVANCED &&
				!this.slotHandler.validateAdvancedRuneEquipSetup(targetRune.runeId)
			) {
				this.tooltip.displayMessage(this.TOOLTIPS.DUPLICATE_ADVANCED_RUNE);
			} else if (slot.canEquipRune(targetRune)) {
				if (slot.runeId == null) {
					this.emptyRuneSlotCount--;
				}
				if (slot.originalRuneId === targetRune.runeId && slot.originalRuneLevel === targetRune.level) {
					this.runeSelector.runeUnequiped(targetRune.runeId, targetRune.level);
				}
				slot.slotInNewRune(targetRune);
				targetRune.slottedIn();
				this.updateOpenSlots();
				this.avatarInfoDisplay.newRune(targetRune);

				this.updateSaveButtonState();
			} else {
				this.tooltip.displayMessage(
					this.TOOLTIPS.WRONG_RUNE_SLOT.replace("{category}", slot.categoryName).replace("{type}", slot.typeName)
				);
			}
		} else {
			this.tooltip.displayMessage(this.TOOLTIPS.NO_RUNE_SELECTED);
		}
	}

	unequipSlot(slot, skipOpenSlotUpdate) {
		if (slot.runeId) {
			if (slot.newRune) {
				this.runeSelector.runeUnequiped(slot.runeId, slot.runeLevel);
			}
			let rune = this.runeSelector.getRune(slot.runeId, slot.runeLevel);
			this.avatarInfoDisplay.removeRune(rune);
			slot.clear();
			this.emptyRuneSlotCount++;
			if (!skipOpenSlotUpdate) {
				this.updateOpenSlots();
			}

			this.updateSaveButtonState();
		}
	}

	updateOpenSlots() {
		this.slotHandler.updateOpenSlots(this.emptyRuneSlotCount > 0);
		this.$openSlotsCounter.text(this.emptyRuneSlotCount);
	}

	reset() {
		this.runeSelector.resetSelection();
		this.slotHandler.reset();
		this.saveButton.disable();
		this.currentRuneSetup = [];
	}

	newRuneLayout(runes, emptyRuneSlotCount) {
		this.emptyRuneSlotCount = emptyRuneSlotCount;
		this.updateOpenSlots();
		this.slotHandler.reset();
		this.saveButton.disable();
		this.avatarInfoDisplay.resetBoosts();
		this.setupRunes(runes);
	}

	updateSaveButtonState() {
		if (this.pageChanged) {
			this.saveButton.enable();
		} else {
			this.saveButton.disable();
		}
	}

	confirmTabChange(callback) {
		if (this.pageChanged) {
			displayOption("Unsaved Changes", "Rune page have unsaved changes, discard changes?", "Discard", "Cancel", () => {
				callback();
			});
		} else {
			callback();
		}
	}

	confirmClose(callback) {
		this.confirmTabChange(callback);
	}

	get pageChanged() {
		let newSetup = this.slotHandler.allRunes;
		return (
			JSON.stringify(newSetup.sort((a, b) => a.slot - b.slot)) !==
			JSON.stringify(this.currentRuneSetup.sort((a, b) => a.slot - b.slot))
		);
	}
}
NexusCityWorkshopRuneSetupTab.prototype.TOOLTIPS = {
	NO_RUNE_SELECTED: "No rune selected. Select the rune you want to equip above.",
	WRONG_RUNE_SLOT: "{category} {type} rune slot. Only runes matching the slot can be equiped in it",
	INVALID_SETUP: "Invalid rune setup. Make sure all used containers are powered",
	DUPLICATE_ADVANCED_RUNE: "Duplicate advanced rune. Only one advanced rune of each ability can be equiped",
};

class NexusCityWorkshopRuneSelectorSlotHandler {
	constructor($window, controller, tooltip) {
		this.offensiveStandardTopContainer = new NexusCityWorkshopRuneSelectorStandardContainer(
			$window.find("#ncwwRuneSetupMinorOffensiveRuneTopContainer"),
			this.OFFENSIVE_RUNE_TOP_RANGE[0],
			controller,
			[NEXUS_RUNE_CATEGORIES.OFFENSIVE],
			tooltip
		);
		this.offensiveStandardBottomContainer = new NexusCityWorkshopRuneSelectorStandardContainer(
			$window.find("#ncwwRuneSetupMinorOffensiveRuneBottomContainer"),
			this.OFFENSIVE_RUNE_BOTTOM_RANGE[0],
			controller,
			[NEXUS_RUNE_CATEGORIES.OFFENSIVE],
			tooltip
		);

		this.defensiveStandardTopContainer = new NexusCityWorkshopRuneSelectorStandardContainer(
			$window.find("#ncwwRuneSetupMinorDefensiveRuneTopContainer"),
			this.DEFENSIVE_RUNE_TOP_RANGE[0],
			controller,
			[NEXUS_RUNE_CATEGORIES.DEFENSIVE],
			tooltip
		);
		this.defensiveStandardBottomContainer = new NexusCityWorkshopRuneSelectorStandardContainer(
			$window.find("#ncwwRuneSetupMinorDefensiveRuneBottomContainer"),
			this.DEFENSIVE_RUNE_BOTTOM_RANGE[0],
			controller,
			[NEXUS_RUNE_CATEGORIES.DEFENSIVE],
			tooltip
		);

		this.offensiveAdvancedContainer = new NexusCityWorkshopRuneSelectorAdvancedContainer(
			$window.find("#ncwwRuneSetupMajorOffensiveRune"),
			this.OFFENSIVE_ADVANCED_SLOT_NUMBER,
			controller,
			[NEXUS_RUNE_CATEGORIES.OFFENSIVE],
			tooltip
		);
		this.defensiveAdvancedContainer = new NexusCityWorkshopRuneSelectorAdvancedContainer(
			$window.find("#ncwwRuneSetupMajorDefensiveRune"),
			this.DEFENSIVE_ADVANCED_SLOT_NUMBER,
			controller,
			[NEXUS_RUNE_CATEGORIES.DEFENSIVE],
			tooltip
		);

		this.sharedAdvancedContainer = new NexusCityWorkshopRuneSelectorAdvancedContainer(
			$window.find("#ncwwRuneSetupMajorShardRune"),
			this.SHARED_ADVANCED_SLOT_NUMBER,
			controller,
			[NEXUS_RUNE_CATEGORIES.OFFENSIVE, NEXUS_RUNE_CATEGORIES.DEFENSIVE],
			tooltip
		);
	}

	get allOffensiveContainers() {
		return [this.offensiveStandardTopContainer, this.offensiveStandardBottomContainer, this.offensiveAdvancedContainer];
	}

	get allDefensiveContainers() {
		return [this.defensiveStandardTopContainer, this.defensiveStandardBottomContainer, this.defensiveAdvancedContainer];
	}

	get allContainers() {
		return [...this.allOffensiveContainers, ...this.allDefensiveContainers, this.sharedAdvancedContainer];
	}

	get allRunes() {
		return this.allContainers.flatMap((container) => container.allRunes);
	}

	get validSlotSetup() {
		let offensiveCorrectSetup = this.checkContainerSetupValid(
			this.offensiveStandardTopContainer,
			this.offensiveAdvancedContainer,
			this.offensiveStandardBottomContainer
		);
		let defensiveCorrectSetup = this.checkContainerSetupValid(
			this.defensiveStandardTopContainer,
			this.defensiveAdvancedContainer,
			this.defensiveStandardBottomContainer
		);
		return (
			offensiveCorrectSetup &&
			defensiveCorrectSetup &&
			(!this.sharedAdvancedContainer.slotInUse ||
				(this.offensiveStandardBottomContainer.allSlotsInUse && this.defensiveStandardBottomContainer.allSlotsInUse))
		);
	}

	validateAdvancedRuneEquipSetup(newRuneId) {
		let offensiveRuneId = this.offensiveAdvancedContainer.advancedRuneId;
		let defensiveRuneId = this.defensiveAdvancedContainer.advancedRuneId;
		let sharedRuneId = this.sharedAdvancedContainer.advancedRuneId;
		return (
			(!offensiveRuneId || newRuneId !== offensiveRuneId) &&
			(!defensiveRuneId || newRuneId !== defensiveRuneId) &&
			(!sharedRuneId || newRuneId !== sharedRuneId)
		);
	}

	checkContainerSetupValid(topContainer, advancedContainer, bottomContainer) {
		return (
			(!bottomContainer.slotInUse || (topContainer.allSlotsInUse && advancedContainer.allSlotsInUse)) &&
			(!advancedContainer.slotInUse || topContainer.allSlotsInUse)
		);
	}

	displayRunes(runes) {
		runes.forEach(({ rune, slot }) => {
			if (rune.category === NEXUS_RUNE_CATEGORIES.OFFENSIVE) {
				if (slot <= this.OFFENSIVE_RUNE_TOP_RANGE[1]) {
					this.offensiveStandardTopContainer.addRune(rune, slot, true);
				} else if (slot === this.OFFENSIVE_ADVANCED_SLOT_NUMBER) {
					this.offensiveAdvancedContainer.addRune(rune, slot, true);
				} else if (slot <= this.OFFENSIVE_RUNE_BOTTOM_RANGE[1]) {
					this.offensiveStandardBottomContainer.addRune(rune, slot, true);
				} else if (slot === this.SHARED_ADVANCED_SLOT_NUMBER) {
					this.sharedAdvancedContainer.addRune(rune, slot, true);
				}
			} else if (rune.category === NEXUS_RUNE_CATEGORIES.DEFENSIVE) {
				if (slot <= this.DEFENSIVE_RUNE_TOP_RANGE[1]) {
					this.defensiveStandardTopContainer.addRune(rune, slot, true);
				} else if (slot === this.DEFENSIVE_ADVANCED_SLOT_NUMBER) {
					this.defensiveAdvancedContainer.addRune(rune, slot, true);
				} else if (slot <= this.DEFENSIVE_RUNE_BOTTOM_RANGE[1]) {
					this.defensiveStandardBottomContainer.addRune(rune, slot, true);
				} else if (slot === this.SHARED_ADVANCED_SLOT_NUMBER) {
					this.sharedAdvancedContainer.addRune(rune, slot, true);
				}
			}
		});

		this.updateLockedStates();
	}

	updateLockedStates() {
		let allOffensiveUnlocked = this.updateLockStatesForContainers(
			this.offensiveStandardTopContainer,
			this.offensiveAdvancedContainer,
			this.offensiveStandardBottomContainer
		);
		let allDefensiveUnlocked = this.updateLockStatesForContainers(
			this.defensiveStandardTopContainer,
			this.defensiveAdvancedContainer,
			this.defensiveStandardBottomContainer
		);

		this.sharedAdvancedContainer.updateLocked(!allOffensiveUnlocked || !allDefensiveUnlocked);
	}

	updateLockStatesForContainers(topContainer, advancedContainer, bottomContainer) {
		if (!topContainer.allSlotsInUse) {
			advancedContainer.updateLocked(true);
			bottomContainer.updateLocked(true);
			return false;
		} else if (!advancedContainer.allSlotsInUse) {
			advancedContainer.updateLocked(false);
			bottomContainer.updateLocked(true);
			return false;
		} else {
			advancedContainer.updateLocked(false);
			bottomContainer.updateLocked(false);
			return bottomContainer.allSlotsInUse;
		}
	}

	updateOpenSlots(openSlots) {
		this.allContainers.forEach((container) => container.updateOpenSlots(openSlots));
		this.updateLockedStates();
	}

	reset() {
		this.allContainers.forEach((container) => container.clear());
		this.updateLockedStates();
	}
}
NexusCityWorkshopRuneSelectorSlotHandler.prototype.OFFENSIVE_RUNE_TOP_RANGE = [1, 12];
NexusCityWorkshopRuneSelectorSlotHandler.prototype.OFFENSIVE_ADVANCED_SLOT_NUMBER = 13;
NexusCityWorkshopRuneSelectorSlotHandler.prototype.OFFENSIVE_RUNE_BOTTOM_RANGE = [14, 21];
NexusCityWorkshopRuneSelectorSlotHandler.prototype.DEFENSIVE_RUNE_TOP_RANGE = [22, 33];
NexusCityWorkshopRuneSelectorSlotHandler.prototype.DEFENSIVE_ADVANCED_SLOT_NUMBER = 34;
NexusCityWorkshopRuneSelectorSlotHandler.prototype.DEFENSIVE_RUNE_BOTTOM_RANGE = [35, 42];
NexusCityWorkshopRuneSelectorSlotHandler.prototype.SHARED_ADVANCED_SLOT_NUMBER = 43;

class NexusCityWorkshopRuneSelectorContainer {
	constructor($container, baseSlotNumber, controller, categoryList, tooltip) {
		this.$container = $container;
		this.controller = controller;

		this.locked = false;
		this.openSlots = false;

		this.entryMap = {};

		this.$container.children(this.SLOT_CLASS).each((i, slot) => {
			let targetSlotNumber = baseSlotNumber + i;
			this.entryMap[targetSlotNumber] = new NexusCityWorkshopRuneSelectorEntry(
				$(slot),
				targetSlotNumber,
				this.IMAGE_SIZE,
				controller,
				this.TARGET_TYPE,
				categoryList
			);
		});

		this.$container.click(() => {
			if (!this.locked && !this.openSlots) {
				tooltip.displayMessage("All rune slots in use, level up avatar to unlock more");
			}
		});
	}

	get allSlotsInUse() {
		return !Object.values(this.entryMap).some((slot) => slot.runeId == null);
	}

	get allRunes() {
		return Object.values(this.entryMap)
			.filter((slot) => slot.runeId != null)
			.map((slot) => slot.runeDescription);
	}

	get slotInUse() {
		return Object.values(this.entryMap).some((slot) => slot.runeId != null);
	}

	clear() {
		Object.values(this.entryMap).forEach((slot) => slot.reset());
	}

	addRune(rune, slot, original) {
		this.entryMap[slot].slotInRune(rune, original);
	}

	updateLocked(locked) {
		if (locked) {
			this.$container.addClass("locked");
			// Object.values(this.entryMap).forEach((slot) => {
			// 	if (slot.runeId) {
			// 		this.controller.unequipSlot(slot, true);
			// 	}
			// });
		} else {
			this.$container.removeClass("locked");
		}

		this.locked = locked;
	}

	updateOpenSlots(openSlots) {
		if (openSlots) {
			this.$container.removeClass("noOpenSlots");
		} else {
			this.$container.addClass("noOpenSlots");
		}
		this.openSlots = openSlots;
	}
}

class NexusCityWorkshopRuneSelectorStandardContainer extends NexusCityWorkshopRuneSelectorContainer {
	constructor($container, baseSlotNumber, controller, categoryList, tooltip) {
		super($container, baseSlotNumber, controller, categoryList, tooltip);
	}
}
NexusCityWorkshopRuneSelectorStandardContainer.prototype.SLOT_CLASS = ".ncwwRuneSetupMinorRuneSlot";
NexusCityWorkshopRuneSelectorStandardContainer.prototype.IMAGE_SIZE = "40px";
NexusCityWorkshopRuneSelectorStandardContainer.prototype.TARGET_TYPE = NEXUS_RUNE_TYPES.STANDARD;

class NexusCityWorkshopRuneSelectorAdvancedContainer extends NexusCityWorkshopRuneSelectorContainer {
	constructor($container, baseSlotNumber, controller, categoryList, tooltip) {
		super($container, baseSlotNumber, controller, categoryList, tooltip);
	}

	get advancedRuneId() {
		let allRunes = this.allRunes;
		return allRunes.length ? allRunes[0].runeId : null;
	}
}
NexusCityWorkshopRuneSelectorAdvancedContainer.prototype.SLOT_CLASS = ".ncwwRuneSetupMajorRuneSlot";
NexusCityWorkshopRuneSelectorAdvancedContainer.prototype.IMAGE_SIZE = "104px";
NexusCityWorkshopRuneSelectorAdvancedContainer.prototype.TARGET_TYPE = NEXUS_RUNE_TYPES.ADVANCED;

class NexusCityWorkshopRuneSlot {
	constructor($body, imageSize) {
		this.$body = $body;
		this.$img = this.$body.find(".ncwwRuneSetupRuneImage");

		this.imageSize = imageSize;

		this.runeId;
		this.runeLevel;

		this.imagePreload;

		this.graceHover;
	}

	slotInRune(rune) {
		if (this.imagePreload) {
			this.imagePreload.cancel();
		}

		this.imagePreload = new PreloadImage(this.$img, rune.src, rune.srcSet, true, this.imageSize);

		this.runeId = rune.runeId;
		this.runeLevel = rune.level;

		this.$body.addClass("activeRune");

		if (this.graceHover) {
			this.graceHover.destroy();
		}

		this.graceHover = new GraceHoverHandler(
			this.$body,
			250,
			50,
			() => {
				nexusRunePopover.displayRune(
					{ name: rune.name, fileName: rune.fileName, description: rune.description, type: rune.type },
					this.$body,
					rune.hoverId
				);
			},
			() => {
				nexusRunePopover.hide(rune.hoverId);
			}
		);
	}

	reset() {
		if (this.imagePreload) {
			this.imagePreload.cancel();
		}

		if (this.graceHover) {
			this.graceHover.destroy();
			this.graceHover = null;
		}

		this.$body.removeClass("activeRune");

		this.$img.attr("src", "").attr("srcset", "");

		this.runeId = null;
		this.runeLevel = null;
	}
}

class NexusCityWorkshopRuneSelectorEntry extends NexusCityWorkshopRuneSlot {
	constructor($body, slotNumber, imageSize, controller, targetType, targetCategoryList) {
		super($body, imageSize);
		this.slotNumber = slotNumber;
		this.targetType = targetType;
		this.targetCategoryList = targetCategoryList;

		this.newRune = false;

		this.originalRuneId;
		this.originalRuneLevel;

		this.$body.click((event) => {
			if (this.runeId) {
				if (this.newRune) {
					controller.unequipSlot(this);
				} else {
					displayOption("Destroy Rune?", null, "Destroy", "Cancel", () => {
						controller.unequipSlot(this);
					});
				}
			} else {
				controller.slotInRune(this);
			}
			event.stopPropagation();
		});
	}

	get runeDescription() {
		return {
			runeId: this.runeId,
			level: this.runeLevel,
			slot: this.slotNumber,
		};
	}

	get typeName() {
		if (this.targetType === NEXUS_RUNE_TYPES.STANDARD) {
			return "Standard";
		} else {
			return "Advanced";
		}
	}

	get categoryName() {
		if (this.targetCategoryList.length > 1) {
			return "Any";
		} else if (this.targetCategoryList[0] === NEXUS_RUNE_CATEGORIES.OFFENSIVE) {
			return "Offensive";
		} else {
			return "Defensive";
		}
	}

	canEquipRune(rune) {
		return rune.type === this.targetType && this.targetCategoryList.includes(rune.category);
	}

	slotInRune(rune, original) {
		super.slotInRune(rune);
		if (original) {
			this.originalRuneId = rune.runeId;
			this.originalRuneLevel = rune.level;
		}
	}

	slotInNewRune(rune) {
		if (this.originalRuneId === rune.runeId && this.originalRuneLevel === rune.level) {
			this.newRune = false;
			this.$img.removeClass("newInSlot");
		} else {
			this.newRune = true;
			this.$img.addClass("newInSlot");
		}
		this.slotInRune(rune);
	}

	clear() {
		super.reset();

		this.$img.removeClass("newInSlot");
		this.newRune = false;
	}

	reset() {
		this.clear();
		this.originalRuneId = null;
		this.originalRuneLevel = null;
	}
}

class NexusCityWorkshopRuneSetupTooltip {
	constructor($container) {
		this.$tooltip = $container.find("#ncwwRuneSetupTooltipPopup");
		this.$tooltipText = this.$tooltip.find("div");
		this.hideTimeout;
	}

	displayMessage(message) {
		if (this.hideTimeout) {
			clearTimeout(this.hideTimeout);
		}
		this.$tooltipText.text(message);
		this.$tooltip.addClass("display");
		this.hideTimeout = setTimeout(() => {
			this.hide();
		}, this.DISPLAY_TIME);
	}

	hide() {
		this.$tooltip.removeClass("display");
	}
}
NexusCityWorkshopRuneSetupTooltip.prototype.DISPLAY_TIME = 2000; //ms
