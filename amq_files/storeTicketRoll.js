"use strict";

class StoreTicketRollSelector {
    constructor($ticketOptionContainer, historyHandler, rollTargets) {
        this.$mainContainer = $("#swTicketRollMainContainer");
        this.$selectContainer = $("#swTicketRollSelectionContainer");
        this.$oneRollButton = this.$selectContainer.find("#swTicketOneRollContainer");
        this.$tenRollButton = this.$selectContainer.find("#swTicketTenRollContainer");

        this.$executeContainer = $("#swTicketRollExecuteContainer");
        this.$executeButtonContainer = $("#swTicketRollExecuteInner");
        this.$executeCloseButton = this.$executeContainer.find("#swTicketRollExecuteCancal");
        this.$executeRollButton = this.$executeContainer.find("#swTicketRollExecuteHoverInner");
        this.$executeRollPrice = this.$executeContainer.find("#swTicketExecutePrice");

        this.$innerResultContainer = $("#swTicketRollInnerResultContainer");

        this.$executeTicketImage = this.$executeContainer.find(".swTicketRollTicketIcon");

        this.$swTicketAvatarLockingImage = this.$executeContainer.find("#swTicketAvatarLockingImage");

        this.$executionHideable = this.$executeContainer.find(".swTicketRollExecutionContent");

        this.$ticketOptionContainer = $ticketOptionContainer;

        this.historyHandler = historyHandler;
        this.targetSelector = new StoreTickRollTargetSelector(rollTargets);

        this.outsideRewardContainers = [
            new StoreOuterRewardContainer($("#swTicketRollOuterResultContainerOne")),
            new StoreOuterRewardContainer($("#swTicketRollOuterResultContainerTwo")),
            new StoreOuterRewardContainer($("#swTicketRollOuterResultContainerThree")),
            new StoreOuterRewardContainer($("#swTicketRollOuterResultContainerFour")),
            new StoreOuterRewardContainer($("#swTicketRollOuterResultContainerSix")),
            new StoreOuterRewardContainer($("#swTicketRollOuterResultContainerSeven")),
            new StoreOuterRewardContainer($("#swTicketRollOuterResultContainerEight")),
            new StoreOuterRewardContainer($("#swTicketRollOuterResultContainerNine")),
            new StoreOuterMajorRewardContainer($("#swTicketRollOuterResultContainerFive")),
            new StoreOuterMajorRewardContainer($("#swTicketRollOuterResultContainerTen"))
        ];

        this.insideRewardContainer = new StoreInsdeRewardContainer(this.$innerResultContainer);

        this.animationController = new StoreRollAnimationController(this.DEFAULT_TIER);

        this.$oneRollButton.click(() => {
            if (this.targetSelector.currentTarget && this.ONE_ROLL_TOKEN_PRICE > storeWindow.avatarTokens) {
                let missingCount = this.ONE_ROLL_TOKEN_PRICE - storeWindow.avatarTokens;
                displayMessage(
                    "Not Enough Avatar Tokens",
                    `You're lacking ${missingCount} avatar token to be able to perform the roll with an avatar target. Avatar tokens are obtained by buying tickets or supporting the Patreon`
                );
            } else {
                this.displayRollExecute(this.ONE_ROLL_PRICE);
            }
        });
        this.$tenRollButton.click(() => {
            if (this.targetSelector.currentTarget && this.TEN_ROLL_TOKEN_PRICE > storeWindow.avatarTokens) {
                let missingCount = this.TEN_ROLL_TOKEN_PRICE - storeWindow.avatarTokens;
                displayMessage(
                    "Not Enough Avatar Tokens",
                    `You're lacking ${missingCount} avatar tokens to be able to perform the roll with an avatar target. Avatar tokens are obtained by buying tickets or supporting the Patreon`
                );
            } else {
                this.displayRollExecute(this.TEN_ROLL_PRICE);
            }
        });

        this.$executeCloseButton.click(() => {
            this.displayRollSelection();
        });

        this.$executeRollButton.click(() => {
            if (xpBar.currentTicketCount < this.activePrice) {
                displayMessage("Not Enough Tickets");
            } else {
                if (this.activePrice === this.ONE_ROLL_PRICE) {
                    this.executeSingleRoll();
                } else if (this.activePrice === this.TEN_ROLL_PRICE) {
                    this.executeTenRoll();
                }
            }
        });

        this.$innerResultContainer.click(() => {
            this.displayRollSelection();
        });

        this.activePrice;

        this.currentRewards;
        this.rewardTimerTriggered = false;
        this.rollResultListener = new Listener(
            "ticket roll result",
            function (payload) {
                this.currentRewards = payload;
                this.executeReward();
                this.historyHandler.addEntries(payload.rewardList);
            }.bind(this)
        );
        this.rollResultListener.bindListener();

        this.rollErrorListener = new Listener(
            "ticket roll error",
            function () {
                displayMessage("Error Executing Roll", "Please Try Again", () => {
                    this.displayRollSelection();
                });
            }.bind(this)
        );
        this.rollErrorListener.bindListener();
    }

    hide() {
        this.$mainContainer.addClass("hide");
    }

    show() {
        this.$mainContainer.removeClass("hide");
        this.resize();
    }

    resize() {
        this.outsideRewardContainers.forEach((rewardContainer) => {
            rewardContainer.resize();
        });
    }

    displayRollSelection() {
        this.$executeContainer.addClass("hide");
        this.$selectContainer.removeClass("hide");
        this.$ticketOptionContainer.removeClass("hide");
        storeWindow.enableTopBar();

        this.insideRewardContainer.toggleActive(false);
        this.$executeButtonContainer.removeClass("notActive");
        this.$executeRollButton.removeClass("disabled");
        this.animationController.stopAnimation();
        this.animationController.resetAnimation();
        this.outsideRewardContainers.forEach((container) => container.reset());
        this.$executeTicketImage
            .attr("srcset", cdnFormater.newTicketSrcSet(this.DEFAULT_TIER))
            .attr("src", cdnFormater.newTicketSrc(this.DEFAULT_TIER));
    }

    displayRollExecute(price) {
        this.activePrice = price;
        this.$executeRollPrice.text(price);
        this.$executionHideable.removeClass("hide");
        this.$executeContainer.removeClass("hide");
        this.$selectContainer.addClass("hide");
        this.$ticketOptionContainer.addClass("hide");
        this.animationController.show();
        if (this.targetSelector.currentTarget) {
            this.$swTicketAvatarLockingImage
                .attr("srcset", this.targetSelector.currentTarget.srcSet)
                .attr("src", this.targetSelector.currentTarget.src)
                .removeClass("hide");
        } else {
            this.$swTicketAvatarLockingImage.addClass("hide");
        }
    }

    executeSingleRoll() {
        this.$executeRollButton.addClass("disabled");
        storeWindow.disableTopBar();

        this.$executionHideable.addClass("hide");
        this.animationController.changeToRollStart();
        let rollTarget = this.targetSelector.currentTarget ? this.targetSelector.currentTarget.id : undefined;
        socket.sendCommand({
            type: "avatar",
            command: "ticket roll",
            data: {
                amount: 1,
                rollTarget
            }
        });
        setTimeout(() => {
            this.rewardTimerTriggered = true;
            this.executeReward();
        }, 2000);
    }

    executeTenRoll() {
        this.$executeRollButton.addClass("disabled");
        storeWindow.disableTopBar();

        this.$executionHideable.addClass("hide");
        this.animationController.changeToRollStart();
        this.outsideRewardContainers.forEach((container) => container.toggleActive(true));
        let rollTarget = this.targetSelector.currentTarget ? this.targetSelector.currentTarget.id : undefined;
        socket.sendCommand({
            type: "avatar",
            command: "ticket roll",
            data: {
                amount: 10,
                rollTarget
            }
        });
        setTimeout(() => {
            this.rewardTimerTriggered = true;
            this.executeReward();
        }, 2000);
    }

    executeReward() {
        if (this.rewardTimerTriggered && this.currentRewards) {
            let rewards = this.currentRewards.rewardList;
            if (rewards.length === 1) {
                this.showSingleResult(rewards[0]);
            } else {
                this.showMultipleResults(rewards);
            }
            xpBar.setTickets(this.currentRewards.ticketCount);
            storeWindow.avatarTokens = this.currentRewards.avatarTokens;
            this.currentRewards = null;
            this.rewardTimerTriggered = false;
        }
    }

    showSingleResult(result) {
        this.insideRewardContainer.setupResult(result);
        new PreloadImage(
            this.$executeTicketImage,
            cdnFormater.newTicketSrc(result.tier),
            cdnFormater.newTicketSrcSet(result.tier),
            true,
            null,
            () => {
                this.animationController.changeToRolLResult(result.tier);
                this.insideRewardContainer.toggleActive(true);
                this.$executeButtonContainer.addClass("notActive");
            },
            true
        );
    }

    showMultipleResults(results) {
        let tierDistribution = {};
        results.forEach((result, index) => {
            let targetResultContainer = this.outsideRewardContainers[index];
            targetResultContainer.setupResult(result);

            if (!tierDistribution[result.tier]) {
                tierDistribution[result.tier] = [];
            }
            tierDistribution[result.tier].push(targetResultContainer);
        });
        this.handleDisplayMultiRollTierResults(tierDistribution);
    }

    handleDisplayMultiRollTierResults(tierDistribution, currentIndex = 0) {
        let targetTier = Object.keys(tierDistribution)[currentIndex];
        if (targetTier !== undefined) {
            this.loadCenterImage(targetTier, () => {
                this.animationController.changeColorTier(targetTier);
                tierDistribution[targetTier].forEach((resultContainer) => {
                    resultContainer.displayResult(targetTier);
                });
                setTimeout(() => {
                    tierDistribution[targetTier].forEach((resultContainer) => {
                        resultContainer.animationDone();
                    });
                    this.handleDisplayMultiRollTierResults(tierDistribution, currentIndex + 1);
                }, 2000);
            });
        } else {
            this.handleDisplayMultiRollTierEndResult(tierDistribution);
        }
    }

    handleDisplayMultiRollTierEndResult(tierDistribution) {
        this.animationController.displayMultiTierEndResult(Object.keys(tierDistribution));
        this.$executeCloseButton.removeClass("hide");
    }

    loadCenterImage(tier, callback) {
        new PreloadImage(
            this.$executeTicketImage,
            cdnFormater.newTicketSrc(tier),
            cdnFormater.newTicketSrcSet(tier),
            true,
            null,
            callback,
            true
        );
    }
}

StoreTicketRollSelector.prototype.ONE_ROLL_PRICE = 2;
StoreTicketRollSelector.prototype.TEN_ROLL_PRICE = 20;
StoreTicketRollSelector.prototype.DEFAULT_TIER = 2;
StoreTicketRollSelector.prototype.ONE_ROLL_TOKEN_PRICE = 1;
StoreTicketRollSelector.prototype.TEN_ROLL_TOKEN_PRICE = 10;

class StoreRollAnimationController {
    constructor(defaultTier) {
        this.defaultTier = defaultTier;
        this.innerController = new StoreRollInnerAnimationController(this.defaultTier);
        this.outerController = new StoreRollOuterAnimationController(this.defaultTier);
        this.running = false;
        this.clear = true;
        this.lastFrameTimestamp;
    }

    show() {
        this.innerController.updateCanvasSize();
        this.outerController.updateCanvasSize();
        this.startAnimation();
    }

    startAnimation() {
        this.running = true;
        this.clear = false;
        this.lastFrameTimestamp = new Date().valueOf();
        window.requestAnimationFrame(() => {
            this.runAnimation();
        });
    }

    stopAnimation() {
        this.running = false;
        this.clear = true;
    }

    runAnimation() {
        let timestamp = new Date().valueOf();
        let deltaTimeSeconds = (timestamp - this.lastFrameTimestamp) / 1000;
        this.innerController.drawFrame(deltaTimeSeconds);
        this.outerController.drawFrame(deltaTimeSeconds);
        this.lastFrameTimestamp = timestamp;
        if (this.running) {
            window.requestAnimationFrame(() => {
                this.runAnimation();
            });
        }
        if (this.clear) {
            this.innerController.clearFrame();
            this.outerController.clearFrame();
        }
    }

    resetAnimation() {
        this.innerController.updateColorTier(this.defaultTier);
        this.outerController.updateColorTier(this.defaultTier);
        this.innerController.toggleRollSpeed(false);
        this.outerController.toggleRollSpeed(false);
        this.outerController.toggleReverseDirection(false);
    }

    changeToRollStart() {
        this.innerController.toggleRollSpeed(true);
        this.outerController.toggleRollSpeed(true);
    }

    changeToRolLResult(tier) {
        this.changeColorTier(tier);
        this.innerController.toggleRollSpeed(false);
        this.outerController.toggleRollSpeed(false);

        this.outerController.toggleReverseDirection(true);
    }

    changeColorTier(tier) {
        this.innerController.updateColorTier(tier);
        this.outerController.updateColorTier(tier);
    }

    displayMultiTierEndResult(tiers) {
        this.innerController.updateMultiColorTiers(tiers);
        this.outerController.updateMultiColorTiers(tiers);
        this.innerController.toggleRollSpeed(false);
        this.outerController.toggleRollSpeed(false);
        this.outerController.toggleReverseDirection(true);
    }
}

class StoreRollInnerAnimationController extends AnimationController {
    constructor(startColorTier) {
        let staticCanvas = new StoreInnerAnimationCanvas($("#swTicketRollInnerCanvasStatic"));
        staticCanvas.content.push(
            new StaticDonut(staticCanvas.ctx, 0, 0, 0, 0.95, 0.94, new RGB()),
            new StaticDonut(staticCanvas.ctx, 0, 0, 0, 0.9, 0.85, new RGB()),
            new StaticDonut(staticCanvas.ctx, 0, 0, 0, 0.8, 0.78, new RGB()),
            new StaticDonut(staticCanvas.ctx, 0, 0, 0, 0.72, 0.64, new RGB())
        );

        let dynamicCanvas = new StoreInnerAnimationCanvas($("#swTicketRollInnerCanvasDynamic"));

        let currentDepth = 1;
        let numbersInLayer = 2;
        let dropRange = 0.04;
        let minDropRange = 0.02;
        let minSpeed = 0.7;
        let maxSpeed = 2.5;
        let minWidth = 0.4;
        let maxWidth = 0.8;
        let currenctCount = 0;
        for (let i = 0; i < 150; i++) {
            let startAngel = Math.random() * Math.PI * 2;
            let speed = Math.random() * (maxSpeed - minSpeed) + minSpeed;
            let width = Math.random() * (maxWidth - minWidth) + minWidth;
            dynamicCanvas.content.push(
                new RotatingCircleSlice(dynamicCanvas.ctx, 0, 0, startAngel, 0, currentDepth, width, speed, new RGB())
            );
            currenctCount++;
            if (currenctCount === numbersInLayer) {
                currentDepth -= Math.random() * dropRange + minDropRange;
                currenctCount = 0;
                numbersInLayer = Math.round(numbersInLayer * 1.25);
                dropRange = dropRange * 0.95;
            }
        }
        super(staticCanvas, dynamicCanvas);
        this.updateColorTier(startColorTier);
    }

    updateColorTier(tier) {
        this.staticCanvas.content.forEach((element) => {
            element.updateColor(this.TIER_STATIC_COLORS[tier]);
        });
        this.dynamicCanvas.content.forEach((element) => {
            element.updateColor(this.TIER_DYNAMIC_COLORS[tier]);
        });
    }

    updateMultiColorTiers(tiers) {
        this.dynamicCanvas.content.forEach((element) => {
            let colorIndex = Math.round(Math.random() * (tiers.length - 1));
            element.updateColor(this.TIER_DYNAMIC_COLORS[tiers[colorIndex]]);
        });
    }

    toggleRollSpeed(on) {
        this.dynamicCanvas.content.forEach((element) => {
            let targetBonusSpeed = on ? element.speed * this.ROLL_SPEED_PERCENT : 0;
            element.targetBonusSpeed = targetBonusSpeed;
        });
    }
}

StoreRollInnerAnimationController.prototype.TIER_STATIC_COLORS = {
    1: new RGB(239, 224, 205, 0.3),
    2: new RGB(0, 115, 255, 0.3),
    3: new RGB(163, 82, 188, 0.3),
    4: new RGB(197, 108, 55, 0.3)
};
StoreRollInnerAnimationController.prototype.TIER_DYNAMIC_COLORS = {
    1: new RGB(239, 224, 205, 0.2),
    2: new RGB(102, 171, 255, 0.2),
    3: new RGB(163, 82, 188, 0.2),
    4: new RGB(237, 165, 90, 0.2)
};
StoreRollInnerAnimationController.prototype.ROLL_SPEED_PERCENT = 2;

class StoreInnerAnimationCanvas extends AnimationCanvasCenter {
    constructor($canvas) {
        super($canvas);
    }

    updateContent() {
        let radius = this.width / 2;
        this.content.forEach((canvasContent) => (canvasContent.containerRadius = radius));
    }
}

class StoreRollOuterAnimationController extends AnimationController {
    constructor(startColorTier) {
        let $rewardCircle = $("#swTicketRewardCenter");
        let staticCanvas = new StoreOuterStaticAnimationCanvas($("#swTicketRollOuterCanvasStatic"), $rewardCircle);
        staticCanvas.content.push(new StaticGlowOrb(staticCanvas.ctx, 0, 0, 0, 0.1, 0.1, 0.1, new RGB()));
        let targetShape = new AnimationShapeCircle(0, 0, 0);
        let spawnShape = new AnimationShapeDonut(0, 0, 0, 0);

        let dynamicCanvas = new StoreOuterDynamicAnimationCanvas(
            $("#swTicketRollOuterCanvasDynamic"),
            $rewardCircle,
            targetShape,
            spawnShape
        );

        for (let i = 0; i < 100; i++) {
            let particle = new AnimationRandomParticle(
                dynamicCanvas.ctx,
                0.6,
                0.2,
                0.2,
                new RGB(),
                targetShape,
                spawnShape,
                20,
                30,
                3,
                5
            );
            particle.fadeSpeed = 0.5;
            dynamicCanvas.content.push(particle);
        }

        super(staticCanvas, dynamicCanvas);
        this.updateColorTier(startColorTier);
        this.centerCircleShape = targetShape;
        this.spawnDonutShape = spawnShape;
    }

    updateColorTier(tier) {
        this.staticCanvas.content.forEach((element) => {
            element.updateColor(this.TIER_COLORS[tier]);
        });
        this.dynamicCanvas.content.forEach((element) => {
            element.updateColor(this.TIER_COLORS[tier]);
        });
    }

    updateMultiColorTiers(tiers) {
        let currentTierIndex = -1;
        let colorDistributionCount = Math.floor(this.dynamicCanvas.content.length / tiers.length);
        this.dynamicCanvas.content.forEach((element, index) => {
            if (index % colorDistributionCount === 0 && currentTierIndex + 1 !== tiers.length) {
                currentTierIndex++;
            }
            element.updateColor(this.TIER_COLORS[tiers[currentTierIndex]]);
        });
    }

    toggleRollSpeed(on) {
        this.dynamicCanvas.content.forEach((element) => {
            let targetBonusSpeed = on ? element.speed * this.ROLL_SPEED_PERCENT : 0;
            element.targetBonusSpeed = targetBonusSpeed;
        });
    }

    toggleReverseDirection(on) {
        this.dynamicCanvas.content.forEach((element) => {
            element.reverseDirection = on;
            element.fadeOut = on;
        });
    }
}

StoreRollOuterAnimationController.prototype.TIER_COLORS = {
    1: new RGB(239, 224, 205),
    2: new RGB(102, 171, 255),
    3: new RGB(163, 82, 188),
    4: new RGB(237, 165, 90)
};
StoreRollOuterAnimationController.prototype.ROLL_SPEED_PERCENT = 7;

class StoreOuterStaticAnimationCanvas extends AnimationCanvasCenter {
    constructor($canvas, $rewardCenter) {
        super($canvas);

        this.$rewardCenter = $rewardCenter;
    }

    updateContent() {
        let radius = this.$rewardCenter.width() / 2;
        this.content.forEach((canvasContent) => (canvasContent.baseRadius = radius));
    }
}

class StoreOuterDynamicAnimationCanvas extends AnimationCanvasCenter {
    constructor($canvas, $rewardCenter, targetCircleShape, spawnDonutShape) {
        super($canvas);

        this.$rewardCenter = $rewardCenter;
        this.targetCircleShape = targetCircleShape;
        this.spawnDonutShape = spawnDonutShape;
    }

    updateContent() {
        let radius = this.$rewardCenter.width() / 2;
        this.targetCircleShape.radius = radius;
        this.spawnDonutShape.innerRadius = radius * 1.3;
        this.spawnDonutShape.outerRadius = radius * 1.5;
        this.content.forEach((canvasContent) => {
            canvasContent.randomize(true);
        });
    }
}

class StoreOuterRewardContainer {
    constructor($container) {
        this.$container = $container;
        this.$nameContainer = this.$container.find(".swAvatarTileFooterContent");
        this.$name = this.$container.find(".swAvatarSkinName:first-child");
        this.$avatarImage = this.$container.find(".swTicketRollRewardImg");
        this.$backgroundImage = this.$container.find(".swTicketRollRewardContainer");
        this.$ticketIcon = this.$container.find(".swTicketRollRewardTicketIcon");
        this.$typeText = this.$container.find(".swAvatarTileTypeText");
        this.$rhythmIcon = this.$container.find(".swRhythmIcon");

        this.rhythmReward = 0;
    }

    get maxWidth() {
        let parentWidth = this.$container.parent().width();
        return parentWidth / 2 - parentWidth * this.RIGHT_MARGIN_PERCENT;
    }

    get maxHeight() {
        return this.$container.parent().height();
    }

    set avatar(avatar) {
        this.$avatarImage
            .attr(
                "srcset",
                cdnFormater.newAvatarSrcSet(
                    avatar.avatarName,
                    avatar.outfitName,
                    avatar.optionName,
                    true,
                    avatar.colorName,
                    cdnFormater.AVATAR_POSE_IDS.BASE
                )
            )
            .attr("sizes", this.SIZE_MOD_SIZES[avatar.sizeModifier])
            .attr(
                "src",
                cdnFormater.newAvatarSrc(
                    avatar.avatarName,
                    avatar.outfitName,
                    avatar.optionName,
                    true,
                    avatar.colorName,
                    cdnFormater.AVATAR_POSE_IDS.BASE
                )
            )
            .attr("class", "swTicketRollRewardImg")
            .addClass("sizeMod" + avatar.sizeModifier);
        this.$backgroundImage
            .css(
                "background-image",
                'url("' +
                cdnFormater.newAvatarBackgroundSrc(avatar.backgroundFileName, cdnFormater.BACKGROUND_STORE_PREVIEW_SIZE) +
                '")'
            )
            .attr("class", "swTicketRollRewardContainer")
            .addClass(avatar.avatarName)
            .addClass(avatar.outfitName.replace(" ", "-"))
            .addClass(avatar.colorName.replace(" ", "-"));
    }

    set emote(emote) {
        this.$avatarImage
            .attr("srcset", cdnFormater.newEmoteSrcSet(emote.name))
            .attr("src", cdnFormater.newEmoteSrc(emote.name))
            .attr("class", "swTicketRollRewardImg");
        this.$backgroundImage.css("background-image", "").attr("class", "swTicketRollRewardContainer").addClass("emote");
    }

    set ticketImageTier(tier) {
        this.$ticketIcon.attr("srcset", cdnFormater.newTicketSrcSet(tier)).attr("src", cdnFormater.newTicketSrc(tier));
    }

    animationDone() {
        if (this.rhythmReward) {
            storeWindow.rhythm = storeWindow.rhythm + this.rhythmReward;
        }
    }

    setupResult(result) {
        if (result.type === "avatar" || result.type === "color") {
            this.avatar = result.description;
            if (result.type === "avatar") {
                this.$typeText.text("Skin");
                this.$name.text(capitalizeMajorWords(result.description.outfitName));
            } else {
                this.$typeText.text(result.description.avatarName);
                this.$name.text(capitalizeMajorWords(result.description.colorName));
            }
        } else {
            this.emote = result.description;
            this.$typeText.text("Emote");
            this.$name.text(result.description.name);
        }

        this.rhythmReward = result.rhythm;

        if (this.rhythmReward) {
            this.$rhythmIcon.removeClass("hide");
        } else {
            this.$rhythmIcon.addClass("hide");
        }

        this.ticketImageTier = result.tier;

        this.updateTextSize();
    }

    resize() {
        let maxWidth = this.maxWidth;
        let maxHeight = this.maxHeight;

        let height, width;
        if (maxWidth * 1.5 < maxHeight) {
            height = maxWidth * 1.5;
            width = maxWidth;
        } else {
            height = maxHeight;
            width = maxHeight * (2 / 3);
        }
        this.$container.height(height).width(width);

        this.updateTextSize();
    }

    updateTextSize() {
        fitTextToContainer(this.$name, this.$nameContainer, 40, 12);
    }

    toggleActive(on) {
        if (on) {
            this.$container.addClass("active");
        } else {
            this.$container.removeClass("active");
        }
    }

    displayResult(tier) {
        this.$container.addClass("displayResult");
        this.$container.css("box-shadow", "0 0 10px 2px " + this.TIER_COLORS[tier].string);
    }

    reset() {
        this.toggleActive(false);
        this.$container.css("box-shadow", "");
        this.$backgroundImage.css("background-image", "");
        this.$container.removeClass("displayResult");
    }
}

StoreOuterRewardContainer.prototype.RIGHT_MARGIN_PERCENT = 0.025;
StoreOuterRewardContainer.prototype.TIER_COLORS = {
    1: new RGB(239, 224, 205),
    2: new RGB(102, 171, 255),
    3: new RGB(163, 82, 188),
    4: new RGB(237, 165, 90)
};
StoreOuterRewardContainer.prototype.SIZE_MOD_SIZES = {
    0: "25vh",
    20: "30vh",
    51: "38vh"
};

class StoreOuterMajorRewardContainer extends StoreOuterRewardContainer {
    constructor($container) {
        super($container);
    }

    get maxWidth() {
        return this.$container.parent().width();
    }
}

class StoreInsdeRewardContainer extends StoreOuterRewardContainer {
    constructor($container) {
        super($container);

        this.$container.on("transitionend", () => {
            this.$container.css("pointer-events", "");
            this.animationDone();
        });
    }

    resize() {
        //do nothing
    }

    toggleActive(on) {
        if (on) {
            this.$container.removeClass("notActive").css("pointer-events", "none");
        } else {
            this.$container.addClass("notActive");
        }
    }
}
