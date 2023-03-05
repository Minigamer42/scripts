'use strict';

class ScoreBoardTeamEntry {
	constructor(teamNumber) {
		this.$body = $(format(this.TEMPLATE, teamNumber));
		this.$playerContainer = this.$body.find('.qpTeamPlayerContainer');
		this.playerEntrySample;
		this.entryCount = 0;
		this.teamNumber = teamNumber;
	}

	get positionFromTop() {
		return this.$body.position().top;
	}

	get slotSortNumber() {
		return this.playerEntrySample.positionSlot;
	}

	set offset(newValue) {
		this.$body.css('transform', 'translateY(' + newValue + 'px)');
	}

	get height() {
		return this.entryCount * this.playerEntrySample.ENTRY_HEIGHT;
	}

	addPlayerEntry(playerEntry) {
		this.$playerContainer.append(playerEntry.$entry);
		this.playerEntrySample = playerEntry;
		this.entryCount++;
	}

	remove() {
		this.$body.remove();
	}	
}

ScoreBoardTeamEntry.prototype.TEMPLATE = $("#quizScoreboardTeamEntryTemplate").html();