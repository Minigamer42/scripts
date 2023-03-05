"use strict";
/*exported LobbyRuleModal*/

class LobbyRuleModal {
	constructor() {
		this.$modal = $("#quizRulesModal");
		this.$prevButton = this.$modal.find("#qrPrevButton");
		this.$nextButton = this.$modal.find("#qrNextButton");
		this.$imageContainer = this.$modal.find("#qrImageInnerContainer");
		this.$title = this.$modal.find("#qrCategoryTitle");
		this.mainCycle = new LobbyRuleCycleContainer(this.$modal.find("#qrCycleContainer"));
		this.modeCycle = new LobbyRuleCycleContainer(this.$modal.find("#qrModeCycleContainer"));
		this.currentSetIndex = 0;
		this.entries = [];

		this.teamModeSet = new LobbyRuleModalEntrySet(
			"Team Mode",
			$(this.TEAM_MODE_TEMPLATE),
			{ 2: 250 },
			{ 1: -105 },
			this,
			["Team Selection", "Answering", "Scoring", "Chat"],
			() => {tutorial.showTeams = false;}
		);
		this.speedScoringSet = new LobbyRuleModalEntrySet(
			"Speed Scoring",
			$(this.SPEED_SCORING_TEMPLATE),
			{ 0: 440, 1: 250, 2: 500 },
			{},
			this,
			["Answer Ranking", "Scoring", "Correct Answers"],
			() => {tutorial.showSpeed = false;}
		);
		this.livesSet = new LobbyRuleModalEntrySet(
			"Lives",
			$(this.LIVES_TEMPLATE),
			{ 0: 430, 1: 430, 2: 430, 3: 430, 4: 520 },
			{ 1: -110, 2: -110, 3: -110, 4: -110 },
			this,
			["Lives", "Losing Lives 1", "Losing Lives 2", "Winning", "Reviving"],
			() => {tutorial.showLives = false;}
		);
		this.lootingSet = new LobbyRuleModalEntrySet(
			"Looting",
			$(this.LOOTING_TEMPLATE),
			{ 0: 460, 3: 348, 4: 480 },
			{ 0: -230, 4: -115 },
			this,
			["Dropping", "Looting", "Containers", "Changing Zones", "Inventory"],
			() => {tutorial.showLooting = false;}
		);

		this.$nextButton.click(() => {
			if (this.onLastEntry) {
				this.$modal.modal("hide");
				this.reset();
			} else {
				let activeSet = this.entries[this.currentSetIndex];
				if (activeSet.onLastEntry) {
					this.setActiveSet(this.currentSetIndex + 1);
				} else {
					activeSet.setNewSelected(activeSet.selectedEntryIndex + 1);
				}
			}
		});

		this.$prevButton.click(() => {
			let activeSet = this.entries[this.currentSetIndex];
			if (activeSet.onFirstEntry) {
				this.setActiveSet(this.currentSetIndex - 1);
			} else {
				activeSet.setNewSelected(activeSet.selectedEntryIndex - 1);
			}
		});
	}

	get onLastEntry() {
		let activeSet = this.entries[this.currentSetIndex];
		return (
			this.currentSetIndex === this.entries.length - 1 && activeSet.selectedEntryIndex === activeSet.entryCount - 1
		);
	}

	get onFirstEntry() {
		let activeSet = this.entries[this.currentSetIndex];
		return this.currentSetIndex === 0 && activeSet.selectedEntryIndex === 0;
	}

	show() {
		this.$modal.modal("show");
	}

	hide() {
		this.$modal.modal("hide");
	}

	reset() {
		this.teamModeSet.reset();
		this.speedScoringSet.reset();
		this.lootingSet.reset();
		this.livesSet.reset();
		this.setActiveSet(0);
	}

	setupContent(showLooting, showTeam, showSpeed, showLives) {
		if (this.entries[this.currentSetIndex]) {
			this.entries[this.currentSetIndex].removeEntries();
		}
		this.entries = [];
		let nameMap = [];
		if (showLooting) {
			this.entries.push(this.lootingSet);
			nameMap.push("Looting");
		}
		if (showTeam) {
			this.entries.push(this.teamModeSet);
			nameMap.push("Team");
		}
		if (showSpeed) {
			this.entries.push(this.speedScoringSet);
			nameMap.push("Speed");
		}
		if (showLives) {
			this.entries.push(this.livesSet);
			nameMap.push("Lives");
		}

		this.modeCycle.setup(this.entries.length, nameMap, 0, (index) => {
			this.setActiveSet(index);
		});

		this.setActiveSet(0);
	}

	setActiveSet(index) {
		if (this.entries.length) {
			this.entries[this.currentSetIndex].removeEntries();
			this.currentSetIndex = index;
			let entrySet = this.entries[index];
			this.$imageContainer.html("");
			entrySet.entries.forEach((entry) => this.$imageContainer.append(entry.$entry));
			this.mainCycle.setup(entrySet.entryCount, entrySet.nameMap, entrySet.selectedEntryIndex, (index) =>
				entrySet.changeSelected(index)
			);
			this.modeCycle.setActive(index);
			this.$title.text(entrySet.name);
			this.updateButtons();
		}
	}

	selectedChange(newIndex) {
		this.mainCycle.setActive(newIndex);
	}

	updateButtons() {
		if (this.onFirstEntry) {
			this.$prevButton.addClass("hide");
		} else {
			this.$prevButton.removeClass("hide");
		}
		if (this.onLastEntry) {
			this.$nextButton.text("Close");
		} else {
			this.$nextButton.text("Next");
		}
	}
}
LobbyRuleModal.prototype.TEAM_MODE_TEMPLATE = $("#qrTeamModeTemplate")
	.html()
	.replace(/(\n|\t)/g, "");
LobbyRuleModal.prototype.SPEED_SCORING_TEMPLATE = $("#qrSpeedScoringTemplate")
	.html()
	.replace(/(\n|\t)/g, "");
LobbyRuleModal.prototype.LIVES_TEMPLATE = $("#qrLivesTemplate")
	.html()
	.replace(/(\n|\t)/g, "");
LobbyRuleModal.prototype.LOOTING_TEMPLATE = $("#qrLootingTemplate")
	.html()
	.replace(/(\n|\t)/g, "");

class LobbyRuleCycleContainer {
	constructor($container) {
		this.$container = $container;
		this.entries = [];
		this.activeIndex = 0;
	}

	setup(amount, nameMap, activeIndex, onClickHandler = () => {}) {
		this.$container.html("");
		this.entries = [];
		for (let i = 0; i < amount; i++) {
			let $entry = $(this.ENTRY_TEMPLATE);
			$entry.click(() => {
				this.setActive(i);
				onClickHandler(i);
			});
			$entry.popover({
				content: nameMap[i],
				delay: 50,
				placement: "top",
				trigger: "hover",
			});
			this.entries.push($entry);
			this.$container.append($entry);
		}
		this.setActive(activeIndex);
	}

	setActive(index) {
		if (this.entries[this.activeIndex]) {
			this.entries[this.activeIndex].removeClass("active");
		}
		this.activeIndex = index;

		this.entries[this.activeIndex].addClass("active");
	}
}
LobbyRuleCycleContainer.prototype.ENTRY_TEMPLATE = '<div class="cycleEntry floatingContainer clickAble"></div>';

class LobbyRuleModalEntrySet {
	constructor(name, $entries, maxSizeMap, customOffsetMap, mainController, nameMap, onFinishCallback) {
		this.name = name;
		this.entries = [];
		this.selectedEntryIndex = 0;
		this.mainController = mainController;
		this.nameMap = nameMap;
		this.onFinishCallback = onFinishCallback;
		for (let i = 0; i < $entries.length; i++) {
			this.entries.push(new LobbyRuleModalEntry($($entries[i]), i, this, maxSizeMap[i], customOffsetMap[i]));
		}

		this.updateSelectedEntry();
	}

	get entryCount() {
		return this.entries.length;
	}

	get onLastEntry() {
		return this.selectedEntryIndex === this.entries.length - 1;
	}
	get onFirstEntry() {
		return this.selectedEntryIndex === 0;
	}

	removeEntries() {
		this.entries.forEach((entry) => entry.$entry.detach());
	}

	reset() {
		this.selectedEntryIndex = 0;
		this.updateSelectedEntry();
	}

	updateSelectedEntry() {
		let expandedSize = this.entries[this.selectedEntryIndex].maxSize
			? this.entries[this.selectedEntryIndex].maxSize
			: this.DEFAULT_OPEN_SIZE;
		let defaultWidth = (this.FULL_WIDTH - expandedSize) / (this.entryCount - 1);
		this.entries.forEach((entry, index) => {
			if (index === this.selectedEntryIndex) {
				entry.selected = true;
				entry.width = expandedSize;
			} else {
				entry.width = defaultWidth;
			}
		});
	}

	changeSelected(newIndex) {
		this.entries[this.selectedEntryIndex].selected = false;
		this.selectedEntryIndex = newIndex;
		this.updateSelectedEntry();
		this.mainController.updateButtons();

		if(this.onLastEntry) {
			this.onFinishCallback();
		}
	}

	setNewSelected(newIndex) {
		this.changeSelected(newIndex);
		this.mainController.selectedChange(newIndex);
	}
}
LobbyRuleModalEntrySet.prototype.FULL_WIDTH = 598 + 118; //px - modal width + tilt
LobbyRuleModalEntrySet.prototype.DEFAULT_OPEN_SIZE = 400; //px

class LobbyRuleModalEntry {
	constructor($entry, index, parentSet, maxSize, customOffset) {
		this.$entry = $entry;
		this.index = index;
		this.parentSet = parentSet;
		this.maxSize = maxSize;
		this._selected = false;

		if (customOffset) {
			this.$entry.find("img").css("margin-left", customOffset);
		}

		this.$entry.click(() => {
			if (!this.selected) {
				parentSet.setNewSelected(this.index);
			}
		});
	}

	set width(value) {
		this.$entry.css("width", value);
	}

	set selected(value) {
		this._selected = value;
		if (value) {
			this.$entry.addClass("selected");
		} else {
			this.$entry.removeClass("selected");
		}
	}

	get selected() {
		return this._selected;
	}
}
