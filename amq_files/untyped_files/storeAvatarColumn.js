"use strict";
/*exported StoreAvatarColumn*/

class StoreAvatarColumn {
	constructor() {
		this.$bottomColumn = $("#swRightColumnBottomInner");
		this.$name = $("#swRightColumnAvatarNameArea > h2");
		this.$avatarImage = $("#swRightColumnAvatarImage");
		this.$avatarImageContainer = $("#swRightColumnAvatarImageContainer");
		this.$actionButton = $("#swRightColumnActionButton");
		this.$actionButtonMainContainer = $("#swRightColumActionButtonMainContainer");
		this.$actionButtonText = $("#swRightColumnActionButtonText");
		this.$actionButtonPriceContainer = $("#swRightColumnActionButtonPriceContainer");
		this.$actionButtonPriceText = $("#swRightColumnActionButtonPrice");
		this.$actionButtonPriceIcon = $("#swRightColumnActionButtonIcon");
		this.$actionButtonRhythmContainer = $("#swRightColumnActionButtonRhythmPriceContainer");
		this.$actionButtonFavoriteContainer = $("#swRightColumnActionButtonFavoriteContainer");
		this.$actionButtonFavoriteStarSelected = this.$actionButtonFavoriteContainer.find('.fa-star');
		this.$actionButtonFavoriteStarUnselected = this.$actionButtonFavoriteContainer.find('.fa-star-o');
		this.$swRightColumnActionButtonRhythmPrice = $("#swRightColumnActionButtonRhythmPrice");
		this.$worldName = $("#swRightColumnWolrdName");
		this.$artistName = $("#swRightColumnArtistName");
		this.$editerName = $("#swRightColumnEditorName");
		this.$loreText = $("#swLoreText");
		this.$avatarContainer = $("#swRightColumnAvatarContainer");
		this.$extraInfoContainer = $("#swRightColumnExtraInfoContainer");
		this.$backgroundButton = $("#swRightColumnAvatarChangeBackgroundButton");
		this.$bonusBadgeIconImage = $("#swRightColumnAvatarBonusBadge > img");

		this.poseButtonsByName = {
			BASE: $("#swRightColumnBasePoseButton"),
			THINKING: $("#swRightColumnThinkingPoseButton"),
			WRONG: $("#swRightColumnWrongPoseButton"),
			RIGHT: $("#swRightColumnRightPoseButton"),
			WAITING: $("#swRightColumnWaitingPoseButton"),
			CONFUSED: $("#swRightColumnConfusedPoseButton"),
		};

		this.actionState = this.ACTION_STATES.NONE;

		this.activeFavoriteId;

		this.$bottomColumn.perfectScrollbar({
			suppressScrollX: true,
		});

		this.characterProgressBar = new StoreColumnProgressBar(
			$("#swRightColumnAvatarBonusBar"),
			$("#swRightColumnAvatarBonusEndpoint")
		);
		this.avatarProgressBar = new StoreColumnProgressBar(
			$("#swRightColumnSkinBonusBar"),
			$("#swRightColumnSkinBonusEndpoint")
		);

		this.currentAvatar;
		this.currentBackground;
		this.currentImagePreload;
		this.currentPose;

		Object.keys(this.poseButtonsByName).forEach((poseName) => {
			let $button = this.poseButtonsByName[poseName];
			$button.click(() => {
				if (!$button.hasClass("active")) {
					this.setImagePose(poseName);
				}
			});
		});

		this.$actionButtonFavoriteContainer.popover({
			content: "Toggle Favorite",
			html: true,
			delay: 50,
			placement: "auto top",
			trigger: "hover",
			container: "#swRightColumn",
		});

		this.$bonusBadgeIconImage.popover({
			content: "",
			html: true,
			delay: 50,
			placement: "auto top",
			trigger: "hover",
			container: "#swRightColumn",
		});

		let toggleCallback = function (active) {
			this.currentAvatar.optionActive = active;
			this.setImagePose(this.currentPose);
			this.updateActionButton();
		}.bind(this);
		this.toggleButton = new ToggleButton(
			$("#swRightColumnAvatarToggleButton"),
			$("#swRightColumnAvatarToggleButtonInner"),
			"Toggle On",
			"Toggle Off",
			toggleCallback
		);

		this.$backgroundButton.click(() => {
			storeWindow.toggleBackgroundSelect();
		});

		this.$actionButtonMainContainer.click(() => {
			if (this.actionState === this.ACTION_STATES.USE) {
				socket.sendCommand({
					type: "avatar",
					command: "use avatar",
					data: this.currentDescriptionPackage,
				});
			} else if ((this, this.actionState === this.ACTION_STATES.UNLOCK)) {
				let avatar = storeWindow.getAvatar(this.currentAvatar.characterId, this.currentAvatar.avatarId);
				let priceItems = [];

				priceItems.push({
					name: avatar.outfitName + " " + avatar.avatarName,
					hidePrice: true,
					bold: true,
				});

				if (!avatar.unlocked && (avatar.ticketTier || !this.currentAvatar.ticketTier)) {
					priceItems.push({
						name: "Skin (Default: " + capitalizeMajorWords(avatar.defaultColorName) + ")",
						notePrice: avatar.notePrice,
						realMoneyPrice: avatar.realMoneyPrice,
						patreonTierToUnlock: avatar.patreonTierToUnlock,
						rhythmPrice: TICKET_TIER_RHYTHM_PRICES[avatar.ticketTier],
					});
				}

				if (!this.currentAvatar.defaultColor) {
					priceItems.push({
						name: "Color: " + capitalizeMajorWords(this.currentAvatar.colorName),
						notePrice: this.currentAvatar.colorNotePrice,
						rhythmPrice: TICKET_TIER_RHYTHM_PRICES[this.currentAvatar.ticketTier],
					});
				}

				storePriceModal.showAvatar(priceItems, this.currentAvatar.avatarId, this.currentAvatar.colorId);
			}
		});

		this.$actionButtonFavoriteContainer.click(() => {
			if (this.activeFavoriteId == undefined) {
				socket.sendCommand({
					type: "avatar",
					command: 'new favorite avatar',
					data: this.currentDescriptionPackage,
				});
			} else {
				socket.sendCommand({
					type: "avatar",
					command: 'remove favorite avatar',
					data: {favoriteId: this.activeFavoriteId}
				});
			}
		});
	}

	get avatarName() {
		if (this.currentAvatar.outfitName === "Standard") {
			return this.currentAvatar.avatarName;
		} else {
			return this.currentAvatar.outfitName + " " + this.currentAvatar.avatarName;
		}
	}

	get totalNotePrice() {
		let avatar = storeWindow.getAvatar(this.currentAvatar.characterId, this.currentAvatar.avatarId);
		let price = this.currentAvatar.colorNotePrice;
		if (!avatar.unlocked) {
			price += this.currentAvatar.avatarNotePrice;
		}
		return price;
	}

	get currentDescriptionPackage() {
		return {
			avatar: {
				avatarId: this.currentAvatar.avatarId,
				colorId: this.currentAvatar.colorId,
				optionActive: this.currentAvatar.optionActive,
			},
			background: {
				avatarId: this.currentBackground.avatarId,
				colorId: this.currentBackground.colorId,
			},
		};
	}

	displayAvatar(avatarDescription) {
		this.currentAvatar = avatarDescription;

		this.$name.text(this.avatarName);
		this.setImagePose("BASE");
		this.$avatarImage
			.removeClass()
			.addClass("sizeMod" + this.currentAvatar.sizeModifier);

		this.toggleButton.active = this.currentAvatar.optionActive;
		this.toggleButton.disabled = this.currentAvatar.optionName === "None";

		let avatarUnlockCount = storeWindow.avatarUnlockCount[this.currentAvatar.avatarId];
		let characterUnlockCount = storeWindow.characterUnlockCount[this.currentAvatar.characterId];

		this.characterProgressBar.updateProgress(characterUnlockCount);
		this.avatarProgressBar.updateProgress(avatarUnlockCount);

		

		let avatar = storeWindow.getAvatar(this.currentAvatar.characterId, this.currentAvatar.avatarId);
		this.$worldName.text(avatar.world);
		this.$artistName.text(avatar.artist);
		this.$loreText.text(avatar.lore);
		if (this.currentAvatar.editor) {
			this.$extraInfoContainer.removeClass("hideEditor");
			this.$editerName.text(this.currentAvatar.editor);
		} else {
			this.$extraInfoContainer.addClass("hideEditor");
		}

		this.$bonusBadgeIconImage.attr("srcset", cdnFormater.newBadgeSrcSet(avatar.badgeFileName));
		this.$bonusBadgeIconImage.attr("src", cdnFormater.newBadgeSrc(avatar.badgeFileName));
		this.$bonusBadgeIconImage.data("bs.popover").options.content = createBadgePopoverHtml(
			avatar.badgeFileName,
			avatar.badgeName
		);

		this.updateTextSize();
	}

	displayBackground(backgroundDescription) {
		if (this.currentBackground) {
			this.$avatarImageContainer
				.removeClass(this.currentBackground.avatarName)
				.removeClass(this.currentBackground.outfitName.replace(/ /g, "-"));
		}
		this.currentBackground = backgroundDescription;
		let avatarBackgroundSrc = cdnFormater.newAvatarBackgroundSrc(
			this.currentBackground.backgroundVert,
			cdnFormater.BACKGROUND_STORE_PREVIEW_SIZE
		);
		this.$avatarImageContainer
			.css("background-image", 'url("' + avatarBackgroundSrc + '")')
			.addClass(this.currentBackground.avatarName)
			.addClass(this.currentBackground.outfitName.replace(/ /g, "-"));

		this.updateActionButton();
	}

	newUnlock() {
		this.updateActionButton();
		this.characterProgressBar.updateProgress(storeWindow.characterUnlockCount[this.currentAvatar.characterId]);
		this.avatarProgressBar.updateProgress(storeWindow.avatarUnlockCount[this.currentAvatar.avatarId]);
	}

	updateActionButton() {
		let activeAvatar =
			this.currentAvatar.avatarId === storeWindow.activeAvatar.avatarId &&
			this.currentAvatar.colorId === storeWindow.activeAvatar.colorId &&
			this.currentAvatar.optionActive === storeWindow.activeAvatar.optionActive;
		let activeBackground = this.currentBackground.backgroundVert === storeWindow.activeBackground.backgroundVert;
		let normalBackground =
			this.currentAvatar.avatarId === this.currentBackground.avatarId &&
			this.currentAvatar.colorId === this.currentBackground.colorId;
		let avatar = storeWindow.getAvatar(this.currentAvatar.characterId, this.currentAvatar.avatarId);

		this.$actionButtonPriceContainer.addClass("hide");
		this.$actionButtonRhythmContainer.addClass("hide");
		this.updateFavoriteButton(false);
		if (activeAvatar && activeBackground) {
			this.actionState = this.ACTION_STATES.NONE;
			this.$actionButtonMainContainer.addClass("disabled");
			this.$actionButtonText.text("Active");
			this.updateFavoriteButton(true);
		} else if (
			!normalBackground &&
			!activeBackground &&
			!storeWindow.getAvatarBonusUnlocked(this.currentBackground.avatarId)
		) {
			this.actionState = this.ACTION_STATES.NONE;
			this.$actionButtonMainContainer.addClass("disabled");
			this.$actionButtonText.text("Missing Skin Bonus");
		} else if (
			!normalBackground &&
			!activeBackground &&
			!storeWindow
				.getAvatar(this.currentBackground.characterId, this.currentBackground.avatarId)
				.getColorUnlocked(this.currentBackground.colorId)
		) {
			this.actionState = this.ACTION_STATES.NONE;
			this.$actionButtonMainContainer.addClass("disabled");
			this.$actionButtonText.text("Background Locked");
		} else if (avatar.getColorUnlocked(this.currentAvatar.colorId)) {
			this.actionState = this.ACTION_STATES.USE;
			this.$actionButtonMainContainer.removeClass("disabled");
			this.$actionButtonText.text("Use");
			this.updateFavoriteButton(true);
		} else if (!this.currentAvatar.active || !this.currentAvatar.colorActive) {
			this.actionState = this.ACTION_STATES.NONE;
			this.$actionButtonMainContainer.addClass("disabled");
			this.$actionButtonText.text("Unavailable");
		} else {
			this.actionState = this.ACTION_STATES.UNLOCK;
			this.$actionButtonMainContainer.removeClass("disabled");
			this.$actionButtonText.text("Unlock");

			if (this.currentAvatar.ticketTier || (this.currentAvatar.avatarTicketTier && !avatar.unlocked)) {
				let rhythmPrice = 0;
				let notePrice = 0;
				if (this.currentAvatar.ticketTier) {
					rhythmPrice += TICKET_TIER_RHYTHM_PRICES[this.currentAvatar.ticketTier];
				} else if (this.currentAvatar.colorNotePrice) {
					notePrice += this.currentAvatar.colorNotePrice;
				}

				if (!avatar.unlocked) {
					if (this.currentAvatar.avatarTicketTier) {
						rhythmPrice += TICKET_TIER_RHYTHM_PRICES[this.currentAvatar.avatarTicketTier];
					} else if (this.currentAvatar.avatarNotePrice && !this.currentAvatar.ticketTier) {
						notePrice += this.currentAvatar.avatarNotePrice;
					}
				}

				this.$swRightColumnActionButtonRhythmPrice.text(rhythmPrice);
				this.$actionButtonRhythmContainer.removeClass("hide");
				if (notePrice) {
					this.$actionButtonPriceIcon.attr("src", this.NOTE_ICON_SRC);
					this.$actionButtonPriceText.text(numberWithCommas(notePrice));
					this.$actionButtonPriceIcon.removeClass("hide");
					this.$actionButtonPriceContainer.removeClass("hide");
				}
			} else if (this.currentAvatar.avatarRealMoneyPrice) {
				let text;
				if (this.currentAvatar.defaultColor && avatar.patreonTierToUnlock) {
					text = "or $" + this.currentAvatar.avatarRealMoneyPrice.toFixed(2);
					this.$actionButtonPriceIcon.attr("src", cdnFormater.newBadgeSrc(cdnFormater.PATREON_PREVIEW_BADGE_FILENAME));
					this.$actionButtonPriceIcon.removeClass("hide");
				} else {
					text = "$" + this.currentAvatar.avatarRealMoneyPrice.toFixed(2);
					this.$actionButtonPriceIcon.addClass("hide");
				}
				this.$actionButtonPriceText.text(text);
				this.$actionButtonPriceContainer.removeClass("hide");
			} else {
				this.$actionButtonPriceIcon.attr("src", this.NOTE_ICON_SRC);
				this.$actionButtonPriceIcon.removeClass("hide");
				this.$actionButtonPriceText.text(numberWithCommas(this.totalNotePrice));
				this.$actionButtonPriceContainer.removeClass("hide");
			} 
		}
	}

	updateLayout() {
		this.updateScroll();
		this.updateTextSize();
	}

	updateScroll() {
		this.$bottomColumn.perfectScrollbar("update");
	}

	updateTextSize() {
		[this.$worldName, this.$artistName, this.$editerName].forEach(($textContainer) => {
			fitTextToContainer($textContainer, $textContainer.parent(), 16, 10);
		});
		fitTextToContainer(this.$name, this.$name.parent(), 30, 14);
	}

	setImagePose(poseName) {
		if (this.currentImagePreload) {
			this.currentImagePreload.cancel();
		}

		Object.values(this.poseButtonsByName).forEach(($button) => {
			$button.removeClass("active");
		});
		this.poseButtonsByName[poseName].addClass("active");

		let poseId = cdnFormater.AVATAR_POSE_IDS[poseName];
		let src = cdnFormater.newAvatarSrc(
			this.currentAvatar.avatarName,
			this.currentAvatar.outfitName,
			this.currentAvatar.optionName,
			this.currentAvatar.optionActive,
			this.currentAvatar.colorName,
			poseId
		);
		let srcSet = cdnFormater.newAvatarSrcSet(
			this.currentAvatar.avatarName,
			this.currentAvatar.outfitName,
			this.currentAvatar.optionName,
			this.currentAvatar.optionActive,
			this.currentAvatar.colorName,
			poseId
		);

		this.currentImagePreload = new PreloadImage(this.$avatarImage, src, srcSet, true, this.AVATAR_MOD_SIZE_SIZES[this.currentAvatar.sizeModifier]);
		this.currentPose = poseName;
	}

	updateBackgroundMode(active) {
		if (active) {
			this.$backgroundButton.addClass("active");
		} else {
			this.$backgroundButton.removeClass("active");
		}
	}

	updateFavoriteButton(on) {
		if (on) {
			let favoriteId = storeWindow.getFavoriteId(this.currentAvatar, this.currentBackground);
			if(favoriteId)  {
				this.$actionButtonFavoriteStarSelected.removeClass('hide');
				this.$actionButtonFavoriteStarUnselected.addClass('hide');
			} else {
				this.$actionButtonFavoriteStarSelected.addClass('hide');
				this.$actionButtonFavoriteStarUnselected.removeClass('hide');
			}
			this.activeFavoriteId = favoriteId;
			this.$actionButtonFavoriteContainer.removeClass("hide");
		} else {
			this.$actionButtonFavoriteContainer.addClass("hide");
		}
	}
}

StoreAvatarColumn.prototype.ACTION_STATES = {
	NONE: 1,
	USE: 2,
	UNLOCK: 3,
};
StoreAvatarColumn.prototype.NOTE_ICON_SRC = "/img/ui/currency/Icon_Normal.svg";
StoreAvatarColumn.prototype.AVATAR_MOD_SIZE_SIZES = {
	0: "250px",
	20: "300px",
	51: "380px"
};

class StoreColumnProgressBar {
	constructor($bar, $endpoint) {
		this.$bar = $bar;
		this.$endpoint = $endpoint;

		this._progressPercent = 0;

		this.$bar.on("transitionend", () => {
			if (this.progressPercent === 100) {
				this.$endpoint.addClass("active");
			}
		});
	}

	get progressPercent() {
		return this._progressPercent;
	}

	set progressPercent(newValue) {
		this._progressPercent = newValue;

		this.$bar.css("transform", "translateX(" + (-100 + this.progressPercent) + "%");

		if (this.progressPercent < 100) {
			this.$endpoint.removeClass("active");
		} else if (!this.$bar.is(":visible")) {
			this.$endpoint.addClass("active");
		}
	}

	updateProgress(newCount) {
		let percent = (newCount / storeWindow.REQUIRED_COUNT_FOR_BONUS) * 100;
		percent = percent > 100 ? 100 : percent;
		this.progressPercent = percent;
	}
}
