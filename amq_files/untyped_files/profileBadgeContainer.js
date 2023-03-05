'use strict';
/*exported ProfileBadgeContainer*/

class ProfileBadgeContainer {
	constructor(badgeHandler, profileBadges, $profile) {
		this.$badgeContainer = $profile.find('.ppBadgeContainerInner');
		this.$noBadgeContainer = $profile.find('.ppBadgeNoBadge');
		let $leftContainer = this.$badgeContainer.find('.ppBadgeMinorContainer.left');
		let $rightContainer = this.$badgeContainer.find('.ppBadgeMinorContainer.right');

		let selectHandler = (slot) => {badgeHandler.slotSelected(slot);};
		let clearHandler = (badgeId) => {badgeHandler.clearSelected(badgeId);};

		this.badgeSlotMap = {
			1: new ProfileBadgeSlot(this.$badgeContainer.find('.ppBadgeImageContainer.big'), 1, selectHandler, clearHandler),
			2: new ProfileBadgeSlot($leftContainer.find('.ppBadgeImageContainer.1'), 2, selectHandler, clearHandler),
			3: new ProfileBadgeSlot($leftContainer.find('.ppBadgeImageContainer.2'), 3, selectHandler, clearHandler),
			4: new ProfileBadgeSlot($leftContainer.find('.ppBadgeImageContainer.3'), 4, selectHandler, clearHandler),
			5: new ProfileBadgeSlot($leftContainer.find('.ppBadgeImageContainer.4'), 5, selectHandler, clearHandler),
			6: new ProfileBadgeSlot($rightContainer.find('.ppBadgeImageContainer.1'), 6, selectHandler, clearHandler),
			7: new ProfileBadgeSlot($rightContainer.find('.ppBadgeImageContainer.2'), 7, selectHandler, clearHandler),
			8: new ProfileBadgeSlot($rightContainer.find('.ppBadgeImageContainer.3'), 8, selectHandler, clearHandler),
			9: new ProfileBadgeSlot($rightContainer.find('.ppBadgeImageContainer.4'), 9, selectHandler, clearHandler),
		};

		this.badgeHandler = badgeHandler;

		this.activeBadgeCount = profileBadges.length;
		if(this.activeBadgeCount) {
			profileBadges.forEach(badgeInfo => {
				this.badgeHandler.setActive(badgeInfo.id, this.badgeSlotMap[badgeInfo.slot]);
			});
		} else {
			this.toggleNoBadges(true);
		}
	}

	set selectedSlot(newValue) {
		this.containerStates.selectedBadgeSlot = newValue;
	}

	get selectedSlot() {
		return this.containerStates.selectedBadgeSlot;
	}

	showBadge(badge, slot) {
		this.badgeSlotMap[slot].showBadge(badge);
	}

	toggleNoBadges(on) {
		if(on) {
			this.$badgeContainer.addClass('hide');
			this.$noBadgeContainer.removeClass('hide');
		} else {
			this.$badgeContainer.removeClass('hide');
			this.$noBadgeContainer.addClass('hide');
		}
	}

	toggleEdit(on) {
		Object.values(this.badgeSlotMap).forEach(badge => {
			badge.editActive = on;
		});
		if(on) {
			this.toggleNoBadges(false);
		} else {
			this.toggleNoBadges(this.activeBadgeCount === 0);
		}
	}

	handleBadgeClear() {
		this.activeBadgeCount--;
	}
}

class ProfileBadgeSlot {
	constructor($container, slotNumber, selectionHandler, clearHandler) {
		this.$container = $container;
		this.slotNumber = slotNumber;

		this.clearHandler = clearHandler;

		this.currentBadgeId = null;

		this.$image = this.$container.find('.ppBadgeImage');
		this.$clearButton = this.$container.find('.ppBadgeClear');
		this.$container.popover({
			content: '',
			html: true,
			delay: 50,
			placement: 'top',
			trigger: 'hover',
			container: '.playerProfileContainer'
		});

		this._selected = false;
		this._editActive = false;

		this.$container.click(() => {
			if(!this.editActive) {
				return;
			}
			selectionHandler(this);
		});

		this.$clearButton.click((event) => {
			this.fireClear();
			event.stopPropagation();
		});
	}

	get activeBadge() {
		return this.currentBadgeId !== null;
	}

	get editActive() {
		return this._editActive;
	}

	set editActive(newValue) {
		this._editActive = newValue;
		if(!newValue) {
			this.selected = false;
		}
	}

	get selected() {
		return this._selected;
	}

	set selected(newValue) {
		this._selected = newValue;
		if(this.selected) {
			this.$container.addClass('selected');
			if(this.activeBadge) {
				this.$clearButton.removeClass('hide');
			}
		} else {
			this.$container.removeClass('selected');
			this.$clearButton.addClass('hide');
		}
	}

	showBadge(badge) {
		if(this.currentBadgeId != undefined) {
			this.fireClear();
		}
		this.$container.data('bs.popover').options.content = createBadgePopoverHtml(badge.fileName, badge.name, badge.unlockDescription);
		new PreloadImage(this.$image, cdnFormater.newBadgeSrc(badge.fileName), cdnFormater.newBadgeSrcSet(badge.fileName));
		this.currentBadgeId = badge.id;
	}

	fireClear() {
		this.clearHandler(this.currentBadgeId);
	}

	clearBadge() {
		this.$container.data('bs.popover').options.title = '';
		this.$container.data('bs.popover').options.content = '';
		this.$image.removeAttr('src');
		this.$image.removeAttr('srcset');
		this.currentBadgeId = null;
	}
}