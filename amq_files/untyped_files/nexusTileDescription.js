'use strict';

class NexusTileDescirption {
	constructor(typeId, genreName) {
		this.$body = $(this.TEMPLATE);
		this.$list = this.$body.find('ul');

		this.addRow(this.TYPE_DESCRIPTION[typeId]);
		this.addRow(capitalizeFirstLetter(genreName) + " Zone");

		this.detatchTimeout;
	}

	addRow(text) {
		this.$list.append(format(this.ROW_TEMPLATE, text));
	}

	display(x, y) {
		clearTimeout(this.detatchTimeout);
		this.$body.css('left', `${x}px`);
		this.$body.css('top', `${y}px`);
		this.$body.width(); //Force dom to update before adding class
		this.$body.addClass('display');
	}

	hide() {
		this.$body.removeClass('display');
		this.detatchTimeout = setTimeout(() => {
			this.$body.detach();
		}, this.DETATCH_TIMEOUT);
	}
}
NexusTileDescirption.prototype.TEMPLATE = "<div class='nexusTileInfoContainer'><ul></ul></div>";
NexusTileDescirption.prototype.ROW_TEMPLATE = "<li>{0}</li>";
NexusTileDescirption.prototype.DETATCH_TIMEOUT = 150;
NexusTileDescirption.prototype.TYPE_DESCRIPTION = {
	1: "Floor Entrance",
	2: "Boss Chamber",
	3: "Enemy Encounter",
	4: "Unknown Event",
	5: "Crafting Station",
};