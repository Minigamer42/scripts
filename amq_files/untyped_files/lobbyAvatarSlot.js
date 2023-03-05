"use strict";
/*exported LobbyAvatarSlot*/

class LobbyAvatarSlot {
	constructor(avatarInfo, playerName, playerLevel, isReady, isHost, isSelf, teamNumber, numberOfTeams, teamFullMap) {
		this.$LOBBY_SLOT = $(this.SLOT_TEMPLATE);
		this.$NAME_OUTER_CONTAINER = this.$LOBBY_SLOT.find(".lobbyAvatarNameContainerInner");
		this.$NAME_CONTAINER = this.$LOBBY_SLOT.find(".lobbyAvatarNameContainerInner > h2");
		this.$LEVEL_CONTAINER = this.$LOBBY_SLOT.find(".lobbyAvatarLevelContainer > .lobbyAvatarSubTextContainer > h3");
		this.$IS_HOST_CONTAINER = this.$LOBBY_SLOT.find(".lobbyAvatarHostContainer > .lobbyAvatarHostSubTextContainer");
		this.$HOST_OPTIONS = this.$LOBBY_SLOT.find(".lobbyAvatarHostOptions");
		this.$AVATAR_IMAGE = this.$LOBBY_SLOT.find(".lobbyAvatarImg");
		this.$TEAM_DISPLAY = this.$LOBBY_SLOT.find(".lobbyAvatarTeamContainer");
		this.$TEAM_DISPLAY_TEXT = this.$TEAM_DISPLAY.find("h3");

		this._name;
		this._isHost;
		this.isSelf = isSelf;

		this.avatar = avatarInfo;
		this.name = playerName;
		this.level = playerLevel;
		this.ready = isReady;
		this.isHost = isHost;

		this.$TEAM_DISPLAY.popover({
			content: 'Team',
			container: '#lobbyPage',
			placement: 'top',
			trigger: 'hover'
		});

		this.teamController;
		if (isSelf) {
			this.$LOBBY_SLOT.addClass("isSelf");
			this.teamController = new LobbyAvatarTeamController(this.$LOBBY_SLOT, numberOfTeams, teamFullMap, isHost);
		}

		this.numberOfTeams = numberOfTeams;
		this.teamNumber = teamNumber;
	}

	set name(newName) {
		this._name = newName;
		this.$NAME_CONTAINER.text(newName);
		if (!this.isSelf) {
			setTimeout(() => {
				this.setupAvatarOptions();
			}, 1);
		}
	}
	get name() {
		return this._name;
	}
	set level(newLevel) {
		this.$LEVEL_CONTAINER.text(newLevel);
	}
	set ready(isReady) {
		if (isReady) {
			this.$LOBBY_SLOT.addClass("lbReady");
		} else {
			this.$LOBBY_SLOT.removeClass("lbReady");
		}
	}
	set isHost(isHost) {
		this._isHost = isHost;
		if (isHost) {
			this.$IS_HOST_CONTAINER.removeClass("hide");
		} else {
			this.$IS_HOST_CONTAINER.addClass("hide");
		}
		if(this.teamController) {
			this.teamController.isHost = isHost;
		}
	}
	get isHost() {
		return this._isHost;
	}
	set avatar(avatarInfo) {
		if (avatarInfo) {
			let avatar = avatarInfo.avatar;
			this.$AVATAR_IMAGE
				.attr(
					"srcset",
					cdnFormater.newAvatarHeadSrcSet(
						avatar.avatarName,
						avatar.outfitName,
						avatar.optionName,
						avatar.optionActive,
						avatar.colorName
					)
				)
				.attr(
					"src",
					cdnFormater.newAvatarHeadSrc(
						avatar.avatarName,
						avatar.outfitName,
						avatar.optionName,
						avatar.optionActive,
						avatar.colorName
					)
				);
		} else {
			this.$AVATAR_IMAGE.attr("srcset", "").attr("src", "");
		}
	}
	set hostOptionsActive(active) {
		if (active) {
			this.$HOST_OPTIONS.removeClass("hide");
		} else {
			this.$HOST_OPTIONS.addClass("hide");
		}
	}

	set teamNumber(newValue) {
		if (newValue) {
			this.$TEAM_DISPLAY_TEXT.text(newValue);
			if (this.teamController) {
				this.teamController.setActiveNumber(newValue);
			}
		} else {
			this.$TEAM_DISPLAY_TEXT.text("Team");
			if (this.teamController) {
				this.teamController.clearActiveNumber();
			}
		}
	}

	set numberOfTeams(newValue) {
		if (newValue) {
			this.$TEAM_DISPLAY.removeClass("hide");

			if (this.teamController) {
				this.teamController.updateNumberOfTeams(newValue);
			}
			this.teamNumber = this.isHost ? 1 : null;
		} else {
			this.$TEAM_DISPLAY.addClass("hide");
		}
	}

	setupAvatarOptions() {
		let $profileIcon = this.$LOBBY_SLOT.find(".playerCommandProfileIcon");
		$profileIcon
			.click(() => {
				playerProfileController.loadProfileIfClosed(this.name, $profileIcon, { x: 7 }, () => {}, false, true);
			})
			.tooltip({
				placement: "top",
				title: "Profile",
				container: "#lobbyPage",
			});
		this.$LOBBY_SLOT
			.find(".playerCommandIconPromote")
			.click(() => {
				lobby.promoteHost(this.name);
			})
			.tooltip({
				placement: "top",
				title: "Promote Host",
				container: "#lobbyPage",
			});
		this.$LOBBY_SLOT
			.find(".playerCommandIconChangeSpec")
			.click(() => {
				lobby.changeToSpectator(this.name);
			})
			.tooltip({
				placement: "top",
				title: "Change to Spectator",
				container: "#lobbyPage",
			});
		this.$LOBBY_SLOT
			.find(".playerCommandIconKick")
			.click(() => {
				lobby.kickPlayer(this.name);
			})
			.tooltip({
				placement: "top",
				title: "Kick",
				container: "#lobbyPage",
			});
	}

	remove() {
		this.$LOBBY_SLOT.remove();
	}

	updateLayout() {
		setTimeout(() => {
			fitTextToContainer(this.$NAME_CONTAINER, this.$NAME_OUTER_CONTAINER, 30, 12);
		}, 1);
	}

	setTeamFull(teamNumber, isFull) {
		if(this.teamController) {
			this.teamController.setTeamFull(teamNumber, isFull);
		}
	}
}
LobbyAvatarSlot.prototype.SLOT_TEMPLATE = $("#lobbyAvatarTemplate").html();

class LobbyAvatarTeamController {
	constructor($lobbySlot, numberOfTeams, teamFullMap, isHost) {
		this.$teamDisplay = $lobbySlot.find(".lobbyAvatarTeamContainer");
		this.$teamNumberContainer = $lobbySlot.find(".lobbyAvatarTeamSelector");
		this.$unsetOption = $lobbySlot.find('.lobbyAvatarTeamSelectorUnset');

		this.isHost = isHost;

		this.activeNumber;
		this.numberMap = {};

		this.updateNumberOfTeams(numberOfTeams);

		if (teamFullMap) {
			Object.keys(teamFullMap).forEach((teamNumber) => {
				this.setTeamFull(teamNumber, teamFullMap[teamNumber]);
			});
		}

		this.hideTimeout;
		this.$teamDisplay.hover(
			() => {
				clearTimeout(this.hideTimeout);
				this.$teamNumberContainer.addClass("show");
			},
			() => {
				setTimeout(() => {
					this.hideTimeout = this.$teamNumberContainer.removeClass("show");
				}, 200);
			}
		);

		this.$unsetOption.click(() => {
			socket.sendCommand({
				type: "lobby",
				command: "leave team",
			});
		});
	}

	set isHost(isHost) {
		if(isHost) {
			this.$unsetOption.addClass('hide');
		} else {
			this.$unsetOption.removeClass('hide');
		}
	}

	updateNumberOfTeams(numberOfTeams) {
		Object.values(this.numberMap).forEach((teamNumber) => teamNumber.remove());
		this.numberMap = {};
		for (let i = 1; i <= numberOfTeams; i++) {
			let teamNumber = new LobbyAvatarTeamNumber(i);
			this.numberMap[i] = teamNumber;
			this.$teamNumberContainer.append(teamNumber.$body);
		}
	}

	setTeamFull(teamNumber, isFull) {
		this.numberMap[teamNumber].full = isFull;
	}

	setActiveNumber(number) {
		this.clearActiveNumber();
		this.numberMap[number].active = true;
		this.activeNumber = this.numberMap[number];
		this.$unsetOption.removeClass('active');
	}

	clearActiveNumber() {
		if (this.activeNumber) {
			this.activeNumber.active = false;
		}
		this.activeNumber = null;
		this.$unsetOption.addClass('active');
	}
}

class LobbyAvatarTeamNumber {
	constructor(number) {	
		this.$body = $(format(this.TEMPLATE, number));

		this._full = false;

		this.$body.click(() => {
			socket.sendCommand({
				type: "lobby",
				command: "join team",
				data: { teamNumber: number },
			});
		});
	}

	set active(isActive) {
		if (isActive) {
			this.$body.addClass("active");
		} else {
			this.$body.removeClass("active");
		}
	}

	set full(isFull) {
		this._full = isFull;
		if (isFull) {
			this.$body.addClass("disabled");
		} else {
			this.$body.removeClass("disabled");
		}
	}

	get full() {
		return this._full;
	}

	remove() {
		this.$body.remove();
	}
}
LobbyAvatarTeamNumber.prototype.TEMPLATE = $("#lobbyAvatarTeamSelectorNumberTemplate").html();
