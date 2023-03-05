"use strict";
/*exported nexusAbilityPopover*/

class NexusAbilityPopover extends NexusBasePopover {
	constructor() {
		super();

		this.$cooldownContainer.removeClass('hide');
	}

	displayAbility({ name, description, fileName, cooldownLength, currentCooldown }, $triggerElement, handlerId, forcedDirection) {
		let src = cdnFormater.newNexusAbilityIconSrc(fileName);
		let srcSet = cdnFormater.newNexusAbilityIconSrcSet(fileName);

		this.displayDefault("Ability", name, description, src, srcSet, $triggerElement, handlerId, forcedDirection);

		this.$cooldown.text(cooldownLength);

		if(currentCooldown) {
			this.$cooldownDisplay.text(currentCooldown);
			this.$cooldownDisplay.removeClass('hide');
		} else {
			this.$cooldownDisplay.addClass('hide');
		}
	}
}

var nexusAbilityPopover = new NexusAbilityPopover();