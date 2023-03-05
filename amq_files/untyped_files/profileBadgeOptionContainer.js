'use strict';

class ProfileBadgeOptionContainer {
	constructor(badgeHandler, allBadges, $profileContainer) {
		this.$profile = $profileContainer;
		this.$container = $profileContainer.find('.ppBadgeOptions');
		this.$profileBody = this.$container.find('.ppBadgeOptionProfileBody');
		this.$chatBody = this.$container.find('.ppPadgeOptionChatBody');
		this.$chatContent = this.$chatBody.find('.ppBadgeOptionChatBodyContent');
		this.$chatBodyPlayerName = this.$chatBody.find('.ppBadgeOptionNameText');
		this.$chatBodyPlayerNamBadges = this.$chatBody.find('.ppBadgeOptionNameBadges');
		this.$chatBodySpecialContainer = this.$chatBody.find('.ppBadgeOptionChatSpecialBadgeContainer');
		this.$chatBodyStandardContainer = this.$chatBody.find('.ppBadgeOptionChatStandardBadgeContainer');

		this.$profileToggle = this.$container.find(".ppBadgeOptionProfileToggle");
		this.$chatToggle = this.$container.find(".ppBadgeOptionChatToggle");

		this.optionSlots = [];
		this.chatSlots = [];
		this.activeChatSlots = [];
		
		let handleBadgeClick = (badgeId) => {badgeHandler.optionClick(badgeId);};
		let handleChatBadgeClick = (badgeId) => {
			let badge = badgeHandler.getBadge(badgeId);
			if(!badge.unlocked) {
				return;
			}
			if(badge.showInChat) {
				badge.showInChat = false;
				this.removeChatBadge(badgeId);
				socket.sendCommand({
					type: 'social',
					command: 'player profile clear chat badge',
					data: {
						badgeId: badgeId
					}
				});
			} else {
				badge.showInChat = true;
				if(!badge.special) {
					let nonSpecialBadgeId = this.getNonSpeicalChatBadgeId();
					if(nonSpecialBadgeId != null) {
						let oldBadge = badgeHandler.getBadge(nonSpecialBadgeId);
						oldBadge.showInChat = false;
						oldBadge.updateChatState();
						this.removeChatBadge(nonSpecialBadgeId);
					}
				}
				socket.sendCommand({
					type: 'social',
					command: 'player profile set chat badge',
					data: {
						badgeId: badgeId
					}
				});
				this.addChatBadge(badge);
				this.updateChatBadges();
			}
			badge.updateChatState();
		};

		allBadges.sort((a,b) => {
			if (a.unlocked !== b.unlocked) {
				return a.unlocked ? -1 : 1;
			}
			if(this.BADGE_TYPE_ORDER_WEIGHT[b.type] !== this.BADGE_TYPE_ORDER_WEIGHT[a.type]) {
				return this.BADGE_TYPE_ORDER_WEIGHT[b.type] - this.BADGE_TYPE_ORDER_WEIGHT[a.type];
			}
			if(a.type === b.type && a.type === 1 || a.type === 2) {
				return a.name.localeCompare(b.name, undefined, {numeric: true, sensitivity: 'base'});
			}
			return a.id - b.id;
		}).forEach(badge => {
			if(this.PROFILE_BADGE_TYPES.includes(badge.type)) {
				let optionSlot = new ProfileOptionBadgeSlot(handleBadgeClick, badge.id);
				badgeHandler.attachOptionSlot(badge.id, optionSlot);
				this.optionSlots.push(optionSlot);
				this.$profileBody.append(optionSlot.$imgContainer);
			}

			let chatSlot = new ProfileOptionBadgeSlot(handleChatBadgeClick, badge.id);
			badgeHandler.attachChatSlot(badge.id, chatSlot);
			this.chatSlots.push(chatSlot);
			if(badge.special) {
				this.$chatBodySpecialContainer.append(chatSlot.$imgContainer);
			} else {
				this.$chatBodyStandardContainer.append(chatSlot.$imgContainer);
			}
			if(badge.showInChat) {
				this.addChatBadge(badge);
			}
		});
		this.updateChatBadges();
		this.badgesLoaded = false;

		this.$chatBodyPlayerName.text(selfName);
		this.$profileBody.perfectScrollbar({
			suppressScrollX: true
		});
		this.$chatContent.perfectScrollbar({
			suppressScrollX: true
		});

		this.$profileToggle.click(() => {this.setProfileView();});
		this.$chatToggle.click(() => {
			this.setChatView();
			badgeHandler.resetSelection();
		});
	}

	get shouldPlaceLeft() {
		let leftOffset = this.$profile.offset().left;
		let profileWidth = this.$profile.innerWidth();
		let optionRightBondary = leftOffset + profileWidth + this.CONTAINER_WIDTH;
		return optionRightBondary > $(window).width();
	}

	toggleEdit(on) {
		if(on) {
			this.setProfileView();
			if(!this.badgesLoaded) {
				this.optionSlots.forEach(slot => {slot.load();});
				this.chatSlots.forEach(slot => {slot.load();});
				this.activeChatSlots.forEach(slot => {slot.load();});
				this.badgesLoaded = true;
			}

			if(this.shouldPlaceLeft) {
				this.$container.addClass('left');
			}
		}
	}

	addChatBadge(badgeInfo) {
		let slot = new ProfileOptionChatBadgeSlot(badgeInfo);
		this.activeChatSlots.push(slot);
		if(this.badgesLoaded) {
			slot.load();
		}
	}

	getNonSpeicalChatBadgeId() {
		let slot = this.activeChatSlots.find((slot) => {return !slot.special;});
		if(slot) {
			return slot.badgeId;
		} else {
			return null;
		}
	}

	removeChatBadge(badgeId) {
		let index = this.activeChatSlots.findIndex(slot => {return slot.badgeId === badgeId;});
		if(index !== -1) {
			this.activeChatSlots[index].$imgContainer.remove();
			this.activeChatSlots.splice(index, 1);
		}
	}

	updateChatBadges() {
		this.activeChatSlots.sort((a,b) => {
			return a.weight - b.weight;
		}).forEach(badgeSlot => {
			badgeSlot.$imgContainer.detach();
			this.$chatBodyPlayerNamBadges.append(badgeSlot.$imgContainer);
		});
	}

	setChatView() {
		this.$profileBody.addClass('hide');
		this.$chatBody.removeClass('hide');

		this.$profileToggle.removeClass('selected');
		this.$chatToggle.addClass('selected');
		
		this.$chatContent.perfectScrollbar('update');

		this.$profile.addClass('chatEdit');
	}

	setProfileView() {
		this.$chatBody.addClass('hide');
		this.$profileBody.removeClass('hide');

		this.$chatToggle.removeClass('selected');
		this.$profileToggle.addClass('selected');

		this.$profileBody.perfectScrollbar('update');

		this.$profile.removeClass('chatEdit');
	}
}
ProfileBadgeOptionContainer.prototype.PROFILE_BADGE_TYPES = [1, 2, 3, 4, 6];
ProfileBadgeOptionContainer.prototype.BADGE_TYPE_ORDER_WEIGHT = {
	1: 90,
	2: 100,
	3: 1,
	4: 10,
	5: 1,
	6: 95,
};
ProfileBadgeOptionContainer.prototype.CONTAINER_WIDTH = 200; //px

class ProfileOptionBadgeSlot {
	constructor(handleBadgeClick, badgeId) {
		this.badgeId = badgeId;

		this.badgeFileName;

		this.$imgContainer = $(this.BADGE_TEMPLATE);
		this.$imgContainer.addClass('optionChatBadge');
		this.$imgContainer.popover({
			content: '',
			html: true,
			delay: 50,
			placement: 'top',
			trigger: 'hover',
			container: '.ppBadgeOptions'
		});

		this.$imgContainer.click(() => {
			handleBadgeClick(this.badgeId);
		});
	}

	setBadge(badgeName, unlockDescription, fileName) {
		this.$imgContainer.data('bs.popover').options.content = createBadgePopoverHtml(fileName, badgeName, unlockDescription);
		this.badgeFileName = fileName;
	}

	load() {
		new PreloadImage(this.$imgContainer.find('.ppBadgeImage'), cdnFormater.newBadgeSrc(this.badgeFileName), cdnFormater.newBadgeSrcSet(this.badgeFileName));
	}

	clearSelection() {
		this.selected = false;
		this.updateState();
	}

	updateState(unlocked, active, selected) {
		this.$imgContainer.removeClass('locked');
		this.$imgContainer.removeClass('active');
		this.$imgContainer.removeClass('selected');
		if(selected) {
			this.$imgContainer.addClass('selected');
		} else if(active) {
			this.$imgContainer.addClass('active');
		} else if(!unlocked) {
			this.$imgContainer.addClass('locked');
		}
	}
}

ProfileOptionBadgeSlot.prototype.BADGE_TEMPLATE = $("#playerProfileBadgeOption").html();

class ProfileOptionChatBadgeSlot extends ProfileOptionBadgeSlot {
	constructor(badgeInfo) {
		super(() => {}, badgeInfo.id);

		this.special = badgeInfo.special;
		this.weight = this.CHAT_BADGE_ORDER_WEIGHT[badgeInfo.type];
		this.setBadge(badgeInfo.name, null, badgeInfo.fileName);
	}

	setBadge(badgeName, unlockDescription, fileName) {
		this.$imgContainer.data('bs.popover').options.content = createBadgePopoverHtml(fileName, badgeName);
		this.badgeFileName = fileName;
	}

	clearSelection() {
		//Do nothing
	}

	updateState() {
		//Do nothing
	}
}
ProfileOptionChatBadgeSlot.prototype.CHAT_BADGE_ORDER_WEIGHT = {
	1: 100,
	2: 100,
	3: 10,
	4: 100,
	5: 1
};