'use strict';

function BattleRoyalCollectionController() {
	this.$container = $("#brCollectionContainer");
	this.$list = this.$container.find("#brCollectedList");
	this.$slotsLeft = this.$container.find("#brSlotsLeftNumber");
	this.$collectedCount = this.$container.find('#brCollectedNumber');

	this.size = 0;
	this.entries = [];

	this.$list.perfectScrollbar({
		suppressScrollX: true
	});
}

BattleRoyalCollectionController.prototype.reset = function () {
	this.$list.find('li').remove();
	this.$list.perfectScrollbar('update');
	this.$container.removeClass('lowSlotsCount');
	this.$container.removeClass('noDrop');
	this.$slotsLeft.text(0);
	this.$collectedCount.text(0);
	this.entries = [];
	this.hide();
};

BattleRoyalCollectionController.prototype.hide = function () {
	this.$container.addClass('hide');
};

BattleRoyalCollectionController.prototype.show = function () {
	this.$container.removeClass('hide');
};

BattleRoyalCollectionController.prototype.addEntry = function (entry) {
	let name = this.extractShowName(entry);
	let $entry = $("<li><div class='brEntryDrop clickAble'>×</div> " + name + '</li>');
	$entry.popover({
		content: name,
		delay: { show: 50, hide: 0 },
		placement: 'auto',
		trigger: 'hover',
		container: '#brMapContainer'
	});
	$entry.find('.brEntryDrop').click(() => {
		socket.sendCommand({
			type: "quiz",
			command: "drop entry",
			data: {
				id: entry.id
			}
		});
	});
	this.entries.push({
		$entry: $entry,
		id: entry.id
	});
	this.$list.prepend($entry);
	this.updateCounter();
	this.$list.perfectScrollbar('update');
};

BattleRoyalCollectionController.prototype.removeEntry = function (id) {
	let index = this.entries.findIndex((entry) => {
		return entry.id === id;
	});
	if(index !== -1) {
		let entry = this.entries.splice(index, 1)[0];
		entry.$entry.popover('hide');
		entry.$entry.remove();
		this.updateCounter();
		this.$list.perfectScrollbar('update');
	}
};

BattleRoyalCollectionController.prototype.updateCounter = function () {
	let currentCount = this.$list.find('li').length;
	let left = this.size - currentCount;
	this.$slotsLeft.text(left);
	this.$collectedCount.text(currentCount);
	if (left <= this.AMOUNT_FOR_WARNING_COLOR) {
		this.$container.addClass('lowSlotsCount');
	} else {
		this.$container.removeClass('lowSlotsCount');
	}
};

BattleRoyalCollectionController.prototype.extractShowName = function (nameInfo) {
	if (!nameInfo.eng) {
		return nameInfo.jap;
	} else if (!nameInfo.jap) {
		return nameInfo.eng;
	} else if (options.useRomajiNames) {
		return nameInfo.jap;
	} else {
		return nameInfo.eng;
	}
};

BattleRoyalCollectionController.prototype.setSize = function (size) {
	this.size = size;
	this.updateCounter();
};

BattleRoyalCollectionController.prototype.isFull = function () {
	let currentCount = this.$list.find('li').length;
	return this.size === currentCount;
};

BattleRoyalCollectionController.prototype.disableDrop = function () {
	this.$container.addClass('noDrop');
};

BattleRoyalCollectionController.prototype.AMOUNT_FOR_WARNING_COLOR = 5;