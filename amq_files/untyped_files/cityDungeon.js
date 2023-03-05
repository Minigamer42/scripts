"use strict";
/*exported NexusTutorialDungeonMode NexusTutorialDungeonLobby NexusTutorialDungeonAvatarSelection*/

class NexusTutorialDungeonMode extends BaseNexusTutorial {
	constructor(tutorialId, selectionTab) {
		super(tutorialId);

		this.addEvent(
			"Welcome to the Dungeon Tower! Here you prepare and setup for your dungeon run, before embarking on the adventure.",
			null,
			true
		);
		this.addEvent(
			"In the future, new ways to challenge the dungeon will be added. But for now only the standard section is available.",
			null,
			true,
			null,
			null,
			0,
			-225
		);

		let soloElement = new NexusTutorialStandardPositionElement(
			selectionTab.standardModeSelectionEntry.$soloButton,
			0,
			"right",
			true
		);
		this.addEvent(
			"You can either challenge the dungeon solo, where you bring a party consisting of 4 of your own avatars.",
			soloElement,
			false
		);
		let coopElement = new NexusTutorialStandardPositionElement(
			selectionTab.standardModeSelectionEntry.$coopButton,
			0,
			"right",
			true
		);
		this.addEvent(
			"Or join up with up to 4 friends, each of you bringing 1-2 avatars to the dungeon run.",
			coopElement,
			false
		);
	}
}

class NexusTutorialDungeonLobby extends BaseNexusTutorial {
	constructor(tutorialId, $slot, $settingRow, $rating, $floor) {
		super(tutorialId);

		this.addEvent("Here we have the dungeon lobby, where you set up the party and configure the dungeon.", null, true);

		let slotElement = new NexusTutorialStandardPositionElement($slot, 0, "right", true);
		this.addEvent("First of all, you’ll have to select 4 avatars to bring into the dungeon.", slotElement, false);

		let settingElement = new NexusTutorialStandardPositionElement($settingRow, 0, "left", true);
		this.addEvent(
			"Over here to my right, you can adjust how songs are selected in the dungeon.",
			settingElement,
			false
		);

		let ratingElement = new NexusTutorialStandardPositionElement($rating, 0, "left", true);
		this.addEvent(
			"Changing the song selection effects the dungeon rating. The harder the settings, the higher the rating and the better rewards in the dungeon.",
			ratingElement,
			false
		);

		let floorElement = new NexusTutorialStandardPositionElement($floor, 0, "left", true);
		this.addEvent(
			"Beside the rating, you can also choose what floor of the dungeon you want to challenge.",
			floorElement,
			false
		);
		this.addEvent("Each floor adds a new combat modifier, making it harder the higher you climb.", floorElement, false);
		this.addEvent(
			"To unlock new floors, you’ll have to complete the floor below it on the rating. Higher floors also reward more runes and xp.",
			floorElement,
			false
		);
	}
}

class NexusTutorialDungeonAvatarSelection extends BaseNexusTutorial {
	constructor(tutorialId, avatarSelector) {
		super(tutorialId);

		this.addEvent(
			"You can use any avatars you’ve unlocked normally in the game, and that have been added to the Nexus.",
			null,
			true
		);

		this.addEvent(
			"Beside avatars you’ve unlocked, 6 avatars are always free to use. The free avatars have a lock in the upper right, and changes each Wednesday.",
			null,
			true
		);

		this.addEvent(
			"Hovering an avatar will display their ability, a unique power that can be used doing combat in the dungeon.",
			null,
			true
		);

		this.addEvent(
			"The avatars stats will also be shown over on the right. To see what each stat does, you can hover the stat icon after the tutorial.",
			null,
			true,
			() => {
				avatarSelector.displayFirstAvatar();
			},
			null
		);

		this.addEvent("Finally, below the stats, each avatar have their genre strengths and weaknesses.", null, true);

		this.addEvent(
			"Avatars deal more damage when guessing shows they are strong at, and take more damage when missing shows they are weak at.",
			null,
			true
		);
	}
}
