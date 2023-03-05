'use strict';
/*exported troubleShooterDropDown*/

class TroubleShooterDropDown {
	constructor() {
		this.$container = $("#qpVideoTroubleshootingContainer");
		this.$close = this.$container.find('.close');

		this.currentLives = 2;
		this.currentMax = 5;
		this.inCooldown = false;

		this.$close.click(() => {
			let oldMax = this.currentMax;
			this.currentMax += 3;
			this.currentLives = Math.round(this.currentMax / 2);
			this.$container.removeClass('open');
			this.inCooldown = true;
			setTimeout(() => {
				this.inCooldown = false;
			}, oldMax * 60 * 1000);
		});
	}

	videoFullyBuffered() {
		this.currentLives++;
		if(this.currentLives > this.currentMax) {
			this.currentLives = this.currentMax;
		}
	}

	videoIssueBuffering() {
		if(this.inCooldown) {
			return;
		}
		this.currentLives--;
		if(this.currentLives <= 0) {
			this.currentLives = 2;
			this.$container.addClass('open');
		}
	}
}

var troubleShooterDropDown = new TroubleShooterDropDown();