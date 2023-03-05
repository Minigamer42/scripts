'use strict';
/*exported BattleRoyalePlayer*/

class BattleRoyalePlayer extends GamePlayer {
	constructor(name, level, gamePlayerId, host, avatarInfo, positionSlot, teamPlayer, teamNumber) {
		super(name, level, gamePlayerId, host, avatarInfo);
		this.inGame = true;
		this.positionSlot = positionSlot;
		this.teamPlayer = teamPlayer;
		this.teamNumber = teamNumber;
	}
}