"use strict";

/*exported QuizAvatarSlot*/

class QuizAvatarSlot {
    constructor(name, level, points, avatarInfo, isHost, pose, avatarDisabled, lifeCountEnabled, maxLives, teamPlayer, hidden) {
        this.$body = $(this.AVATAR_TEMPALTE);
        this.$innerContainer = this.$body.find(".qpAvatarContainer");
        this.$bottomContainer = this.$body.find(".qpAvatarInfoBar ");
        this.$nameContainer = this.$body.find(".qpAvatarName");
        this.$levelContainer = this.$body.find(".qpAvatarLevel");
        this.$pointContainer = this.$body.find(".qpAvatarScore");
        this.$avatarImage = this.$body.find(".qpAvatarImage");
        this.$imageContainer = this.$body.find(".qpAvatarImageContainer");
        this.$answerContainerText = this.$body.find(".qpAvatarAnswerText");
        this.$answerContainer = this.$body.find(".qpAvatarAnswerContainer");
        this.$hostIconContainer = this.$body.find(".qpAvatarHostIcon");
        this.$hiddenIconContainer = this.$body.find('.qpAvatarHiddenIcon');

        this._name;
        this.name = name;
        this.level = level;
        this.points = points;
        this.host = isHost;
        this.disabled = avatarDisabled;

        this.disabled = false;
        this.displayed = false;
        this.currentMaxWidth;
        this.currentMaxHeight;
        this.currentPose = pose ? pose : cdnFormater.AVATAR_POSE_IDS.BASE;
        this.poseImages = {};

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
            container: "#quizPage"
        });

        this.$answerContainer.click(() => {
            if (this.teamAnswerSharingOn) {
                quiz.answerInput.setNewAnswer(this.$answerContainerText.text());
            }
        });

        if (selfName !== name) {
            this.$bottomContainer.addClass("clickAble").click(() => {
                playerProfileController.loadProfileIfClosed(name, this.$bottomContainer, {}, () => {
                }, false, this.disabled);
            });
        }

        if (teamPlayer) {
            this.$body.addClass("qpAvatarTeamLayout");
        }

        if (hidden) {
            this.displayHidden();
        }
    }

    set name(newValue) {
        this._name = newValue;
        this.$nameContainer.text(newValue);
    }

    get name() {
        return this._name;
    }

    set level(newVaule) {
        this.$levelContainer.text(newVaule);
    }

    set points(newValue) {
        this.$pointContainer.text(newValue);
    }

    set host(newValue) {
        if (newValue) {
            this.$hostIconContainer.removeClass("hide");
        } else {
            this.$hostIconContainer.addClass("hide");
        }
    }

    set zIndex(newValue) {
        this.$body.css("z-index", newValue);
    }

    set disabled(newValue) {
        this._disabled = newValue;
        if (newValue) {
            this.$innerContainer.addClass("disabled");
            this.updatePose();
        } else {
            this.$innerContainer.removeClass("disabled");
            this.updatePose();
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

    set pose(poseId) {
        this._pose = poseId;
        this.updatePose();
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

    displayHidden() {
        this.$hiddenIconContainer.removeClass('hide');
        this.$hiddenIconContainer.popover({
            content: 'Hidden from other players',
            delay: 50,
            placement: 'top',
            trigger: 'hover'
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
            .attr('sizes', this.IMAGE_SIZE_MOD_SIZES[avatar.sizeModifier])
            .addClass('sizeMod' + avatar.sizeModifier);

        Object.keys(cdnFormater.AVATAR_POSE_IDS).forEach((pose) => {
            this.poseImages[pose] = new QuizAvatarPoseImage(avatar, pose, this.IMAGE_SIZE_MOD_SIZES[avatar.sizeModifier]);
        });
    }

    setupBackground(background) {
        let avatarBackgroundSrc = cdnFormater.newAvatarBackgroundSrc(
            background.backgroundVert,
            cdnFormater.BACKGROUND_GAME_SIZE
        );
        this.$imageContainer
            .css("background-image", 'url("' + avatarBackgroundSrc + '")')
            .addClass(background.avatarName)
            .addClass(background.outfitName.replace(/ /g, "-"));
    }

    loadPoses() {
        Object.values(this.poseImages).forEach((poseImage) => {
            poseImage.load(
                function () {
                    this.updatePose();
                }.bind(this)
            );
        });
    }

    updatePose() {
        if (!this.displayed) {
            return;
        }
        let img;
        if (this._disabled) {
            img = this.poseImages.BASE.image;
        } else {
            Object.keys(this.poseImages).some((pose) => {
                if (cdnFormater.AVATAR_POSE_IDS[pose] === this._pose) {
                    let poseImage = this.poseImages[pose];
                    if (poseImage.loaded) {
                        img = poseImage.image;
                    }
                    return true;
                }
            });
        }
        if (!img) {
            img = this.poseImages.BASE.image;
        }

        this.$avatarImage.attr("srcset", img.srcset).attr("src", img.src);
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
        this.currentMaxWidth = maxWidth;
        this.currentMaxHeight = maxHeight;
        this.$body.css("max-height", maxHeight).css("max-width", maxWidth);
        setTimeout(() => {
            fitTextToContainer(this.$nameContainer, this.$bottomContainer, 20, 12);
        }, 1);
        //Set image max height
        let containerMaxHeight = maxHeight - this.INFO_CONTAINER_HEIGHT;
        let containerMaxWidth = maxWidth;
        let imageMaxHeight = containerMaxHeight;
        let imageMaxWidth = containerMaxWidth * this.INNER_OUTER_CONTAINER_WIDTH_RATIO;

        let imageRatio = 1.5;

        let containerWidth;
        let containerHeight;

        if (imageMaxHeight > imageMaxWidth * imageRatio) {
            containerWidth = containerMaxWidth;
            containerHeight = imageMaxWidth * imageRatio + this.INFO_CONTAINER_HEIGHT;
        } else {
            containerHeight = containerMaxHeight;
            containerWidth = imageMaxHeight / imageRatio;
        }

        this.$body.css("height", containerHeight).css("width", containerWidth);

        this.updateAnswerFontSize();
        if (this.lifeCounterController) {
            this.lifeCounterController.resize();
        }
    }

    updateAnswerFontSize() {
        fitTextToContainer(this.$answerContainerText, this.$answerContainer, 23, 9);
    }

    remove() {
        this.$body.remove();
    }

    hide() {
        this.$body.addClass("hide");
        this.displayed = false;
    }

    show() {
        this.$body.removeClass("hide");
        this.displayed = true;
        this.loadPoses();
        this.updatePose();
        this.updateSize(this.currentMaxWidth, this.currentMaxHeight);
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
}

QuizAvatarSlot.prototype.AVATAR_TEMPALTE = $("#quizAvatarTemplate").html();
QuizAvatarSlot.prototype._COMMAND_TEMPLATE = $("#chatPlayerCommandsTemplate").html();
QuizAvatarSlot.prototype.WIDE_AVATARS = ["Miyu", "Kuriko"];
QuizAvatarSlot.prototype.GROUP_CHANGE_ANIMATION_LENGTH = 4; //sec
QuizAvatarSlot.prototype.INFO_CONTAINER_HEIGHT = 39; //px
QuizAvatarSlot.prototype.INNER_OUTER_CONTAINER_WIDTH_RATIO = 0.8;
QuizAvatarSlot.prototype.IMAGE_SIZE_MOD_SIZES = {
    0: '10vw',
    20: '11vw',
    51: '12vw'
};

class QuizAvatarPoseImage {
    constructor(avatarInfo, pose, imageVh) {
        this.avatarInfo = avatarInfo;
        this.pose = pose;
        this.imageVh = imageVh;
        this.loaded = false;
        this.image;
    }

    load(callback) {
        if (!this.loaded && !this.image) {
            this.image = new Image();
            this.image.onload = function () {
                this.loaded = true;
                callback(this.pose);
            }.bind(this);

            this.image.sizes = this.imageVh;
            this.image.srcset = cdnFormater.newAvatarSrcSet(
                this.avatarInfo.avatarName,
                this.avatarInfo.outfitName,
                this.avatarInfo.optionName,
                this.avatarInfo.optionActive,
                this.avatarInfo.colorName,
                cdnFormater.AVATAR_POSE_IDS[this.pose]
            );
            this.image.src = cdnFormater.newAvatarSrc(
                this.avatarInfo.avatarName,
                this.avatarInfo.outfitName,
                this.avatarInfo.optionName,
                this.avatarInfo.optionActive,
                this.avatarInfo.colorName,
                cdnFormater.AVATAR_POSE_IDS[this.pose]
            );
        }
    }
}
