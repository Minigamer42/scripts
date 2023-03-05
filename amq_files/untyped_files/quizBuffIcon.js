"use strict";

class QuizBuffIcon {
	constructor(name, description, fileName, duration, debuff, currentCharge) {
		let durationText = duration === null ? "" : duration;
		this.$body = $(format(this.TEMPLATE, fileName, durationText));
		this.$img = this.$body.find('.qpAvatarBuffIcon');
		this.$duration = this.$body.find('.qpAvatarBuffDurationNumber');
		this.$chargeNumber = this.$body.find('.qpAvatarBuffChargeNumber');

		if(currentCharge != null) {
			this.$chargeNumber.text(currentCharge);
		}

		new PreloadImage(
			this.$img,
			cdnFormater.newNexusAbilityIconSrc(fileName),
			cdnFormater.newNexusAbilityIconSrcSet(fileName),
			true,
			"35px"
		);

		this.abilityHover = new GraceHoverHandler(this.$body, 250, 50, () => {
			nexusBuffPopover.displayBuff({ name, description, fileName, debuff}, this.$body, name);
		}, () => {
			nexusBuffPopover.hide(name);
		});
	}

	remove() {
		if(this.abilityHover) {
			this.abilityHover.destroy();
		}
		this.$body.remove();
	}

	updateDuration(duration) {
		this.$duration.text(duration);
	}

	updateCharge(charge) {
		if(charge != null) {
			this.$chargeNumber.text(charge);
		} else {
			this.$chargeNumber.text("");
		}
	}
}

QuizBuffIcon.prototype.TEMPLATE =
	"<div class='qpAvatarBuff'><img class='qpAvatarBuffIcon'/><div class='qpAvatarBuffChargeNumber'></div><div class='qpAvatarBuffDurationNumber'>{1}</div></div>";
