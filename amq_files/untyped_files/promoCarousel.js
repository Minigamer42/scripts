'use strict';
/*exported promoCarousel*/

function PromoCarousel() {
	this.$PROMO_CONTAINER = $("#mpPromoInnerContainer");
	this.$CYCLE_CONTAINER = $("#mpPromoCycleContainer");
	this.promoList = [];
	this.currentIndex = 0;
	this.LOOP_SPEED = 9000; //ms
	this.interval;
}

PromoCarousel.prototype.setup = function () {
	this.initCarousel();
};

PromoCarousel.prototype.initCarousel = function() {
	this.$CYCLE_CONTAINER.html("");
	this.promoList = [];
	let parent = this;
	this.$PROMO_CONTAINER.children().each(function(index) {
		let $body = $(this);
		let $cycleEntry = parent.createCycleEntry(index);
		if(index === 0) {
			$body.removeClass('hidden');
			$cycleEntry.addClass('active');
		} else {
			$body.addClass('hidden');
		}
		parent.promoList.push({
			$body: $body,
			$cycleEntry: $cycleEntry
		});
	});
	if(this.promoList.length === 1) {
		this.$CYCLE_CONTAINER.addClass('hidden');
	} else {
		this.resetLoop();
	}
};

PromoCarousel.prototype.resetLoop = function() {
	clearInterval(this.interval);
	this.interval = setInterval(() => {
		this.step();
	}, this.LOOP_SPEED);
};

PromoCarousel.prototype.step = function() {
	let nextIndex = (this.currentIndex + 1) % this.promoList.length;
	this.stepTo(nextIndex);
};

PromoCarousel.prototype.stepTo = function(index) {
	if(this.currentIndex !== index) {
		let current = this.promoList[this.currentIndex];
		current.$body.addClass('hidden');
		current.$cycleEntry.removeClass('active');
		
		let next = this.promoList[index];
		next.$body.removeClass('hidden');
		next.$cycleEntry.addClass('active');
		this.currentIndex = index;
	}
};

PromoCarousel.prototype.createCycleEntry = function(index) {
	let $entry = $('<div class="cycleEntry floatingContainer clickAble"></div>');

	$entry.click(() => {
		this.stepTo(index);
		this.resetLoop();
	});

	this.$CYCLE_CONTAINER.append($entry);
	return $entry;
};

var promoCarousel = new PromoCarousel();