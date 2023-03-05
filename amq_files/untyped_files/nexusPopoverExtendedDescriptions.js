"use strict";
/*exported nexusPopoverExtendedDescriptions*/

class NexusPopoverExtendedDescriptions {
	constructor() {
		this.extendedDescriptionMap = {};
	}

	addBuffDescription({ name, fileName, description, debuff }) {
		let popover = new NexusBasePopover();

		let typeName = debuff ? "Debuff" : "Buff";

		let src = cdnFormater.newNexusAbilityIconSrc(fileName);
		let srcSet = cdnFormater.newNexusAbilityIconSrcSet(fileName);

		popover.setupContent(typeName, name, description, src, srcSet, false);

		this.extendedDescriptionMap[name] = popover;
	}

	getExtendedContentInDescription(description) {
		let targets = [];
		let lowerDescription = description.toLowerCase();
		Object.keys(this.extendedDescriptionMap).forEach((buffName) => {
			let index = lowerDescription.indexOf(buffName.toLowerCase());
			if (index !== -1) {
				targets.push({
					name: buffName,
					popout: this.extendedDescriptionMap[buffName],
					index,
				});
			}
		});

		return targets
			.sort((a, b) => {
				return a.index - b.index;
			})
			.map((target) => target.popout);
	}
}

var nexusPopoverExtendedDescriptions = new NexusPopoverExtendedDescriptions();
