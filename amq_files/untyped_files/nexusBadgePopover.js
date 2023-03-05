"use strict";
/*exported nexusBadgePopover*/

class NexusBadgePopover extends NexusBasePopover {
	constructor() {
		super();
		this.$badgeStatBoostContainer.removeClass('hide');
		this.$badgeLevelContainer.removeClass('hide');
		this.$image.addClass('hide');
	}

	displayBadge(badgeInfo, $triggerElement, handlerId, direction) {
		let {level, boostedStat, genreName, abilityDescription } = badgeInfo;

		let hoverBadgeIcon = new NexusBadge(level, badgeInfo, 100);
		this.$badgeStatBoost.text(boostedStat);
		this.$badgeLevel.text(level);

		if(genreName) {
			this.$badgeGenreBoostContainer.removeClass('hide');
			this.$badgeGenreBoost.text(genreName);
		} else {
			this.$badgeGenreBoostContainer.addClass('hide');
		}

		let description = abilityDescription ? abilityDescription : "";

		this.displayDefault("Avatar Badge", hoverBadgeIcon.completeName, description, null, null, $triggerElement, handlerId, direction, hoverBadgeIcon.$body);
	}
}

var nexusBadgePopover = new NexusBadgePopover();