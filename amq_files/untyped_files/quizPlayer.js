"use strict";
/*exported QuizPlayer*/

class QuizPlayer extends QuizCharacter {
	constructor(
		name,
		level,
		gamePlayerId,
		host,
		avatarInfo,
		points,
		avatarDisabled,
		lifeCountEnabled,
		maxLives,
		startPositionSlot,
		teamPlayer,
		teamNumber,
		hidden,
		slot,
		maxHp,
		currentHp,
		shield,
		abilityInfo,
		buffs,
		genreInfo,
		playerName
	) {
		super();
		this._name = name;
		this.level = level;
		this.gamePlayerId = gamePlayerId;
		this._host = host;
		this.avatarInfo = avatarInfo;

		this.points = points ? points : 0;
		this.lifeCountEnabled = lifeCountEnabled;
		this._inGame = !avatarDisabled;
		this.isSelf = name === selfName;
		this._groupNumber;
		this.startPositionSlot = startPositionSlot;
		this.teamNumber = teamNumber;
		this.hidden = hidden;
		this._slot = slot;

		this.targetIcons = [];
		this.attackOrderIcon;
		this.targetIcon;
		this.swapIcon;
		this.maxHp = maxHp;
		this.startHp = currentHp;
		this.startShield = shield;
		this.genreInfo = genreInfo;

		this.avatarSlot = new QuizAvatarSlot(
			this.name,
			this.level,
			this.points,
			this.avatarInfo,
			host,
			avatarDisabled,
			lifeCountEnabled,
			maxLives,
			teamPlayer,
			hidden,
			slot != null
		);

		if(abilityInfo) {
			this.abilityIcon = new QuizAbilityIcon(this.avatarSlot.$abilityIconContainer, abilityInfo, slot, playerName === selfName);
		}

		if(buffs) {
			buffs.forEach(buff => {
				this.addBuff(buff);
			});
		}

		if (this.isSelf) {
			this.particleAnimation = new ParticleAnimation();
			this.particleTrack = new ParticleTrack(
				this.avatarSlot.$imageContainer,
				$("#xpLevelContainer"),
				PARTICLE_SPAWN_STRATEGIES.RECTANGLE_VERTICAL_EDGES
			);
			this.particleAnimation.addTrack(this.particleTrack);
		}
	}

	get host() {
		return this._host;
	}

	get slotElement() {
		return this.avatarSlot;
	}

	get slot() {
		return this._slot;
	}

	set slot(newValue) {
		this._slot = newValue;
		this.abilityIcon.slot = newValue;
	}

	get name() {
		return this._name;
	}

	set name(newValue) {
		this._name = newValue;
		this.avatarSlot.name = newValue;
		this.avatarSlot.updateSize(this.avatarSlot.currentMaxWidth, this.avatarSlot.currentMaxHeight);
	}

	get groupNumber() {
		return this._groupNumber;
	}

	set groupNumber(newValue) {
		let value = parseInt(newValue);
		if (this.groupNumber === undefined) {
			this._groupNumber = value;
		} else {
			if (this._groupNumber < value) {
				this.avatarSlot.runGroupDownAnimation();
			} else if (this._groupNumber > value) {
				this.avatarSlot.runGroupUpAnimation();
			}
			this._groupNumber = value;
		}
	}

	get inGame() {
		return this._inGame;
	}

	set inGame(newValue) {
		if (!newValue) {
			this.avatarPose = cdnFormater.AVATAR_POSE_IDS.BASE;
		}
		this._inGame = newValue;
	}

	set score(newScore) {
		this.avatarSlot.points = newScore;
	}

	set finalPosition(position) {
		this.avatarSlot.finalResult = position;
	}

	set avatarDisabled(newValue) {
		this.avatarSlot.disabled = newValue;
	}

	get avatarDisabled() {
		return this.avatarSlot.disabled;
	}

	set host(newValue) {
		this.avatarSlot.host = newValue;
	}

	set answer(newValue) {
		this.avatarSlot.answer = newValue;
		this.avatarSlot.hideTeamAnswer();
	}

	set teamAnswer(newValue) {
		this.answer = newValue;
		this.avatarSlot.showTeamAnswer();
	}

	set unknownAnswerNumber(newValue) {
		this.avatarSlot.unknownAnswerNumber = newValue;
	}

	set resultAnswerNumber(newValue) {
		this.avatarSlot.resultAnswerNumber = newValue;
	}

	set avatarPose(newValue) {
		if (this.inGame) {
			this.avatarSlot.pose = newValue;
		}
	}

	set state(newState) {
		this.score = newState.score;
		if (this.lifeCountEnabled) {
			this.avatarSlot.setupLifeCounterState(newState.score, newState.reviveScore);
		}
		if (!newState.inGame) {
			this.avatarSlot.disabled = true;
		} else if (newState.answer != undefined) {
			this.avatarSlot.answer = newState.answer;
			if (newState.correct == undefined) {
				this.avatarSlot.unknownAnswerNumber = newState.answerNumber;
			} else {
				this.avatarSlot.resultAnswerNumber = newState.answerNumber;
				this.avatarSlot.answerCorrect = newState.correct;
				if (newState.listStatus) {
					this.avatarSlot.listStatus = newState.listStatus;
					this.avatarSlot.listScore = newState.showScore;
				}
			}
		}
	}

	updatePose() {
		this.avatarSlot.updatePose();
	}

	updateAnswerResult(answerResult) {
		this.avatarSlot.answerCorrect = answerResult.correct;
		this.avatarSlot.setResultAnswerNumber(answerResult.answerNumber, answerResult.correct);

		this.score = answerResult.score;
		if (this.lifeCountEnabled) {
			this.avatarSlot.updateLifeCounter(answerResult.score, answerResult.reviveScore);
		}

		if (answerResult.correct) {
			this.avatarSlot.level = answerResult.level;
			this.avatarPose = cdnFormater.AVATAR_POSE_IDS.RIGHT;
		} else if (!answerResult.noAnswer) {
			this.avatarPose = answerResult.pose;
		}
		if (answerResult.listStatus) {
			this.avatarSlot.listStatus = answerResult.listStatus;
			this.avatarSlot.listScore = answerResult.showScore;
		}
	}

	fireRewardEvent(xpInfo, level, credits, tickets) {
		if (this.avatarSlot.displayed && this.particleTrack) {
			this.particleTrack.buildTrack();
			this.particleTrack.setEndEvent(() => {
				xpBar.handleXpChange(xpInfo.xpPercent, xpInfo.xpForLevel, xpInfo.xpIntoLevel, level, xpInfo.lastGain);
				xpBar.setCredits(credits, null, true);
				xpBar.setTickets(tickets, null, true);
			});
			this.particleAnimation.startAnimation();
		} else {
			xpBar.handleXpChange(xpInfo.xpPercent, xpInfo.xpForLevel, xpInfo.xpIntoLevel, level, xpInfo.lastGain);
			xpBar.setCredits(credits);
			xpBar.setTickets(tickets, null, true);
		}
	}

	toggleTeamAnswerSharing(on) {
		this.avatarSlot.teamAnswerSharingOn = on;
	}

	initNexusContent() {
		this.attackOrderIcon = new QuizTargetAvatarIcon(this.avatarInfo.avatar);
		this.targetIcon = new QuizTargetAvatarIcon(this.avatarInfo.avatar);
		this.swapIcon = new QuizTargetAvatarIcon(this.avatarInfo.avatar);
		this.swapIcon.showSwapIcon();
		this.avatarSlot.points = null;
		this.avatarSlot.hpBarPercent = Math.round((this.startHp / this.maxHp) * 100) - 100;

		let shieldPercent = Math.round((this.startShield / this.maxHp) * 100) - 100;
		this.avatarSlot.shieldBarPercent = shieldPercent;
		this.avatarSlot.shieldAmount = this.startShield;

		this.avatarSlot.addGenreIcons(this.genreInfo);

		if (this.startHp <= 0) {
			this.updateNexusState({
				alive: false,
			});
		}
		this.avatarSlot.$nexusTargetButton.click((event) => {
			let targetEvent = quiz.handleNewNexusCharacterClick(this);
			if(!targetEvent) {
				socket.sendCommand({
					type: "nexus",
					command: "target swap",
					data: {
						slot: this.slot,
					},
				});
			} else {
				event.stopPropagation();
			}
		});
		this.avatarSlot.$innerContainer.click((event) => {
			let targetEvent = quiz.handleNewNexusCharacterClick(this);
			if(targetEvent) {
				event.stopPropagation();
			}
		});
	}

	addTargetIcon(icon) {
		this.targetIcons.push(icon);
	}

	removeTargetIcon(icon) {
		icon.detach();
		this.targetIcons = this.targetIcons.filter((tIcon) => tIcon !== icon);
	}

	updateTargetIcons() {
		this.targetIcons
			.sort((a, b) => a.attackCounter - b.attackCounter)
			.forEach((icon) => {
				this.avatarSlot.addTargetIcon(icon);
			});
	}

	setNexusTurn(on) {
		if (on) {
			this.avatarSlot.showNexusTurn();
		} else {
			this.avatarSlot.hideNexusTurn();
		}
	}

	displayDamage(newHp, newShield, damage, damageClasses, attackEffectSet, finishedCallback, displayZero) {
		if(damage === 0 && !displayZero) {
			if(attackEffectSet && attackEffectSet.forceSfx) {
				this.avatarSlot.playForcedSfx(attackEffectSet.sfx, attackEffectSet.sfxTimeingMs, finishedCallback);
			} else {
				finishedCallback();
			}
			return;
		}
		if(damage > 0) {
			damage = `${damage}`;
		}
		this.avatarSlot.displayDamage(newHp, newShield, damage, this.maxHp, damageClasses, attackEffectSet, finishedCallback);
	}

	setSwapIcon(icon) {
		this.avatarSlot.addSwapIcon(icon);
	}

	updateNexusState({ alive }) {
		if (!alive) {
			this.avatarDisabled = true;
			this.attackOrderIcon.detach();
		}
	}

	displayOverlay(src, srcet) {
		this.avatarSlot.displayOverlay(src, srcet);
	}

	clearOverlay() {
		this.avatarSlot.clearOverlay();
	}

	setInFocus(on) {
		this.avatarSlot.setInFocus(on);
	}

	hideAllGenres() {
		this.avatarSlot.hideAllGenres();
	}

	showGenres(genreIds, seasonId) {
		if(!this.avatarDisabled) {
			this.avatarSlot.showGenres(genreIds, seasonId);
		}
	}
}
