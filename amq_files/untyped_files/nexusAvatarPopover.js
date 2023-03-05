"use strict";
/*exported nexusAvatarPopover*/

class NexusAvatarPopover extends NexusBasePopover {
	constructor() {
		super();

		this.$statInfo.removeClass("hide");

		this.infoDisplay = new NexusCityAvatarInfoDisplay(this.$statInfo, null, true);
		this.activeBadge = false;
	}

	displayAvatar({ name, baseStats, runeInfo, genreInfo, abilityInfo, badgeInfo}, src, srcSet, $triggerElement, handlerId) {
		this.displayDefault("Avatar", name, "", src, srcSet, $triggerElement, handlerId);

		this.infoDisplay.statBaseMax = nexus.statBaseMax;
		this.infoDisplay.displayStats(baseStats, runeInfo, genreInfo);

		nexusAbilityPopover.displayAbility(abilityInfo, this.$body, handlerId, this.currentDirection);
		if(badgeInfo) {
			nexusBadgePopover.displayBadge(badgeInfo, nexusAbilityPopover.$body, handlerId, "bottom");
			this.activeBadge = true;
		} else {
			this.activeBadge = false;
		}
	}
	
	hide(handlerId) {
		super.hide(handlerId);
		nexusAbilityPopover.hide(handlerId);
		if(this.activeBadge) {
			nexusBadgePopover.hide(handlerId);
			this.activeBadge = false;
		}
	}
}

var nexusAvatarPopover = new NexusAvatarPopover();