'use strict';

class QuizEnemySlot extends QuizAvatarSlotBase {
	constructor(enemyInfo, hp, position) {
		super(QuizEnemySlot.prototype.ENEMY_TEMPLATE, enemyInfo.name, hp, null, null, cdnFormater.ENEMY_POSE_IDS);
		
		this.$targetImage = this.$body.find(".qpEnemyTargetTargetIcon");
		this.$counterContainer = this.$body.find(".qpAvatarScoreContainer");

		this.setupAvatar(enemyInfo);

		if(enemyInfo.untargetable) {
			this.$body.addClass("untargetable");
		}

		this.$body.addClass('qpEnemySlot-' + position);
		this.$body.css('z-index', 8 - position);
	}

	setupAvatar(avatar) {
		this.avatarSizeMod = avatar.sizeModifier;
		this.$avatarImage
			.attr("sizes", this.sizeModValue)
			.addClass(this.sizeModClass);

		Object.keys(cdnFormater.ENEMY_POSE_IDS).forEach((pose) => {
			this.poseImages[pose] = new QuizEnemyPoseImage(avatar, pose, this.IMAGE_SIZE_MOD_SIZES[avatar.sizeModifier]);
		});
	}

	updateTarget(src, srcset) {
		this.$targetImage.attr("srcset", srcset);
		this.$targetImage.attr("src", src);
	}

	clearTarget() {
		this.$targetImage.attr("src", "");
		this.$targetImage.attr("srcset", "");
	}

	setGotTarget(gotTarget) {
		if (gotTarget) {
			this.$counterContainer.removeClass("qpEnemySlotNoTarget");
		} else {
			this.$counterContainer.addClass("qpEnemySlotNoTarget");
		}
	}
	
	updateSpriteCanvasPosition() {
		let xChange = this.SPRITE_CANVAS_POSITION_CHANGE_X * (Math.random() * 2 - 1);
		let yChange = this.SPRITE_CANVAS_POSITION_CHANGE_Y * Math.random() * -1 + this.SPRITE_CANVAS_POSITION_Y_DEFAULT;
		this.$hitCanvas.css('transform', `translate(${xChange}%, ${yChange}%)`);
	}
}

QuizEnemySlot.prototype.ENEMY_TEMPLATE = $("#quizNexusEnemyTemplate").html();
QuizEnemySlot.prototype.SPRITE_CANVAS_POSITION_CHANGE_X = 10;
QuizEnemySlot.prototype.SPRITE_CANVAS_POSITION_CHANGE_Y = 15;
QuizEnemySlot.prototype.SPRITE_CANVAS_POSITION_Y_DEFAULT = -50;

class QuizEnemyPoseImage extends QuizAvatarPoseImageBase {
	constructor(avatarInfo, pose, imageVh) {
		super(avatarInfo, pose, imageVh);
	}

	get srcset() {
		return cdnFormater.newEnemySrcSet(
			this.avatarInfo.name,
			cdnFormater.ENEMY_POSE_IDS[this.pose]
		);
	}

	get src() {
		return cdnFormater.newEnemySrc(
			this.avatarInfo.name,
			cdnFormater.ENEMY_POSE_IDS[this.pose]
		);
	}
}