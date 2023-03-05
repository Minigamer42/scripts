"use strict";

class NexusDungeonResultWindow extends NexusDungeonBaseWindow {
	constructor() {
		super($("#nexusMapResultContainer"));
		this.$headerText = $("#nexusMapResultContainer > h1");
		this.$continueButton = this.$window.find("#nexusMapResultContinueButton");
		this.$title = this.$window.find("#nexusMapResultTitle");

		this.xpController = new NexusDungeonResultWindowXpController(this.$window, this.XP_ANIMATION_TIME_MS, () => {
			this.avatarController.runAnimations(this.XP_BAR_ANIMATION_TIME_MS);
		});
		this.avatarController = new NexusDungeonResultWindowAvatarController(this.$window, () => {
			this.runeModController.runAnimations(this.RUNE_MODS_ANIMATION_TIME_MS);
		});
		this.runeModController = new NexusDungeonResultWindowRuneModsController(this.$window, () => {
			this.$continueButton.removeClass("disabled");
		});

		this.$continueButton.click(() => {
			socket.sendCommand({
				type: "nexus",
				command: "finish dungeon",
			});
		});
	}

	close() {
		super.close();
		this.reset();
	}

	reset() {
		this.xpController.reset();
		this.avatarController.reset();
		this.runeModController.reset();
	}

	displayResult(xpResults, avatarList, avatarXpInfo, runeMods, title) {
		if(xpResults.length) {
			this.$continueButton.addClass("disabled");
		} else {
			this.$continueButton.removeClass("disabled");
		}
		this.xpController.displayEntries(xpResults, this.XP_ANIMATION_TIME_MS);
		this.avatarController.displayAvatars(avatarList, avatarXpInfo);
		this.runeModController.displayRuneMods(runeMods, this.RUNE_MODS_ANIMATION_TIME_MS);
		this.$title.text(title);
	}
}
NexusDungeonResultWindow.prototype.XP_ANIMATION_TIME_MS = 3000;
NexusDungeonResultWindow.prototype.XP_BAR_ANIMATION_TIME_MS = 2000;
NexusDungeonResultWindow.prototype.RUNE_MODS_ANIMATION_TIME_MS = 1300;

class NexusDungeonResultWindowXpController {
	constructor($window, counterSpeed, completedCallback) {
		this.$xpRewardRow = $window.find("#nexusMapResultXpRow");
		this.xpMainCounter = new TextCounter($window.find("#nexusMapResultXpTotal"), counterSpeed, null, 0, () => {
			completedCallback();
		});

		this.currentEntries = [];
	}

	reset() {
		this.$xpRewardRow.html("");
		this.currentEntries = [];
	}

	displayEntries(entries, totalSpeedMs) {
		this.reset();

		let largestEntryXp = 1;
		entries.forEach((entry) => {
			if (entry.xpCount > largestEntryXp) {
				largestEntryXp = entry.xpCount;
			}
		});

		let totalXp = 0;
		this.currentEntries = entries.map((entryInfo) => {
			totalXp += entryInfo.xpCount;

			let entrySpeedMs = totalSpeedMs * (entryInfo.xpCount / largestEntryXp);

			let entry = new NexusDungeonResultWindowXpEntry(entryInfo, entrySpeedMs);
			this.$xpRewardRow.append(entry.$body);
			return entry;
		});

		this.xpMainCounter.currentValue = 0;
		this.xpMainCounter.targetValue = 0;

		this.currentEntries.forEach((entry) => {
			entry.startCounter();
		});

		this.xpMainCounter.countToValue(totalXp);
	}
}

class NexusDungeonResultWindowXpEntry {
	constructor({ name, entryCount, xpCount }, speedMs) {
		this.$body = $(format(this.TEMPALTE, name));
		this.$nameCount = this.$body.find(".nexusMapResultXpResultNameCount");

		this.xpCount = xpCount;

		let entryTickInterval = xpCount / entryCount;
		let entryTickIntervalNumber = 0;
		this.counter = new TextCounter(this.$body.find(".nexusMapResultXpResultValue"), speedMs, (newValue) => {
			if (entryCount > 1) {
				let newEntryTickIntervalNumber = Math.ceil(newValue / entryTickInterval);
				if (newEntryTickIntervalNumber > entryTickIntervalNumber && newEntryTickIntervalNumber <= entryCount) {
					this.$nameCount.text("(" + newEntryTickIntervalNumber + ")");
					entryTickInterval = newEntryTickIntervalNumber;
				}
			}
		});
	}

	get counterFinished() {
		return this.counter.finished;
	}

	startCounter() {
		this.counter.countToValue(this.xpCount);
	}
}
NexusDungeonResultWindowXpEntry.prototype.TEMPALTE =
	'<div class="nexusMapResultXpResultContainer"><div class="nexusMapResultXpResultName">{0} <span class="nexusMapResultXpResultNameCount"></span></div><div class="nexusMapResultXpResultValue">0</div>';

class NexusDungeonResultWindowAvatarController {
	constructor($window, animationDoneCallback) {
		this.$avatarRow = $window.find("#nexusMapResultAvatarRow");

		this.animationDoneCallback = animationDoneCallback;

		this.currentAvatars = [];
	}

	reset() {
		this.$avatarRow.html("");
		this.currentAvatars = [];
	}

	displayAvatars(avatarlist, avatarXpInfo) {
		this.reset();

		this.currentAvatars = avatarlist.map((avatarListEntry) => {
			let entry = new NexusDungeonResultWindowAvatarEntry(
				avatarListEntry.avatarInfo.avatar,
				avatarListEntry.avatarInfo.background.backgroundVert,
				avatarXpInfo[avatarListEntry.avatarInfo.avatar.avatarName],
				() => {
					this.handleAnimationFinished();
				}
			);
			this.$avatarRow.append(entry.$body);
			return entry;
		});
	}

	handleAnimationFinished() {
		if (this.currentAvatars.some((avatar) => !avatar.animationDone)) {
			//Wait all animations finished
			return;
		}
		this.animationDoneCallback();
	}

	runAnimations(durationMs) {
		this.currentAvatars.forEach((avatar) => avatar.displayNewState(durationMs));
	}
}

class NexusDungeonResultWindowAvatarEntry {
	constructor(
		{ avatarName, outfitName, optionName, optionActive, colorName, sizeModifier },
		backgroundVert,
		{ originalXpState, newXpState },
		updateFinishedCallback
	) {
		this.$body = $(this.TEMPLATE);
		this.$img = this.$body.find(".nexusMapResultAvatarImg");
		this.$levelText = this.$body.find(".nexusMapResultAvatarXpLevelText span");
		this.$xpBar = this.$body.find(".nexusMapResultAvatarXpBar");
		this.$rewardContainer = this.$body.find(".nexusMapResultAvatarLevelUpUnlockContainer");
		new PreloadImage(
			this.$img,
			cdnFormater.newAvatarSrc(
				avatarName,
				outfitName,
				optionName,
				optionActive,
				colorName,
				cdnFormater.AVATAR_POSE_IDS.BASE
			),
			cdnFormater.newAvatarSrcSet(
				avatarName,
				outfitName,
				optionName,
				optionActive,
				colorName,
				cdnFormater.AVATAR_POSE_IDS.BASE
			),
			true,
			"250px"
		);
		this.$img.addClass("sizeMod" + sizeModifier);

		this.$body.css(
			"background-image",
			`url(${cdnFormater.newAvatarBackgroundSrc(backgroundVert, cdnFormater.BACKGROUND_GAME_SIZE)})`
		);

		this.levelText = originalXpState.level;
		if (originalXpState.maxLevel) {
			this.updateXpPercent(100, 0);
		} else {
			let xpPercent = (originalXpState.currentXp / originalXpState.xpForLevelUp) * 100;
			this.updateXpPercent(xpPercent, 0);
		}
		this.originalXpState = originalXpState;
		this.newXpState = newXpState;

		this.updateFinishedCallback = updateFinishedCallback;

		this.$xpBar.on("transitionend webkitTransitionEnd", () => {
			if (this.levelUpSteps.length) {
				this.runAnimationStep();
			} else {
				this.$body.removeClass("xpGaining");
				updateFinishedCallback();
			}
		});
	}

	get animationDone() {
		return this.levelUpSteps ? this.levelUpSteps.length === 0 : true;
	}

	set levelText(newValue) {
		this.$levelText.text(newValue);
	}

	updateXpPercent(newPercent, transitionTimeMs) {
		if (!transitionTimeMs) {
			this.$xpBar.css("transition", "");
		} else {
			this.$xpBar.css("transition", `transform ${transitionTimeMs}ms`);
		}
		this.$xpBar.height(); //Force dom to re-rendoer before triggering transform
		this.$xpBar.css("transform", `skewX(-35.5deg) translateX(${newPercent - 100}%)`);
		this.$xpBar.height(); //Force dom to re-rendoer to trigger tranform
	}

	displayNewState(durationMs) {
		let levelsGained = this.newXpState.level - this.originalXpState.level;
		let levelUpRewardMap = this.newXpState.lastXpRewardsMap;
		if (levelsGained === 0) {
			if(this.newXpState.maxLevel){
				this.updateFinishedCallback();
				return;
			} else {
				this.levelUpSteps = [
					{
						level: this.newXpState.level,
						targetXpPercent: (this.newXpState.currentXp / this.newXpState.xpForLevelUp) * 100,
						reset: false,
						durationMs: durationMs,
					},
				];
			}
		} else if (levelsGained === 1) {
			let initXpGain = this.originalXpState.xpForLevelUp - this.originalXpState.currentXp;
			let totalXp = initXpGain + this.newXpState.currentXp;
			this.levelUpSteps = [
				{
					level: this.originalXpState.level,
					targetXpPercent: 100,
					reset: false,
					durationMs: durationMs * (initXpGain / totalXp),
				},
				{
					level: this.newXpState.level,
					targetXpPercent: (this.newXpState.currentXp / this.newXpState.xpForLevelUp) * 100,
					reset: true,
					durationMs: durationMs * (this.newXpState.currentXp / totalXp),
					levelUpRewards: levelUpRewardMap[this.newXpState.level],
				},
			];
		} else {
			let initXpGainPercent = (this.originalXpState.xpForLevelUp - this.originalXpState.currentXp) / 100;
			let totalXpGainPercentCount = levelsGained * 100 + initXpGainPercent;
			let standardDuration = (100 / totalXpGainPercentCount) * durationMs;
			this.levelUpSteps = [
				{
					level: this.originalXpState.level,
					targetXpPercent: 100,
					reset: false,
					durationMs: (initXpGainPercent / totalXpGainPercentCount) * durationMs,
				},
			];
			for (let i = 1; i < levelsGained; i++) {
				let targetLevel = this.originalXpState.level + i;
				this.levelUpSteps.push({
					level: targetLevel,
					targetXpPercent: 100,
					reset: true,
					durationMs: standardDuration,
					levelUpRewards: levelUpRewardMap[targetLevel],
				});
			}
			this.levelUpSteps.push({
				level: this.newXpState.level,
				targetXpPercent: (this.newXpState.currentXp / this.newXpState.xpForLevelUp) * 100,
				reset: true,
				durationMs: standardDuration,
				levelUpRewards: levelUpRewardMap[this.newXpState.level],
			});
		}
		this.$body.addClass("xpGaining");
		this.runAnimationStep();
	}

	runAnimationStep() {
		let step = this.levelUpSteps.shift();
		if (step.reset) {
			this.updateXpPercent(0, null);
			this.$body.addClass("levelUp");
		}
		this.levelText = step.level;

		if(step.level === this.MAX_LEVEL) {
			this.updateXpPercent(100, step.durationMs);
		} else {
			this.updateXpPercent(step.targetXpPercent, step.durationMs);
		}
		if (step.levelUpRewards) {
			step.levelUpRewards.forEach((reward) => {
				let $reward = $(format(this.LEVEL_UP_REWARD_TEMPLATE, reward));
				this.$rewardContainer.prepend($reward);
				$reward.height(); //Force dom update
				$reward.addClass("display");
			});
		}
	}
}
NexusDungeonResultWindowAvatarEntry.prototype.TEMPLATE = $("#nexusAvatarResultTemplate").html();
NexusDungeonResultWindowAvatarEntry.prototype.LEVEL_UP_REWARD_TEMPLATE =
	"<div class='nexusMapResultAvatarLevelUpUnlock'>+ {0}</div>";
NexusDungeonResultWindowAvatarEntry.prototype.MAX_LEVEL = 50;

class NexusDungeonResultWindowRuneModsController {
	constructor($window, animationDoneCallback) {
		this.$runeModRow = $window.find("#nexusMapResultRuneModRow");

		this.animationDoneCallback = animationDoneCallback;

		this.baseCapacity = Math.floor(this.BASE_CONTAINER_WIDTH / this.RUNE_MOD_SIZE) + this.BASE_CONTAINER_EXTRA_CAPACITY;

		this.currentRuneMods = [];
	}

	reset() {
		this.currentRuneMods = [];
		this.$runeModRow.html("");
	}

	displayRuneMods(runeModList, animationTimeMs) {
		this.reset();

		let { startX, offsetIncrease } = this.calculatePositionBasis(runeModList);

		let fadeTime = animationTimeMs / runeModList.length;

		this.currentRuneMods = runeModList
			.sort((a, b) => {
				if (a.category !== b.category) {
					return a.category - b.category;
				} else if (a.type !== b.type) {
					return a.type - b.type;
				} else if (a.runeId !== b.runeId) {
					return a.runeId - b.runeId;
				} else {
					return a.level - b.level;
				}
			})
			.map((runeModInfo, index) => {
				let entry = new NexusDungeonResultWindowRuneModEntry(runeModInfo, startX + offsetIncrease * index, fadeTime);
				this.$runeModRow.append(entry.$body);
				return entry;
			});
	}

	calculatePositionBasis(runeModList) {
		let runeCount = runeModList.length;

		if (runeCount < 2) {
			return {
				startX: Math.round(this.FULL_ROW_WIDTH / 2 - this.RUNE_MOD_SIZE / 2),
				offsetIncrease: 0,
			};
		} else {
			let containerSize = this.baseCapacity >= runeCount ? this.BASE_CONTAINER_WIDTH : this.FULL_CONTAINER_WIDTH;
			let startX = Math.round(this.FULL_ROW_WIDTH / 2 - containerSize / 2);

			let offsetSizePool = containerSize - this.RUNE_MOD_SIZE;
			let offsetIncrease = offsetSizePool / (runeCount - 1);

			return { startX, offsetIncrease };
		}
	}

	runAnimations(durationMs) {
		if (this.currentRuneMods.length === 0) {
			this.animationDoneCallback();
		} else {
			let tickSpeed = (durationMs * this.FADE_IN_TOGGLE_SPEED_INCREASE) / this.currentRuneMods.length;

			let timer = new Timer();
			let tickCount = 0;
			let interval = setInterval(() => {
				let ticksPassed = Math.floor(timer.getTimePassedMs() / tickSpeed);
				
				for(let i = tickCount; tickCount <= ticksPassed; i++) {
					tickCount++;
					if(this.currentRuneMods[i]) {
						this.currentRuneMods[i].display();
					}
				}

				if(tickCount >= this.currentRuneMods.length) {
					this.animationDoneCallback();
					clearInterval(interval);
				}
			}, this.TICK_SPEED);
		}
	}
}
NexusDungeonResultWindowRuneModsController.prototype.BASE_CONTAINER_WIDTH = 270; //px
NexusDungeonResultWindowRuneModsController.prototype.FULL_CONTAINER_WIDTH = 666; //px
NexusDungeonResultWindowRuneModsController.prototype.FULL_ROW_WIDTH = 900; //px
NexusDungeonResultWindowRuneModsController.prototype.RUNE_MOD_SIZE = 70; //
NexusDungeonResultWindowRuneModsController.prototype.BASE_CONTAINER_EXTRA_CAPACITY = 5; //
NexusDungeonResultWindowRuneModsController.prototype.FADE_IN_TOGGLE_SPEED_INCREASE = 0.8; //

class NexusDungeonResultWindowRuneModEntry {
	constructor({ name, fileName }, offset, fadeTime) {
		this.$body = $(this.TEMPLATE);
		new PreloadImage(
			this.$body,
			cdnFormater.newNexusRuneIconSrc(fileName),
			cdnFormater.newNexusRuneIconSrcSet(fileName),
			true,
			"70px"
		);

		this.$body.css("left", `${offset}px`).css("transition-duration", `${fadeTime}ms`);

		this.$body.popover({
			html: true,
			content: name,
			delay: 50,
			placement: "top",
			trigger: "hover",
		});
	}

	display() {
		this.$body.addClass('display');
	}
}
NexusDungeonResultWindowRuneModEntry.prototype.TEMPLATE = '<img class="nexusMapResultRuneMod">';
