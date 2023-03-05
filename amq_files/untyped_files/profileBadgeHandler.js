'use strict';
/*exported ProfileBadgeHandler*/

class ProfileBadgeHandler {
	constructor(allBadges, activeBadges) {
		this.badgeMap = {};
		if(allBadges.length) {
			allBadges.forEach(badge => {
				this.badgeMap[badge.id] = new ProfileBadge(badge);
			});
		} else {
			activeBadges.forEach(badge => {
				this.badgeMap[badge.id] = new ProfileBadge(badge);
			});
		}

		this.selectedOptionBadge = null;
		this.selectedSlot = null;
	}

	setActive(badgeId, slot) {
		this.badgeMap[badgeId].showInSlot(slot);
	}

	attachOptionSlot(badgeId, slot) {
		this.badgeMap[badgeId].attachOptionSlot(slot);
	}

	attachChatSlot(badgeId, slot) {
		this.badgeMap[badgeId].attachChatSlot(slot);
	}

	slotSelected(slot) {
		if(this.selectedOptionBadge) {
			this.selectedSlot = slot;
			this.handleBadgeSelectedForSlot();
		} else if(this.selectedSlot === slot) {
			this.selectedSlot.selected = false;
			this.selectedSlot = null;
		} else {
			if(this.selectedSlot) {
				this.selectedSlot.selected = false;
			}
			this.selectedSlot = slot;
			this.selectedSlot.selected = true;
		}
	}

	optionClick(badgeId) {
		let badge = this.badgeMap[badgeId];
		if(!badge.canSelect) {
			return;
		}

		if(this.selectedSlot) {
			this.selectedOptionBadge = badge;
			this.handleBadgeSelectedForSlot();
		} else if(this.selectedOptionBadge === badge){
			badge.updateOptionState(false);
			this.selectedOptionBadge = null;
		} else {
			if(this.selectedOptionBadge) {
				this.selectedOptionBadge.updateOptionState(false);
			}
			this.selectedOptionBadge = badge;
			badge.updateOptionState(true);
		}
	}
	
	getBadge(badgeId) {
		return this.badgeMap[badgeId];
	}

	clearSelected(badgeId) {
		this.badgeMap[badgeId].clearBadgeSlot();
	}

	handleBadgeSelectedForSlot() {
		this.selectedOptionBadge.showInSlot(this.selectedSlot);

		socket.sendCommand({
			type: 'social',
			command: 'player profile show badge',
			data: {
				slotNumber: this.selectedSlot.slotNumber,
				badgeId: this.selectedOptionBadge.id
			}
		});

		this.selectedOptionBadge.updateOptionState(false);
		this.selectedSlot.selected = false;
		this.selectedOptionBadge = null;
		this.selectedSlot = null;
	}

	resetSelection() {
		if(this.selectedOptionBadge) {
			this.selectedOptionBadge.updateOptionState(false);
			this.selectedOptionBadge = null;
		}
		if(this.selectedSlot) {
			this.selectedSlot.selected = false;
			this.selectedSlot = null;
		}
	}
}

class ProfileBadge {
	constructor(badgeInfo) {
		this.name = badgeInfo.name;
		this.unlockDescription = badgeInfo.unlockDescription;
		this.fileName = badgeInfo.fileName;
		this.id = badgeInfo.id;
		this.special = badgeInfo.special;

		this.unlocked = badgeInfo.unlocked;
		this.showInChat = badgeInfo.showInChat;

		this.badgeSlot = null;
		this.optionSlot = null;
		this.chatSlott = null;
	}

	get active() {
		return this.badgeSlot != null;
	}

	get canSelect() {
		return this.unlocked && !this.active;
	}

	showInSlot(slot) {
		if(this.badgeSlot) {
			this.badgeSlot.clearBadge();
		}
		this.badgeSlot = slot;
		this.badgeSlot.showBadge(this, this.id);
	}

	attachOptionSlot(slot) {
		this.optionSlot = slot;
		this.optionSlot.setBadge(this.name, this.unlockDescription, this.fileName);
		this.updateOptionState(false);
	}

	attachChatSlot(slot) {
		this.chatSlot = slot;
		this.chatSlot.setBadge(this.name, this.unlockDescription, this.fileName);
		this.updateChatState();
	}

	updateOptionState(selected) {
		this.optionSlot.updateState(this.unlocked, this.active, selected);
	}

	updateChatState() {
		this.chatSlot.updateState(this.unlocked, this.showInChat, false);
	}

	clearBadgeSlot() {
		socket.sendCommand({
			type: 'social',
			command: 'player profile clear badge',
			data: {
				slotNumber: this.badgeSlot.slotNumber
			}
		});
		this.badgeSlot.clearBadge();
		this.badgeSlot.selected = false;
		this.badgeSlot = null;

		this.updateOptionState(false);
	}
}