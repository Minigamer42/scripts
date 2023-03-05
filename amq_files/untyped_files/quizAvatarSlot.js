"use strict";
/*exported QuizAvatarSlot*/
class QuizAvatarSlot extends QuizAvatarSlotBase {
	constructor(
		name,
		level,
		points,
		avatarInfo,
		isHost,
		avatarDisabled,
		lifeCountEnabled,
		maxLives,
		teamPlayer,
		hidden,
		nexusSlot
	) {
		super(
			QuizAvatarSlot.prototype.AVATAR_TEMPALTE,
			name,
			level,
			points,
			avatarDisabled,
			cdnFormater.AVATAR_POSE_IDS,
			true
		);
		this.$answerContainerText = this.$body.find(".qpAvatarAnswerText");
		this.$answerContainer = this.$body.find(".qpAvatarAnswerContainer");
		this.$hostIconContainer = this.$body.find(".qpAvatarHostIcon");
		this.$hiddenIconContainer = this.$body.find(".qpAvatarHiddenIcon");
		this.$abilityIconContainer = this.$body.find(".qpAvatarAblityIconContainer");
		this.$backgroundContainer = this.$body.find(".qpAvatarBackgroundContainer");
		this.$genreIconContainer = this.$body.find(".qpNexusGenreIconContainer");

		this.genreIcons = {};

		this.host = isHost;
		this._teamAnswerSharingOn = false;

		this.setupAvatar(avatarInfo.avatar);
		this.setupBackground(avatarInfo.background);

		this.answerNumberController = new AnswerNumberController(this.$answerContainer);
		this.answerStatus = new AvatarAnswerStatus(this.$innerContainer);

		if (lifeCountEnabled) {
			this.lifeCounterController = new LifeCounterController(
				this.$innerContainer,
				maxLives,
				avatarDisabled ? 0 : maxLives
			);
		} else {
			this.lifeCounterController = null;
		}

		this.$answerContainer.popover({
			trigger: "hover",
			placement: "top",
			content: "...",
			container: "#quizPage",
		});

		this.$answerContainer.click((event) => {
			if (this.teamAnswerSharingOn) {
				quiz.answerInput.setNewAnswer(this.$answerContainerText.text());
				event.stopPropagation();
			}
		});

		if (selfName !== name && !nexusSlot) {
			this.$bottomContainer.addClass("clickAble").click(() => {
				playerProfileController.loadProfileIfClosed(name, this.$bottomContainer, {}, () => {}, false, this.disabled);
			});
		}

		if (teamPlayer) {
			this.$body.addClass("qpAvatarTeamLayout");
		}

		if (hidden) {
			this.displayHidden();
		}
	}

	set host(newValue) {
		if (newValue) {
			this.$hostIconContainer.removeClass("hide");
		} else {
			this.$hostIconContainer.addClass("hide");
		}
	}

	set answer(newAnswer) {
		if (newAnswer == null) {
			this.$answerContainer.popover("hide").addClass("hide");
			this.$answerContainerText.removeClass("rightAnswer").removeClass("wrongAnswer");
			this.answerStatus.hide();
			this.answerNumberController.hide();
		} else {
			if (newAnswer === "") {
				newAnswer = "...";
			}
			this.$answerContainerText.text(newAnswer);
			this.$answerContainer.removeClass("hide").data("bs.popover").options.content = newAnswer;
			this.updateAnswerFontSize();
		}
	}

	set answerCorrect(correct) {
		if (correct) {
			this.$answerContainerText.addClass("rightAnswer");
		} else {
			this.$answerContainerText.addClass("wrongAnswer");
		}
	}

	set finalResult(finalPosition) {
		let colorClass;
		switch (finalPosition) {
			case 1:
				colorClass = "goldGlow";
				break;
			case 2:
				colorClass = "silverGlow";
				break;
			case 3:
				colorClass = "bronzeGlow";
				break;
		}
		this.$answerContainerText.addClass(colorClass);
		this.answer = finalPosition;
	}

	set unknownAnswerNumber(number) {
		if (number != undefined) {
			this.answerNumberController.showUnknown(number);
			this.updateAnswerFontSize();
		} else {
			this.answerNumberController.hide();
		}
	}

	set listStatus(status) {
		this.answerStatus.status = status;
	}

	set listScore(score) {
		this.answerStatus.score = score;
	}

	set teamAnswerSharingOn(on) {
		this._teamAnswerSharingOn = on;
		if (on) {
			this.$answerContainer.addClass("clickAble");
		} else {
			this.$answerContainer.removeClass("clickAble");
		}
	}

	get teamAnswerSharingOn() {
		return this._teamAnswerSharingOn;
	}

	showTeamAnswer() {
		this.$answerContainer.addClass("qpAvatarTeamAnswer");
	}

	hideTeamAnswer() {
		this.$answerContainer.removeClass("qpAvatarTeamAnswer");
	}

	displayHidden() {
		this.$hiddenIconContainer.removeClass("hide");
		this.$hiddenIconContainer.popover({
			content: "Hidden from other players",
			delay: 50,
			placement: "top",
			trigger: "hover",
		});
	}

	setResultAnswerNumber(number, correct) {
		if (number != undefined) {
			this.answerNumberController.showResult(number, correct);
		} else {
			this.answerNumberController.hide();
		}
	}

	setupAvatar(avatar) {
		this.avatarSizeMod = avatar.sizeModifier;
		this.$avatarImage
			.attr("sizes", this.sizeModValue)
			.addClass(this.sizeModClass);

		Object.keys(cdnFormater.AVATAR_POSE_IDS).forEach((pose) => {
			this.poseImages[pose] = new QuizAvatarPoseImage(avatar, pose, this.IMAGE_SIZE_MOD_SIZES[avatar.sizeModifier]);
		});
	}

	setupBackground(background) {
		let avatarBackgroundSrc = cdnFormater.newAvatarBackgroundSrc(
			background.backgroundVert,
			cdnFormater.BACKGROUND_GAME_SIZE
		);
		this.$backgroundContainer
			.css("background-image", 'url("' + avatarBackgroundSrc + '")')
			.addClass(background.avatarName)
			.addClass(background.outfitName.replace(/ /g, "-"));
	}

	updateLifeCounter(lifeCount, revivePoints) {
		if (this.lifeCounterController) {
			this.lifeCounterController.updateState(lifeCount, revivePoints);
		}
	}

	setupLifeCounterState(lives, revivePoints) {
		this.lifeCounterController.setupLives(lives, revivePoints);
	}

	updateSize(maxWidth, maxHeight) {
		super.updateSize(maxWidth, maxHeight);

		this.updateAnswerFontSize();
		if (this.lifeCounterController) {
			this.lifeCounterController.resize();
		}
	}

	updateAnswerFontSize() {
		fitTextToContainer(this.$answerContainerText, this.$answerContainer, 23, 9);
	}

	runGroupUpAnimation() {
		this.$imageContainer.addClass("blue");
		setTimeout(() => {
			this.$imageContainer.removeClass("blue");
		}, this.GROUP_CHANGE_ANIMATION_LENGTH * 1000);
	}

	runGroupDownAnimation() {
		this.$imageContainer.addClass("red");
		setTimeout(() => {
			this.$imageContainer.removeClass("red");
		}, this.GROUP_CHANGE_ANIMATION_LENGTH * 1000);
	}

	showNexusTurn() {
		this.$body.addClass("nexusTurn");
	}

	hideNexusTurn() {
		this.$body.removeClass("nexusTurn");
		this.updateTargetButtonTextSize();
	}

	addGenreIcons(genreInfo) {
		genreInfo.strengths
			.filter((info) => info.active)
			.forEach((genre) => {
				let $icon = new QuizAvatarGenreIcon(genre, true);
				let {genreId, seasonId} = genre;
				if(seasonId) {
					genreId = seasonId + this.SEASON_ID_GENRE_OFFSET;
				}
				if (!this.genreIcons[genreId]) {
					this.genreIcons[genreId] = [];
				}
				this.genreIcons[genreId].push($icon);
				this.$genreIconContainer.append($icon.$body);
			});
		genreInfo.weaknesses
			.filter((info) => info.active)
			.forEach((genre) => {
				let $icon = new QuizAvatarGenreIcon(genre, false);
				let {genreId, seasonId} = genre;
				if(seasonId) {
					genreId = seasonId + this.SEASON_ID_GENRE_OFFSET;
				}
				if (!this.genreIcons[genreId]) {
					this.genreIcons[genreId] = [];
				}
				this.genreIcons[genreId].push($icon);
				this.$genreIconContainer.append($icon.$body);
			});
	}

	hideAllGenres() {
		Object.values(this.genreIcons).forEach((icons) => {
			icons.forEach((icon) => {
				icon.active = false;
			});
		});
	}

	showGenres(genreIds, seasonId) {
		genreIds.forEach((genreId) => {
			if (this.genreIcons[genreId]) {
				this.genreIcons[genreId].forEach((icon) => {
					icon.active = true;
				});
			}
		});
		if(seasonId) {
			let seasonGenreId = seasonId + this.SEASON_ID_GENRE_OFFSET;
			if (this.genreIcons[seasonGenreId]) {
				this.genreIcons[seasonGenreId].forEach((icon) => {
					icon.active = true;
				});
			}
		}
	}
}

QuizAvatarSlot.prototype.AVATAR_TEMPALTE = $("#quizAvatarTemplate").html();
QuizAvatarSlot.prototype.GROUP_CHANGE_ANIMATION_LENGTH = 4; //sec
QuizAvatarSlot.prototype.SEASON_ID_GENRE_OFFSET = 1000;

class QuizAvatarPoseImage extends QuizAvatarPoseImageBase {
	constructor(avatarInfo, pose, imageVh) {
		super(avatarInfo, pose, imageVh);
	}

	get srcset() {
		return cdnFormater.newAvatarSrcSet(
			this.avatarInfo.avatarName,
			this.avatarInfo.outfitName,
			this.avatarInfo.optionName,
			this.avatarInfo.optionActive,
			this.avatarInfo.colorName,
			cdnFormater.AVATAR_POSE_IDS[this.pose]
		);
	}

	get src() {
		return cdnFormater.newAvatarSrc(
			this.avatarInfo.avatarName,
			this.avatarInfo.outfitName,
			this.avatarInfo.optionName,
			this.avatarInfo.optionActive,
			this.avatarInfo.colorName,
			cdnFormater.AVATAR_POSE_IDS[this.pose]
		);
	}
}

class QuizAvatarGenreIcon {
	constructor({ name }, strong) {
		this.$body = $(this.TEMPLATE);

		let src = cdnFormater.newNexusGenreIconSrc(name);
		let srcset = cdnFormater.newNexusGenreIconSrcSet(name);
		this.$body.attr("srcset", srcset);
		this.$body.attr("src", src);

		if (strong) {
			this.$body.addClass("strength");
		} else {
			this.$body.addClass("weak");
		}

		let message = `Increase damage ${strong ? "done" : "taken"} during ${name} shows.`;

		this.$body.popover({
			title: name,
			content: message,
			container: "#nexus",
			delay: 50,
			placement: "top",
			trigger: "hover",
		});
	}

	set active(active) {
		if (active) {
			this.$body.addClass("active");
		} else {
			this.$body.removeClass("active");
		}
	}

	remove() {
		this.$body.remove();
	}
}
QuizAvatarGenreIcon.prototype.TEMPLATE = '<img class="qpNexusGenreIcon" sizes="50px" >';
