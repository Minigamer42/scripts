"use strict";

class PlayerProfile {
	constructor(profileInfo, offset, onClose, offline, inGame) {
		this.$profile;
		this.onClose = onClose;
		this.contextMenuShown = false;
		this.editActive = false;

		let avatarInfo = profileInfo.avatar;
		let avatarImageSrc = cdnFormater.newAvatarHeadSrc(
			avatarInfo.avatarName,
			avatarInfo.outfitName,
			avatarInfo.optionName,
			avatarInfo.optionActive,
			avatarInfo.colorName
		);
		let avatarImageSrcset = cdnFormater.newAvatarHeadSrcSet(
			avatarInfo.avatarName,
			avatarInfo.outfitName,
			avatarInfo.optionName,
			avatarInfo.optionActive,
			avatarInfo.colorName
		);
		let targetName = profileInfo.name;

		let src, srcSet;
		if (profileInfo.avatarProfileImage) {
			src = avatarImageSrc;
			srcSet = avatarImageSrcset;
		} else {
			let emote = storeWindow.getEmote(profileInfo.profileEmoteId);
			src = emote.src;
			srcSet = emote.srcSet;
		}

		this.$profile = $(
			format(
				this.PROFILE_TEMPLATE,
				targetName,
				profileInfo.level,
				profileInfo.creationDate.value,
				profileInfo.songCount.value,
				profileInfo.guessPercent.value,
				profileInfo.originalName
			)
		);
		new PreloadImage(this.$profile.find(".ppProfileImg"), src, srcSet);

		this.$profile.css("top", offset.y + "px").css("left", offset.x + "px");

		this.$profile.find(".close").click(() => {
			this.close();
		});
		this.$profile
			.find(".startChat")
			.click(() => {
				socialTab.startChat(targetName);
			})
			.popover({
				content: "Chat",
				delay: 50,
				placement: "top",
				trigger: "hover",
			});
		this.$profile
			.find(".addFriend")
			.click(() => {
				socialTab.sendFriendRequest(targetName);
			})
			.popover({
				content: "Add Friend",
				delay: 50,
				placement: "top",
				trigger: "hover",
			});
		this.$profile
			.find(".block")
			.click(() => {
				socialTab.blockPlayer(targetName);
			})
			.popover({
				content: "Block",
				delay: 50,
				placement: "top",
				trigger: "hover",
			});
		this.$profile
			.find(".report")
			.click(() => {
				reportModal.show(targetName);
			})
			.popover({
				content: "Report",
				delay: 50,
				placement: "top",
				trigger: "hover",
			});

		this.$additionalOptionsButton = this.$profile.find(".additional");
		this.$additionalOptionsButton.click((event) => {
			if (this.contextMenuShown) {
				this.$additionalOptionsButton.contextMenu("hide");
				event.stopImmediatePropagation();
			}
		});
		$.contextMenu(this.createContextMenuObject(targetName, offline, inGame));

		if (targetName === selfName) {
			this.$profile.find(".report").addClass("disabled");
		}
		if (targetName === selfName || offline) {
			this.$profile.find(".startChat").addClass("disabled");
		}
		if (targetName === selfName || socialTab.isFriend(targetName) || offline) {
			this.$profile.find(".addFriend").addClass("disabled");
		}
		if (targetName === selfName || socialTab.isBlocked(targetName)) {
			this.$profile.find(".block").addClass("disabled");
		}

		this.statsLines = {
			creationDate: new ProfileStatsLine(
				this.$profile.find(".creationDate"),
				"creationDate",
				profileInfo.creationDate.hidden,
				profileInfo.creationDate.adminView
			),
			songCount: new ProfileStatsLine(
				this.$profile.find(".songCount"),
				"songCount",
				profileInfo.songCount.hidden,
				profileInfo.songCount.adminView
			),
			guessPercent: new ProfileStatsLine(
				this.$profile.find(".guessPercent"),
				"guessPercent",
				profileInfo.guessPercent.hidden,
				profileInfo.guessPercent.adminView
			),
			list: new ListProfileStatsLine(
				this.$profile.find(".list"),
				"list",
				profileInfo.list.hidden,
				profileInfo.list.adminView,
				profileInfo.list.listId,
				profileInfo.list.listUser,
				profileInfo.list.listUserUrl
			),
		};

		this.badgeHandler = new ProfileBadgeHandler(profileInfo.allBadges, profileInfo.badges);
		this.badgeContainer = new ProfileBadgeContainer(this.badgeHandler, profileInfo.badges, this.$profile);
		this.badgeOptionContainer = new ProfileBadgeOptionContainer(
			this.badgeHandler,
			profileInfo.allBadges,
			this.$profile
		);

		if (targetName === selfName) {
			this.imageSelector = new ProfileImageSelector(
				this.$profile,
				profileInfo.avatarProfileImage,
				profileInfo.profileEmoteId,
				avatarImageSrc,
				avatarImageSrcset
			);

			this.$profile
				.find(".ppEditNameButton")
				.popover({
					content: "Change Nickname",
					delay: 50,
					container: ".playerProfileContainer",
					placement: "top",
					trigger: "hover",
				})
				.click(() => {
					nameChangeModal.show();
				});

			let $chatColorToggleContainer = this.$profile.find(".ppBadgeOptionChallengerChatColorToggle");
			$chatColorToggleContainer.find(".ppBadgeOptionChatEffectHeader").popover({
				content: "Unique name color in chat, unlocked by qualifying for last season's ranked championship",
				delay: 50,
				placement: "top",
				trigger: "hover",
				container: ".ppBadgeOptions",
			});
			let colorToggleSwitch = new Switch($chatColorToggleContainer.find(".switchContainer"));

			if(!profileInfo.rankedChatColorUnlocked) {
				colorToggleSwitch.setOn(false);
				colorToggleSwitch.setDisabled(true);
			} else {
				colorToggleSwitch.setOn(profileInfo.chatColorActive);
				colorToggleSwitch.addListener((on) => {
					socket.sendCommand({
						type: "social",
						command: "toggle chat color",
						data: {
							on
						},
					});
				});
			}

			let $chatGlowToggleContainer = this.$profile.find(".ppBadgeOptionChallengerChatGlowToggle");
			$chatGlowToggleContainer.find(".ppBadgeOptionChatEffectHeader").popover({
				content: "Unique name glow in chat, unlocked by qualifying for last season's ranked championship",
				delay: 50,
				placement: "top",
				trigger: "hover",
				container: ".ppBadgeOptions",
			});
			let glowToggleSwitch = new Switch($chatGlowToggleContainer.find(".switchContainer"));

			if(!profileInfo.rankedChatGlowUnlocked) {
				glowToggleSwitch.setOn(false);
				glowToggleSwitch.setDisabled(true);
			} else {
				glowToggleSwitch.setOn(profileInfo.chatGlowActive);
				glowToggleSwitch.addListener((on) => {
					socket.sendCommand({
						type: "social",
						command: "toggle chat glow",
						data: {
							on
						},
					});
				});
			}
		}
	}

	resizeName() {
		let $nameContainer = this.$profile.find(".ppPlayerNameContainer");
		let $originalName = this.$profile.find(".ppPlayerOriginalName");
		let $name = $nameContainer.find(".ppPlayerName");
		fitTextToContainer($name, $nameContainer, 24, 12);
		$name.css("display", "none");
		$originalName.css("display", "initial");
		fitTextToContainer($originalName, $nameContainer, 24, 12);
		$name.css("display", "");
		$originalName.css("display", "");
	}

	close() {
		if (this.onClose) {
			this.onClose();
		}
		this.$additionalOptionsButton.contextMenu("destroy");
		this.$profile.remove();
	}

	toggleEdit() {
		this.$profile.toggleClass("edit");
		this.editActive = !this.editActive;
		this.badgeContainer.toggleEdit(this.editActive);
		this.badgeOptionContainer.toggleEdit(this.editActive);
		if (!this.editActive) {
			this.badgeHandler.resetSelection();
		} else {
			this.imageSelector.displayed();
			if (playerProfileController.editToggleOnListener) {
				playerProfileController.editToggleOnListener();
			}
		}
	}

	createContextMenuObject(playerName, offline, inGame) {
		let items = {
			InviteToGame: {
				name: "Invite to Game",
				callback: () => {
					if (guestRegistrationController.isGuest) {
						displayMessage("Unavailable for Guess Accounts", "Guest accounts are not able to send game invites");
					} else if (!(lobby.inLobby || quiz.inQuiz || nexus.inNexusLobby)) {
						displayMessage("You're not in a game");
					} else if ((lobby.inLobby && lobby.soloMode) || (quiz.inQuiz && quiz.soloMode) || (nexus.inNexusLobby && !nexus.inCoopLobby)) {
						displayMessage("Can't Invite Players when Playing Solo");
					} else {
						socket.sendCommand({
							type: "social",
							command: "invite to game",
							data: {
								target: playerName,
							},
						});
					}
				},
			},
		};

		if (playerName === selfName) {
			items.Edit = {
				name: "Edit",
				callback: () => {
					this.toggleEdit();
				},
			};
		}

		return {
			selector: ".playerProfileContainer .additional",
			trigger: "left",
			appendTo: this.$profile,
			itemClickEvent: true,
			build: () => {
				return {
					items: items,
					events: {
						show: (options) => {
							if (playerName === selfName || offline || inGame) {
								options.items.InviteToGame.disabled = true;
							}
							this.contextMenuShown = true;
						},
						hide: () => {
							this.contextMenuShown = false;
						},
					},
				};
			},
			position: function (opt, x, y) {
				var offset;
				// determine contextMenu position
				if (!x && !y) {
					opt.determinePosition.call(this, opt.$menu);
					return;
				} else if (x === "maintain" && y === "maintain") {
					// x and y must not be changed (after re-show on command click)
					offset = opt.$menu.position();
				} else {
					// x and y are given (by mouse event)
					var offsetParentOffset = opt.$menu.offsetParent().offset();
					offset = { top: y - offsetParentOffset.top, left: x - offsetParentOffset.left };
				}

				// correct offset if viewport demands it
				var bottom = $(window).scrollTop() + $(window).height(),
					right = $(window).scrollLeft() + $(window).width(),
					height = opt.$menu.outerHeight(),
					width = opt.$menu.outerWidth();

				if (y + height > bottom - 5) {
					offset.top -= height;
				}

				if (offset.top < 0) {
					offset.top = 0;
				}

				if (x + width > right) {
					offset.left -= width;
				}

				if (offset.left < 0) {
					offset.left = 0;
				}

				opt.$menu.css(offset);
			},
		};
	}
}

PlayerProfile.prototype.PROFILE_TEMPLATE = $("#playerProfileTemplate").html();
PlayerProfile.prototype.PROFILE_IMAGE_SIZE = 100; //px
