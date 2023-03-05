'use strict';
/*exported QuizBoss*/

class QuizBoss extends QuizEnemy {
	constructor(enemyInfo) {
		super(enemyInfo);
	}
	
	createSlot(enemyInfo) {
		return new QuizBossSlot(enemyInfo, this.hp, this.enemyPosition);
	}
	
	createTargetIcon(enemyInfo) {
		return new QuizBossTargetIcon(enemyInfo.name, enemyInfo.attackTimer, enemyInfo.position, enemyInfo.headForm);
	}

	initPose(enemyInfo) {
		this.updatePoseState(enemyInfo.poseInfo);
	}

	updatePoseState({poseId, attack, form}) {
		this.enemySlot.currentAttack = attack;
		this.enemySlot.currentForm = form;
		this.enemySlot.pose = poseId;
	}

	updateState({ attackTimer, poseInfo, defeated }) {
		this.targetIcon.attackCounter = attackTimer;
		this.updateAttackTimer(attackTimer);
		this.updatePoseState(poseInfo);
		if (defeated) {
			this.enemySlot.$body.addClass("defeated");
			this.enemySlot.$body.addClass("disabled");
			this.targetIcon.detach();
			this.removeAllBuffs();
			this.enemySlot.clearTarget();
			this.enemySlot.points = "";
		}
	}
}