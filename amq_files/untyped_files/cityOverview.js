'use strict';
/*exported NexusTutorialCityOverview*/

class NexusTutorialCityOverview extends BaseNexusTutorial {
	constructor(tutorialId, $container, elementMap, cityController) {
		super(tutorialId);
		this.$container = $container;

		this.addEvent('Welcome to the Nexus city, the hub city for all your Nexus adventures. I’ll pop in from time to time to give a quick overview of how things work.', null, true);
		this.addEvent('Currently, there are 3 places for you to visit in the city.', null, true);

		let dungeonPositionElement = new NexusCityTutorialCityPositionElement(elementMap.tower, 'top', 40, true);
		this.addEvent('First off, we have the dungeon tower, where you set out to explore the Nexus dungeon.', dungeonPositionElement, false);

		let workshopElement = new NexusCityTutorialCityPositionElement(elementMap.lab, 'top', 0, true);
		this.addEvent('Next we have the workshop, here you can equip your avatars with runes, a type of power up you find in the Nexus dungeon.', workshopElement, false);

		let innElement = new NexusCityTutorialCityPositionElement(elementMap.inn, 0, -450, true, -75, 100);
		let scrollDelay = cityController.overflowHeight > 0 ? 350 : 0;
		this.addEvent('Finally, we have the inn, here you can change avatar skins and create preset Nexus teams.', innElement, false, () => {
			cityController.scrollMapBottom();
		}, scrollDelay);

		this.addEvent('That’s it for the overview, to start out I suggest checking out the dungeon.', null, true);
	}
}

class NexusCityTutorialCityPositionElement extends NexusTutorialBasePositionElement {
	constructor(staticElement, vertPosition, horPosition, noOffsetbackdrop, backdropOffsetX, backdropOffsetY) {
		super(staticElement, vertPosition, horPosition, noOffsetbackdrop, backdropOffsetX, backdropOffsetY);
	}

	get elementCords() {
		let {top: yCord, left: xCord} = this.element.$nameContainer.offset();
		return { xCord, yCord };
	}

	get elementHeight() {
		return this.element.$nameContainer.height();
	}

	get elementWidth() {
		return this.element.$nameContainer.width();
	}
}