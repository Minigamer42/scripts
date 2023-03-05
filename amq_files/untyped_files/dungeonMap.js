"use strict";
/*exported NexusTutorialDungeonMap NexusTutorialDungeonCombat NexusTutorialDungeonRewards NexusTutorialCraftingStations*/

class NexusTutorialDungeonMap extends BaseNexusTutorial {
	constructor(tutorialId, $partyContainer, $runeContainer) {
		super(tutorialId);

		this.addEvent("Welcome to the Nexus dungeon!", null, true);
		this.addEvent(
			"To clear the dungeon, you’ll have to climb from the bottom row to the top one, where the boss is waiting.",
			null,
			true
		);
		this.addEvent("Along your path to the top, you’ll run into 3 types of tiles.", null, true);
		this.addEvent("Enemy tiles that trigger a combat encounter.", null, true);
		this.addEvent("Event tiles that trigger some random event.", null, true);
		this.addEvent(
			"Crafting stations, where you can convert fragments you find throughout the dungeon, into artifacts that power up your avatars.",
			null,
			true
		);
		this.addEvent(
			"Some regions of the dungeon are also themed around a specific genre, causing shows from that genre to be more likely to appear.",
			null,
			true
		);
		this.addEvent(
			"You can spot the genre region by the color of a tile, and you can always hover tiles to see the region and type of them.",
			null,
			true
		);

		let partyElement = new NexusTutorialStandardPositionElement($partyContainer, 0, "left", true);

		this.addEvent(
			"To the right, you can see your party status. Hovering any of the avatars will reveal their ability, stats and any badge they’re using.",
			partyElement,
			false
		);
		this.addEvent("Artifacts you equip to them will also be shown here.", partyElement, false);

		let runeElement = new NexusTutorialStandardPositionElement($runeContainer, 0, "left", false, null, null, -130);

		this.addEvent(
			"Above them, you find your current fragment count, as well as your rune inventory.",
			runeElement,
			false
		);
	}
}

class NexusTutorialDungeonCombat extends BaseNexusTutorial {
	constructor(tutorialId, $enemyContainer, $turnOrder, $partyContainer) {
		super(tutorialId);

		this.addEvent("Here we have the combat encounter, the central part of all dungeon runs.", null, true);

		let enemyElement = new NexusTutorialStandardPositionElement($enemyContainer, "top", "center", false);
		this.addEvent(
			"To win a combat encounter, you must reduce the health of all the enemies to 0. Their health are displayed below the green health bar.",
			enemyElement,
			false
		);
		this.addEvent(
			"Left of the health bars are the enemies current target, together with a countdown to their attack.",
			enemyElement,
			false
		);
		this.addEvent(
			"The attack countdown ticks down each time you guess wrong, and the enemy attacks when it hits 0.",
			enemyElement,
			false
		);
		this.addEvent(
			"At the top of the right most enemy, you’ll see your attack target. When you guess correctly, the turn avatar attacks this target.",
			enemyElement,
			false
		);
		this.addEvent("You can change your attack target to any other enemy by clicking it.", enemyElement, false);

		let turnOrderElement = new NexusTutorialStandardPositionElement($turnOrder, 0, "left", false);
		this.addEvent(
			"The avatars in the party take turns. To the right, you have the turn order, with the bottom avatar having the current turn.",
			turnOrderElement,
			false
		);
		this.addEvent("Turns progress no matter if you guess right or wrong.", turnOrderElement, false);

		let partyElement = new NexusTutorialStandardPositionElement($partyContainer, "top", "center", false);
		this.addEvent(
			"Finally, you have your avatar party. As with the enemies, you find their health and health bar below them.",
			partyElement,
			false
		);
		this.addEvent("Instead of a target, avatar have their ability to the left of the health bar.", partyElement, false);
		this.addEvent(
			"These abilities can in general be used any time doing combat, not only doing the avatars turn, by clicking the icon.",
			partyElement,
			false
		);
		this.addEvent(
			"The turn avatar is also able to swap position with another avatar in the party instead of attacking.",
			partyElement,
			false
		);
		this.addEvent(
			"This doesn’t change the turn order, but does swap the enemy targets between the two avatars.",
			partyElement,
			false
		);
		this.addEvent(
			"So you can use swapping to change attacks from your low health avatars, to the more healthy ones.",
			partyElement,
			false
		);
		this.addEvent(
			"To swap two avatars, simply click the avatar you want the turn avatar to switch position with, and guess the song correctly.",
			partyElement,
			false
		);
		this.addEvent("That’s the basics of combat encounters, best of luck!", null, true);
	}
}

class NexusTutorialDungeonRewards extends BaseNexusTutorial {
	constructor(tutorialId, $fragments, $artifactRow, $runeRow, $continueButton) {
		super(tutorialId);

		this.addEvent(
			"After winning a combat encounter or some events, you’ll earn artifacts, fragments and sometimes runes.",
			null,
			true
		);

		let fragmentElement = new NexusTutorialStandardPositionElement($fragments, 0, "right", true);
		this.addEvent(
			"To the left, you can see the fragments earned, these can be used doing some events and at crafting stations.",
			fragmentElement,
			false
		);

		let artifactElement = new NexusTutorialStandardPositionElement($artifactRow, "top", "center", false, null, null, null, -50);
		this.addEvent(
			"Below we have the found artifacts, you can choose one of these to give to an avatar, powering them up.",
			artifactElement,
			false
		);

		let runeElement = new NexusTutorialStandardPositionElement($runeRow, "top", "center", false, null, null, null, -50);
		this.addEvent(
			"Finally, at the bottom, we have any runes that might have dropped. You automatically loot all of these.",
			runeElement,
			false
		);
		this.addEvent(
			"The runes don’t do anything doing the run, but after it, you can equip them to your avatars at the workshop to boost their stats and give unique effects.",
			runeElement,
			false
		);

		let continueElement = new NexusTutorialStandardPositionElement($continueButton, 0, "left", true);
		this.addEvent(
			"Once you’ve finished, you can continue by clicking the bottom in the top right.",
			continueElement,
			false
		);
	}
}

class NexusTutorialCraftingStations extends BaseNexusTutorial {
	constructor(tutorialId, $continueButton) {
		super(tutorialId);

		this.addEvent("Here we have a crafting station, where you can convert your fragments into artifacts and runes.", null, true);
		this.addEvent("Each item can only be crafted once, but you can craft as many of them as you have fragments for.", null, true);

		let continueElement = new NexusTutorialStandardPositionElement($continueButton, 0, "left", true);
		this.addEvent(
			"Once you’ve finished, you can continue by clicking the bottom in the top right.",
			continueElement,
			false
		);
	
	}
}