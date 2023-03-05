"use strict";

class SocialTabFriendEntry {
	constructor(friendInfo, offline, $scrollContainer) {
		this.status = friendInfo.status;
		this.name = friendInfo.name;
		this.$html = $(
			format(
				this.TEMPLATE,
				friendInfo.name,
				this.statusText,
				this.colorStatusClass
			)
		);
		this.$nameContainer = this.$html.find('.stPlayerNameContainer');
		this.$name = this.$nameContainer.find("h4");
		this.$sociaiStatusText = this.$html.find(".stPlayerName > h3");
		this.$scrollContainer = $scrollContainer;
		this.imagePreload;
		this.inList = null;
		this.inGame = false;
		this.gameState = friendInfo.gameState;

		contextMenueGenerator.generateFriendListContextMenu(this.$html, ".stPlayerName", this.name);
		this.updateStatus(this.status, friendInfo.gameState);
		this.updateAvatar(friendInfo);

		let $profileButton = this.$html.find(".stPlayerProfileButton");
		$profileButton.click(() => {
			playerProfileController.loadProfileIfClosed(
				friendInfo.name,
				$profileButton,
				{ x: 7 },
				() => {
					this.$html.removeClass("profileOpen");
				},
				offline
			);
			this.$html.addClass("profileOpen");
		});
	}

	get colorStatusClass() {
		switch (this.status) {
			case 1:
				return "socialTabPlayerSocialStatusInnerCircleColorOnline";
			case 2:
				return "socialTabPlayerSocialStatusInnerCircleColorDoNotDisturb";
			case 3:
				return "socialTabPlayerSocialStatusInnerCircleColorAway";
			default:
				return "socialTabPlayerSocialStatusInnerCircleColorOffline";
		}
	}

	get statusText() {
		return socialTab.socialStatus.getSocialStatusInfo(this.status);
	}

	updateName(newName) {
		this.name = newName;
		this.$name.text(newName);
		contextMenueGenerator.generateFriendListContextMenu(this.$html, ".stPlayerName", this.name);
		this.updateTextSize();
	}

	updateTextSize() {
		fitTextToContainer(this.$name, this.$nameContainer, 24, 10);
	}

	destroy() {
		this.imagePreload.cancel();
		this.$html.remove();
	}

	updateStatus(newStatus, gameState) {
		this.status = newStatus;
		this.gameState = gameState;
		this.$html
			.find(".socialTabPlayerSocialStatusInnerCircle")
			.attr("class", "socialTabPlayerSocialStatusInnerCircle")
			.addClass(this.colorStatusClass);
		let text = "";
		this.inGame = false;
		if(gameState && gameState.inNexusLobby) {
			let textMod = gameState.coop ? "Co-Op" : "Solo";
			if(gameState.activeRun) {
				text = `Playing ${textMod} Nexus`;
			} else {
				text = `In ${textMod} Nexus Lobby`;
			}
		} else if(gameState) {
			this.inGame = true;
			let textMod = "";
			if(gameState.soloGame) {
				textMod = 'Solo ';
			} else if(gameState.private) {
				textMod = 'Private ';
			} else if(gameState.isRanked) {
				textMod = 'Ranked ';
			}
			if(gameState.inLobby) {
				text = `In ${textMod}Lobby`;
			} else if(gameState.isSpectator) {
				text = `Spectating ${textMod}Quiz`;
			} else {
				text = `In ${textMod}Quiz`;
			}
		} else {
			text = this.statusText;
		}
		this.$sociaiStatusText.text(text);
	}

	detach() {
		this.$html.detach();
		this.inList = null;
	}

	updateAvatar(avatarInfo) {
		let src, srcSet;
		if (avatarInfo.profileEmoteId != null) {
			let emote = storeWindow.getEmote(avatarInfo.profileEmoteId);
			src = emote.src;
			srcSet = emote.srcSet;
		} else {
			src = cdnFormater.newAvatarHeadSrc(
				avatarInfo.avatarName,
				avatarInfo.outfitName,
				avatarInfo.optionName,
				avatarInfo.optionActive,
				avatarInfo.colorName
			);
			srcSet = cdnFormater.newAvatarHeadSrcSet(
				avatarInfo.avatarName,
				avatarInfo.outfitName,
				avatarInfo.optionName,
				avatarInfo.optionActive,
				avatarInfo.colorName
			);
		}

		if (this.imagePreload) {
			this.imagePreload.cancel();
		}
		this.imagePreload = new PreloadImage(
			this.$html.find(".friendPlayerEntryPictureImage"),
			src,
			srcSet,
			false,
			null,
			null,
			false,
			this.$scrollContainer,
			false,
			this.$html
		);
	}

	checkLazyLoad() {
		this.imagePreload.lazyLoadEvent();
	}
}

SocialTabFriendEntry.prototype.TEMPLATE = $("#socialMenuFriendPlayerTemplate").html();
