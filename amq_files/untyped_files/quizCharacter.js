"use strict";
/*exported QuizCharacter*/

class QuizCharacter {
	constructor(spriteSheets) {
		this.buffs = {};
		this.disabledAction = {};

		if(spriteSheets) {
			spriteSheets.forEach(sheetName => {
				spriteSheetBuffer.loadAttackVFXSheet(sheetName);
			});
		}
	}

	get slotElement() {
		throw new Error("Needs to be overriden");
	}

	addBuff({ name, description, fileName, duration, disables, debuff, currentCharge }) {
		let newBuff = new QuizBuffIcon(name, description, fileName, duration, debuff, currentCharge);
		if (this.buffs[name]) {
			this.removeBuff({ name });
		}
		this.buffs[name] = newBuff;
		this.slotElement.addBuff(newBuff.$body);

		disables.forEach(({ target, icon }) => {
			if (!this.disabledAction[target]) {
				this.disabledAction[target] = [];
			}

			let img = new Image();
			img.sizes = this.DISABLE_ICON_SIZE;
			img.srcset = cdnFormater.newNexusAbilityIconSrcSet(icon);
			img.src = cdnFormater.newNexusAbilityIconSrcSet(icon);

			this.disabledAction[target].push({
				parentBuff: name,
				iconImg: img,
			});
		});
	}

	updateBuff({ name, duration, charge }) {
		this.buffs[name].updateDuration(duration);
		this.buffs[name].updateCharge(charge);
	}

	removeBuff({ name }) {
		this.buffs[name].remove();
		delete this.buffs[name];

		this.slotElement.buffRemoved();

		Object.keys(this.disabledAction).forEach(action => {
			this.disabledAction[action] = this.disabledAction[action].filter(actionInfo => actionInfo.parentBuff !== name);
			if(this.disabledAction[action].length === 0) {
				delete this.disabledAction[action];
			}
		});
	}

	removeAllBuffs() {
		Object.keys(this.buffs).forEach(buff => {
			this.removeBuff({ name: buff });
		});
	}

	displayDisabledAction(actionName, callback) {
		let targetImg = this.disabledAction[actionName][0].iconImg;

		this.displayFlashIcon(targetImg.src, targetImg.srcset, callback);
	}

	displayFlashIcon(src, srcset, callback, $targetImage) {
		this.slotElement.displayFlashIcon(src, srcset, callback, $targetImage);
	}

	updateShield(newShieldValue) {
		this.slotElement.updateShield(newShieldValue, this.maxHp);
	}

	setCloneEffect(cloneTarget) {
		this.slotElement.setCloneEffect(cloneTarget.slotElement);
	}

	removeCloneEffect() {
		this.slotElement.removeCloneEffect();
	}
}
QuizCharacter.prototype.DISABLE_ICON_SIZE = "12vw";

