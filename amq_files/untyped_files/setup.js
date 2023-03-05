"use strict";
var setupDocumentDone = false;
$(document).ready(function () {
	setupDocumentDone = true;
	clientSetup();
});

window.addEventListener("keydown", function (e) {
	if (e.keyCode === 221 && e.ctrlKey && e.shiftKey) {
		e.preventDefault();
	}
});

function clientSetup() {
	if (setupDocumentDone) {
		//Add listner for setup to complete
		var setupCallback = new Listener("login complete", function (payload) {
			// let time = new Date();
			// let reportTime = function(stage) {
			// 	let passedTime = new Date() - time;
			// 	console.log(`Setup Stage ${stage} completed. Time: ${passedTime}`);
			// 	time = new Date();
			// };
			selfName = payload.self;
			isGameAdmin = payload.gameAdmin;
			isTopAdmin = payload.topAdmin;
			taxRate = payload.saleTax;
			options.setup(
				payload.malName,
				payload.malLastUpdate,
				payload.settings,
				payload.aniList,
				payload.aniListLastUpdate,
				payload.kitsu,
				payload.kitsuLastUpdate,
				payload.useRomajiNames,
				payload.serverStatuses,
				payload.videoHostNames
			);
			// reportTime(1);
			viewChanger.setup();
			hostModal.setup(payload.genreInfo, payload.tagInfo, payload.savedQuizSettings);
			roomBrowser.setup();
			gameChat.setup();
			// reportTime(2);
			quizVideoController.setup();
			quiz.setup();
			reportModal.setup();
			volumeController.setup(); //Dependent on quizVideoController, call only after it have been setup
			// reportTime(3);
			avatarDrive.setup(
				payload.top5AvatarNominatios,
				payload.top5AllTime,
				payload.top5Montly,
				payload.top5Weekly,
				payload.recentDonations,
				payload.driveTotal,
				payload.freeDonation
			);
			// reportTime(4);
			newsManager.setup();
			avatarDriveModal.setup(payload.backerLevel, payload.freeDonation);
			afkKicker.setup();
			qualityController.setup();
			settingRandomizer.setup(payload.genreInfo, payload.tagInfo);
			roomFilter.setup();
			idTranslator.setup(payload.genreInfo, payload.tagInfo);
			expandLibrary.setup(payload.expandCount);
			battleRoyal.setup();
			promoCarousel.setup();
			ranked.setup(payload.rankedState);
			// reportTime(5);
			storeWindow.setup(
				payload.defaultAvatars,
				payload.unlockedDesigns,
				payload.avatar,
				payload.characterUnlockCount,
				payload.avatarUnlockCount,
				payload.emoteGroups,
				payload.rhythm,
				payload.unlockedEmoteIds,
				payload.favoriteAvatars,
				payload.recentTicketRewards,
				payload.avatarTokens,
				payload.rollTargets,
				payload.saleInfo
			);
			// reportTime(6);
			socialTab.setup(payload.friends, payload.blockedPlayers);
			// reportTime(7);
			leaderboardModule.setup(payload.rankedLeaderboards, payload.rankedChampions);
			patreon.setup(
				payload.patreonId,
				payload.backerLevel,
				payload.badgeLevel,
				payload.customEmojis,
				payload.patreonBadgeInfo,
				payload.patreonDesynced
			);
			// reportTime(8);
			emojiSelector.setup(payload.recentEmotes);
			guestRegistrationController.setup(payload.guestAccount);
			cheatTestModal.setup(isGameAdmin, payload.cheatTestEntries);
			cheatTestGame.setup(quiz);
			nameChangeModal.setup(payload.nameChangeTokens);
			tutorial.setup(payload.tutorialState);
			nexus.setup(payload.nexusStatBaseMax, payload.nexusBuffs);
			emoteSelector.setup();
			socialRewardModal.setup(payload.twitterClaimed, payload.discordClaimed);
			qusetContainer.setup(payload.questDescriptions, payload.questTokenProgress);
			// reportTime(9);

			hostModal.reset();

			if (payload.displayArtContestPopUp) {
				displayHtmlMessage(
					"AMQ Art Contest Vote",
					"The AMQ Art Contest is underway, help select the winner <a href='/artContest' target='_blank'>here</a>",
					"Close"
				);
			}

			if (payload.restartState) {
				popoutMessages.displayRestartMessage(payload.restartState.msg, payload.restartState.time);
			}

			if(payload.disableRanked) {
				$("#mpRankedButton").addClass('disabled');
			}

			if (payload.canReconnectGame) {
				displayOption(
					"Rejoin Disconnect Game",
					"You where disconnected from your last game, want to rejoin it?",
					"Rejoin",
					"Cancel",
					() => {
						let joinGameListner;
						joinGameListner = new Listener(
							"Join Game",
							function (response) {
								if (response.error) {
									displayMessage(response.errorMsg);
								} else {
									response.spectators.forEach((spectator) => {
										gameChat.addSpectator(spectator);
									});
									if (response.quizState.state === quiz.QUIZ_STATES.BATTLE_ROYAL) {
										battleRoyal.setupGame(
											response.quizState.players,
											false,
											response.settings,
											response.quizState.timeLeft,
											response.quizState.mapState,
											response.soloMode,
											response.playerBRState
										);
										viewChanger.changeView("battleRoyal");
									} else {
										quiz.setupQuiz(
											response.quizState.players,
											false,
											response.quizState,
											response.settings,
											response.hostName === selfName,
											response.quizState.groupSlotMap,
											response.soloMode,
											response.teamAnswers,
											response.selfAnswer,
											response.champGame
										);
										viewChanger.changeView("quiz");
									}
								}
								joinGameListner.unbindListener();
							}.bind(this)
						);
						joinGameListner.bindListener();
						socket.sendCommand({
							command: "rejoin game",
							type: "roombrowser",
						});
					},
					() => {},
					true
				);
			} else if(payload.canReconnectNexus) {
				displayOption(
					"Rejoin Disconnect Nexus Game",
					"You where disconnected from your last nexus game, want to rejoin it?",
					"Rejoin",
					"Cancel",
					() => {
						nexus.displayLoading();
						viewChanger.changeView("nexus", {
							rejoin: true,
						});
						nexus.changeToDungeon();
						nexus.cityController.loadNexusCityContent(() => {
							socket.sendCommand({
								command: "rejoin nexus game",
								type: "nexus",
							});
						});
					},
					() => {},
					true
				);
			} else if (payload.rewardAlert) {
				let rewardAlert = payload.rewardAlert;
				swal({
					title: "Reward Unlocked!",
					html: format(
						"<img src='{0}' style='max-width: 100%'/><div>Based on your performance in the 2020 Ranked Seasons you've earned the {1} badge. Best of luck in the 2021 seasons!</div>",
						cdnFormater.newBadgeSrc(rewardAlert.fileName),
						rewardAlert.name
					),
					onClose: () => {
						socket.sendCommand({
							command: "reward alert recived",
							type: "settings",
							data: {
								rewardAlertId: rewardAlert.userRewardAlertId,
							},
						});
					},
				});
			}

			//Load bootstrap elements
			$('[data-toggle="popover"]').popover();

			$('[data-toggle="tooltip"]').tooltip();

			//Set event to update scrollbar layout when window size changes
			$(window).resize(function () {
				$(".ps").perfectScrollbar("update");
			});

			// Prevent the backspace key from navigating back.
			$(document)
				.unbind("keydown")
				.bind("keydown", function (event) {
					if (event.keyCode === 8) {
						var doPrevent = true;
						var types = [
							"text",
							"password",
							"file",
							"search",
							"email",
							"number",
							"date",
							"color",
							"datetime",
							"datetime-local",
							"month",
							"range",
							"search",
							"tel",
							"time",
							"url",
							"week",
						];
						var d = $(event.srcElement || event.target);
						var disabled = d.prop("readonly") || d.prop("disabled");
						if (!disabled) {
							if (d[0].isContentEditable) {
								doPrevent = false;
							} else if (d.is("input")) {
								var type = d.attr("type");
								if (type) {
									type = type.toLowerCase();
								}
								if (types.indexOf(type) > -1) {
									doPrevent = false;
								}
							} else if (d.is("textarea")) {
								doPrevent = false;
							}
						}
						if (doPrevent) {
							event.preventDefault();
							return false;
						}
					}
				});
			let disabledKeycodes = [9, 33, 34]; //Tab, Page up, page Down. May brake layout in Chrome.
			let disableTabExemptIds = ["grUsername", "grPassword", "grPasswordRepeat", "grEmail"];
			$("#gameContainer").bind("keydown", (event) => {
				if (
					disabledKeycodes.includes(event.keyCode) &&
					(event.keyCode !== 9 || !disableTabExemptIds.includes(event.target.id))
				) {
					event.preventDefault();
				}
			});

			new Listener("force logoff", (data) => {
				displayMessage(
					"Kicked by Server",
					data.reason,
					() => {
						window.location = "/";
					},
					false,
					true
				);
			}).bindListener();

			new Listener("alert", (data) => {
				displayMessage(data.title, data.message, null, data.easyClose);
			}).bindListener();

			new Listener("html alert", (data) => {
				swal({
					title: data.title,
					html: data.body,
				});
				if (data.storeTransactionTrigger) {
					storePriceModal.hide();
				}
			}).bindListener();

			new Listener("self name changed", (data) => {
				selfName = data.newName;
			}).bindListener();

			new Listener("unknown error", () => {
				displayOption(
					"Unknown Error",
					"An unknown error happened. Restarting the game is recommended, continuing the current session may result in more errors.",
					"Restart",
					"Continue Session",
					() => {
						window.location = "/";
					}
				);
			}).bindListener();

			

			viewChanger.hideLoadingScreen();
			xpBar.setup(payload.xpInfo, payload.level, payload.credits, payload.tickets); //Do last, to let animation run
			hostModal.reset(); //Setup once level have been loaded
			setupCallback.unbindListener();
		});

		setupCallback.bindListener();

		socket.setup(); //Call after all setup listners have been added
	}
}
