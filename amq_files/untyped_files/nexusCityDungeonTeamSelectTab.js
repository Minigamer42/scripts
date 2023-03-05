'use strict';
/*exported NexusCityDungeonTeamSelectTab*/

class NexusCityDungeonTeamSelectTab extends NexusCityTeamSetupTab {
	constructor(window) {
		super(
			window,
			window.$window.find("#ncdwLeftTeamSelector"),
			window.$window.find("#ncdwAvatarSelectionContainer"),
			window.$window.find("#ncdwSetuprTab"),
			window.$window.find("#ncdwLeftTeamSelectorContainer"),
			NexusCityTeamRow,
			window.avatarInfoDisplay
		);
	}

	handleTeamClick(team) {
		socket.sendCommand({
			type: "nexus",
			command: "dungeon lobby select team",
			data: {
				teamId: team.teamId,
			},
		});
	}
}