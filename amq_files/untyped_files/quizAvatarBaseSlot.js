"use strict";
/*exported QuizAvatarPoseImageBase QuizAvatarSlotBase*/

// var TEST_SFX_DELAY = -200;

class QuizAvatarSlotBase {
	constructor(template, name, level, points, avatarDisabled, poseIdMap, flipDamageSprite) {
		this.$body = $(template);
		this.$innerContainer = this.$body.find(".qpAvatarContainer");
		this.$bottomContainer = this.$body.find(".qpAvatarInfoBar");
		this.$nameContainer = this.$body.find(".qpAvatarName");
		this.$levelContainer = this.$body.find(".qpAvatarLevel");
		this.$pointContainer = this.$body.find(".qpAvatarScore");
		this.$avatarImage = this.$body.find(".qpAvatarImage");
		this.$avatarImageContainer = this.$body.find(".qpAvatarImageInnerContainer");
		this.$imageContainer = this.$body.find(".qpAvatarImageContainer");
		this.$targetIconContainer = this.$body.find(".qpAvatarTargetIconContainer");
		this.$swapIconContainer = this.$body.find(".qpAvatarSwapIconContainer");
		this.$hpBar = this.$body.find(".qpAvatarHealthBar");
		this.$shieldBar = this.$body.find(".qpAvatarShieldBar");
		this.$buffContainer = this.$body.find(".qpAvatarBuffContainer");
		this.$buffContainerInner = this.$body.find(".qpAvatarBuffContainerInner");
		this.$overlayImg = this.$body.find(".qpAvatarOverlayImage");
		this.$iconFlashImg = this.$body.find(".qpAvatarIconFlashImage");
		this.$iconObjectContainer = this.$body.find(".qpAvatarIconFlashContainer");
		this.$hitCanvas = this.$body.find(".qpAvatarHitCanvas");
		this.$damageBubleContainer = this.$body.find(".qpAvatarDamageBubler");
		this.$shieldAmount = this.$body.find(".qpAvatarShieldAmount");
		this.$nexusTargetButton = this.$body.find(".qpAvatarNexusTargetButton");
		this.$nexusTargetButtonText = this.$body.find(".qpAvatarNexusTargetButton > div");

		this.hitCanvasCtx = this.$hitCanvas[0].getContext("2d");

		this.flashImg = new QuizAvatarSlotFlashImage(this.$iconFlashImg, this.$iconObjectContainer);

		this.poseIdMap = poseIdMap;

		this.currentBuffSize = this.BUFF_MAX_SIZE;

		this.avatarSizeMod = null;

		this._name;
		this.name = name;
		this.level = level;
		this.points = points;

		this.flipDamageSprite = flipDamageSprite;

		this.displayed = false;
		this.disabled = avatarDisabled;
		this.currentMaxWidth;
		this.currentMaxHeight;

		this.cloneImageTarget = null;

		this.poseImages = {};
	}

	get allPoseImages() {
		return Object.values(this.poseImages);
	}

	setupAvatar() {
		throw "setupAvatar function not overriden";
	}

	addTargetIcon(icon) {
		icon.detach();
		this.$targetIconContainer.append(icon.$body);
	}

	addSwapIcon(icon) {
		icon.detach();
		this.$swapIconContainer.append(icon.$body);
	}

	loadPoses() {
		this.allPoseImages.forEach((poseImage) => {
			poseImage.load(
				function () {
					this.updatePose();
				}.bind(this)
			);
		});
	}

	updatePose() {
		if (!this.displayed) {
			return;
		}

		let img = this.getPoseImage(this._pose, this._disabled);

		this.$avatarImage.attr("srcset", img.srcset).attr("src", img.src);
	}

	getPoseImage(targetPose, disabled) {
		if(this.cloneImageTarget) {
			return this.cloneImageTarget.getPoseImage(targetPose, disabled);
		} else {
			let img;
			if (disabled) {
				img = this.poseImages.BASE.image;
			} else {
				Object.keys(this.poseImages).some((pose) => {
					if (this.poseIdMap[pose] === targetPose) {
						let poseImage = this.poseImages[pose];
						if (poseImage.loaded) {
							img = poseImage.image;
						}
						return true;
					}
				});
			}
			if (!img) {
				img = this.poseImages.BASE.image;
			}
	
			return img;
		}
	}

	updateSpriteCanvasPosition() {
		//default do nothing
	}

	updateSize(maxWidth, maxHeight) {
		this.currentMaxWidth = maxWidth;
		this.currentMaxHeight = maxHeight;
		this.$body.css("max-height", maxHeight).css("max-width", maxWidth);
		setTimeout(() => {
			fitTextToContainer(this.$nameContainer, this.$bottomContainer, 20, 12);
			this.updateTargetButtonTextSize();
		}, 1);
		//Set image max height
		let containerMaxHeight = maxHeight - this.INFO_CONTAINER_HEIGHT;
		let containerMaxWidth = maxWidth;
		let imageMaxHeight = containerMaxHeight;
		let imageMaxWidth = containerMaxWidth * this.INNER_OUTER_CONTAINER_WIDTH_RATIO;

		let imageRatio = 1.5;

		let containerWidth;
		let containerHeight;

		if (imageMaxHeight > imageMaxWidth * imageRatio) {
			containerWidth = containerMaxWidth;
			containerHeight = imageMaxWidth * imageRatio + this.INFO_CONTAINER_HEIGHT;
		} else {
			containerHeight = containerMaxHeight;
			containerWidth = imageMaxHeight / imageRatio;
		}

		this.$body.css("height", containerHeight).css("width", containerWidth);
		this.$body.width(); //Update dom
		let hitCanvasSize = this.$hitCanvas.width();
		this.$hitCanvas.css("height", hitCanvasSize).attr("width", hitCanvasSize).attr("height", hitCanvasSize);
		this.updateBuffContainerSize();
	}

	updateTargetButtonTextSize() {
		fitTextToContainer(this.$nexusTargetButtonText, this.$nexusTargetButton, 26, 12);
	}
	
	updateBuffContainerSize() {
		let {top: topOffset} = this.$buffContainer.offset();
		let documentHeight = $(document).height();

		let containerSize = documentHeight - topOffset - this.BOTTOM_BAR_SIZE;
		this.$buffContainer.css("height", containerSize);
		this.resetBuffSize();
	}

	buffsLargerThanContainer() {
		return this.$buffContainerInner.height() > this.$buffContainer.height() + this.BUFF_SIZE_GRACE;
	}

	resizeBuffs() {
		let targetSize = this.currentBuffSize;
		while(this.buffsLargerThanContainer() && targetSize > this.BUFF_MIN_SIZE) {
			targetSize -= this.BUFF_SIZE_STEPS;
			this.$buffContainer.find(".qpAvatarBuff").css("height", targetSize);
			this.$buffContainer.find(".qpAvatarBuff").css("width", targetSize);
		}
		this.currentBuffSize = targetSize;
	}

	resetBuffSize() {
		this.currentBuffSize = this.BUFF_MAX_SIZE;
		this.$buffContainer.find(".qpAvatarBuff").css("height", this.currentBuffSize);
		this.$buffContainer.find(".qpAvatarBuff").css("width", this.currentBuffSize);
		this.resizeBuffs();
	}

	addBuff($buff) {
		$buff.css("height", this.currentBuffSize);
		$buff.css("width", this.currentBuffSize);
		this.$buffContainerInner.append($buff);
		this.resizeBuffs();
	}

	buffRemoved() {
		this.resetBuffSize();
	}

	remove() {
		this.$body.remove();
	}

	hide() {
		this.$body.addClass("hide");
		this.displayed = false;
	}

	show() {
		this.$body.removeClass("hide");
		this.displayed = true;
		this.loadPoses();
		this.updatePose();
		this.updateSize(this.currentMaxWidth, this.currentMaxHeight);
	}

	displayDamage(newHp, newShield, hpChangeText, maxHealth, damageClasses, attackEffectSet, finishedCallback) {
		if (attackEffectSet) {
			if (attackEffectSet.sfxTimeingMs < 0) {
				this.playSfx(attackEffectSet.sfx);
				setTimeout(() => {
					this.triggerHealthUpdate(newHp, newShield, hpChangeText, maxHealth, damageClasses);
					this.playDamageSprite(attackEffectSet.sprite, attackEffectSet.hitEffect, finishedCallback);
				}, attackEffectSet.sfxTimeingMs * -1);
			} else if (attackEffectSet.sfxTimeingMs > 0) {
				this.triggerHealthUpdate(newHp, newShield, hpChangeText, maxHealth, damageClasses);
				this.playDamageSprite(attackEffectSet.sprite, attackEffectSet.hitEffect, finishedCallback);
				setTimeout(() => {
					this.playSfx(attackEffectSet.sfx);
				}, attackEffectSet.sfxTimeingMs);
			} else {
				this.playSfx(attackEffectSet.sfx);
				this.triggerHealthUpdate(newHp, newShield, hpChangeText, maxHealth, damageClasses);
				this.playDamageSprite(attackEffectSet.sprite, attackEffectSet.hitEffect, finishedCallback);
			}
		} else {
			this.triggerHealthUpdate(newHp, newShield, hpChangeText, maxHealth, damageClasses);
			finishedCallback();
		}
	}

	triggerHealthUpdate(newHp, newShield, hpChangeText, maxHealth, damageClasses) {
		this.updateHealth(newHp, hpChangeText, maxHealth, damageClasses);
		if (newShield != null) {
			this.updateShield(newShield, maxHealth);
		}
	}

	playForcedSfx(sfx, sfxTimeingMs, callback) {
		if (sfxTimeingMs < 0) {
			this.playSfx(sfx);
			setTimeout(callback, sfxTimeingMs * -1);
		} else if (sfxTimeingMs > 0) {
			callback();
			setTimeout(() => {
				this.playSfx(sfx);
			}, sfxTimeingMs);
		} else {
			this.playSfx(sfx);
			callback();
		}
	}

	playSfx(sfx) {
		let sfxGroup = audioController.getGroup("nexusSfx");
		if (sfxGroup.trackReady(sfx)) {
			sfxGroup.playTrack(sfx, true);
		}
	}

	playDamageSprite(sprite, hitEffect, finishedCallback) {
		if(sprite) {
			this.updateSpriteCanvasPosition();
			let hitEffectClass = this.getEffectClassFromHitEffectId(hitEffect);
			try {
				let animation = new SpriteAnimation(this.hitCanvasCtx, sprite, this.flipDamageSprite);
				this.$avatarImageContainer.addClass(hitEffectClass);
				animation.startAnimation(() => {
					this.$avatarImageContainer.removeClass(hitEffectClass);
					finishedCallback();
				});
			} catch (e) {
				console.log(sprite);
				console.log(e.stack);
				finishedCallback();
			}
		} else {
			finishedCallback();
		}
	}

	updateHealth(newHp, hpChangeText, maxHealth, damageClasses) {
		let $buble = $(format(this.DAMAGE_BUBLE_TEMPLATE, hpChangeText));
		if (damageClasses) {
			damageClasses.forEach((className) => {
				$buble.find(".qpAvatarDamageBubleText").addClass(className);
			});
		}

		$buble.on("animationend", () => {
			$buble.remove();
		});

		this.$damageBubleContainer.append($buble);
		this.$damageBubleContainer.width(); //force dom render

		let directionValue = Math.random() < 0.5 ? 1 : -1;
		let offset =
			Math.random() * (this.MAX_HORI_DAMAGE_BUBLE_OFFSET - this.MIN_HORI_DAMAGE_BUBLE_OFFSET) * directionValue;

		$buble.find(".qpAvatarDamageBuble").css("transform", `translateX(${offset}%)`);

		this.level = newHp;
		let hpPercent = Math.round((newHp / maxHealth) * 100);
		this.hpBarPercent = hpPercent - 100;

		if (hpPercent <= 20) {
			this.$hpBar.addClass("hp20Percent");
		} else if (hpPercent <= 50) {
			this.$hpBar.addClass("hp50Percent");
		}
	}

	updateShield(newShield, maxHealth) {
		let shieldPercent = Math.round((newShield / maxHealth) * 100) - 100;
		if (shieldPercent > 0) {
			shieldPercent = 0;
		}
		this.shieldBarPercent = shieldPercent;
		this.shieldAmount = newShield;
	}

	displayOverlay(src, srcset) {
		this.$overlayImg.attr("srcset", srcset);
		this.$overlayImg.attr("src", src);
	}

	clearOverlay() {
		this.$overlayImg.removeAttr("src");
		this.$overlayImg.removeAttr("srcset");
	}

	displayFlashIcon(iconSrc, iconSrcset, callback, $targetImage) {
		this.flashImg.flashImage(iconSrc, iconSrcset, callback, $targetImage);
	}

	getEffectClassFromHitEffectId(hitEffectId) {
		switch (hitEffectId) {
			case NEXUS_HIT_EFFECT_IDS.SHAKE:
				return "qpAvatarDamageShake";
			case NEXUS_HIT_EFFECT_IDS.PUSH:
				return "qpAvatarDamagePush";
			case NEXUS_HIT_EFFECT_IDS.PUSH_ONE_WAY:
				return "qpAvatarDamagePushOneWay";
			default:
				return "qpAvatarDamageShake";
		}
	}

	setCloneEffect(cloneSlot) {
		this.$avatarImage
			.attr("sizes", cloneSlot.sizeModValue)
			.removeClass(this.sizeModClass)
			.addClass("cloneEffect")
			.addClass(cloneSlot.sizeModClass);

		this.cloneImageTarget = cloneSlot;
		this.updatePose();
	}

	removeCloneEffect() {
		this.$avatarImage
			.attr("sizes", this.sizeModValue)
			.removeClass(this.cloneImageTarget.sizeModClass)
			.removeClass("cloneEffect")
			.addClass(this.sizeModClass);

		this.cloneImageTarget = null;
		this.updatePose();
	}

	set hpBarPercent(newValue) {
		this.$hpBar.css("transform", `translateX(${newValue}%)`);
	}

	set shieldBarPercent(newValue) {
		if (newValue > 0) {
			newValue = 0;
		}
		this.$shieldBar.css("transform", `translateX(${newValue}%)`);
	}

	set shieldAmount(newValue) {
		if (newValue < 0 || !newValue) {
			this.$shieldAmount.text("");
		} else {
			this.$shieldAmount.text(newValue);
		}
	}

	set name(newValue) {
		this._name = newValue;
		this.$nameContainer.text(newValue);
	}

	get name() {
		return this._name;
	}

	set level(newVaule) {
		this.$levelContainer.text(newVaule);
	}

	set points(newValue) {
		this.$pointContainer.text(newValue);
	}

	set disabled(newValue) {
		this._disabled = newValue;
		if (newValue) {
			this.$innerContainer.addClass("disabled");
			this.updatePose();
		} else {
			this.$innerContainer.removeClass("disabled");
			this.updatePose();
		}
	}

	get disabled() {
		return this._disabled;
	}

	set zIndex(newValue) {
		this.$body.css("z-index", newValue);
	}

	set pose(poseId) {
		this._pose = poseId;
		this.updatePose();
	}

	get sizeModClass() {
		return "sizeMod" + this.avatarSizeMod;
	}

	get sizeModValue() {
		return this.IMAGE_SIZE_MOD_SIZES[this.avatarSizeMod];
	}
}
QuizAvatarSlotBase.prototype.IMAGE_SIZE_MOD_SIZES = {
	0: "11vw",
	20: "12.5vw",
	51: "15vw",
	80: "18vw",
};
QuizAvatarSlotBase.prototype.INFO_CONTAINER_HEIGHT = 39; //px
QuizAvatarSlotBase.prototype.INNER_OUTER_CONTAINER_WIDTH_RATIO = 0.8;
QuizAvatarSlotBase.prototype.DAMAGE_BUBLE_TEMPLATE = $("#avatarDamageBubleTemplate").html();
QuizAvatarSlotBase.prototype.MAX_HORI_DAMAGE_BUBLE_OFFSET = 50;
QuizAvatarSlotBase.prototype.MIN_HORI_DAMAGE_BUBLE_OFFSET = 25;
QuizAvatarSlotBase.prototype.BOTTOM_BAR_SIZE = 45;
QuizAvatarSlotBase.prototype.BUFF_MAX_SIZE = 45; //px
QuizAvatarSlotBase.prototype.BUFF_MIN_SIZE = 25; //px
QuizAvatarSlotBase.prototype.BUFF_SIZE_STEPS = 5; //px
QuizAvatarSlotBase.prototype.BUFF_SIZE_GRACE = 10; //px

class QuizAvatarPoseImageBase {
	constructor(avatarInfo, pose, imageVh) {
		this.avatarInfo = avatarInfo;
		this.pose = pose;
		this.imageVh = imageVh;
		this.loaded = false;
		this.image;
	}

	get srcset() {
		throw "get srcset not overriden";
	}

	get src() {
		throw "get src not overriden";
	}

	load(callback) {
		if (!this.loaded && !this.image) {
			this.image = new Image();
			this.image.onload = function () {
				this.loaded = true;
				callback(this.pose);
			}.bind(this);

			this.image.sizes = this.imageVh;
			this.image.srcset = this.srcset;
			this.image.src = this.src;
		}
	}
}

class QuizAvatarSlotFlashImage {
	constructor($img, $objectContainer) {
		this.$img = $img;
		this.$objectContainer = $objectContainer;
		this.active = false;
		this.fadingIn = true;
		this.callback;

		this.stuckTimeout;

		this.$img.on("transitionend", () => {
			if (this.fadingIn) {
				this.$img.removeClass("display");
				this.fadingIn = false;
			} else {
				this.active = false;
				this.$img.removeAttr("src");
				this.$img.removeAttr("srcset");
				if (this.callback) {
					this.callback();
				}
			}
		});

		this.$objectContainer.on("transitionend", () => {
			if (this.fadingIn) {
				this.$img.removeClass("display");
				this.$objectContainer.removeClass("display");
				this.fadingIn = false;
			} else {
				this.active = false;
				this.$img.removeAttr("src");
				this.$img.removeAttr("srcset");
				this.$objectContainer.html("");
				clearTimeout(this.stuckTimeout);
				if (this.callback) {
					this.callback();
				}
			}
		});
	}

	flashImage(src, srcset, callback, $targetImage) {
		if (this.active) {
			if (callback) {
				callback();
			}
			return;
		}

		this.callback = callback;

		if($targetImage) {
			this.$objectContainer.append($targetImage);
			this.$objectContainer.addClass("display");
		} else {
			this.$img.attr("srcset", srcset);
			this.$img.attr("src", src);
			this.$img.addClass("display");
			this.active = true;
			this.fadingIn = true;
		}
		this.stuckTimeout = setTimeout(() => {
			this.$img.removeClass("display");
			this.$objectContainer.removeClass("display");
			this.fadingIn = false;
			this.active = false;
			this.$img.removeAttr("src");
			this.$img.removeAttr("srcset");
			this.$objectContainer.html("");
			if (this.callback) {
				this.callback();
			}
		}, this.STUCK_TIMEOUT_TIME);
	}
}
QuizAvatarSlotFlashImage.prototype.STUCK_TIMEOUT_TIME = 2500; //ms