"use strict";
/*exported QuizEnemy*/

class QuizEnemy extends QuizCharacter {
	constructor(enemyInfo) {
		super(enemyInfo.attackEffectSets.map(set => set.sprite).filter(sprite => sprite != null));
		this.enemyPosition = enemyInfo.position;
		this.hp = enemyInfo.hp;
		this.shield = enemyInfo.shield;
		this.maxHp = enemyInfo.maxHp;
		this.enemySlot = this.createSlot(enemyInfo);
		this.targetIcon = this.createTargetIcon(enemyInfo);

		let sfxGroup = audioController.getGroup("nexusSfx");
		enemyInfo.attackEffectSets.forEach(set => {
			if(set.sfx) {
				sfxGroup.addDynamicBufferElement(set.sfx, cdnFormater.newNexusSfxSrc(set.sfx), false, -15);
			}
		});

		enemyInfo.buffs.forEach(buff => {
			this.addBuff(buff);
		});

		
		this.initPose(enemyInfo);

		this.enemySlot.hpBarPercent = Math.round((this.hp / this.maxHp) * 100) - 100;

		let shieldPercent = Math.round((enemyInfo.shield / this.maxHp) * 100) - 100;
		this.enemySlot.shieldBarPercent = shieldPercent;
		this.enemySlot.shieldAmount = enemyInfo.shield;
		
		this.enemySlot.$nexusTargetButton.click((event) => {
			let targetEvent = quiz.handleNewNexusCharacterClick(this);
			if(!targetEvent) {
				socket.sendCommand({
					type: "nexus",
					command: "target enemy",
					data: {
						enemyPosition: this.enemyPosition,
					},
				});
			} else {
				event.stopPropagation();
			}
		});
		
		this.enemySlot.$innerContainer.click((event) => {
			let targetEvent = quiz.handleNewNexusCharacterClick(this);
			if(targetEvent) {
				event.stopPropagation();
			}
		});

		this.updateAttackTimer(enemyInfo.attackTimer);

		if(this.hp === 0) {
			this.displayDefeated();
		}
	}

	get slotElement() {
		return this.enemySlot;
	}

	get slot() {
		return this.enemyPosition;
	}

	createSlot(enemyInfo) {
		return new QuizEnemySlot(enemyInfo, this.hp, this.enemyPosition);
	}

	createTargetIcon(enemyInfo) {
		return new QuizEnemyTargetIcon(enemyInfo.name, enemyInfo.attackTimer, enemyInfo.position);
	}

	initPose(enemyInfo) {
		this.enemySlot.pose = enemyInfo.poseId;
	}

	updatePose() {
		this.enemySlot.updatePose();
	}

	addTargetIcon(icon) {
		this.enemySlot.addTargetIcon(icon);
	}

	displayDamage(newHp, newShield, damage, damageClasses, attackEffectSet, finishedCallback, displayZero) {
		if(damage === 0 && !displayZero) {
			finishedCallback();
			return;
		}
		this.enemySlot.displayDamage(newHp, newShield, damage, this.maxHp, damageClasses, attackEffectSet, finishedCallback);
		this.shield = newShield;
		this.hp = newHp;
	}

	updateState({ attackTimer, poseId, defeated }) {
		this.targetIcon.attackCounter = attackTimer;
		this.updateAttackTimer(attackTimer);
		this.enemySlot.pose = poseId;
		if (defeated) {
			this.enemySlot.$body.addClass("defeated");
			this.enemySlot.$body.addClass("disabled");
			this.targetIcon.detach();
			this.removeAllBuffs();
			this.enemySlot.clearTarget();
			this.enemySlot.points = "";
		}
	}

	displayDefeated() {
		this.enemySlot.$body.addClass("defeated");
		this.enemySlot.$body.addClass("disabled");
		this.targetIcon.detach();
		this.removeAllBuffs();
		this.enemySlot.clearTarget();
		this.enemySlot.points = "";
	}

	setAvatarTarget(avatar) {
		if(avatar) {
			this.enemySlot.setGotTarget(true);
			let { avatarName, outfitName, optionName, optionActive, colorName } = avatar.avatarInfo.avatar;
	
			let src = cdnFormater.newAvatarHeadSrc(avatarName, outfitName, optionName, optionActive, colorName);
			let srcset = cdnFormater.newAvatarHeadSrcSet(avatarName, outfitName, optionName, optionActive, colorName);
	
			this.enemySlot.updateTarget(src, srcset);
		} else {
			this.enemySlot.clearTarget();
			this.enemySlot.setGotTarget(false);
		}
	}

	updateAttackTimer(timeLeft) {
		this.enemySlot.points = timeLeft;
	}
	
	displayOverlay(src, srcet) {
		this.enemySlot.displayOverlay(src, srcet);
	}
	
	clearOverlay() {
		this.enemySlot.clearOverlay();
	}
}
