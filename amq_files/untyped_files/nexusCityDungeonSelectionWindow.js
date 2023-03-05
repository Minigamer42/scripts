"use strict";
/*exported NexusCityDungeonSelectionWindow*/

class NexusCityDungeonSelectionWindow extends NexusCityWindow {
	constructor(statBaseMax) {
		super($("#nexusCityDungeonWindow"));

		this.currentSelectionTargetSlotNumber = null;

		this.avatarInfoDisplay = new NexusCityAvatarInfoDisplay(
			this.$window.find("#ncdwAvatarSelectionContainer"),
			statBaseMax,
			true
		);

		this.modeSelectionTab = new NexusDungeonSelectionTab(this);
		this.dungeonSetupTab = new NexusCityDungeonSetupTab(this);
		this.avatarSelectionTab = new NexusCityDungeonAvatarSelector(this);
		this.teamSelectionTab = new NexusCityDungeonTeamSelectTab(this);
		this.badgeSelectionTab = new NexusCityBadgeSelector(
			this,
			this.$window.find("#ncdwLeftBadgeSelectorContainer"),
			this.$window.find("#ncdwBadgeSelectionContainer"),
			this.$window.find("#ncdwSetuprTab"),
			(badgeEntry) => {
				this.selectBadge(badgeEntry.avatarId);
			},
			() => {
				this.clearSelectedSlotsBadge();
			}
		);

		this.activeLobby = false;

		this._joinNexusLobbyListener = new Listener("join nexus lobby", (payload) => {
			this.setupDungeonInfo(payload);
		});
		this._joinNexusLobbyListener.bindListener();

		this._nexusLobbyAvatarChangeListener = new Listener("nexus lobby avatar change", (payload) => {
			let { removedCharacterIds, newCharacterIds } = this.dungeonSetupTab.avatarChange(
				payload.clearTileSlots,
				payload.newAvatarSlots
			);
			this.changeTab(this.dungeonSetupTab);
			this.badgeSelectionTab.updateActiveCharacters(removedCharacterIds, newCharacterIds);
		});
		this._nexusLobbyAvatarChangeListener.bindListener();

		this._nexusLobbyBadgeChangeListener = new Listener("nexus lobby badge change", (payload) => {
			this.dungeonSetupTab.badgeChange(payload.clearBadgeSlots, payload.newBadgeSlots);
			this.changeTab(this.dungeonSetupTab);
		});
		this._nexusLobbyBadgeChangeListener.bindListener();

		this._unlockAvatarListener = new Listener("unlock avatar", (payload) => {
			if (this.activeLobby && payload.nexusUpdates) {
				this.avatarSelectionTab.avatarUnlocks(payload.nexusUpdates);
			}
		});
		this._unlockAvatarListener.bindListener();

		this._leaveDungeonLobbyListener = new Listener("leave dungeon lobby", () => {
			this.activeLobby = false;
			this.changeTab(this.modeSelectionTab);
			this.dungeonSetupTab.reset();
			nexusCoopChat.hide();
		});
		this._leaveDungeonLobbyListener.bindListener();

		this._nexusDungeonFinishedListener = new Listener("nexus dungeon finished", (payload) => {
			let { newLevelInfo, newBadgeInfoList, rotationAvatarIds } = payload;
			newLevelInfo.forEach(({ level, avatarId, baseStats, playerName }) => {
				if (playerName === selfName) {
					this.avatarSelectionTab.updateAvatarInfo(avatarId, level, baseStats);
				}
			});
			this.avatarSelectionTab.updateRotationAvatars(rotationAvatarIds);
			let newBadgeInfo = newBadgeInfoList.filter((badgeInfo) => badgeInfo.playerName === selfName);
			if (newBadgeInfo.length > 0) {
				this.badgeSelectionTab.updateBadges(newBadgeInfo);
			}
			this.avatarSelectionTab.updateAvatarOrder();
			this.teamSelectionTab.updateAvatarLevels(newLevelInfo);
		});
		this._nexusDungeonFinishedListener.bindListener();

		this._exitNexusGame = new Listener("exit nexus game", () => {
			this.activeLobby = false;
			this.changeTab(this.modeSelectionTab);
			this.dungeonSetupTab.reset();
			nexusCoopChat.hide();
			this.close();
		});
		this._exitNexusGame.bindListener();

		this._nexusDungeonWindowInfoListener = new Listener("nexus dungeon window info", (payload) => {
			this.modeSelectionTab.updateState(payload.gotSoloState);
			this.dungeonSetupTab.updateFloorProgress(payload.floorProgress);
			this.open();
			if (payload.coopRejoin) {
				displayOption(
					"Rejoin Nexus Co-op Game?",
					"If you start another game, you won't be able to rejoin the co-op game.",
					"Rejoin",
					"Cancel",
					() => {
						nexus.displayLoading();
						nexus.changeToDungeon();
						nexus.cityController.loadNexusCityContent(() => {
							socket.sendCommand({
								command: "rejoin nexus game",
								type: "nexus",
							});
						});
					},
					() => {},
					true
				);
			}
		});
		this._nexusDungeonWindowInfoListener.bindListener();

		this._nexusUpdateLobbyPlayerSlotsListener = new Listener("nexus update lobby player slots", (payload) => {
			if (payload.clearedCharacterIds.length) {
				this.badgeSelectionTab.updateActiveCharacters(payload.clearedCharacterIds, []);
			}
		});
		this._nexusUpdateLobbyPlayerSlotsListener.bindListener();
	}

	setupDungeonInfo({ lobbyId, slotsInfo, avatarInfoList, teams, players, hostName, settings, badges }) {
		if (viewChanger.currentView !== "nexus") {
			viewChanger.changeView("nexus");
		}
		if (!this.isOpen) {
			this.open();
		}

		this.activeLobby = true;
		this.dungeonSetupTab.setupLayout(lobbyId, slotsInfo);
		this.changeTab(this.dungeonSetupTab);
		this.avatarSelectionTab.displayAvatars(avatarInfoList);
		this.badgeSelectionTab.displayBadges(badges);

		if (teams) {
			this.teamSelectionTab.setupTeams(teams);
		}
		if (lobbyId) {
			nexusCoopChat.setupPlayers(players, hostName);
			nexusCoopChat.show();
			if (hostName !== selfName) {
				this.dungeonSetupTab.disableSettings();
			} else {
				this.dungeonSetupTab.sendSettingUpdate();
			}
		}
		if (settings) {
			this.dungeonSetupTab.updateSettings(settings);
		}
	}

	setupDungeonLobby(typeId, coop) {
		let type = coop ? "Co-op" : "Solo";
		this.changeToConfigView(type);
	}

	changeToConfigView(type) {
		this.configView.type = type;

		this.changeTab(this.dungeonSetupTab);
		this.configView.relayout();
	}

	changeToTeamSelectionView() {
		this.changeTab(this.teamSelectionTab);
		this.enableBackForTab(() => {
			this.changeTab(this.dungeonSetupTab);
		});
	}

	trigger() {
		socket.sendCommand({
			type: "nexus",
			command: "nexus open dungeon window",
		});
	}

	open() {
		super.open();
		this.changeTab(this.modeSelectionTab);
		if(!tutorial.state.nexusDungeonMode) {
			nexusTutorialController.startDungeonModeTutorial(this.modeSelectionTab);
		}
	}

	displayAvatarSelection(targetSlotNumber, displayClear) {
		this.currentSelectionTargetSlotNumber = targetSlotNumber;
		if (displayClear) {
			this.avatarSelectionTab.displayClear();
		}
		this.changeTab(this.avatarSelectionTab);
		this.enableBackForTab(() => {
			this.changeTab(this.dungeonSetupTab);
		});
	}

	displayBadgeSelection(targetSlotNumber, displayClear) {
		if (this.badgeSelectionTab.gotBadges) {
			this.currentSelectionTargetSlotNumber = targetSlotNumber;
			if (displayClear) {
				this.badgeSelectionTab.displayClear();
			}
			this.changeTab(this.badgeSelectionTab);
			this.enableBackForTab(() => {
				this.changeTab(this.dungeonSetupTab);
			});
		} else {
			displayMessage(
				"No Avatar Badges Unlocked",
				"Unlock avatar badges by leveling up avatars, and user them to power up other avatars"
			);
		}
	}

	selectAvatar(avatarId) {
		socket.sendCommand({
			type: "nexus",
			command: "dungeon lobby select avatar",
			data: {
				avatarId: avatarId,
				slot: this.currentSelectionTargetSlotNumber,
			},
		});
	}

	selectBadge(avatarId) {
		socket.sendCommand({
			type: "nexus",
			command: "dungeon lobby select badge",
			data: {
				avatarId: avatarId,
				slot: this.currentSelectionTargetSlotNumber,
			},
		});
	}

	clearSelectedSlot() {
		socket.sendCommand({
			type: "nexus",
			command: "dungeon lobby clear avatar",
			data: {
				slot: this.currentSelectionTargetSlotNumber,
			},
		});
	}

	clearSelectedSlotsBadge() {
		socket.sendCommand({
			type: "nexus",
			command: "dungeon lobby clear badge",
			data: {
				slot: this.currentSelectionTargetSlotNumber,
			},
		});
	}

	leaveLobby() {
		socket.sendCommand({
			type: "nexus",
			command: "leave dungeon lobby",
		});
	}

	close() {
		if (this.activeLobby) {
			displayOption("Leave Dungeon Lobby?", null, "Leave", "Cancel", () => {
				super.close();
				this.leaveLobby();
			});
		} else {
			super.close();
		}
	}

	changeTab(newTab) {
		if (this.activeLobby && newTab === this.modeSelectionTab) {
			displayOption("Leave Dungeon Lobby?", null, "Leave", "Cancel", () => {
				this.leaveLobby();
			});
		} else {
			super.changeTab(newTab);
		}
	}
}
NexusCityDungeonSelectionWindow.prototype.DUNGEON_TYPE_IDS = {
	STANDARD: 1,
	ENDLESS: 2,
};

class NexusCityDungeonAvatarEntry extends NexusCityAvatarEntry {
	constructor(avatarDescription, $container, hoverCallback, clickCallback) {
		super(avatarDescription, $container, hoverCallback, clickCallback);

		this.$freeWeekIcon = this.$body.find(".nexusCityAvatarSelectorAvatarFreeWeekIcon");

		this.freeWeek = avatarDescription.freeWeek;

		if (this.freeWeek && this._locked) {
			this.$body.removeClass("locked");
			this.$body.click(() => {
				this.clickCallback(this);
			});
		}

		if (this.freeWeek) {
			this.$freeWeekIcon.removeClass("hide");
			this.$freeWeekIcon.popover({
				content: "Free Rotation",
				delay: 50,
				container: "#nexusCityDungeonWindow",
				placement: "top",
				trigger: "hover",
			});
		}

		if(this.earlyAccess && !this._locked && patreon.backerLevel < this.PATREON_LEVLE_FOR_EARLY_ACCESS) {
			this.$body.addClass("locked");
			this.$body.off("click");
		} else if(this.earlyAccess && this._locked && patreon.backerLevel >= this.PATREON_LEVLE_FOR_EARLY_ACCESS) {
			this.$body.removeClass("locked");
			this.$body.click(() => {
				this.clickCallback(this);
			});
		}
	}

	updateFreeWeek(freeWeek) {
		if(this.freeWeek === freeWeek) {
			return;
		}
		this.freeWeek = freeWeek;

		if (this.locked) {
			this.$body.addClass("locked");
			this.$body.off("click");
		} else {
			this.$body.removeClass("locked");
			this.$body.click(() => {
				this.clickCallback(this);
			});
		}

		if (this.freeWeek) {
			this.$freeWeekIcon.removeClass("hide");
			this.$freeWeekIcon.popover({
				content: "Free Rotation",
				delay: 50,
				container: "#nexusCityDungeonWindow",
				placement: "top",
				trigger: "hover",
			});
		} else {
			this.$freeWeekIcon.addClass("hide");
			this.$freeWeekIcon.popover("destroy");
		}
	}

	get locked() {
		return this._locked && !this.freeWeek;
	}

	set locked(value) {
		this._locked = value;
	}
}

class NexusCityDungeonAvatarSelector extends NexusCityAvatarSelector {
	constructor(window) {
		super(window,
			window.$window.find("#ncdwLeftAvatarSelectorContainer"),
			window.$window.find("#ncdwAvatarSelectionContainer"),
			window.$window.find("#ncdwAvatarSelectionTab"),
			window.avatarInfoDisplay,
			NexusCityDungeonAvatarEntry,
			(avatarEntry) => {
				window.selectAvatar(avatarEntry.avatarId);
			},
			[],
			true,
			() => {
				window.clearSelectedSlot();
			},
			true);
	}

	show(noChangeHighlightTab) {
		super.show(noChangeHighlightTab);
		if(!tutorial.state.nexusAvatarSelection) {
			nexusTutorialController.startDungeonAvatarSelectionTutorial(this);
		}
	}

	updateRotationAvatars(rotationAvatarIds) {
		let changes = false;
		this.entryList.filter(entry => entry.freeWeek).forEach(entry => {
			if (!rotationAvatarIds.includes(entry.avatarId)) {
				entry.updateFreeWeek(false);
				changes = true;
			}
		});
		if(changes) {
			this.entryList.filter(entry => rotationAvatarIds.includes(entry.avatarId)).forEach(entry => {
				entry.updateFreeWeek(true);
			});
		}
	}
}