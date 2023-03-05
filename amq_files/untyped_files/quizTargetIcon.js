'use strict';
/*exported QuizTargetAvatarIcon, QuizEnemyTargetIcon, QuizBossTargetIcon*/

class QuizTargetIcon {
	constructor(entryInfo) {
		this.$body = $(format(this.TEMPLATE, this.createSrc(entryInfo), this.createSrcSet(entryInfo)));
	}

	createSrc() {
		throw new Error("Should be overriden");
	}

	createSrcSet() {
		throw new Error("Should be overriden");
	}

	detach() {
		this.$body.detach();
	}

	showFade() {
		this.$body.addClass('fade');
	}

	hideFade() {
		this.$body.removeClass('fade');
	}
}
QuizTargetIcon.prototype.TEMPLATE = $("#quizTargetIconTemplate").html();

class QuizTargetAvatarIcon extends QuizTargetIcon {
	constructor(avatarInfo) {
		super(avatarInfo);

		this.$swapIcon = this.$body.find('.qpAvatarTargetIconSwapIcon');
	}

	createSrc(avatarInfo) {
		return cdnFormater.newAvatarHeadSrc(
			avatarInfo.avatarName,
			avatarInfo.outfitName,
			avatarInfo.optionName,
			avatarInfo.optionActive,
			avatarInfo.colorName
		);
	}

	createSrcSet(avatarInfo) {
		return cdnFormater.newAvatarHeadSrcSet(
			avatarInfo.avatarName,
			avatarInfo.outfitName,
			avatarInfo.optionName,
			avatarInfo.optionActive,
			avatarInfo.colorName
		);
	}

	showSwapIcon() {
		this.$swapIcon.removeClass('hide');
	}

	hideSwapIcon() {
		this.$swapIcon.addClass('hide');
	}
}

class QuizEnemyTargetIcon extends QuizTargetIcon {
	constructor(enemyInfo, turnsToAttck, position) {
		super(enemyInfo);
		
		this.$body.addClass('qpAvatarTargetIconEnemy-' + position);

		this.$counter = this.$body.find('.qpAvatarTargetCounter');
		this.attackCounter = turnsToAttck;
		this.$counter.removeClass('hide');
	}

	createSrc(enemyName) {
		return cdnFormater.newEnemyHeadSrc(
			enemyName
		);
	}

	createSrcSet(enemyName) {
		return cdnFormater.newEnemyHeadSrcSet(
			enemyName
		);
	}

	get attackCounter() {
		return this._attackCounter;
	}

	set attackCounter(value) {
		this._attackCounter = value;
		this.$counter.text(value);
	}
}

class QuizBossTargetIcon extends QuizEnemyTargetIcon {
	constructor(bossName, turnsToAttck, position, headForm) {
		super({name: bossName, headForm}, turnsToAttck, position);
	}
	
	createSrc({name, headForm}) {
		return cdnFormater.newBossHeadSrc(
			name,
			headForm
		);
	}

	createSrcSet({name, headForm}) {
		return cdnFormater.newBossHeadSrcSet(
			name,
			headForm
		);
	}
}