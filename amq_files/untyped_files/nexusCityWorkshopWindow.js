"use strict";
/*exported NexusCityWorkshopWindow*/

class NexusCityWorkshopWindow extends NexusCityWindow {
	constructor(statBaseMax) {
		super($("#nexusCitWorkshopWindow"));

		this.runeSelector = new NexusCityWorkshopRuneSelector(this.$window);
		this.avatarSelector = new NexusCityWorkshopAvatarSelector(this);
		this.runeSetupTab = new NexusCityWorkshopRuneSetupTab(this, statBaseMax, this.runeSelector);
		this.runeReformaterTab = new NexusCityWorkshopRuneReformaterTab(this, this.runeSelector);

		this.runes = {};

		this.$window.bind("transitionend", () => {
			if (this.isOpen) {
				this.avatarSelector.triggerImageLoads();
			}
		});

		this._nexusWorkshopBaseInfoListener = new Listener("nexus workshop base info", (payload) => {
			this.avatarSelector.displayAvatars(payload.avatars);
			this.runeSelector.setupRunes(payload.runes);
			this.open();
		});
		this._nexusWorkshopBaseInfoListener.bindListener();

		this._runePageUpdateListener = new Listener("nexus workshop rune page update", (payload) => {
			if (payload.error) {
				displayMessage("Unexpected Error Saving Rune Page");
			} else {
				this.runeSelector.updateRunes(payload.deletedRunes, payload.updatedRunes);
				this.avatarSelector.updateAvatarRunes(payload.avatarId, payload.avatarRunes, payload.emptyRuneSlots);
				if (this.runeSetupTab.avatarId === payload.avatarId) {
					this.runeSetupTab.newRuneLayout(payload.avatarRunes, payload.emptyRuneSlots);
				}
			}
		});
		this._runePageUpdateListener.bindListener();

		this._clearRunePageListener = new Listener("nexus clear rune page", (payload) => {
			if (payload.error) {
				displayMessage("Unexpected Error Clearing Rune Page");
			} else {
				this.runeSelector.clearedRunePage(payload.uneqipedRuneInfo, payload.avatarId);
				this.avatarSelector.updateAvatarRunes(payload.avatarId, [], payload.emptyRuneSlotCount);
				if (this.runeSetupTab.avatarId === payload.avatarId) {
					this.runeSetupTab.newRuneLayout([], payload.emptyRuneSlotCount);
				}
				xpBar.setTickets(payload.ticketCount);
			}
		});
		this._clearRunePageListener.bindListener();

		this._reformatRunesListener = new Listener("nexus reformat runes", (payload) => {
			if (payload.error) {
				displayMessage("Unexpected Error Reformating Runes");
			} else {
				this.runeSelector.updateRuneAmounts(payload.deletedRunes, payload.updatedRunes, payload.newRune, true);
				if (payload.newRune) {
					this.runeSelector.loadImages();
				}
				let action = payload.upgrade ? "Upgrade" : "Duplicate";
				if (payload.success) {
					displayMessage(`Rune ${action} Succeeded`, null, () => {
						this.runeReformaterTab.reset();
					});
				} else {
					displayMessage(`Rune ${action} Failed`, null, () => {
						this.runeReformaterTab.reset();
					});
				}
			}
		});
		this._reformatRunesListener.bindListener();

		this._unlockAvatarListener = new Listener("unlock avatar", (payload) => {
			if (this.activeLobby && payload.nexusUpdates) {
				this.avatarSelectionTab.avatarUnlocks(payload.nexusUpdates);
			}
		});
	}

	trigger() {
		socket.sendCommand({
			type: "nexus",
			command: "nexus open workshop",
		});
	}

	open() {
		super.open();
		this.changeTab(this.avatarSelector);
		this._unlockAvatarListener.bindListener();
		if (!tutorial.state.nexusWorkshop) {
			nexusTutorialController.startWorkshopTutorial(this.runeReformaterTab.$tab);
		}
	}

	close() {
		super.close();
		this._unlockAvatarListener.unbindListener();
	}

	executeClose() {
		super.executeClose();
		this.avatarSelector.reset();
		this.runeSetupTab.reset();
	}

	displayRuneSetup(avatarInfo) {
		this.runeSetupTab.displayAvatar(avatarInfo);
		this.changeTab(this.runeSetupTab);
	}
}
