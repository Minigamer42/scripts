'use strict';
/*exported qualityController*/

function QualityController () {
	this._$LIST = $("#qpQualityList");
	this._$720 = this._$LIST.find(".720");
	this._$480 = this._$LIST.find(".480");
	this._$0 = this._$LIST.find(".0");

	this.targetResolution;

	this._$720.click(() => {
		this.newResolution(720);
		this.resetSelected();
		this._$720.addClass("selected");
	});
	this._$480.click(() => {
		this.newResolution(480);
		this.resetSelected();
		this._$480.addClass("selected");
	});
	this._$0.click(() => {
		this.newResolution(0);
		this.resetSelected();
		this._$0.addClass("selected");
	});
}

QualityController.prototype.setup = function () {
	let resolution = Cookies.get('resolution');
	if(resolution === '1080') {
		//handle users with old 1080 resolution in cookie
		resolution = '720';
		Cookies.set("resolution", 720, { expires: 365 });
	}
	if(resolution === '480') {
		this.targetResolution = 480;
		this._$480.addClass("selected");
	}else if(resolution === '0') {
		this.targetResolution = 0;
		this._$0.addClass("selected");
	}else{
		this.targetResolution = 720;
		this._$720.addClass("selected");
	}

	$("#qpQuality").hover(() => {
		this._$LIST.addClass("show");
	}, () => {
		this._$LIST.removeClass("show");
	});
};

QualityController.prototype.resetSelected = function() {
	this._$LIST.find(".selected").removeClass("selected");
};

QualityController.prototype.newResolution = function (newRes) {
	this.targetResolution = newRes;
	Cookies.set("resolution", this.targetResolution, { expires: 365 });
};

var qualityController = new QualityController();