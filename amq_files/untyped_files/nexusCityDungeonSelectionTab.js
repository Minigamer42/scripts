"use strict";
/*exported NexusDungeonSelectionTab*/

class NexusDungeonSelectionTab extends NexusCityWindowTab {
	constructor(window) {
		super(
			window,
			window.$window.find("#ncdwLeftModeSelectionContainer"),
			window.$window.find("#ncdwRightModeSelectionContainer"),
			window.$window.find("#ncdwModeTab")
		);
		this.$standardContainer = this.$leftContainer.find("#ncdwStandardModeContainer");

		this.standardModeSelectionEntry = new NexusDungeonModeSelectionEntry(
			this.$leftContainer.find("#ncdwStandardModeContainer"),
			this.DUNGEON_TYPE_IDS.STANDARD
		);

		this._nexusClearSoloStateListener = new Listener("nexus clear solo state", () => {
			this.standardModeSelectionEntry.toggleSoloContinue(false);
		});
		this._nexusClearSoloStateListener.bindListener();
	}

	show() {
		this.reset();
		super.show();
	}

	reset() {
		this.standardModeSelectionEntry.reset();
	}

	updateState(nexusStandardSoloGotState) {
		this.standardModeSelectionEntry.toggleSoloContinue(nexusStandardSoloGotState);
	}
}

NexusDungeonSelectionTab.prototype.DUNGEON_TYPE_IDS = {
	STANDARD: 1,
	ENDLESS: 2,
};

class NexusDungeonModeSelectionEntry {
	constructor($container, typeId) {
		this.$container = $container;
		this.$soloButton = $container.find(".ncdwTypeSolo");
		this.$coopButton = $container.find(".ncdwTypeCoOp");

		this.$coopHostButton = $container.find(".ncdwTypeCoopHostButton");
		this.$coopJoinButton = $container.find(".ncdwTypeCoopJoinButton");
		this.$coopBackButton = $container.find(".ncdwTypeCoopBackButton");

		this.soloContinueText = this.$soloButton.find(".ncdwContinueText");

		this.typeId = typeId;

		this.$soloButton.click(() => {
			this.initDungeonLobby(this.typeId, false);
		});

		this.$coopButton.click(() => {
			this.$container.addClass("coopMenu");
		});

		this.$coopHostButton.click((event) => {
			this.initDungeonLobby(this.typeId, true);
			event.stopPropagation();
		});

		this.$coopBackButton.click((event) => {
			this.reset();
			event.stopPropagation();
		});

		this.$coopJoinButton.click(event => {
			swal({
				title: "Lobby ID",
				text: "Enter the id for the lobby you want to join",
				input: "text",
				inputPlaceholder: "Lobby id",
				inputValidator: (value) => {
					if (!value) {
						return "You must provide a lobby id";
					} else if (value.length > this.LOBBY_ID_MAX_LENGTH || value.length < this.LOBBY_ID_MIN_LENGTH) {
						return "Invalid lobby id";
					}
					return false;
				},
				showCancelButton: true,
				confirmButtonColor: "#204d74",
				confirmButtonText: "Join",
			}).then((result) => {
				socket.sendCommand({
					type: "nexus",
					command: "join dungeon lobby",
					data: {
						lobbyId: result.value,
					},
				});
			});
			event.stopPropagation();
		});
	}

	toggleSoloContinue(toggleOn) {
		if(toggleOn) {
			this.soloContinueText.removeClass("hide");
		} else {
			this.soloContinueText.addClass("hide");
		}
	}

	initDungeonLobby(typeId, coop) {
		socket.sendCommand({
			type: "nexus",
			command: "setup dungeon lobby",
			data: {
				typeId,
				coop,
			},
		});
	}

	reset() {
		this.$container.removeClass("coopMenu");
	}
}
NexusDungeonModeSelectionEntry.prototype.LOBBY_ID_MAX_LENGTH = 6;
NexusDungeonModeSelectionEntry.prototype.LOBBY_ID_MIN_LENGTH = 5;