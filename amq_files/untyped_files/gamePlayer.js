'use strict';
/*exported GamePlayer*/

class GamePlayer {
	constructor(name, level, gamePlayerId, host, avatarInfo) {
		this._name = name;
		this.level = level;
		this.gamePlayerId = gamePlayerId;
		this._host = host;
		this.avatarInfo = avatarInfo;
	}

	get name() {
		return this._name;
	}

	set name(newValue) {
		this._name = newValue;
	}

	get host() {
		return this._host;
	}

	set host(newValue) {
		this._host = newValue;
	}
}