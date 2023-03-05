"use strict";
/*exported NexusCityWorkshopRuneReformaterTab*/

class NexusCityWorkshopRuneReformaterTab extends NexusCityWindowTab {
	constructor(window, runeSelector) {
		super(
			window,
			window.$window.find("#ncwwRuneReformaterContainer"),
			window.$window.find("#ncwwRuneReformaterRightColumn"),
			window.$window.find("#ncwwRuneReformaterTab")
		);
		this.$outerContainer = window.$window.find("#ncwwLeftRuneTabTypeContainer");

		this.slotHandler = new NexusCityWorkshopRuneReformaterSlotHandler(this.$leftContainer, this);
		this.successContainer = new NexusCityWorkshopRuneReformaterSuccessRateContainer(this.$leftContainer);

		this.duplicateButton = new NexusCityWindowButton(
			this.$leftContainer.find("#ncwwRuneReformaterDuplicateButton"),
			() => {
				socket.sendCommand({
					type: "nexus",
					command: "nexus reformat rune",
					data: {
						sacRunes: this.slotHandler.sacRuneInfo,
						targetRune: this.slotHandler.mainSlotRuneInfo,
						upgrade: false,
					},
				});
			},
			"Attempt to duplicate the target rune"
		);

		this.upgradeButton = new NexusCityWindowButton(
			this.$leftContainer.find("#ncwwRuneReformaterUpgradeButton"),
			() => {
				socket.sendCommand({
					type: "nexus",
					command: "nexus reformat rune",
					data: {
						sacRunes: this.slotHandler.sacRuneInfo,
						targetRune: this.slotHandler.mainSlotRuneInfo,
						upgrade: true,
					},
				});
			},
			"Attempt to level up the target rune"
		);

		this.runeSelector = runeSelector;
	}

	show() {
		super.show();
		this.$outerContainer.removeClass("hide");
		this.runeSelector.changeToExpandedSize();
		this.runeSelector.loadImages();
	}

	hide() {
		super.hide();
		this.$outerContainer.addClass("hide");
	}

	slotInRune(slot) {
		let targetRune = this.runeSelector.selectedRune;
		if (targetRune) {
			slot.slotInRune(targetRune);
			targetRune.slottedIn();
			if (slot.mainSlot) {
				this.slotHandler.unlockSacSlots();
			}

			this.updateSuccessRate();
		}
	}

	unequipSlot(slot) {
		if (slot.runeId) {
			this.runeSelector.runeUnequiped(slot.runeId, slot.runeLevel);
			slot.reset();
			if (slot.mainSlot) {
				this.slotHandler.lockSacSlots();
			}

			this.updateSuccessRate();
		}
	}

	updateSuccessRate() {
		if (this.slotHandler.mainSlotInUse) {
			let successRate = this.slotHandler.calculateSuccessRate();
			this.successContainer.setSuccessPercent(successRate);
			if (successRate > 0) {
				this.duplicateButton.enable();
				if (this.slotHandler.mainSlot.runeLevel < this.MAX_LEVEL_FOR_UPGRADING) {
					this.upgradeButton.enable();
				}
			} else {
				this.duplicateButton.disable();
				this.upgradeButton.disable();
			}
		} else {
			this.successContainer.reset();
			this.duplicateButton.disable();
			this.upgradeButton.disable();
		}
	}

	reset() {
		this.slotHandler.reset();
		this.updateSuccessRate();
		this.slotHandler.lockSacSlots();
	}
}
NexusCityWorkshopRuneReformaterTab.prototype.MAX_LEVEL_FOR_UPGRADING = 5;

class NexusCityWorkshopRuneReformaterSlotHandler {
	constructor($container, controller) {
		this.sacSlots = [];
		$container.find(".ncwwRuneReformaterSacRune").each((index, element) => {
			this.sacSlots.push(new NexusCityWorkshopRuneReformaterSlot($(element), "56px", controller));
		});

		this.mainSlot = new NexusCityWorkshopRuneReformaterSlot(
			$container.find("#ncwwRuneReformaterTargetRuneContainer"),
			"104px",
			controller,
			true
		);
	}

	get sacRuneInfo() {
		return this.sacSlots.filter((slot) => slot.runeId != null).map((slot) => slot.runeInfo);
	}

	get mainSlotRuneInfo() {
		return this.mainSlot.runeInfo;
	}

	get mainSlotInUse() {
		return this.mainSlot.runeId != null;
	}

	unlockSacSlots() {
		this.sacSlots.forEach((slot) => slot.unlock());
	}

	lockSacSlots() {
		this.sacSlots.forEach((slot) => slot.lock());
	}

	calculateSuccessRate() {
		let targetLevel = this.mainSlot.runeLevel;

		let chance = 0;
		this.sacSlots.forEach((slot) => {
			if (slot.runeLevel) {
				let levelDiff = slot.runeLevel - targetLevel;
				if (levelDiff === 0) {
					chance += this.BASE_CHANCE_PERCENT;
				} else if (levelDiff > 0) {
					chance += this.BASE_CHANCE_PERCENT * (levelDiff + 1);
				} else if (levelDiff < 0) {
					chance += this.BASE_CHANCE_PERCENT * Math.pow(0.5, Math.abs(levelDiff));
				}
			}
		});
		if (chance > 100) {
			chance = 100;
		}

		return Math.round(chance);
	}

	reset() {
		this.sacSlots.forEach((slot) => slot.reset());
		this.mainSlot.reset();
	}
}
NexusCityWorkshopRuneReformaterSlotHandler.prototype.BASE_CHANCE_PERCENT = 20;

class NexusCityWorkshopRuneReformaterSlot extends NexusCityWorkshopRuneSlot {
	constructor($body, imageSize, controller, mainSlot) {
		super($body, imageSize);
		this.mainSlot = mainSlot;

		this.$body.click(() => {
			if (this.runeId) {
				controller.unequipSlot(this);
			} else {
				controller.slotInRune(this);
			}
		});
	}

	get runeInfo() {
		return {
			runeId: this.runeId,
			level: this.runeLevel,
		};
	}

	unlock() {
		this.$body.removeClass("locked");
	}

	lock() {
		this.$body.addClass("locked");
	}
}

class NexusCityWorkshopRuneReformaterSuccessRateContainer {
	constructor($container) {
		this.$successText = $container.find("#ncwwRuneReformaterChanceCounterNumber");
	}

	setSuccessPercent(percent) {
		this.$successText.text(`${percent}%`);
	}

	reset() {
		this.$successText.html("&#8213;");
	}
}
