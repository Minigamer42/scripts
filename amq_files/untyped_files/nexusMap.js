"use strict";
/*exported NexusMapController */

class NexusMapController {
	constructor() {
		this.$container = $("#nexusMapContainer");
		this.$hoverContainer = this.$container.find("#nexusMapHoverContainer");
		this.$iconOvelayContainer = this.$container.find("#nexusMapIconOverlay");

		this.$fragmentCounter = this.$container.find("#nexusFragmentCount");
		this.fragmentCounter = new TextCounter(this.$fragmentCounter, 1000, null, 0, null);

		this.canvasController = new AdvancedAnimationControllerTripple(
			new AnimationCanvasCenter($("#nexusMapStaticCanvas")),
			new AnimationCanvasCenter($("#nexusMapAnimatedCanvas")),
			new AnimationCanvasCenter($("#nexusMapTopAnimatedCanvas"))
		);
		this.backgroundCanvas = new BackgroundImageCanvas($("#nexusMapBackgroundCanvas"));
		this.backdropCanvas = new TileBackdropCanvas($("#nexusMapBackdropCanvas"), this.backdropSize);

		this.ostAudioGroup = audioController.getGroup("nexusDungeonOst");

		this.statusController = new NexusAvatarStatusController();

		this.rewardWindow = new NexusMapRewardWindow();
		this.eventWindow = new NexusEventWindow(this);
		this.storeWindow = new NexusStoreWindow();
		this.resultWindow = new NexusDungeonResultWindow();
		this.runeInventory = new RuneInventory();
		this.abandonVote = new NexusAbandonRunVoteContainer();

		this.tileRowMap = {};
		this.tileList = [];
		this.currentTile;

		this.playerVoteIcons = {};

		this.mapBaseY;
		this.tileHeight;

		this.currentHoverTile;

		this._fragmentCount = 0;

		this.artifactFlashImageBuffer = {};
		this.buffFlashImageBuffer = {};
		this.runeFlashImageBuffer = {};
		this.badgeFlashImageBuffer = {};

		this.activePan = false;

		this.active = false;
		this.mapElementsHidden = false;

		this.maxThreeArtifacts = false;

		$(window).resize(() => {
			if (this.active) {
				this.readjustCanvasSizes();
			}
		});

		this.exitButton = new DomElement($("#nexusMapBackButton"), () => {
			swal({
				title: "Exit Run?",
				text: this.exitButtonDesription,
				showConfirmButton: true,
				showCancelButton: true,
				showCloseButton: true,
				confirmButtonText: this.exitButtonText,
				cancelButtonText: "Abandon Run",
				cancelButtonColor: "#dd6b55",
			}).then((result) => {
				if (result.dismiss === "cancel") {
					socket.sendCommand({
						type: "nexus",
						command: "abandon run",
					});
				} else if(result.value) {
					socket.sendCommand({
						type: "nexus",
						command: "exit run",
					});
				}
			});
			// socket.sendCommand({
			// 	type: "nexus",
			// 	command: "close map",
			// });
		});
		this.canvasController.addDomElement(
			"exitButton",
			this.exitButton
		);

		this.canvasController.attatchDragEvents(
			() => {
				this.canvasController.startStaticAnimation();
			},
			(xChange, yChange) => {
				this.clearTileDescription();
				this.canvasController.updateTranslate(0, yChange);
			},
			() => {
				this.canvasController.stopStaticAnimation();
			}
		);

		this.canvasController.staticCanvas.attachMouseMoveListener((event) => {
			if (!this.canvasController.staticCanvas.dragActive && !this.activePan) {
				this.handleMouseMove(event.canvasX, event.canvasY);
			}
		});

		this.canvasController.addWheelListener((event) => {
			if (this.activePan) {
				return;
			}

			let yChange = event.originalEvent.deltaY * -1;
			this.canvasController.updateTranslate(0, yChange);
			this.canvasController.drawStatic();
			this.clearTileDescription();
		});

		this.canvasController.addClickTickListener((event) => {
			this.handleMouseClick(event.canvasX, event.canvasY);
		});

		this.canvasController.attachTranslateChangeListener(() => {
			let translate = this.canvasController.staticCanvas.translateY;
			let minDragLimit = this.canvasController.staticCanvas.vertMinDragLimit;
			this.$iconOvelayContainer.css("transform", `translateY(${translate - minDragLimit}px)`);
		});

		this._mapInitListener = new Listener("nexus map init", (mapInfo) => {
			let callback = () => {
				this.setupTiles(mapInfo.tiles);
				this.setCurrentTile(0, 2);
				this.fragmentCount = mapInfo.fragments;
				mapInfo.avatars.forEach((avatarInfo) => {
					this.statusController.addAvatar(avatarInfo);
				});

				this.maxThreeArtifacts = mapInfo.max3Artifacts;

				socket.sendCommand({
					type: "nexus",
					command: "nexus map ready",
				});
			};
			this.loadMap(mapInfo, callback);
		});
		this._mapInitListener.bindListener();

		this._nexusMapReadyListener = new Listener("nexus map ready", () => {
			this.initMap();
			this.scrollMapTop();
			this.ostAudioGroup.playTrack("standard");
			nexus.hideLoading();
			this.panMapToBottom(this.INITIAL_PAN_DELAY, () => {
				if(!tutorial.state.nexusDungeonMap) {
					nexusTutorialController.startDungeonMapTutorial(this.statusController.$statusContainer, this.runeInventory.$container);
				}
			});
		});
		this._nexusMapReadyListener.bindListener();

		this._tileSelectListener = new Listener("map tile select", ({ row, col }) => {
			this.handleTileSelect(row, col);
		});
		this._tileSelectListener.bindListener();

		this._enemyyEncounterListener = new Listener("nexus enemy encounter", (encounterInfo) => {
			quiz.setupQuiz(
				encounterInfo.players,
				false,
				undefined,
				encounterInfo.settings,
				true,
				encounterInfo.groupSlotMap,
				false,
				null,
				null,
				false,
				encounterInfo.enemies,
				encounterInfo.avatarAssets
			);
			viewChanger.changeView("quiz", { keepNexusOpen: true });
			this.hideMapElements();
			nexusCoopChat.setGameMode();
		});
		this._enemyyEncounterListener.bindListener();

		this._enemyyEncounterResultListener = new Listener("nexus enemy encounter result", (payload) => {
			this.focusMapOnCurrentTile();
			this.switchMapFromGame();
			if (payload.result) {
				this.rewardWindow.fragments = payload.rewards.fragments;
				this.fragmentCount = this.fragmentCount + payload.rewards.fragments;

				this.rewardWindow.displayArtifacts(
					payload.rewards.artifacts,
					this.statusController.getAvatarDescriptions(),
					payload.rewards.soloReward,
					this.maxThreeArtifacts
				);
				this.rewardWindow.displayRuneMods(payload.rewards.runeModRewards);

				payload.rewards.runeModRewards.forEach((rune) => {
					this.runeInventory.addRune(rune);
				});
				this.runeInventory.combatWon();
				this.rewardWindow.open();
			}
			nexusCoopChat.clearGameMode();
		});
		this._enemyyEncounterResultListener.bindListener();

		this._nexusGameEventsListener = new Listener(
			"nexus game events",
			function (payload) {
				this.handleNewQuizEvents(payload.events);
			}.bind(this)
		);
		this._nexusGameEventsListener.bindListener();

		this._playNextSongListener = new Listener(
			"play next song",
			function (payload) {
				if (payload.songNumber === 1) {
					this.pauseOSTTrack();
				}
			}.bind(this)
		);

		this._partyWipeListener = new Listener("nexus party wipe", (payload) => {
			this.displayFinalResult(payload, "Party Wipe");
		});
		this._partyWipeListener.bindListener();

		this._dungeonClear = new Listener("nexus dungeon clear", (payload) => {
			this.displayFinalResult(payload, "Floor Cleared!");
		});
		this._dungeonClear.bindListener();

		this._nexusAvatarArtifactListener = new Listener("nexus avatar artifact", (payload) => {
			this.statusController.addArtifactToAvatar(payload.avatarName, payload.artifactInfo);
			this.setupArtifactFlashImage(payload.artifactInfo);
		});
		this._nexusAvatarArtifactListener.bindListener();

		this._nexusRemoveAvatarArtifactListener = new Listener("nexus remove avatar artifact", (payload) => {
			this.statusController.removeArtifactFromAvatar(payload.avatarName, payload.artifactName);
		});
		this._nexusRemoveAvatarArtifactListener.bindListener();

		this._nexusFragmentChangeListener = new Listener("nexus fragment change", (payload) => {
			this.fragmentCount = payload.fragments;
		});
		this._nexusFragmentChangeListener.bindListener();

		this._nexusAvatarHpChangesListener = new Listener("nexus avatar hp changes", (payload) => {
			payload.changes.forEach(({ name, hp }) => {
				this.statusController.updateHp(name, hp);
			});
		});
		this._nexusAvatarHpChangesListener.bindListener();

		this._nexusNewRewardsListener = new Listener("nexus new rewards", (payload) => {
			this.rewardWindow.fragments = payload.fragments;
			this.fragmentCount = this.fragmentCount + payload.fragments;

			this.rewardWindow.displayArtifacts(
				payload.artifacts,
				this.statusController.getAvatarDescriptions(),
				payload.soloReward,
				this.maxThreeArtifacts
			);

			this.rewardWindow.open();
		});
		this._nexusNewRewardsListener.bindListener();

		this._nexusStoreTileListener = new Listener("nexus store tile", (payload) => {
			this.storeWindow.setupContent(
				payload.artifacts,
				payload.runeMods,
				this.fragmentCount,
				this.statusController.getAvatarDescriptions(),
				this.maxThreeArtifacts
			);
			this.storeWindow.open();
			this.panToCurrentTile();
		});
		this._nexusStoreTileListener.bindListener();

		this._nexusStoreArtifactBoughtListener = new Listener("nexus store artifact bought", (payload) => {
			let targetAvatar = this.statusController.getAvatar(payload.avatarName);
			let artifactCount = targetAvatar ? targetAvatar.artifacts.length : null;
			this.storeWindow.itemBought(payload.shopId, this.fragmentCount, payload.avatarName, this.maxThreeArtifacts, artifactCount	);
		});
		this._nexusStoreArtifactBoughtListener.bindListener();

		this._nexusStoreEventEndListener = new Listener("nexus store event end", () => {
			this.storeWindow.close();
		});
		this._nexusStoreEventEndListener.bindListener();

		this._nexusDungeonFinishedListener = new Listener("nexus dungeon finished", () => {
			nexus.changeToNexus();
			viewChanger.changeView("nexus", { nexusClose: true });
			this.resultWindow.close();
			nexusCoopChat.clearGameMode();
			nexusCoopChat.clearNexusMode();
		});
		this._nexusDungeonFinishedListener.bindListener();

		this._nexusRuneFoundListener = new Listener("nexus rune found", (payload) => {
			this.runeInventory.addRune(payload.rune);
		});
		this._nexusRuneFoundListener.bindListener();

		this._nexusMapEventListener = new Listener("nexus map event", () => {
			this.panToCurrentTile();
		});
		this._nexusMapEventListener.bindListener();

		this._nexusMapTileVoteListener = new Listener("map tile vote", ({ row, col, gamePlayerId }) => {
			this.tileRowMap[row][col].displayVote(this.playerVoteIcons[gamePlayerId]);
		});
		this._nexusMapTileVoteListener.bindListener();

		this._nexusMapOptionVoteListener = new Listener("map option vote", ({ optionId, gamePlayerId }) => {
			this.eventWindow.displayVote(optionId, this.playerVoteIcons[gamePlayerId]);
		});
		this._nexusMapOptionVoteListener.bindListener();

		this._nexusMapOptionVoteListener = new Listener(
			"nexus artifact reward vote",
			({ avatarName, artifactName, gamePlayerId }) => {
				this.rewardWindow.displayArtifactVote(
					avatarName,
					artifactName,
					this.playerVoteIcons[gamePlayerId],
					gamePlayerId
				);
			}
		);
		this._nexusMapOptionVoteListener.bindListener();

		this._nexusMapOptionVoteListener = new Listener("map shop vote", ({ avatarName, shopId, gamePlayerId }) => {
			this.storeWindow.displayShopVote(avatarName, shopId, this.playerVoteIcons[gamePlayerId], gamePlayerId);
		});
		this._nexusMapOptionVoteListener.bindListener();

		this._nexusMapRejoinListener = new Listener("nexus map rejoin", (payload) => {
			this.loadMap(payload.mapDescription, () => {
				socket.sendCommand({
					type: "nexus",
					command: "get nexus map state",
				});
			});
		});
		this._nexusMapRejoinListener.bindListener();

		this._nexusMapStateListener = new Listener("nexus map state", (mapInfo) => {
			this.setupTiles(mapInfo.tiles);
			this.setCurrentTile(0, 2);
			mapInfo.tileOrder.forEach(({ row, col }) => {
				this.setCurrentTile(row, col);
			});

			this.maxThreeArtifacts = mapInfo.max3Artifacts;

			this.fragmentCount = mapInfo.fragments;
			mapInfo.avatars.forEach((avatarInfo) => {
				this.statusController.addAvatar(avatarInfo);
			});
			mapInfo.foundRunes.forEach((rune) => {
				this.runeInventory.addRune(rune);
			});
			if (mapInfo.runesUnlocked) {
				this.runeInventory.combatWon();
			}
			if (mapInfo.eventState) {
				this.panToCurrentTile();
				if (mapInfo.eventState.eventType === "event") {
					this.eventWindow.displayContent(mapInfo.eventState.state);
					this.eventWindow.open();
				} else if (mapInfo.eventState.eventType === "store") {
					this.storeWindow.setupContent(
						mapInfo.eventState.state.artifacts,
						mapInfo.eventState.state.runeMods,
						this.fragmentCount,
						this.statusController.getAvatarDescriptions(),
						this.maxThreeArtifacts
					);
					this.storeWindow.open();
				} else if (mapInfo.eventState.eventType === "reward") {
					let {artifacts, fragments, runes, soloReward, highlightedArtifactInfo} = mapInfo.eventState.state;

					this.rewardWindow.fragments = fragments;

					this.rewardWindow.displayArtifacts(
						artifacts,
						this.statusController.getAvatarDescriptions(),
						soloReward,
						this.maxThreeArtifacts
					);

					this.rewardWindow.displayRuneMods(runes);

					if(highlightedArtifactInfo) {
						this.rewardWindow.highlightTargetArtifact(highlightedArtifactInfo.artifactName, highlightedArtifactInfo.avatarName);
					}

					this.rewardWindow.open();
				} else if(mapInfo.eventState.eventType === "combat") {
					let {players, settings, groupSlotMap, enemies, avatarAssets, quizState, teamAnswers, selfAnswer} = mapInfo.eventState.state;
					quiz.setupQuiz(
						players,
						false,
						quizState,
						settings,
						true,
						groupSlotMap,
						false,
						teamAnswers,
						selfAnswer,
						false,
						enemies,
						avatarAssets
					);
					
					setTimeout(() => {
						this.hideMapElements();
						nexus.hideLoading();
					}, 1); // wait for the current block to finish
					viewChanger.changeView("quiz", { keepNexusOpen: true });
					nexusCoopChat.setGameMode();
					return;
				}
			} else {
				this.scrollMapTop();
				this.panToCurrentTile();
			}
			this.ostAudioGroup.playTrack("standard");
			nexus.hideLoading();
		});
		this._nexusMapStateListener.bindListener();

		this._exitNexusGameListener = new Listener("exit nexus game", () => {
			this.switchMapFromGame();
			nexus.changeToNexus();
			viewChanger.changeView("nexus", { nexusClose: true });
			this.resultWindow.close();
			nexusCoopChat.clearGameMode();
			nexusCoopChat.clearNexusMode();
		});
		this._exitNexusGameListener.bindListener();
	}

	get fragmentCount() {
		return this._fragmentCount;
	}

	set fragmentCount(newValue) {
		this.fragmentCounter.countToValue(newValue);
		this._fragmentCount = newValue;
	}

	get currentTileFocusY() {
		let targetRow = this.currentTile.row - 1.1;
		let targetY = this.mapBaseY + targetRow * this.tileHeight;
		return targetY;
	}

	get tileSize() {
		let documentWidth = $(document).width();
		if(documentWidth < this.SMALL_TILE_MAX_WIDTH) {
			return this.SMALL_TILE_SIZE;
		} else {
			return this.STANDARD_TILE_SIZE;
		}
	}

	get backdropSize() {
		return this.tileSize * 10;
	}

	loadMap(mapInfo, callback) {
		let targetCount = 4;
		let currentCount = 0;
		let loadCallack = () => {
			currentCount++;
			if (currentCount >= targetCount) {
				callback();
			}
		};

		let sfxGroup = audioController.getGroup("nexusSfx");
		let sfxLoadTarget = mapInfo.avatars.length;
		let sfxLoadCount = 0;
		mapInfo.avatars.forEach(({ attackEffectSet, artifacts, badgeInfo }) => {
			spriteSheetBuffer.loadAttackVFXSheet(attackEffectSet.sprite);
			sfxGroup.addDynamicBufferElement(
				attackEffectSet.sfx,
				cdnFormater.newNexusSfxSrc(attackEffectSet.sfx),
				false,
				-15,
				() => {
					sfxLoadCount++;
					if (sfxLoadCount >= sfxLoadTarget) {
						loadCallack();
					}
				}
			);
			artifacts.forEach((artifactInfo) => {
				this.setupArtifactFlashImage(artifactInfo);
			});

			if(badgeInfo) {
				this.setupBadgeFlashImage(badgeInfo);
			}
		});

		mapInfo.defaultAttacks.forEach((attackEffectSet) => {
			spriteSheetBuffer.loadAttackVFXSheet(attackEffectSet.sprite);
			sfxGroup.addDynamicBufferElement(
				attackEffectSet.sfx,
				cdnFormater.newNexusSfxSrc(attackEffectSet.sfx),
				false,
				-15
			);
		});

		mapInfo.flashBuffs.forEach((name) => {
			this.setupBuffFlashImage(name);
		});

		mapInfo.flashRuneNames.forEach((name) => {
			this.setupRuneFlashImage(name);
		});

		imageBuffer.waitMultipleCategoryLoad(["nexusTileIcons"], loadCallack);
		imageBuffer.waitBufferSpecficImages("nexusDungeonBG", mapInfo.mapGenres, loadCallack);
		this.ostAudioGroup.waitLoad(loadCallack);

		mapInfo.players.forEach((playerInfo) => {
			this.playerVoteIcons[playerInfo.gamePlayerId] = new NexusMapPlayerVoteIcon(playerInfo);
		});
	}

	get exitButtonText() {
		let currentRow = this.currentTile ? this.currentTile.row : 0;
		if(currentRow === 0 || Object.keys(this.playerVoteIcons).length > 1) {
			return "Exit";
		} else {
			return "Save & Exit";
		}
	}

	get exitButtonDesription() {
		let currentRow = this.currentTile ? this.currentTile.row : 0;
		if(currentRow === 0 || Object.keys(this.playerVoteIcons).length > 1) {
			return null;
		} else {
			return "If you exit doing an enemy encounter, the encounter will be reset";
		}
	}

	handleNewQuizEvents(events) {
		events.forEach((event) => {
			switch (event.type) {
				case NEXUS_EVENTS.PRE_PLAY:
					this.ostAudioGroup.fadeTrack("standard", this.FADE_OUT_PERCENT, event.fadeTime);
					break;
				case NEXUS_EVENTS.ABILITY_COOLDOWN_CHANGE:
					this.statusController.updateCooldown(event.targetName, event.currentCooldown);
					break;
				case NEXUS_EVENTS.DELAY_EVENT:
					this.handleNewQuizEvents(event.events);
					break;
				case NEXUS_EVENTS.QUEUE_EVENT:
					this.handleNewQuizEvents(event.events);
					break;
			}
		});
	}

	show() {
		this.$container.removeClass("hide");
		this.canvasController.startDynamicAnimation();
	}

	hide() {
		this.$container.addClass("hide");
		this.canvasController.stopDynamicAnimation();
	}

	initMap(activeSession) {
		if (!activeSession) {
			nexus.displayLoading();
		}
		this.canvasController.updateSize(activeSession);
		this.backgroundCanvas.updateCanvasSize();
		this.backdropCanvas.updateCanvasSize();
		this.backdropCanvas.drawBackdrop(this.backdropSize);

		this.canvasController.drawStatic();
		this.canvasController.drawDynamic();
		this.canvasController.drawExtraDynamic();
		this.canvasController.enableInputEvents();

		this._playNextSongListener.bindListener();

		nexusCoopChat.setNexusMode();
		this.active = true;
	}

	setupTiles(tileList) {
		this.tileRowMap = {};
		this.currentTileSize = this.tileSize;
		tileList.forEach(({ col, row, incomingDirections, connectionDirections, genre, typeId, visited }) => {
			if (!this.tileRowMap[row]) {
				this.tileRowMap[row] = {};
			}

			
			let tile = new NexusMapTile(
				this.canvasController.staticCtx,
				this.canvasController.dynamicCtx,
				this.canvasController.extraDynamicCtx,
				this.$iconOvelayContainer,
				row,
				col,
				this.currentTileSize,
				incomingDirections,
				connectionDirections,
				genre,
				typeId,
				visited
			);
			this.canvasController.addStaticElement(tile.staticTile);
			this.canvasController.addDynamicElement(tile.dynamicTile);
			this.canvasController.addExtraDynamicElement(tile.selectAnimationTile);
			this.tileRowMap[row][col] = tile;
			this.tileList.push(tile);
		});
		this.updateDragOffsetLimits();
	}

	updateDragOffsetLimits() {
		let rowCount = Object.values(this.tileRowMap).length;
		let tileHeight = Object.values(Object.values(this.tileRowMap)[0])[0].tileOuterHeight;

		let maxY = this.canvasController.staticCanvas.height - tileHeight;
		let minY = (rowCount - 1) * tileHeight;

		this.mapBaseY = maxY;
		this.tileHeight = tileHeight;

		this.canvasController.setTranslateLimits(0, 0, maxY, minY, this.DRAG_GRACE_SIZE);
	}

	handleTileSelect(row, col) {
		let tile = this.tileRowMap[row][col];
		this.canvasController.startExtraDynamicAnimation();
		tile.runSelectAnimation();
		setTimeout(() => {
			this.setCurrentTile(row, col);
		}, this.TILE_SELECT_ANIMATION_TIME);
	}

	setCurrentTile(row, col) {
		this.tileList.forEach((tile) => tile.setSelectable(false));
		let currentTile = this.tileRowMap[row][col];
		currentTile.outgoingConDirectionList.forEach((direction) => {
			let targetTile = this.getTileInDirection(row, col, direction);
			targetTile.setSelectable(true, direction);
		});
		currentTile.setVisited();
		currentTile.stopSelectAnimation();

		this.currentTile = currentTile;
		Object.keys(this.tileRowMap[row]).forEach((targetCol) => {
			targetCol = parseInt(targetCol);
			if (targetCol !== col) {
				this.disableTile(row, targetCol);
			}
		});

		let tileBGImage = imageBuffer.getImage("nexusDungeonBG", currentTile.genre);
		this.backgroundCanvas.displayImage(tileBGImage);

		this.canvasController.drawStatic();
		this.canvasController.stopExtraDynamicAnimation();
		this.canvasController.clearExtraDynamicFrame();

		this.clearPlayerVotes();

		this.clearTileDescription();
	}

	clearPlayerVotes() {
		Object.values(this.playerVoteIcons).forEach((icon) => {
			icon.detach();
		});
	}

	disableTile(row, col) {
		let tile = this.tileRowMap[row][col];
		tile.disable();

		tile.outgoingConDirectionList.forEach((direction) => {
			let targetTile = this.getTileInDirection(row, col, direction);
			targetTile.disableFromDirection(direction);
		});
	}

	getTileInDirection(currentRow, currentCol, direction) {
		let targetRow = currentRow + 1;
		let targetCol = currentCol + this.translateToDirectionToColChange(direction);

		return this.tileRowMap[targetRow][targetCol];
	}

	handleMouseMove(canvasX, canvasY) {
		if(this.mapElementsHidden) {
			return;
		}

		let targetTile = this.getTileInCords(canvasX, canvasY);
		let inTile;
		if (targetTile && targetTile.cordinateInTile(canvasX, canvasY)) {
			inTile = targetTile;
		}

		this.canvasController.displayClickable(inTile && inTile.selectable);
		if (this.currentHoverTile && this.currentHoverTile !== inTile) {
			this.currentHoverTile.mouseLeaveTile();
			this.currentHoverTile = null;
		}
		if (inTile) {
			inTile.mouseOnTile(
				this.$hoverContainer,
				this.canvasController.staticCanvas.translateX,
				this.canvasController.staticCanvas.translateY
			);
			this.currentHoverTile = inTile;
		}
	}

	clearTileDescription() {
		if (this.currentHoverTile) {
			this.currentHoverTile.hideDescription();
			this.currentHoverTile = null;
		}
	}

	handleMouseClick(canvasX, canvasY) {
		let clickedTile = this.getTileInCords(canvasX, canvasY);
		if (clickedTile && clickedTile.selectable) {
			socket.sendCommand({
				type: "nexus",
				command: "map select tile",
				data: {
					row: clickedTile.row,
					col: clickedTile.column,
				},
			});
		}
	}

	getTileInCords(x, y) {
		if (!this.currentTile) {
			return null;
		}
		let baseX = this.currentTile.tileSquareBoundaryX;
		let baseY = this.currentTile.canvasY;
		let tileHeight = this.currentTile.tileOuterHeight;
		let tileWidth = this.currentTile.tileOuterWidth;
		let baseRow = this.currentTile.row;
		let baseColmn = this.currentTile.column;

		let yDifference = y - baseY;
		let rowDifference = Math.floor(yDifference / tileHeight) * -1;

		let xDifference = x - baseX;
		let colDifference = Math.floor(xDifference / tileWidth);

		let targetRow = baseRow + rowDifference;
		let targetCol = baseColmn + colDifference;

		if (this.tileRowMap[targetRow] && this.tileRowMap[targetRow][targetCol]) {
			return this.tileRowMap[targetRow][targetCol];
		} else {
			return null;
		}
	}

	translateToDirectionToColChange(direction) {
		switch (direction) {
			case "up":
				return 0;
			case "left":
				return -1;
			case "right":
				return 1;
			default:
				return null;
		}
	}

	closeMap() {
		this.reset();
	}

	readjustCanvasSizes() {
		this.canvasController.updateSize(false, this.mapElementsHidden);
		this.backgroundCanvas.updateCanvasSize();
		this.backdropCanvas.updateCanvasSize(this.mapElementsHidden);

		if(this.currentTileSize !== this.tileSize) {
			this.currentTileSize = this.tileSize;
			this.tileList.forEach((tile) => tile.updateTileSize(this.tileSize));
		}

		this.backgroundCanvas.redraw();
		if(!this.mapElementsHidden) {
			this.backdropCanvas.drawBackdrop(this.backdropSize);
			this.canvasController.drawStatic();
			this.canvasController.drawDynamic();
			this.canvasController.drawExtraDynamic();
		}

		this.updateDragOffsetLimits();
	}

	reset() {
		this.tileRowMap = {};
		this.artifactFlashImageBuffer = {};
		this.buffFlashImageBuffer = {};
		this.playerVoteIcons = {};
		this.tileList = [];
		this.currentTile = null;
		this.clearTileDescription();

		this.active = false;

		this.fragmentCounter.currentValue = 0;
		this.fragmentCounter.targetValue = 0;

		this.$iconOvelayContainer.html("");

		this.exitButton.show();

		this.canvasController.resetCanvasContent();
		this.canvasController.stopDynamicAnimation();
		this.canvasController.stopExtraDynamicAnimation();
		this.canvasController.stopStaticAnimation();
		this.canvasController.enableInputEvents();
		this.backgroundCanvas.reset();
		this.backdropCanvas.clearCanvas();
		this.ostAudioGroup.resetAll();
		this.statusController.reset();
		this.eventWindow.close();
		this.rewardWindow.close();
		this.storeWindow.close();
		this.runeInventory.reset();

		this._playNextSongListener.unbindListener();
	}

	hideMapElements() {
		this.canvasController.disableInputEvents();
		this.canvasController.stopDynamicAnimation();
		this.canvasController.stopExtraDynamicAnimation();
		this.canvasController.displayClickable(false);
		this.canvasController.clearFrame();
		this.backdropCanvas.clearCanvas();
		this.mapElementsHidden = true;

		if(this.currentHoverTile) {
			this.currentHoverTile.hideDescription();
			this.currentHoverTile = null;
		}
	}

	pauseOSTTrack() {
		this.ostAudioGroup.pauseTrack("standard");
	}

	fadeOSTTrack(target, lengthMs) {
		this.ostAudioGroup.fadeTrack("standard", target, lengthMs);
	}

	setupArtifactFlashImage({ flashAble, fileName }) {
		if (flashAble) {
			let img = new Image();
			let src = cdnFormater.newNexusArtifactIconSrc(fileName);
			let srcset = cdnFormater.newNexusArtifactIconSrcSet(fileName);
			img.sizes = "20vh";
			img.srcset = srcset;
			img.src = src;
			this.artifactFlashImageBuffer[fileName] = img;
		}
	}

	getArtifactFlashImage(artifactName) {
		return this.artifactFlashImageBuffer[artifactName];
	}

	setupBuffFlashImage(name) {
		let img = new Image();
		let src = cdnFormater.newNexusAbilityIconSrc(name);
		let srcset = cdnFormater.newNexusAbilityIconSrcSet(name);
		img.sizes = "20vh";
		img.srcset = srcset;
		img.src = src;
		this.buffFlashImageBuffer[name] = img;
	}

	getBuffFlashImage(name) {
		return this.buffFlashImageBuffer[name];
	}

	setupRuneFlashImage(name) {
		let img = new Image();
		let src = cdnFormater.newNexusRuneIconSrc(name);
		let srcset = cdnFormater.newNexusRuneIconSrcSet(name);
		img.sizes = "20vh";
		img.srcset = srcset;
		img.src = src;
		this.runeFlashImageBuffer[name] = img;
	}

	getRuneFlashImage(name) {
		return this.runeFlashImageBuffer[name];
	}

	setupBadgeFlashImage(badgeInfo) {
		let {avatarId, level} = badgeInfo;

		if(!this.badgeFlashImageBuffer[avatarId]) {
			let badge = new NexusBadge(level, badgeInfo, 200);
			this.badgeFlashImageBuffer[avatarId] = badge;
		}
	}

	getBadgeFlashImage(avatarId) {
		return this.badgeFlashImageBuffer[avatarId] ? this.badgeFlashImageBuffer[avatarId].$body : null;
	}

	switchMapFromGame() {
		viewChanger.changeView("nexus", { activeNexusSession: true, supressServerMsg: true });
		this.ostAudioGroup.playTrack("standard");
		this.ostAudioGroup.fadeTrack("standard", 0, 1500);
		this.canvasController.startDynamicAnimation();
		this.mapElementsHidden = false;
		clearAllPopovers();
	}

	scrollMapTop() {
		//Canvas got a max/min scroll value, so pass large value to hit max/min
		this.canvasController.updateTranslate(0, 99999);
		this.canvasController.drawStatic();
	}

	panMapToBottom(delay, callback = () => {}) {
		let panSpeed =
			Math.abs(
				this.canvasController.staticCanvas.vertMinDragLimit - this.canvasController.staticCanvas.vertMaxDragLimit
			) / this.FULL_PAN_TIME;
		this.panMapToCord(this.canvasController.staticCanvas.vertMinDragLimit, panSpeed, delay, callback);
	}

	panMapToCord(targetY, panSpeed, delay, callback = () => {}) {
		this.$container.addClass("activePan");
		this.activePan = true;

		let controller = new TickController(
			(deltaTimeMs) => {
				let distance = Math.ceil(deltaTimeMs * panSpeed);
				this.canvasController.updateTranslate(0, -distance);
				this.canvasController.drawStatic();
			},
			() => {
				if (panSpeed > 0) {
					return (
						targetY >= this.canvasController.staticCanvas.translateY ||
						this.canvasController.staticCanvas.translateY <= this.canvasController.staticCanvas.vertMinDragLimit
					);
				} else {
					return (
						targetY <= this.canvasController.staticCanvas.translateY ||
						this.canvasController.staticCanvas.translateY >= this.canvasController.staticCanvas.vertMaxDragLimit
					);
				}
			},
			() => {
				this.$container.removeClass("activePan");
				this.activePan = false;
				callback();
			}
		);
		if (delay) {
			setTimeout(() => {
				controller.start();
			}, delay);
		} else {
			controller.start();
		}
	}

	focusMapOnCurrentTile() {
		let yChange = this.currentTileFocusY - this.canvasController.staticCanvas.translateY;
		this.canvasController.updateTranslate(0, yChange);
	}

	panToCurrentTile() {
		let panSpeedMod = this.currentTileFocusY > this.canvasController.staticCanvas.translateY ? -1 : 1;
		this.panMapToCord(this.currentTileFocusY, this.FOCUS_PAN_SPEED * panSpeedMod, 0);
	}

	displayFinalResult({xpDistribution, avatarXpInfo, runeMods}, text) {
		this.switchMapFromGame();
		this.panMapToBottom(this.INITIAL_PAN_DELAY, () => {
			this.resultWindow.displayResult(
				xpDistribution,
				this.statusController.getAvatarDescriptions(),
				avatarXpInfo,
				runeMods,
				text
			);
			this.resultWindow.open();
		});
		this.exitButton.hide();
	}
}

NexusMapController.prototype.FADE_OUT_PERCENT = 100;
NexusMapController.prototype.DRAG_GRACE_SIZE = 40;
NexusMapController.prototype.FULL_PAN_TIME = 4000; //ms
NexusMapController.prototype.INITIAL_PAN_DELAY = 1000; //ms
NexusMapController.prototype.FOCUS_PAN_SPEED = 0.8; //px/ms
NexusMapController.prototype.TILE_SELECT_ANIMATION_TIME = 1050; //ms
NexusMapController.prototype.SMALL_TILE_MAX_WIDTH = 1250; //px
NexusMapController.prototype.STANDARD_TILE_SIZE = 80; //px
NexusMapController.prototype.SMALL_TILE_SIZE = 60; //px

class NexusMapPlayerVoteIcon {
	constructor({
		name,
		icon: {
			emoteId,
			avatarInfo: {
				avatar: { avatarName, outfitName, colorName, optionName, optionActive },
			},
		},
	}) {
		this.$icon = $(this.TEMPLATE);
		this.$img = this.$icon.find(".nexusVoteIconImg");

		let src, srcSet;
		if (emoteId) {
			let emote = storeWindow.getEmote(emoteId);
			src = emote.src;
			srcSet = emote.srcSet;
		} else {
			src = cdnFormater.newAvatarHeadSrc(avatarName, outfitName, optionName, optionActive, colorName);
			srcSet = cdnFormater.newAvatarHeadSrcSet(avatarName, outfitName, optionName, optionActive, colorName);
		}

		this.imagePreload = new PreloadImage(this.$img, src, srcSet, true, "25px");

		this.$icon.popover({
			content: name,
			delay: 50,
			placement: "top",
			trigger: "hover",
		});
	}

	detach() {
		this.$icon.detach();
	}
}
NexusMapPlayerVoteIcon.prototype.TEMPLATE =
	'<div class="nexusVoteIcon"><img class="nexusVoteIconImg" sizes="25px" ></div>';
