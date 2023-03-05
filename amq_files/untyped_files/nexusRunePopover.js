"use strict";
/*exported nexusRunePopover*/

class NexusRunePopover extends NexusBasePopover {
	constructor() {
		super(["nexusRunePopover"]);
	}

	displayRune({ name, description, fileName, amount, inUseAmount, type}, $triggerElement, handlerId) {
		let src = cdnFormater.newNexusRuneIconSrc(fileName);
		let srcSet = cdnFormater.newNexusRuneIconSrcSet(fileName);

		let typeName = type === NEXUS_RUNE_TYPES.STANDARD ? "Standard" : "Advanced";

		this.displayDefault(`${typeName} Rune`, name, description, src, srcSet, $triggerElement, handlerId);

		
		if(amount != undefined) {
			this.$runeTotal.text(amount);
			this.$runeTotalContainer.removeClass("hide");
		} else {
			this.$runeTotalContainer.addClass("hide");
		}

		if(inUseAmount != undefined) {
			this.$runeInUse.text(inUseAmount);
			this.$runeInUseContainer.removeClass("hide");
		} else {
			this.$runeInUseContainer.addClass("hide");
		}
	}
}

var nexusRunePopover = new NexusRunePopover();