"use strict";
/*exported nexusBuffPopover*/

class NexusBuffPopover extends NexusBasePopover {
	constructor() {
		super();
	}

	displayBuff({ name, description, fileName, debuff }, $triggerElement, handlerId) {
		let src = cdnFormater.newNexusAbilityIconSrc(fileName);
		let srcSet = cdnFormater.newNexusAbilityIconSrcSet(fileName);

		let typeName = debuff ? "Debuff" : "Buff";

		this.displayDefault(typeName, name, description, src, srcSet, $triggerElement, handlerId);
	}
}

var nexusBuffPopover = new NexusBuffPopover();