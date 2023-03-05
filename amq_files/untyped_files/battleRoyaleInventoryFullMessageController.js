'use strict';


function BattleRoyaleInventoryFullMessageController() {
	this.$container = $("#brInventoryFullMessage");

	this.hideTimeout;
}

BattleRoyaleInventoryFullMessageController.prototype.show = function() {
	this.$container.addClass('active');
	clearTimeout(this.hideTimeout);
	this.hideTimeout = setTimeout(() => {
		this.hide();
	}, this.OPEN_TIME);
};

BattleRoyaleInventoryFullMessageController.prototype.hide = function() {
	this.$container.removeClass('active');
};

BattleRoyaleInventoryFullMessageController.prototype.OPEN_TIME = 3500;