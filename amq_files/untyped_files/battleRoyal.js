"use strict";
/*exported battleRoyal*/

class BattleRoyal {
	constructor() {
		this.$view = $("#battleRoyalPage");
		this.$playerList = $("#brPlayerList");
		this.$playerListContainer = $("#brPlayerListContainer");
		this.$brMapContainer = $("#brMapContainer");
		this.$brMap = $("#brMap");
		this.$loadTextContainer = $("#brLoadTextContainer");

		this.PLAYER_LIST_ENTRY_TEMPLATE = $("#brListPlayerEntryTemplate").html();
		this.LEVEL_OVERLAP_HEIGHT = 75;

		this.timer;
		this.map;
		this.spectatorController;
		this.inView = false;

		this.players;
		this.isSpectator;
		this.settings;

		this.$playerListContainer.perfectScrollbar({
			suppressScrollX: true,
		});

		$(window).resize(() => {
			if (this.inView) {
				this.updateMapSize();
			}
		});

		this._readyListener = new Listener(
			"battle royal ready",
			function (payload) {
				this.$loadTextContainer.addClass("hidden");
				this.timer.start(payload.lootTime);
				this.map.drawTileOverview(payload.mapSize, this.isSpectator);
				this.collectionController.setSize(payload.inventorySize);
			}.bind(this)
		);

		this._spawnListener = new Listener("battle royal spawn", (payload) => {
			let collectionFull = !this.isSpectator && this.collectionController.isFull();
			this.map.setupTile(payload, this.isSpectator, collectionFull);
			if (!this.isSpectator) {
				this.collectionController.show();
			}
			this.spectatorController.show();
			this.spectatorController.updateIcon(payload.spectatorCount);
		});

		this._objectDespawnListener = new Listener("battle royal object despawn", (payload) => {
			this.map.objectDespawn(payload.x, payload.y);
		});

		this._newEntryCollectedListener = new Listener("new collected name entry", (entry) => {
			this.collectionController.addEntry(entry);
			this.map.setCollectionFull(this.collectionController.isFull());
		});

		this._dataStoreContentListener = new Listener("battle royal data store content", (payload) => {
			this.map.showContainerContent(payload.x, payload.y, payload.entries);
		});

		this._dataStoreContentDespawn = new Listener("container entry despawn", (payload) => {
			this.map.containerEntryDespawn(payload.x, payload.y, payload.id);
		});

		this._spawnPlayerListener = new Listener("battle royal spawn player", (playerInfo) => {
			this.map.spawnPlayer(playerInfo);
		});

		this._newPlayerPositionListener = new Listener("battle royal new player position", (playerInfo) => {
			this.map.updatePlayerPosition(playerInfo.gamePlayerId, playerInfo.position);
		});

		this._playerDespawnListener = new Listener("battle royal despawn player", (playerInfo) => {
			this.map.despawnPlayer(playerInfo.gamePlayerId);
		});

		this._playerLeaveListner = new Listener(
			"Player Left",
			function (change) {
				$("#brListPlayerEntry-" + change.player.gamePlayerId).addClass("disabled");
				this.players[change.player.gamePlayerId].inGame = false;
				if (change.newHost) {
					Object.values(this.players).some((gamePlayer) => {
						if (gamePlayer.name === change.newHost) {
							gamePlayer.host = true;
							return true;
						}
					});
				}
			}.bind(this)
		);

		this._playerRejoiningListener = new Listener(
			"Rejoining Player",
			function (payload) {
				$("#brListPlayerEntry-" + payload.gamePlayerId).removeClass("disabled");
				this.players[payload.gamePlayerId].inGame = true;
			}.bind(this)
		);

		this._phaseOverListener = new Listener(
			"battle royal phase over",
			function (payload) {
				let isHost = Object.values(this.players)
					.filter((player) => {
						return player.host;
					})
					.some((player) => {
						return player.name === selfName;
					});
				quiz.setupQuiz(
					Object.values(this.players),
					this.isSpectator,
					undefined,
					this.settings,
					isHost,
					payload.groupSlotMap,
					this.soloMode
				);
				viewChanger.changeView("quiz", { supressServerMsg: true, keepChatOpen: true });
			}.bind(this)
		);

		this._correctPosistionListener = new Listener(
			"battle royale correct posistion",
			function (payload) {
				this.map.correctPosition(payload.x, payload.y);
			}.bind(this)
		);

		this._correctPosistionListener = new Listener(
			"battle royal tile count",
			function (payload) {
				this.map.updateTileCount(payload.x, payload.y, payload.count);
			}.bind(this)
		);

		this._spectatorCountChangeListener = new Listener(
			"tile spectator count change",
			function (payload) {
				this.spectatorController.updateIcon(payload.count);
				this.map.spectatorCount = payload.count;
			}.bind(this)
		);

		this._returnMapListener = new Listener(
			"battle royal return map",
			function (payload) {
				this.map.drawTileOverview(payload.mapSize, this.isSpectator, payload.tilePlayerCounts);
				this.spectatorController.hide();
			}.bind(this)
		);

		this._dropNameEntryListener = new Listener(
			"drop name entry",
			function (payload) {
				this.collectionController.removeEntry(payload.id);
				this.map.setCollectionFull(false);
			}.bind(this)
		);

		this._objectSpawnListener = new Listener(
			"battle royal object spawn",
			function (payload) {
				this.map.spawnObject(payload, this.collectionController.isFull());
				if (!this.isSpectator) {
					this.map.toggleActiveObjects();
				}
			}.bind(this)
		);

		this._nameChangeListner = new Listener(
			"player name change",
			function (payload) {
				this.players[payload.gamePlayerId].name = payload.newName;
				this.map.updatePlayerName(payload.gamePlayerId, payload.newName);
			}.bind(this)
		);

		this._noPlayersListner = new Listener("quiz no players", function () {
			displayMessage("All players have left", "Game room closed.");
			viewChanger.changeView("roomBrowser", { supressServerMsg: true });
		});
	}

	setup() {
		this.timer = new BattleRoyalTimer();
		this.map = new BattleRoyalMap();
		this.collectionController = new BattleRoyalCollectionController();
		this.spectatorController = new BattleRoyalSpectatorController();
	}

	setupGame(players, isSpectator, settings, timeLeft, mapState, soloMode, playerBRState) {
		this.$playerList.html("");
		this.timer.reset();
		this.collectionController.reset();
		this.spectatorController.reset();
		this.soloMode = soloMode;

		if (!settings.modifiers.lootDropping) {
			this.collectionController.disableDrop();
		}

		this.isSpectator = isSpectator;
		this.settings = settings;
		if (isSpectator) {
			hostModal.changeSettings(settings);
		}

		gameChat.toggleQueueTab(this.settings.modifiers.queueing);

		this.players = {};
		players.forEach((player) => {
			this.players[player.gamePlayerId] = new BattleRoyalePlayer(
				player.name,
				player.level,
				player.gamePlayerId,
				player.host,
				player.avatarInfo,
				player.positionSlot,
				player.teamPlayer,
				player.teamNumber
			);
		});

		if (timeLeft) {
			this.timer.start(timeLeft);
		}

		Object.values(this.players).forEach((player) => {
			let $entry = $(format(this.PLAYER_LIST_ENTRY_TEMPLATE, player.name, player.gamePlayerId));
			this.$playerList.append($entry);
			if (player.avatarDisabled) {
				$entry.addClass("disabled");
			}
		});
		if (playerBRState) {
			this.collectionController.setSize(playerBRState.inventorySize);
			if (playerBRState.tileState) {
				playerBRState.lootedAnswers.forEach(entry => {
					this.collectionController.addEntry(entry);
				});
				let collectionFull = !this.isSpectator && this.collectionController.isFull();
				this.map.setupTile(playerBRState.tileState, this.isSpectator, collectionFull);
				this.collectionController.show();
				this.spectatorController.show();
				this.spectatorController.updateIcon(playerBRState.tileState.spectatorCount);
			} else {
				this.map.drawTileOverview(mapState.mapSize, false);
			}
			this.$loadTextContainer.addClass("hidden");
		} else if (mapState) {
			this.map.drawTileOverview(mapState.mapSize, this.isSpectator, mapState.tilePlayerCounts);
		} else {
			this.$loadTextContainer.removeClass("hidden");
		}
	}

	closeView(args) {
		if (!args.supressServerMsg) {
			socket.sendCommand({
				type: "lobby",
				command: "leave game",
			});
		}
		this.timer.stop();
		this.map.clear();
		this.inView = false;

		this._readyListener.unbindListener();
		this._spawnListener.unbindListener();
		this._objectDespawnListener.unbindListener();
		this._newEntryCollectedListener.unbindListener();
		this._dataStoreContentListener.unbindListener();
		this._dataStoreContentDespawn.unbindListener();
		this._spawnPlayerListener.unbindListener();
		this._newPlayerPositionListener.unbindListener();
		this._playerDespawnListener.unbindListener();
		this._playerLeaveListner.unbindListener();
		this._playerRejoiningListener.unbindListener();
		this._phaseOverListener.unbindListener();
		this._correctPosistionListener.unbindListener();
		this._spectatorCountChangeListener.unbindListener();
		this._returnMapListener.unbindListener();
		this._dropNameEntryListener.unbindListener();
		this._objectSpawnListener.unbindListener();
		this._nameChangeListner.unbindListener();
		this._noPlayersListner.unbindListener();

		this.$view.addClass("hidden");
		if (!args.keepChatOpen) {
			gameChat.closeView();
		}
	}

	openView(callback) {
		if (!gameChat.isShown()) {
			gameChat.openView();
		}
		this._readyListener.bindListener();
		this._spawnListener.bindListener();
		this._objectDespawnListener.bindListener();
		this._newEntryCollectedListener.bindListener();
		this._dataStoreContentListener.bindListener();
		this._dataStoreContentDespawn.bindListener();
		this._spawnPlayerListener.bindListener();
		this._newPlayerPositionListener.bindListener();
		this._playerDespawnListener.bindListener();
		this._playerLeaveListner.bindListener();
		this._playerRejoiningListener.bindListener();
		this._phaseOverListener.bindListener();
		this._correctPosistionListener.bindListener();
		this._spectatorCountChangeListener.bindListener();
		this._returnMapListener.bindListener();
		this._dropNameEntryListener.bindListener();
		this._objectSpawnListener.bindListener();
		this._nameChangeListner.bindListener();
		this._noPlayersListner.bindListener();

		this.$view.removeClass("hidden");
		this.inView = true;
		this.updateMapSize();
		this.$playerListContainer.perfectScrollbar("update");
		callback();
	}

	updateMapSize() {
		let maxHeight = this.$brMapContainer.height() - this.LEVEL_OVERLAP_HEIGHT;
		let maxWidth = this.$brMapContainer.width;

		let size = maxHeight > maxWidth ? maxWidth : maxHeight;
		this.$brMap.height(size).width(size);
		this.map.relayout();
	}

	leave() {
		if (this.isSpectator) {
			viewChanger.changeView("roomBrowser");
		} else {
			displayOption(
				"Leave Quiz?",
				null,
				"Leave",
				"Stay",
				() => {
					if (this.soloMode) {
						viewChanger.changeView("main");
					} else {
						viewChanger.changeView("roomBrowser");
					}
				},
				() => {}
			);
		}
	}
}

var battleRoyal = new BattleRoyal();
