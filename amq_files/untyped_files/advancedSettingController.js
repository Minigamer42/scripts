'use strict';

function AdvancedSettingController ($switch, $standardSettingContainer, $advacnedSettingContainer, doubleActive) {
	Switch.call(this, $switch);

	this.$standardContainer = $standardSettingContainer;
	this.$advancedContainer = $advacnedSettingContainer;
	this.doubleActive = doubleActive;
}

AdvancedSettingController.prototype = Object.create(Switch.prototype);
AdvancedSettingController.prototype.constructor = AdvancedSettingController;

AdvancedSettingController.prototype.setOn = function (on) {
	Switch.prototype.setOn.call(this, on);

	if(on) {
		if(!this.doubleActive){
			this.$standardContainer.addClass("disabled");
		}
		this.$advancedContainer.removeClass("disabled");
	}else {
		this.$advancedContainer.addClass("disabled");
		this.$standardContainer.removeClass("disabled");
	}
};