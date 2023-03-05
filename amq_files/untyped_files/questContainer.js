"use strict";
/*exported qusetContainer*/

class QusetContainer {
	constructor() {
		this.$body = $("#questContainer");
		this.$questContainer = this.$body.find("#qcQuestContainerInner");
		this.$infoIcon = $("#qcInfoIcon");
		this.$stickOut = $("#qcStickOut");
		this.$counterCurrent = $("#qcStickOutCounterCurrent");
		this.$counterTarget = $("#qcStickOutCounterTarget");
		this.$tokenCounter = $("#qcTokenCounterValue");
		this.$tokenGainedShadow = $(".qcTokenIcon.shadow");

		this.$infoIcon.popover({
			title: "Daily Quests",
			content:
				"Complete daily quests to earn bonus notes, and earn an avatar token for every 7 quest completed! A new quest becomes available every day at 12:00 CET, and you’ll have 7 days to complete it.",
			placement: "right",
			trigger: "hover",
		});

		this.questMap = {};
		this.selectedQuest;

		this.$stickOut.click(() => {
			this.$stickOut.addClass("clicked");
			this.$body.toggleClass("open");
		});

		this.questEventListener = new Listener("new quest events", ({ events, tokenProgress, tokenGained }) => {
			events.forEach(({ questEvent, data }) => {
				switch (questEvent) {
					case this.QUEST_EVENTS.STATE_UPDATE: {
						let state = data.newState;
						let quest = this.questMap[state.weekSlot];
						quest.updateState(state);
						quest.updateBody();
						quest.updateProgressBar();
						if (quest === this.selectedQuest) {
							this.updateCounter();
						}
					}
				}
			});

			this.tokenProgress = tokenProgress;
			if (tokenGained) {
				this.$tokenGainedShadow.removeClass("hide");
			}
		});
		this.questEventListener.bindListener();
	}

	set tokenProgress(value) {
		this.$tokenCounter.text(value);
	}

	setup(questDescriptions, tokenProgress) {
		if (questDescriptions.length === 0) {
			this.$body.addClass("hide");
		}
		this.tokenProgress = tokenProgress;
		questDescriptions.forEach((description) => {
			let quest = new Quest(description);
			this.questMap[quest.weekSlot] = quest;
		});
		for (let i = 0; i < 7; i++) {
			if (!this.questMap[i]) {
				let quest = new Quest(
					{
						questId: null,
						name: "???",
						state: 0,
						targetState: 1,
						ticketReward: 0,
						noteReward: 0,
						description: null,
						weekSlot: i,
					},
					true
				);
				this.questMap[quest.weekSlot] = quest;
			}
		}
		Object.values(this.questMap)
			.sort((a, b) => a.sortValue - b.sortValue)
			.forEach((quest) => {
				this.$questContainer.append(quest.$body);
			});
	}

	selectQuest(weekSlot) {
		let targetQuest = this.questMap[weekSlot];
		if (this.selectedQuest) {
			this.selectedQuest.selected = false;
		}
		if (targetQuest === this.selectedQuest) {
			delete this.selectedQuest;
		} else if (!targetQuest.locked) {
			targetQuest.selected = true;
			this.selectedQuest = targetQuest;
		}
		this.updateCounter();
	}

	updateCounter() {
		if (this.selectedQuest) {
			this.$counterCurrent.text(this.selectedQuest.state);
			this.$counterTarget.text(this.selectedQuest.targetState);
			this.$stickOut.addClass("counterMode");
		} else {
			this.$stickOut.removeClass("counterMode");
		}
	}
}
QusetContainer.prototype.QUEST_EVENTS = {
	STATE_UPDATE: 1,
};

var qusetContainer = new QusetContainer();

class Quest {
	constructor(questDescription, locked) {
		this.updateState(questDescription);

		this.$body = $(this.TEMPALTE);
		this.$progressBar = this.$body.find(".qcProgressBar");
		this.$name = this.$body.find(".qcQuestObjective");
		this.$stateCount = this.$body.find(".gcStateCount");
		this.$totalStateCount = this.$body.find(".gcTargetStateCount");
		this.$questTypeText = this.$body.find(".qcQuestTypeText");

		this.locked = locked;

		this.$body.popover({
			title: this.eventQuest ? "Event Quest" : "Weekly Quest",
			content: () => {
				return this.popoverContent;
			},
			delay: { show: 100, hide: 0 },
			placement: "auto",
			trigger: "hover",
			html: true,
		});

		this.$body.click(() => {
			if (!this.locked) {
				qusetContainer.selectQuest(this.weekSlot);
			}
		});

		this.updateBody();
		this.updateProgressBar();
	}

	get sortValue() {
		if(this.eventQuest) {
			return -1;
		}
		return this.weekSlot === 0 ? 7 : this.weekSlot;
	}

	get popoverContent() {
		if (this.eventQuest) {
			let content = `${this.description}.`;
			return content;
		}
		if (!this.locked) {
			let content = `${this.description}.<br/>Reward: ${this.noteReward} notes`;
			if (this.ticketReward) {
				content += ` + ${this.ticketReward} tickets.`;
			} else {
				content += ".";
			}
			content += `<br/> Resets ${this.timeUntilReset}.`;
			return content;
		} else {
			return `Unlocks ${this.timeUntilReset}`;
		}
	}

	set selected(isSelected) {
		if (isSelected) {
			this.$body.addClass("selected");
		} else {
			this.$body.removeClass("selected");
		}
	}

	get typeName() {
		switch (this.weekSlot) {
			case 0:
				return "Sun";
			case 1:
				return "Mon";
			case 2:
				return "Tue";
			case 3:
				return "Wed";
			case 4:
				return "Thu";
			case 5:
				return "Fri";
			case 6:
				return "Sat";
			case "event":
				return "Eve";
			default:
				return "unk";
		}
	}

	get timeUntilReset() {
		let time = moment().tz("Europe/Copenhagen");
		time.set({
			hours: 12,
			minutes: 0,
			seconds: 0,
		});
		time.day(this.weekSlot);
		if (time.isBefore(moment())) {
			time.day(this.weekSlot + 7);
		}

		return time.fromNow();
	}

	updateState(state) {
		this.eventQuest = state.weekSlot === "event";
		this.questId = state.questId;
		this.name = state.name;
		this.state = state.state;
		this.targetState = state.targetState;
		this.ticketReward = state.ticketReward;
		this.noteReward = state.noteReward;
		this.description = state.description;
		this.weekSlot = state.weekSlot;
	}

	updateBody() {
		this.$name.text(this.name);
		this.$stateCount.text(this.locked ? "?" : this.state);
		this.$totalStateCount.text(this.locked ? "?" : this.targetState);
		this.$questTypeText.text(this.typeName);
	}

	updateProgressBar() {
		let progressPercent = -100 + (this.locked ? 0 : (this.state / this.targetState) * 100);
		this.$progressBar.css("transform", `translateX(${progressPercent}%)`);
	}
}
Quest.prototype.TEMPALTE = $("#questRowTemplate").html();
