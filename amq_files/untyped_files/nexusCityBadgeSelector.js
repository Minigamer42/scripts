'use strict';
/*exported NexusCityBadgeSelector*/

class NexusCityBadgeSelector extends NexusCityWindowTab {
	constructor(
		window,
		$leftContainer,
		$rightContainer,
		$tab,
		clickHandler,
		clearClickHandler = () => {}
	) {
		super(window, $leftContainer, $rightContainer, $tab);

		this.$badgeSelectContainer = this.$leftContainer.find(".nexusCityAvatarSelecterContainer");

		this.badgeEntries = {};

		this.clickHandler = clickHandler;

		this.clearElement = new NexusCityAvatarClearEntry(clearClickHandler);

		this.badgeFilter = new NexusCityFilter(
			[
				new NexusCityOrderFilter(
					this.$leftContainer.find(".ncwAvatarNameSortFilterContainer"),
					() => true,
					(a, b) => a.name.localeCompare(b.name),
					() => {
						this.updateBadgeOrder();
					}
				),
				new NexusCityOrderFilter(
					this.$leftContainer.find(".ncwAvatarLevelSortFilterContainer"),
					(a, b) => a.level !== b.level,
					(a, b) => a.level - b.level,
					() => {
						this.updateBadgeOrder();
					}
				),
			],
			(a, b) => {
				if (a.characterId !== b.characterId) {
					return a.characterId - b.characterId;
				} else {
					return a.avatarId - b.avatarId;
				}
			},
			this.$leftContainer.find(".nexusCityFilterSearchInput"),
			() => {
				this.updateBadgeOrder();
			},
			(a,b) => {
				if(a.locked !== b.locked) {
					return a.locked ? 1 : -1;
				} else {
					return 0;
				}
			}
		);

		this.$badgeSelectContainer.perfectScrollbar({
			suppressScrollX: true,
		});
	}

	get gotBadges() {
		return Object.keys(this.badgeEntries).length > 0;
	}

	displayBadges(badgeInfoList) {
		Object.values(this.badgeEntries).forEach((entry) => entry.remove());
		this.addBadges(badgeInfoList);
	}

	updateBadges(badgeInfoList) {
		badgeInfoList.forEach((badgeInfo) => {
			if (this.badgeEntries[badgeInfo.avatarId]) {
				this.badgeEntries[badgeInfo.avatarId].update(badgeInfo);
			} else {
				this.addBadges([badgeInfo]);
			}
		});
	}

	addBadges(badgeInfoList) {
		badgeInfoList.forEach((badgeInfo) => {
			let entry = new NexusCityBadgeEntry(
				badgeInfo,
				this.clickHandler
			);
			this.badgeEntries[entry.avatarId] = entry;
		});
		this.updateBadgeOrder();
	}

	updateBadgeOrder() {
		let entries = Object.values(this.badgeEntries);
		entries.forEach((entry) => entry.detatch());
		this.badgeFilter.sortList(entries).forEach((entry) => {
			this.$badgeSelectContainer.append(entry.$body);
			this.updateScroll();
		});
	}

	updateScroll() {
		this.$badgeSelectContainer.perfectScrollbar("update");
	}

	displayClear() {
		this.$badgeSelectContainer.prepend(this.clearElement.$body);
	}

	resetActiveCharacters() {
		Object.values(this.badgeEntries).forEach((entry) => entry.enable());
		this.updateBadgeOrder();
	}

	updateActiveCharacters(clearedCharacterIds, newCharacterIds) {
		Object.values(this.badgeEntries).forEach((entry) => {
			if(clearedCharacterIds.includes(entry.characterId)) {
				entry.enable();
			}
			if(newCharacterIds.includes(entry.characterId)) {
				entry.disable();
			}
		});

		this.updateBadgeOrder();
	}
}


class NexusCityBadgeEntry {
	constructor(
		badgeInfo,
		clickCallback
	) {
		let { avatarId, colorId, level, characterId} = badgeInfo;
		
		this.badgeInfo = badgeInfo;

		this.$body = $(format(this.TEMPLATE, level));
		this.$iconContainer = this.$body.find(".nexusCityBadgeSelectorBadgeIconContainer");
		this.$levelText = this.$body.find(".nexusCityAvatarSelectorAvatarLevelNumber");

		this.avatarId = avatarId;
		this.colorId = colorId;
		this.characterId = characterId;
		this.level = level;

		this.locked = false;

		this.updateBadgeImage();


		let targetAvatar = storeWindow.getAvatarFromAvatarId(avatarId);
		this.name = targetAvatar.completeName;

		this.graceHover = new GraceHoverHandler(
			this.$body,
			250,
			50,
			() => {
				nexusBadgePopover.displayBadge(this.badgeInfo, this.$body, this.avatarId);
			},
			() => {
				nexusBadgePopover.hide(this.avatarId);
			}
		);

		this.$body.click(() => {
			clickCallback(this);
		});
	}

	updateLevelText() {
		this.$levelText.text(this.level);
	}

	updateBadgeImage() {
		this.badge = new NexusBadge(this.level, this.badgeInfo, 100);
		this.$iconContainer.html("");
		this.$iconContainer.append(this.badge.$body);
	}

	update(badgeInfo) {
		let {level} = badgeInfo;
		if(level !== this.level) {
			this.level = level;
			this.badgeInfo = badgeInfo;
			this.updateLevelText();
			this.updateBadgeImage();
		}
	}

	remove() {
		if(this.graceHover) {
			this.graceHover.destroy();
		}
		this.$body.remove();
	}

	detatch() {
		if(this.graceHover) {
			this.graceHover.hide();
		}
		this.$body.detach();
	}

	disable() {
		this.locked = true;
		this.$body.addClass('disabled');
	}

	enable() {
		this.locked = false;
		this.$body.removeClass('disabled');
	}
}
NexusCityBadgeEntry.prototype.TEMPLATE = $("#nexuBadgeSelectorTemplate").html();