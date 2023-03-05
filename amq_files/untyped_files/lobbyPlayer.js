"use strict";
/*exported LobbyPlayer*/

class LobbyPlayer extends GamePlayer {
	constructor(name, level, gamePlayerId, host, avatarInfo, ready, teamNumber, numberOfTeams, teamFullMap) {
		super(name, level, gamePlayerId, host, avatarInfo);
		this._ready = ready;
		this.lobbySlot = new LobbyAvatarSlot(
			this.avatarInfo,
			this.name,
			this.level,
			this.ready,
			this.host,
			this.name === selfName,
			teamNumber,
			numberOfTeams,
			teamFullMap
		);
	}

	get name() {
		return this._name;
	}

	set name(newValue) {
		this._name = newValue;
		this.lobbySlot.name = newValue;
		this.lobbySlot.updateLayout();
	}

	get ready() {
		return this._ready || this.host;
	}

	set ready(newValue) {
		let oldValue = this.ready;
		this._ready = newValue;
		if (oldValue != undefined) {
			this.lobbySlot.ready = this.ready;
		}
	}

	set avatar(newAvatarInfo) {
		this.avatarInfo = newAvatarInfo;
		this.lobbySlot.avatar = newAvatarInfo;
	}

	get host() {
		return this._host;
	}

	set host(newValue) {
		let oldValue = this.host;
		this._host = newValue;
		this.lobbySlot.isHost = newValue;
		if (oldValue != undefined) {
			this.lobbySlot.ready = this.ready;
		}
	}

	set hostOptionsActive(active) {
		this.lobbySlot.hostOptionsActive = active;
	}

	set teamNumber(newNumber) {
		this.lobbySlot.teamNumber = newNumber;
	}

	remove() {
		this.lobbySlot.remove();
	}

	updateAvatarLayout() {
		this.lobbySlot.updateLayout();
	}

	updateNumberOfTeams(newNumber) {
		this.lobbySlot.numberOfTeams = newNumber;
	}

	setTeamFull(teamNumber, isFull) {
		this.lobbySlot.setTeamFull(teamNumber, isFull);
	}
}
