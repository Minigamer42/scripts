"use strict";
/*exported NexusTutorialWorkshop NexusTutorialRuneSetup*/

class NexusTutorialWorkshop extends BaseNexusTutorial {
	constructor(tutorialId, $reformaterTab) {
		super(tutorialId);

		this.addEvent(
			"Welcome to the workshop! As you level up your avatars, they’ll unlock rune slots, which you can equip powerful runes in.",
			null,
			true
		);
		this.addEvent(
			"Runes are found throughout the Nexus dungeon, and grants stats boost and unique effects when equipped to an avatar.",
			null,
			true
		);
		this.addEvent("If one of your avatars have empty rune slots, the amount is displayed on their tiles.", null, true);

		let reformatTabElement = new NexusTutorialStandardPositionElement($reformaterTab, 0, "left", true);
		this.addEvent(
			"Finally, you can also use the rune reformatter to transform or upgrade your runes.",
			reformatTabElement,
			false
		);
	}
}

class NexusTutorialRuneSetup extends BaseNexusTutorial {
	constructor(
		tutorialId,
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
		super(tutorialId);

		this.addEvent("Here we have the rune setup for your avatars.", null, true);

		let runeContainerElement = new NexusTutorialStandardPositionElement($runeContainer, "bottom", "center", false);
		this.addEvent(
			"At the top, you have all unused runes you’ve found in the Nexus dungeon.",
			runeContainerElement,
			false
		);
		this.addEvent(
			"Runes are divided into the two categories, offensive (red) and defensive (blue).",
			runeContainerElement,
			false
		);
		this.addEvent(
			"Beside their category, runes also comes in two types, standard (triangle and square) and advanced (circles).",
			runeContainerElement,
			false
		);
		this.addEvent(
			"Standard runes give stacking stat or genre boosts, whereas advanced runes give a unique effect.",
			runeContainerElement,
			false
		);

		let slotContainerElement = new NexusTutorialStandardPositionElement($slotContainer, "top", "center", false);
		this.addEvent("Each rune category have 20 standard slots and 1 advanced slot. ", slotContainerElement, false);

		let minorRuneContainerElement = new NexusTutorialStandardPositionElement(
			$minorRuneContainer,
			"top",
			"center",
			false
		);
		this.addEvent(
			"To unlock the advanced slot for a category, you first have to equip 12 standard runes of that category.",
			minorRuneContainerElement,
			false
		);

		let minorRuneContainerTwoElement = new NexusTutorialStandardPositionElement(
			$minorRuneContainerTwo,
			"top",
			"center",
			false
		);
		this.addEvent(
			"Equipping an advanced rune, then, unlocks the last 8 standard slots for the category.",
			minorRuneContainerTwoElement,
			false
		);

		let sharedRuneSlotElement = new NexusTutorialStandardPositionElement($sharedRuneSlot, "top", "center", false);
		this.addEvent(
			"Finally, if you fill up all the category rune slots, you’re able to equip one additional advanced rune.",
			sharedRuneSlotElement,
			false
		);
		this.addEvent(
			"This final advanced rune can be from any category, but can’t have the same power as the other advanced runes.",
			sharedRuneSlotElement,
			false
		);

		let slotCounterElement = new NexusTutorialStandardPositionElement($slotCounter, "bottom", "center", false);
		this.addEvent("The counter above me show how many empty rune slots the avatar have.", slotCounterElement, false);
		this.addEvent(
			"To equip runes, simply click the rune you want to equip, then an empty slot of the same type.",
			slotCounterElement,
			false
		);

		let saveButtonElement = new NexusTutorialStandardPositionElement($saveButton, "top", "center", false);
		this.addEvent("After changing your rune setup, remember to save it at the bottom.", saveButtonElement, false);

		let clearButtonElement = new NexusTutorialStandardPositionElement($clearButton, "top", "center", false);
		this.addEvent(
			"Unequipping all your equipped runes is also possible, but costs one ticket.",
			clearButtonElement,
			false
		);
		this.addEvent(
			"Instead of unequipping runes, you can also destroy an equipped rune to clear up the slot by clicking it.",
			clearButtonElement,
			false
		);
		this.addEvent(
			"The rune is first lost when you save the page after destroying it, so feel free to experiment with different setup.",
			clearButtonElement,
			false
		);

		let runePageContainerElement = new NexusTutorialStandardPositionElement(
			$runePageContainer,
			"bottom",
			"center",
			false
		);
		this.addEvent(
			"Finally, more rune pages are planned, so you can have different setups. But they will first be added in the future.",
			runePageContainerElement,
			false
		);
	}
}
