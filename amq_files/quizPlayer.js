"use strict";

/*exported QuizPlayer*/

class QuizPlayer extends GamePlayer {
    constructor(
        name,
        level,
        gamePlayerId,
        host,
        avatarInfo,
        points,
        avatarPose,
        avatarDisabled,
        lifeCountEnabled,
        maxLives,
        startPositionSlot,
        teamPlayer,
        teamNumber,
        hidden
    ) {
        super(name, level, gamePlayerId, host, avatarInfo);

        this.points = points ? points : 0;
        this.lifeCountEnabled = lifeCountEnabled;
        this._inGame = !avatarDisabled;
        this.isSelf = name === selfName;
        this._groupNumber;
        this.startPositionSlot = startPositionSlot;
        this.teamNumber = teamNumber;
        this.hidden = hidden;

        this.avatarSlot = new QuizAvatarSlot(
            this.name,
            this.level,
            this.points,
            this.avatarInfo,
            host,
            avatarPose,
            avatarDisabled,
            lifeCountEnabled,
            maxLives,
            teamPlayer,
            hidden
        );

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

    set host(newValue) {
        this.avatarSlot.host = newValue;
    }

    set answer(newValue) {
        this.avatarSlot.answer = newValue;
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
        if (this.avatarSlot.displayed) {
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
        }
    }

    toggleTeamAnswerSharing(on) {
        this.avatarSlot.teamAnswerSharingOn = on;
    }
}
