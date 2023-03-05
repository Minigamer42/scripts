"use strict";
/*exported nexusArtifactPopover*/

class NexusArtifactPopover extends NexusBasePopover {
	constructor() {
		super();
	}

	displayArtifact({ name, description, fileName }, $triggerElement, handlerId) {
		let src = cdnFormater.newNexusArtifactIconSrc(fileName);
		let srcSet = cdnFormater.newNexusArtifactIconSrcSet(fileName);

		this.displayDefault("Artifact", name, description, src, srcSet, $triggerElement, handlerId);
	}
}

var nexusArtifactPopover = new NexusArtifactPopover();