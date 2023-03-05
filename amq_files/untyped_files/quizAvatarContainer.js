'use strict';
/*exported QuizAvatarContainer*/

class QuizAvatarContainer {
	constructor() {
		this.$avatarRow = $('#qpAvatarRow');
		this.$avatarContainer = $("#qpAvatarRowAvatarContainer");
		this.$enemyContainer = $("#qpAvatarRowEnemyContainer");
		this._$page = $("#quizPage");
		this._$animeContainer = $("#qpAnimeContainer");
		this.playerSlotMap = {};
		this.enemySlotMap = {};
		this._groupSlotMap = {};
		this._currentGroup = 1;
		this.delayUpdateRunning = false;
	}

	set currentGroup(groupNumber) {
		this.delayUpdateRunning = false;

		let activeIds = this._groupSlotMap[groupNumber];
		let nextZIndex = this.MAX_GROUP_SIZE;
		Object.keys(this.playerSlotMap).forEach(playerId => {
			let avatarSlot = this.playerSlotMap[playerId];
			if(activeIds.includes(parseInt(playerId))) {
				avatarSlot.show();
				avatarSlot.zIndex = nextZIndex--;
			} else {
				avatarSlot.hide();
			}
		});

		this._currentGroup = groupNumber;
	}

	get currentGroup() {
		return this._currentGroup;
	}

	set groupSlotMap(newMap) {
		this._groupSlotMap = newMap;
		this.currentGroup = this._currentGroup;
	} 

	setupAvatars(players, groupSlotMap) {
		this._groupSlotMap = groupSlotMap;
		this.playerSlotMap = {};
		let selfId;
		players.sort((a,b) => {
			return a.startPositionSlot - b.startPositionSlot;
		}).forEach(player => {
			this.playerSlotMap[player.gamePlayerId] = player.avatarSlot;
			this.$avatarContainer.append(player.avatarSlot.$body);
			if(player.isSelf) {
				selfId = player.gamePlayerId;
			}
		});
		if(selfId != undefined) {
			this.currentGroup = Object.keys(groupSlotMap).find(group => {
				return groupSlotMap[group].includes(selfId);
			});
		} else {
			this.currentGroup = 1;
		}
	}

	setupEnemies(enemies) {
		this.enemySlotMap = {};
		enemies.sort((a,b) => a.enemyPosition - b.enemyPosition).forEach(enemy => {
			this.enemySlotMap[enemy.enemyPosition] = enemy.enemySlot;
			this.$enemyContainer.append(enemy.enemySlot.$body);
		});
	}

	addLateJoinAvatars(players, groupSlotMap) {
		this._groupSlotMap = groupSlotMap;
		let selfId;
		players.sort((a,b) => {
			return a.startPositionSlot - b.startPositionSlot;
		}).forEach(player => {
			this.playerSlotMap[player.gamePlayerId] = player.avatarSlot;
			this.$avatarContainer.append(player.avatarSlot.$body);
			if(player.isSelf) {
				selfId = player.gamePlayerId;
			}
		});
		if(selfId != undefined) {
			this.currentGroup = Object.keys(groupSlotMap).find(group => {
				return groupSlotMap[group].includes(selfId);
			});
		}
	}

	updateAvatarLayout(nexusLayout) {
		//Set container height
		let avatarRowHeight = this._$page.height() - this._$animeContainer.outerHeight(true);
		if(nexusLayout) {
			avatarRowHeight -= this.NEXUS_MODE_CONTAINER_HEIGHT_REDUCTION;
			if(avatarRowHeight < 0) {
				avatarRowHeight = 0;
			}
		}
		this.$avatarRow.css('height', avatarRowHeight);
		//Set avatar size
		let maxWidth = this.$avatarRow.width() / this.MAX_GROUP_SIZE - 4;
		let maxHeight = this.$avatarRow.height();
		
		Object.values(this.playerSlotMap).forEach(avatarSlot => {
			avatarSlot.updateSize(maxWidth, maxHeight);
		});
		
		Object.values(this.enemySlotMap).forEach(enemySlot => {
			enemySlot.updateSize(maxWidth, maxHeight);
		});
	}

	updateGroupSlotWithDelay(newMap, delayInMs) {
		this._groupSlotMap = newMap;
		this.delayUpdateRunning = true;
		setTimeout(() => {
			if (this.delayUpdateRunning) {
				this.updateCurrentGroup();
			}
		}, delayInMs);
	}

	updateCurrentGroup() {
		this.currentGroup = this._currentGroup;
	}

	reset() {
		Object.values(this.playerSlotMap).forEach(avatarSlot => {
			avatarSlot.remove();
			avatarSlot.displayed = false;
		});
		Object.values(this.enemySlotMap).forEach(enemySlot => {
			enemySlot.remove();
			enemySlot.displayed = false;
		});
		this.playerSlotMap = {};
		this.enemySlotMap = {};
		this._groupSlotMap = {};
		this._currentGroup = 1;
	}
}

QuizAvatarContainer.prototype.MAX_GROUP_SIZE = 8;
QuizAvatarContainer.prototype.NEXUS_MODE_CONTAINER_HEIGHT_REDUCTION = 30; //px;