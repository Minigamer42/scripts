"use strict";
/*exported QuizAbilityIcon*/

class QuizAbilityIcon {
	constructor($iconContainer, { name, description, fileName, enabled, cooldownLength, currentCooldown, targetInfo }, slot, ownAbility) {
		this.$iconContainer = $iconContainer;
		this.$icon = this.$iconContainer.find(".qpAvatarAblityIcon");
		this.$cooldownText = this.$iconContainer.find(".qpAvatarAbilityCooldownNumber");
		this.slot = slot;
		this._enabled = enabled;
		this.cooldownLength = cooldownLength;
		this._currentCooldown = currentCooldown;

		new PreloadImage(
			this.$icon,
			cdnFormater.newNexusAbilityIconSrc(fileName),
			cdnFormater.newNexusAbilityIconSrcSet(fileName),
			true,
			"50px"
		);

		this.abilityHover = new GraceHoverHandler(this.$icon, 250, 50, () => {
			nexusAbilityPopover.displayAbility({ name, description, fileName, cooldownLength }, this.$icon, slot);
		}, () => {
			nexusAbilityPopover.hide(slot);
		});

		this.updateState();

		if(ownAbility) {
			if(targetInfo) {
				this.targetInfo = targetInfo;
				this.$iconTarget = $(this.ICON_TARGET_TEMPLATE);
				new PreloadImage(
					this.$iconTarget,
					cdnFormater.newNexusAbilityIconSrc(fileName),
					cdnFormater.newNexusAbilityIconSrcSet(fileName),
					true,
					"50px"
				);
			}
			this.$icon.click((event) => {
				if(!this.currentCooldown) {
					if(targetInfo) {
						quiz.displayAbilityTarget(this.$iconTarget, this, event.pageX, event.pageY);
					} else {
						if (this.active) {
							socket.sendCommand({
								type: "nexus",
								command: "use avatar ability",
								data: {
									slot: this.slot,
								},
							});
						}
					}
				}
				event.stopPropagation();
			});
		} else {
			this.$icon.addClass("visualOnly");
		}
	}

	set enabled(newValue) {
		this._enabled = newValue;
		this.updateState();
	}

	get enabled() {
		return this._enabled;
	}

	get onCooldown() {
		return this.currentCooldown > 0;
	}

	get active() {
		return this.enabled;
	}

	get currentCooldown() {
		return this._currentCooldown;
	}

	set currentCooldown(newValue) {
		this._currentCooldown = newValue;
		this.updateState();
	}

	updateState() {
		if (this.enabled && !this.onCooldown) {
			this.$icon.removeClass("disabledAbility");
		} else {
			this.$icon.addClass("disabledAbility");
		}
		if (this.onCooldown) {
			this.$cooldownText.text(this.currentCooldown);
			this.$cooldownText.removeClass('hide');
		} else {
			this.$cooldownText.addClass('hide');
		}
	}

	validateAbilityTarget(target) {
		if(this.targetInfo.ally && !(target instanceof QuizPlayer)) {
			return false;
		}
		if(this.targetInfo.enemy && !(target instanceof QuizEnemy)) {
			return false;
		}
		if(target.avatarDisabled) {
			return false;
		}
		if(this.targetInfo.noTargetSelf && target.slot === this.slot) {
			return false;
		}
		return true;
	}

	targetSelected(slot) {
		if(this.targetInfo) {
			socket.sendCommand({
				type: "nexus",
				command: "use avatar ability",
				data: {
					slot: this.slot,
					targetInfo: {
						slot,
						type: this.targetInfo.ally ? 'avatar': 'enemy',
					},
				},
			});
		}
	}
}
QuizAbilityIcon.prototype.ICON_TARGET_TEMPLATE = '<img class="qpAvatarAbilityTargetIcon"/>';
