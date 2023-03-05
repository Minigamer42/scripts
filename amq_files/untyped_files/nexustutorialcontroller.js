"use strict";
/*exported BaseNexusTutorial nexusTutorialController NexusTutorialStandardPositionElement*/

class NexusTutorialController {
	constructor() {
		this.window = new NexusTutorialWindow();
	}

	startCityOverviewTutorial($cityContainer, elementMap, cityController) {
		this.window.loadTutorial(
			new NexusTutorialCityOverview(this.NEXUS_TUTORIAL_IDS.CITY_OVERVIEW, $cityContainer, elementMap, cityController)
		);
	}

	startDungeonModeTutorial(selectionTab) {
		this.window.loadTutorial(new NexusTutorialDungeonMode(this.NEXUS_TUTORIAL_IDS.DUNGEON_MODE, selectionTab));
	}

	startDungeonLobbyTutorial($slot, $settingRow, $rating, $floor) {
		this.window.loadTutorial(
			new NexusTutorialDungeonLobby(this.NEXUS_TUTORIAL_IDS.DUNGEON_LOBBY, $slot, $settingRow, $rating, $floor)
		);
	}

	startDungeonAvatarSelectionTutorial(avatarSelector) {
		this.window.loadTutorial(
			new NexusTutorialDungeonAvatarSelection(this.NEXUS_TUTORIAL_IDS.DUNGEON_AVATAR_SELECTION, avatarSelector)
		);
	}

	startDungeonMapTutorial($partyContainer, $runeContainer) {
		this.window.loadTutorial(
			new NexusTutorialDungeonMap(this.NEXUS_TUTORIAL_IDS.DUNGEON_MAP, $partyContainer, $runeContainer)
		);
	}

	startDungeonCombatTutorial($enemyContainer, $turnOrder, $partyContainer) {
		this.window.loadTutorial(
			new NexusTutorialDungeonCombat(
				this.NEXUS_TUTORIAL_IDS.DUNGEON_COMBAT,
				$enemyContainer,
				$turnOrder,
				$partyContainer
			)
		);
	}

	startDungeonRewardsTutorial($fragments, $artifactRow, $runeRow, $continueButton) {
		this.window.loadTutorial(
			new NexusTutorialDungeonRewards(
				this.NEXUS_TUTORIAL_IDS.DUNGEON_REWARDS,
				$fragments,
				$artifactRow,
				$runeRow,
				$continueButton
			)
		);
	}

	startDungeonCraftingStationTutorial($continueButton) {
		this.window.loadTutorial(
			new NexusTutorialCraftingStations(this.NEXUS_TUTORIAL_IDS.CRAFTING_STATION, $continueButton)
		);
	}

	startWorkshopTutorial($reformaterTab) {
		this.window.loadTutorial(new NexusTutorialWorkshop(this.NEXUS_TUTORIAL_IDS.WORKSHOP, $reformaterTab));
	}

	startRuneSetupTutorial(
		$runeContainer,
		$slotContainer,
		$minorRuneContainer,
		$minorRuneContainerTwo,
		$sharedRuneSlot,
		$slotCounter,
		$saveButton,
		$clearButton,
		$runePageContainer
	) {
		this.window.loadTutorial(
			new NexusTutorialRuneSetup(
				this.NEXUS_TUTORIAL_IDS.RUNE_SETUP,
				$runeContainer,
				$slotContainer,
				$minorRuneContainer,
				$minorRuneContainerTwo,
				$sharedRuneSlot,
				$slotCounter,
				$saveButton,
				$clearButton,
				$runePageContainer
			)
		);
	}
}
NexusTutorialController.prototype.NEXUS_TUTORIAL_IDS = {
	CITY_OVERVIEW: 1,
	DUNGEON_MODE: 2,
	DUNGEON_LOBBY: 3,
	DUNGEON_AVATAR_SELECTION: 4,
	DUNGEON_MAP: 5,
	DUNGEON_COMBAT: 6,
	DUNGEON_REWARDS: 7,
	CRAFTING_STATION: 8,
	WORKSHOP: 9,
	RUNE_SETUP: 10,
};

class BaseNexusTutorial {
	constructor(tutorialId) {
		this.tutorialId = tutorialId;
		this.events = [];
		this.currentIndex = null;
	}

	addEvent(text, element, centerPosition, triggerHandler, delay, centerOffsetX, centerOffsetY) {
		this.events.push({
			text,
			element,
			centerPosition,
			triggerHandler,
			delay,
			centerOffsetX,
			centerOffsetY,
		});
	}

	get currenEventInfo() {
		return this.events[this.currentIndex];
	}

	start() {
		this.currentIndex = 0;
		return this.currenEventInfo;
	}

	step() {
		this.currentIndex++;
		return this.currenEventInfo;
	}
}

class NexusTutorialWindow {
	constructor() {
		this.$body = $("#nexusTutorialWindow");
		this.$text = $("#nexusTutorialText");
		this.$backdrop = $("#nexusTutorialBackdrop");

		this.currentTutorial = null;
		this.doingDelay = false;

		this.$body.click(() => {
			if (!this.doingDelay) {
				this.handleClick();
			}
		});
	}

	loadTutorial(tutorial) {
		this.currentTutorial = tutorial;
		this.handleNewContent(this.currentTutorial.start());
	}

	handleClick() {
		const eventInfo = this.currentTutorial.step();
		if (eventInfo) {
			this.handleNewContent(eventInfo);
		} else {
			tutorial.nexusTutorialCompleted(this.currentTutorial.tutorialId);
			this.hide();
		}
	}

	handleNewContent({ text, element, centerPosition, triggerHandler, delay, centerOffsetX, centerOffsetY }) {
		if (triggerHandler) {
			triggerHandler();
		}
		if (delay) {
			this.doingDelay = true;
			setTimeout(() => {
				this.doingDelay = false;
				this.showContent({ text, element, centerPosition, centerOffsetX, centerOffsetY });
			}, delay);
		} else {
			this.showContent({ text, element, centerPosition, centerOffsetX, centerOffsetY });
		}
	}

	showContent({ text, element, centerPosition, centerOffsetX, centerOffsetY }) {
		let { xCord, yCord, backdropXOffset, backdropYOffset } = element
			? element.calculatePosition()
			: { xCord: 0, yCord: 0, backdropXOffset: 0, backdropYOffset: 0 };
		this.$text.text(text);

		if (centerPosition) {
			let xValue = centerOffsetX ? `calc(-50% + ${centerOffsetX}px)` : "-50%";
			let yValue = centerOffsetY ? `calc(-50% + ${centerOffsetY}px)` : "-50%";
			this.$body.css({
				left: "50%",
				top: "50%",
				transform: `translate(${xValue}, ${yValue})`,
			});
		} else {
			this.$body.css({
				left: xCord,
				top: yCord,
				transform: "",
			});
		}
		if (backdropXOffset || backdropYOffset) {
			backdropXOffset = `${backdropXOffset < 0 ? "-" : "+"} ${Math.abs(backdropXOffset)}`;
			backdropYOffset = `${backdropYOffset < 0 ? "-" : "+"} ${Math.abs(backdropYOffset)}`;
			this.$backdrop.css({
				transform: `translate(calc(-50% ${backdropXOffset}px), calc(-50% ${backdropYOffset}px))`,
			});
		} else {
			this.$backdrop.css({
				transform: "translate(-50%, -50%)",
			});
		}
		this.$body.removeClass("hide");
	}

	hide() {
		this.$body.addClass("hide");
	}
}

class NexusTutorialBasePositionElement {
	constructor(
		element,
		vertPosition,
		horPosition,
		noOffsetbackdrop,
		backdropOffsetX,
		backdropOffsetY,
		extraOffsetX,
		extraOffsetY
	) {
		this.element = element;
		this.vertPosition = vertPosition;
		this.horPosition = horPosition;
		this.noOffsetbackdrop = noOffsetbackdrop;
		this.backdropOffsetX = backdropOffsetX;
		this.backdropOffsetY = backdropOffsetY;
		this.extraOffsetX = extraOffsetX;
		this.extraOffsetY = extraOffsetY;
	}

	get elementCords() {
		throw new Error("Should be implemented in child class");
	}

	get elementHeight() {
		throw new Error("Should be implemented in child class");
	}

	get elementWidth() {
		throw new Error("Should be implemented in child class");
	}

	calculatePosition() {
		let { yCord, xCord } = this.elementCords;

		let backdropXOffset = 0;
		let backdropYOffset = 0;
		if (typeof this.vertPosition == "number") {
			yCord += this.vertPosition;
			backdropYOffset -= this.vertPosition;
		} else if (this.vertPosition === "top") {
			yCord -= this.TUTORIAL_WINDOW_HEIGHT;
			backdropYOffset += this.TUTORIAL_WINDOW_HEIGHT;
		} else if (this.vertPosition === "bottom") {
			yCord += this.elementHeight;
			backdropYOffset -= this.elementHeight;
		}

		if (this.extraOffsetY) {
			yCord += this.extraOffsetY;
			backdropYOffset -= this.extraOffsetY;
		}

		if (typeof this.horPosition == "number") {
			xCord += this.horPosition;
			backdropXOffset -= this.horPosition;
		} else if (this.horPosition === "left") {
			xCord -= this.TUTORIAL_WINDOW_WIDTH;
			backdropXOffset += this.TUTORIAL_WINDOW_WIDTH;
		} else if (this.horPosition === "right") {
			xCord += this.elementWidth;
			backdropXOffset -= this.elementWidth;
		} else if (this.horPosition === "center") {
			xCord += this.elementWidth / 2 - this.TUTORIAL_WINDOW_WIDTH / 2;
			backdropXOffset -= this.elementWidth / 2 + this.TUTORIAL_WINDOW_WIDTH / 2;
		}

		if (this.extraOffsetX) {
			xCord += this.extraOffsetX;
			backdropXOffset -= this.extraOffsetX;
		}

		if (!this.noOffsetbackdrop) {
			backdropXOffset = 0;
			backdropYOffset = 0;
		} else {
			if (this.backdropOffsetX) {
				backdropXOffset += this.backdropOffsetX;
			}
			if (this.backdropOffsetY) {
				backdropYOffset += this.backdropOffsetY;
			}
		}

		return {
			xCord,
			yCord,
			backdropXOffset,
			backdropYOffset,
		};
	}
}
NexusTutorialBasePositionElement.prototype.TUTORIAL_WINDOW_HEIGHT = 120;
NexusTutorialBasePositionElement.prototype.TUTORIAL_WINDOW_WIDTH = 420;

class NexusTutorialStandardPositionElement extends NexusTutorialBasePositionElement {
	constructor(
		element,
		vertPosition,
		horPosition,
		noOffsetbackdrop,
		backdropOffsetX,
		backdropOffsetY,
		extraOffsetX,
		extraOffsetY
	) {
		super(
			element,
			vertPosition,
			horPosition,
			noOffsetbackdrop,
			backdropOffsetX,
			backdropOffsetY,
			extraOffsetX,
			extraOffsetY
		);
	}

	get elementCords() {
		let { top, left } = this.element.offset();
		return {
			yCord: top,
			xCord: left,
		};
	}

	get elementHeight() {
		return this.element.outerHeight();
	}

	get elementWidth() {
		return this.element.outerWidth();
	}
}

var nexusTutorialController = new NexusTutorialController();
