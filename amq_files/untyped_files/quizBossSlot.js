"use strict";

class QuizBossSlot extends QuizEnemySlot {
	constructor(enemyInfo, hp, position) {
		super(enemyInfo, hp, position);

		this.currentAttack;
		this.currentForm;
	}

	get allPoseImages() {
		if (this.currentForm) {
			return Object.values(this.poseImages).flatMap((form) =>
				Object.values(form).flatMap((category) => Object.values(category))
			);
		} else {
			return Object.values(this.poseImages).flatMap((category) => Object.values(category));
		}
	}

	setupAvatar(bossInfo) {
		this.avatarSizeMod = bossInfo.sizeModifier;
		this.$avatarImage
			.attr("sizes", this.sizeModValue)
			.addClass(this.sizeModClass);

		let forms = bossInfo.forms ? bossInfo.forms : [null];

		forms.forEach((form) => {
			let formPoses = {};

			formPoses.default = {};
			this.DEFAULT_POSES.forEach((pose) => {
				formPoses.default[pose] = new QuizBossPoseImage(
					bossInfo,
					pose,
					this.IMAGE_SIZE_MOD_SIZES[bossInfo.sizeModifier],
					null,
					form
				);
			});

			bossInfo.attackNames.forEach((attackName) => {
				formPoses[attackName] = {};
				this.ATTACK_POSES.forEach((pose) => {
					formPoses[attackName][pose] = new QuizBossPoseImage(
						bossInfo,
						pose,
						this.IMAGE_SIZE_MOD_SIZES[bossInfo.sizeModifier],
						attackName,
						form
					);
				});
			});

			if (form) {
				this.poseImages[form] = formPoses;
				if (!this.currentForm) {
					this.currentForm = form;
				}
			} else {
				this.poseImages = formPoses;
			}
		});
	}

	updatePose() {
		if (!this.displayed) {
			return;
		}
		if (this.currentAttack == null) {
			this.currentAttack = "default";
		}
		let img;
		if (this._disabled) {
			if (this.currentForm) {
				img = this.poseImages[this.currentForm].default.BASE.DEFEATED;
			} else {
				img = this.poseImages.default.BASE.DEFEATED;
			}
		} else if (this.currentAttack) {
			let targetPoses =
				this.currentForm && this.poseImages[this.currentForm][this.currentAttack]
					? this.poseImages[this.currentForm][this.currentAttack]
					: this.poseImages[this.currentAttack];
			Object.keys(targetPoses).some((pose) => {
				if (this.poseIdMap[pose] === this._pose) {
					let poseObject = this.currentForm ? this.poseImages[this.currentForm] : this.poseImages;
					let poseImage = poseObject[this.currentAttack][pose];
					if (poseImage.loaded) {
						img = poseImage.image;
					}
					return true;
				}
			});
		}
		if (!img) {
			if (this.currentForm) {
				img = this.poseImages[this.currentForm].default.BASE.image;
			} else {
				img = this.poseImages.default.BASE.image;
			}
		}

		this.$avatarImage.attr("srcset", img.srcset).attr("src", img.src);
	}
}
QuizBossSlot.prototype.DEFAULT_POSES = ["BASE", "DEFEATED"];
QuizBossSlot.prototype.ATTACK_POSES = ["CHARGING", "READY", "ATTACK"];

class QuizBossPoseImage extends QuizEnemyPoseImage {
	constructor(avatarInfo, pose, imageVh, attackName, form) {
		super(avatarInfo, pose, imageVh);
		this.attackName = attackName;
		this.form = form;
	}

	get srcset() {
		return cdnFormater.newBossSrcSet(
			this.avatarInfo.name,
			this.attackName,
			this.form,
			cdnFormater.ENEMY_POSE_IDS[this.pose]
		);
	}

	get src() {
		return cdnFormater.newBossSrc(
			this.avatarInfo.name,
			this.attackName,
			this.form,
			cdnFormater.ENEMY_POSE_IDS[this.pose]
		);
	}
}
