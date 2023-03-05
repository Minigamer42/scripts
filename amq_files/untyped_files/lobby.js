"use strict";
/*exported lobby*/

class Lobby {
	constructor() {
		this.$view = $("#lobbyPage");
		this.$roomName = $("#lobbyRoomName");
		this.$roomId = $("#lobbyRoomId");
		this.$ruleButton = $("#lnModeRuleButton");
		this.$shuffleTeamButton = $("#lobbyShuffleTeamButton");

		this.settings;
		this.hostName;
		this.players = {};
		this.gameId;
		this.inLobby = false;
		this.soloMode = false;
		this.isSpectator;
		this.isReady;
		this.closeTime;
		this.ownGamePlayerId = null;

		this.lobbyAvatarContainer = new LobbyAvatarContainer();
		this.mainButton = new LobbyMainButton();
		this.playerCounter = new LobbyPlayerCounter();
		this.ruleModal = new LobbyRuleModal();

		this.$battleRoyalRuleModal = $("#battleRoyalModal");
		this.$lastManRuleModal = $("#lastManStandingModal");
		this.$rankedRuleModal = $("#rankedRulesModal");

		$(window).resize(() => {
			if (this.inLobby) {
				Object.values(this.players).forEach((player) => {
					player.updateAvatarLayout();
				});
				this.lobbyAvatarContainer.updateLayout();
			}
		});

		//Listeners
		this._settingListener = new Listener(
			"Room Settings Changed",
			function (changes) {
				hostModal.changeSettings(changes);
				let chatNotificationMsg = "";
				Object.keys(changes).forEach((key) => {
					if (key === "numberOfTeams") {
						return;
					}
					let newValue = changes[key];
					let oldValue = this.settings[key];
					this.settings[key] = newValue;

					if (
						(key !== "songSelection" && key !== "songType") ||
						!changes.numberOfSongs ||
						newValue.advancedOn ||
						JSON.stringify(oldValue.standardValue) !== JSON.stringify(newValue.standardValue)
					) {
						chatNotificationMsg += settingMessageFormater.format(newValue, oldValue, key);
					}
				});

				if (changes.roomSize) {
					this.settings.roomSize = changes.roomSize;
				}
				Object.values(this.players).forEach((player) => {
					player.ready = false;
					if (changes.numberOfTeams != undefined) {
						player.updateNumberOfTeams(changes.numberOfTeams);
					}
				});

				if (changes.numberOfTeams != undefined) {
					this.numberOfTeams = changes.numberOfTeams;
					gameChat.toggleShowTeamChatSwitch(this.numberOfTeams > 1 && !this.isSpectator && this.isHost);
				}

				this.isReady = false;
				this.toggleRuleButton(changes);
				this.updateMainButton();
				if (changes.roomName) {
					this.$roomName.text(changes.roomName);
				}

				this.updatePlayerCounter();

				gameChat.systemMessage("Game settings have changed", chatNotificationMsg);
			}.bind(this)
		);

		this._newPlayerListner = new Listener(
			"New Player",
			function (player) {
				let newPlayer = this.addPlayer(player);
				if (this.displayJoinLeaveMessages) {
					gameChat.systemMessage(newPlayer.name + " joined the room.", "");
				}
			}.bind(this)
		);

		this._playerLeaveListner = new Listener(
			"Player Left",
			function (change) {
				this.removePlayer(change.player.gamePlayerId);
				if (change.newHost) {
					this.setNewHost(change.newHost);
				}
			}.bind(this)
		);

		this._spectatorChangeToPlayer = new Listener(
			"Spectator Change To Player",
			function (player) {
				this.addPlayer(player);
				if (this.displayJoinLeaveMessages) {
					gameChat.systemMessage(player.name + " changed to player", "");
				}
				if (player.name === selfName) {
					this.isSpectator = false;
					this.updateMainButton();
					gameChat.toggleShowTeamChatSwitch(this.numberOfTeams > 0 && this.isHost);
					this.checkAutoDisplayRuleModal();
				}
			}.bind(this)
		);

		this._readyChangeListner = new Listener(
			"Player Ready Change",
			function (change) {
				this.players[change.gamePlayerId].ready = change.ready;
				if (this.isHost) {
					this.updateMainButton();
				}
				this.updatePlayerCounter();
			}.bind(this)
		);

		this._gameStartListner = new Listener(
			"Game Starting",
			function (payload) {
				gameChat.setSpectatorButtonState(false);
				if (payload.showSelection === quiz.SHOW_SELECTION_IDS.LOOTING) {
					battleRoyal.setupGame(payload.players, this.isSpectator, this.settings, null, null, this.soloMode);
					viewChanger.changeView("battleRoyal", { supressServerMsg: true, keepChatOpen: true });
				} else {
					quiz.setupQuiz(
						payload.players,
						this.isSpectator,
						undefined,
						this.settings,
						this.isHost,
						payload.groupSlotMap,
						this.soloMode,
						null,
						null,
						payload.champGame
					);
					viewChanger.changeView("quiz", { supressServerMsg: true, keepChatOpen: true });
				}
			}.bind(this)
		);

		this._forceSpectatorListner = new Listener(
			"Player Changed To Spectator",
			function (payload) {
				this.removePlayer(payload.playerDescription.gamePlayerId);
				if (payload.playerDescription.name === selfName) {
					this.isSpectator = true;
					this.updateMainButton();
					gameChat.toggleShowTeamChatSwitch(false);
				}
			}.bind(this)
		);

		this._avatarChangeListener = new Listener(
			"avatar change",
			function (payload) {
				this.players[payload.gamePlayerId].avatar = payload.avatar;
			}.bind(this)
		);

		this._hostPromotionListner = new Listener(
			"Host Promotion",
			function (payload) {
				this.setNewHost(payload.newHost);
				gameChat.systemMessage(payload.newHost + " promoted host", "");
			}.bind(this)
		);

		this._gameClosedListner = new Listener(
			"game closed",
			function (payload) {
				displayMessage("Room Closed", payload.reason);
				this.leave({ supressServerMsg: true });
			}.bind(this)
		);

		this._spectatorLeftListener = new Listener(
			"Spectator Left",
			function (payload) {
				if (payload.newHost) {
					this.setNewHost(payload.newHost);
				}
			}.bind(this)
		);

		this._nameChangeListner = new Listener(
			"player name change",
			function (payload) {
				this.players[payload.gamePlayerId].name = payload.newName;
				if(payload.isHost) {
					this.hostName = payload.newName;
				}
			}.bind(this)
		);

		this._spectatorNameChangeListner = new Listener(
			"spectator name change",
			function (payload) {
				if(payload.isHost) {
					this.hostName = payload.newName;
				}
			}.bind(this)
		);

		this._joinTeamListener = new Listener(
			"join team",
			function (payload) {
				this.setPlayerTeam(payload.gamePlayerId, payload.newTeam);
				if (this.ownGamePlayerId !== null) {
					if (payload.newTeamFull) {
						this.players[this.ownGamePlayerId].setTeamFull(payload.newTeam, true);
					}
					if (payload.newTeamOpenNumber !== null) {
						this.players[this.ownGamePlayerId].setTeamFull(payload.newTeamOpenNumber, false);
					}
				}
				if (payload.newTeam === null && payload.gamePlayerId === this.ownGamePlayerId) {
					this.isReady = false;
					this.updateMainButton();
				}
			}.bind(this)
		);

		this._shuffleTeamsListener = new Listener(
			"shuffle teams",
			function () {
				gameChat.systemMessage("Teams Shuffled");
				if (this.ownGamePlayerId !== null) {
					for (let i = 1; i <= this.numberOfTeams; i++) {
						this.players[this.ownGamePlayerId].setTeamFull(i, false);
					}
				}
			}.bind(this)
		);
	}

	get isHost() {
		if (!this.hostName) {
			return false;
		}
		return this.hostName === selfName;
	}

	get numberOfPlayers() {
		return Object.keys(this.players).length;
	}

	get numberOfPlayersReady() {
		return Object.values(this.players).filter((player) => {
			return player.ready;
		}).length;
	}

	openView(callback) {
		this.$view.removeClass("hidden");
		this.inLobby = true;

		this._settingListener.bindListener();
		this._newPlayerListner.bindListener();
		this._playerLeaveListner.bindListener();
		this._spectatorChangeToPlayer.bindListener();
		this._readyChangeListner.bindListener();
		this._gameStartListner.bindListener();
		this._forceSpectatorListner.bindListener();
		this._avatarChangeListener.bindListener();
		this._hostPromotionListner.bindListener();
		this._gameClosedListner.bindListener();
		this._spectatorLeftListener.bindListener();
		this._nameChangeListner.bindListener();
		this._spectatorNameChangeListner.bindListener();
		this._joinTeamListener.bindListener();
		this._shuffleTeamsListener.bindListener();

		gameChat.openView();
		Object.values(this.players).forEach((player) => {
			player.updateAvatarLayout();
		});
		this.lobbyAvatarContainer.updateLayout();
		callback();
	}

	closeView(args) {
		if (this.isHost) {
			afkKicker.clearHostTimeout();
		}
		if (!args.supressServerMsg) {
			socket.sendCommand({
				type: "lobby",
				command: "leave game",
			});
		}

		this._settingListener.unbindListener();
		this._newPlayerListner.unbindListener();
		this._playerLeaveListner.unbindListener();
		this._spectatorChangeToPlayer.unbindListener();
		this._readyChangeListner.unbindListener();
		this._gameStartListner.unbindListener();
		this._forceSpectatorListner.unbindListener();
		this._avatarChangeListener.unbindListener();
		this._hostPromotionListner.unbindListener();
		this._hostPromotionListner.unbindListener();
		this._gameClosedListner.unbindListener();
		this._spectatorLeftListener.unbindListener();
		this._nameChangeListner.unbindListener();
		this._spectatorNameChangeListner.unbindListener();
		this._joinTeamListener.unbindListener();
		this._shuffleTeamsListener.unbindListener();

		this.$lastManRuleModal.modal("hide");
		this.$battleRoyalRuleModal.modal("hide");
		this.$view.addClass("hidden");

		this.ruleModal.reset();
		this.ruleModal.hide();

		Object.values(this.players).forEach((lobbyPlayer) => {
			lobbyPlayer.remove();
		});
		this.players = {};
		this.ownGamePlayerId;

		this.inLobby = false;
		if (!args.keepChatOpen) {
			gameChat.closeView();
		}
	}

	setupLobby(lobbyInfo, isSpectator) {
		this.isSpectator = isSpectator;
		this.isReady = false;
		this.gameId = lobbyInfo.gameId;
		this.hostName = lobbyInfo.hostName;
		this.closeTime = lobbyInfo.roomCloseTime;
		this.blockJoinMessage = lobbyInfo.blockJoinMessage;
		this.soloMode = lobbyInfo.soloMode;
		this.numberOfTeams = lobbyInfo.numberOfTeams;

		if (this.numberOfTeams > 1 && !this.isSpectator && this.isHost) {
			gameChat.toggleShowTeamChatSwitch(true);
		}

		this.settings = lobbyInfo.settings;
		hostModal.changeSettings(this.settings);

		this.players = {};
		lobbyInfo.players.forEach((playerInfo) => {
			this.addPlayer(playerInfo, lobbyInfo.teamFullMap);
		});

		gameChat.toggleQueueTab(this.settings.modifiers.queueing);
		gameChat.setSpectatorButtonState(!isSpectator);
		gameChat.setQueueButtonState(isSpectator);
		gameChat.slowModeActive = this.settings.gameMode === "Ranked";
		gameChat.displayJoinLeaveMessages = this.settings.gameMode !== "Ranked";
		this.displayJoinLeaveMessages = this.settings.gameMode !== "Ranked";

		if (this.settings.gameMode === "Ranked") {
			this.$roomId.text("#Ranked");
		} else {
			this.$roomId.text("#" + this.gameId);
		}
		this.$roomName.text(this.settings.roomName);

		this.toggleRuleButton();
		this.updateMainButton();

		this.playerCounter.toggleCountMode(this.settings.gameMode === "Ranked");
		this.updatePlayerCounter();

		//Bind Listners
		if (this.isHost) {
			afkKicker.setupHostTimeout();
		}
	}

	updatePlayerCounter() {
		this.playerCounter.updateCount(this.settings.roomSize, this.numberOfPlayers);

		let maxReady = this.settings.gameMode === "Ranked" ? this.numberOfPlayers : this.settings.roomSize;
		this.playerCounter.updateReadyCount(maxReady, this.numberOfPlayersReady);
	}

	addPlayer(player, teamFullMap) {
		let isHost = this.hostName === player.name;
		let newPlayer = new LobbyPlayer(
			player.name,
			player.level,
			player.gamePlayerId,
			isHost,
			player.avatar,
			player.ready,
			player.teamNumber,
			this.numberOfTeams,
			teamFullMap
		);
		newPlayer.hostOptionsActive = this.isHost && player.name !== selfName;
		this.lobbyAvatarContainer.addAvatar(newPlayer.lobbySlot);
		this.players[player.gamePlayerId] = newPlayer;

		if (player.name === selfName) {
			this.ownGamePlayerId = player.gamePlayerId;
		}

		this.updateMainButton();
		this.updatePlayerCounter();
		return newPlayer;
	}

	removePlayer(gamePlayerId) {
		this.players[gamePlayerId].remove();
		delete this.players[gamePlayerId];

		if (this.ownGamePlayerId === gamePlayerId) {
			this.ownGamePlayerId = null;
		}

		this.updateMainButton();
		this.updatePlayerCounter();
	}

	kickPlayer(playerName) {
		displayOption(
			"Kick " + playerName + "?",
			"Kicked players will be unable to rejoin the game",
			"Kick",
			"Cancel",
			() => {
				socket.sendCommand({
					type: "lobby",
					command: "kick player",
					data: { playerName: playerName },
				});
			}
		);
	}

	viewSettings() {
		hostModal.setModeGameSettings(this.isHost, this.soloMode);
		hostModal.showSettings();
		hostModal.show();
	}

	changeGameSettings() {
		let settings = hostModal.getSettings();
		if (!settings) {
			return;
		}
		if (this.soloMode) {
			settings.roomSize = 1;
		}
		let settingChanges = {};
		let changed = false;
		Object.keys(settings).forEach((key) => {
			if (JSON.stringify(this.settings[key]) !== JSON.stringify(settings[key])) {
				//Use stringfy to compare multivalue fields
				settingChanges[key] = settings[key];
				changed = true;
			}
		});

		if (changed) {
			socket.sendCommand({
				type: "lobby",
				command: "change game settings",
				data: settingChanges,
			});
		}
		hostModal.hide();
	}

	changeToSpectator(playerName) {
		socket.sendCommand({
			type: "lobby",
			command: "change player to spectator",
			data: { playerName: playerName },
		});
		this.isReady = false;
	}

	promoteHost(playerName) {
		socket.sendCommand({
			type: "lobby",
			command: "promote host",
			data: {
				playerName: playerName,
			},
		});
	}

	fireMainButtonEvent(dueStartTrigger) {
		if (
			(!this.mainButton.inDueMode && !this.mainButton.active) ||
			(this.mainButton.inDueMode && !dueStartTrigger && !this.mainButton.dueJoinActive) ||
			(this.mainButton.inDueMode && dueStartTrigger && !this.mainButton.dueStartActive)
		) {
			return;
		}
		if (this.isSpectator && !dueStartTrigger) {
			let changeToListner = new Listener(
				"Change To Player",
				function (succes) {
					if (!succes) {
						displayMessage("Error changing to player");
					}
					changeToListner.unbindListener();
				}.bind(this)
			);
			changeToListner.bindListener();

			socket.sendCommand({
				type: "lobby",
				command: "change to player",
			});
		} else if (this.isHost) {
			if (this.numberOfPlayersReady === 0) {
				displayMessage("No Players Ready", "At least 1 player much ready up before starting the game");
				return;
			}
			if (this.numberOfPlayersReady === this.numberOfPlayers) {
				socket.sendCommand({
					type: "lobby",
					command: "start game",
				});
			} else {
				displayOption(
					"All Players not Ready",
					"All players are not ready, all non ready players will be changed to spectators",
					"Start",
					"Cancel",
					() => {
						socket.sendCommand({
							type: "lobby",
							command: "start game",
						});
					}
				);
			}
		} else {
			this.isReady = !this.isReady;
			socket.sendCommand({
				type: "lobby",
				command: "set ready",
				data: { ready: this.isReady },
			});
			this.updateMainButton();
		}
	}

	setNewHost(newHostName) {
		let oldHostPlayer = this.getPlayerByName(this.hostName);
		let wasHost = this.isHost;
		if (oldHostPlayer) {
			oldHostPlayer.host = false;
			oldHostPlayer.ready = false;
		}

		this.hostName = newHostName;
		//Set the new host to be ready
		let player = this.getPlayerByName(newHostName);
		if (player) {
			player.host = true;
		}

		this.updatePlayerCounter();

		if (this.isHost) {
			this.updateMainButton();
			afkKicker.setupHostTimeout();
			Object.values(this.players).forEach((lobbyPlayer) => {
				lobbyPlayer.hostOptionsActive = true;
			});
		}
		if (wasHost) {
			this.isReady = false;
			afkKicker.clearHostTimeout();
			this.updateMainButton();
			Object.values(this.players).forEach((lobbyPlayer) => {
				lobbyPlayer.hostOptionsActive = false;
			});
		}
	}

	getPlayerByName(playerName) {
		return Object.values(this.players).find((player) => {
			return player.name === playerName;
		});
	}

	toggleRuleButton(settingChanges) {
		if (
			(this.RULE_DESCRIPED_GAME_MODES.includes(this.settings.gameMode) ||
			this.settings.showSelection === quiz.SHOW_SELECTION_IDS.LOOTING ||
			this.settings.scoreType !== quiz.SCORE_TYPE_IDS.COUNT ||
			this.numberOfTeams > 1) && this.settings.gameMode !== "Ranked"
		) {
			this.ruleModal.setupContent(
				this.settings.showSelection === quiz.SHOW_SELECTION_IDS.LOOTING,
				this.numberOfTeams > 1,
				this.settings.scoreType === quiz.SCORE_TYPE_IDS.SPEED,
				this.settings.scoreType === quiz.SCORE_TYPE_IDS.LIVES
			);
			this.$ruleButton.removeClass("hidden");
			this.checkAutoDisplayRuleModal(settingChanges);
		} else if(this.settings.gameMode === 'Ranked') {
			this.$ruleButton.removeClass("hidden");
		} else {
			this.$ruleButton.addClass("hidden");
		}
	}

	checkAutoDisplayRuleModal(settingChanges) {
		if (
			!this.isSpectator &&
			((tutorial.showLooting && this.settings.showSelection === quiz.SHOW_SELECTION_IDS.LOOTING && (!settingChanges || settingChanges.showSelection)) ||
				(tutorial.showTeams && this.numberOfTeams > 1 && (!settingChanges || settingChanges.numberOfTeams)) ||
				(tutorial.showSpeed && this.settings.scoreType === quiz.SCORE_TYPE_IDS.SPEED  && (!settingChanges || settingChanges.scoreType)) ||
				(tutorial.showLives && this.settings.scoreType === quiz.SCORE_TYPE_IDS.LIVES  && (!settingChanges || settingChanges.scoreType)))
		) {
			this.showRules();
		}
	}

	showRules() {
		if (this.settings.gameMode === "Ranked") {
			this.$rankedRuleModal.modal("show");
		} else if (
			this.settings.showSelection === quiz.SHOW_SELECTION_IDS.LOOTING ||
			this.settings.scoreType !== quiz.SCORE_TYPE_IDS.COUNT ||
			this.numberOfTeams > 1
		) {
			this.ruleModal.show();
		}
	}

	shuffleTeams() {
		socket.sendCommand({
			type: "lobby",
			command: "shuffle teams",
		});
	}

	updateMainButton() {
		if (this.isHost && this.numberOfTeams > 0) {
			this.$shuffleTeamButton.removeClass("hide");
		} else {
			this.$shuffleTeamButton.addClass("hide");
		}
		if (this.isHost && this.isSpectator) {
			this.mainButton.toggleSplitButton();
			this.mainButton.updateDueJoinButton("Join", this.canJoin, this.joinBlockedMessage);
			this.mainButton.updateDueStartButton("Start", this.numberOfPlayers > 0, "No Players");
		} else {
			if (this.settings.gameMode === "Ranked") {
				if (this.isSpectator) {
					this.mainButton.toggleMainButton();
					this.mainButton.updateMainButton("Join", this.canJoin, this.joinBlockedMessage);
				} else {
					this.mainButton.toggleRankedButton(this.closeTime);
				}
			} else {
				this.mainButton.toggleMainButton();
				if (this.isHost) {
					this.mainButton.updateMainButton("Start", this.numberOfPlayers > 0, "No Players");
				} else if (this.isSpectator) {
					this.mainButton.updateMainButton("Join", this.canJoin, this.joinBlockedMessage);
				} else {
					if (this.isReady) {
						this.mainButton.updateMainButton("Unready", true, "");
					} else {
						this.mainButton.updateMainButton("Ready", true, "");
					}
				}
			}
		}
	}

	get canJoin() {
		return !this.blockJoinMessage && this.numberOfPlayers !== this.settings.roomSize;
	}

	get joinBlockedMessage() {
		return this.blockJoinMessage ? this.blockJoinMessage : "Room is full";
	}

	leave(args) {
		if (this.settings.gameMode === "Ranked" || this.soloMode) {
			viewChanger.changeView("main", args);
		} else {
			viewChanger.changeView("roomBrowser", args);
		}
	}

	setPlayerTeam(gamePlayerId, teamNumber) {
		this.players[gamePlayerId].teamNumber = teamNumber;
		if (gamePlayerId === this.ownGamePlayerId) {
			if (teamNumber === null) {
				this.isReady = false;
				this.updateMainButton();
				gameChat.toggleShowTeamChatSwitch(false);
			} else {
				gameChat.toggleShowTeamChatSwitch(true);
			}
		}
	}
}

class LobbyMainButton {
	constructor() {
		this.$mainButton = $("#lbStartButton");

		this.$duoMainButton = $("#lbDuoButton");
		this.$dueJoinButotn = $("#lbDuoJoin");
		this.$dueStartButotn = $("#lbDuoStart");

		this.$rankedMainButton = $("#lbRankedButtonButton");
		this.$rankedButtonText = this.$rankedMainButton.find("h3");
		this.$rankedTimerText = this.$rankedMainButton.find("h2");
		this.rankedUpdateInterval;
		this.rankedTargetTime;

		this.active;
		this.dueJoinActive;
		this.dueStartActive;
		this.inDueMode = false;
	}

	toggleMainButton() {
		this.hideAll();
		this.$mainButton.removeClass("hidden");
		this.inDueMode = false;
	}

	toggleSplitButton() {
		this.hideAll();
		this.$duoMainButton.removeClass("hidden");
		this.inDueMode = true;
	}

	toggleRankedButton(closeTimeString) {
		this.hideAll();
		if (closeTimeString) {
			this.rankedTargetTime = moment(closeTimeString);
			this.$rankedButtonText.text("Closing In");
		} else {
			this.rankedTargetTime = ranked.getCurrentTargetTime();
			this.$rankedButtonText.text("Starts In");
		}
		this.updateRankedTimer();
		this.$rankedMainButton.removeClass("hidden");
		this.rankedUpdateInterval = setInterval(() => {
			this.updateRankedTimer();
		}, 1000);
	}

	hideAll() {
		this.$mainButton.addClass("hidden");
		this.$duoMainButton.addClass("hidden");
		this.$rankedMainButton.addClass("hidden");

		clearInterval(this.rankedUpdateInterval);
	}

	updateRankedTimer() {
		let durationLeft = moment.duration(this.rankedTargetTime.diff(new Date()));
		this.$rankedTimerText.text(convertDurationToCountdownString(durationLeft));
	}

	updateDueJoinButton(text, active, disableMessage) {
		this._toggleButton(text, active, disableMessage, this.$dueJoinButotn);
		this.dueJoinActive = active;
	}

	updateDueStartButton(text, active, disableMessage) {
		this._toggleButton(text, active, disableMessage, this.$dueStartButotn);
		this.dueStartActive = active;
	}

	updateMainButton(text, active, disableMessage) {
		this._toggleButton(text, active, disableMessage, this.$mainButton);
		this.active = active;
	}

	_toggleButton(text, active, disableMessage, button) {
		button.find("h1").text(text);
		if (active) {
			button.removeClass("disabled");
			button.tooltip("destroy");
		} else {
			button.addClass("disabled");
			button.tooltip({
				placement: "bottom",
				title: disableMessage,
				container: "#lobbyPage",
			});
		}
	}
}
Lobby.prototype.RULE_DESCRIPED_GAME_MODES = ["Ranked"];

let lobby = new Lobby();
