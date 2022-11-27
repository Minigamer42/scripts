"use strict";

/*exported StaticGlowOrb AnimationRandomParticle StaticDonut RotatingCircleSlice, RandomBubleImageElement*/

class AnimationElement {
    constructor(ctx, x, y, rgbColor) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this._color = rgbColor;
    }

    get color() {
        return this._color.string;
    }

    draw() {
        //Do nothing for default element
    }

    updateColor(rgbColor) {
        this._color = rgbColor;
    }
}

class AnimationImageElement {
    constructor(ctx, x, y, imageCanvas) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.imageCanvas = imageCanvas;
    }

    draw() {
        this.ctx.drawImage(this.imageCanvas, Math.round(this.x), Math.round(this.y));
    }
}

class BubleImageElement extends AnimationImageElement {
    constructor(
        ctx,
        x,
        y,
        imageCanvas,
        horiAcc,
        horiChangeChance,
        maxHori,
        vertSpeed,
        vertGoal,
        vertGoalCallback,
        vertOpacityTrigger,
        opacityDropRate
    ) {
        super(ctx, x, y, imageCanvas);
        this.horiAcc = horiAcc;
        this.maxHori = maxHori;
        this.vertSpeed = vertSpeed;
        this.vertGoal = vertGoal;
        this.vertGoalCallback = vertGoalCallback;
        this.horiSpeed = 0;
        this.horiDirection = Math.random() > 0.5 ? 1 : -1;
        this.horiDirectionChangeChance = horiChangeChance;
        this.opacity = 1;
        this.vertOpacityTrigger = vertOpacityTrigger;
        this.opacityDropRate = opacityDropRate;
    }

    draw(deltaTimeSeconds) {
        this.ctx.save();

        this.ctx.globalAlpha = this.opacity;
        super.draw();

        this.ctx.restore();

        let oldY = this.y;
        this.y += this.vertSpeed * deltaTimeSeconds;
        this.x += this.horiSpeed * deltaTimeSeconds;

        if (Math.random() < this.horiDirectionChangeChance * deltaTimeSeconds) {
            this.horiDirection = -1 * this.horiDirection;
        }

        this.horiSpeed += this.horiAcc * this.horiDirection * deltaTimeSeconds;
        if (Math.abs(this.horiSpeed) > this.maxHori) {
            if (this.horiSpeed > 0) {
                this.horiSpeed = this.maxHori;
            } else {
                this.horiSpeed = this.maxHori * -1;
            }
        }

        if ((oldY < this.y && this.y >= this.vertGoal) || (oldY > this.y && this.y <= this.vertGoal)) {
            this.vertGoalCallback();
            this.vertGoalCallback = null;
        }

        if ((oldY < this.y && this.y >= this.vertOpacityTrigger) || (oldY > this.y && this.y <= this.vertOpacityTrigger)) {
            this.opacity -= this.opacityDropRate * deltaTimeSeconds;
            if (this.opacity < 0) {
                this.opacity = 0;
            }
        }
    }
}

class RandomBubleImageElement extends BubleImageElement {
    constructor(
        ctx,
        x,
        y,
        imageCanvas,
        horiAccMin,
        hoiiAccMax,
        horiChangeChanceMin,
        horiChangeChanceMax,
        maxHoriMin,
        maxHoriMax,
        vertSpeedMin,
        vertSpeedmax,
        vertGoal,
        vertGoalCallback,
        vertOpacityTrigger,
        opacityDropRate
    ) {
        let horiAcc = Math.round(Math.random() * (hoiiAccMax - horiAccMin) + horiAccMin);
        let horiChanceChance = Math.random() * (horiChangeChanceMax - horiChangeChanceMin) + horiChangeChanceMin;
        let maxHori = Math.round(Math.random() * (maxHoriMax - maxHoriMin) + maxHoriMin);
        let vertSpeed = Math.round(Math.random() * (vertSpeedmax - vertSpeedMin) + vertSpeedMin);
        super(
            ctx,
            x,
            y,
            imageCanvas,
            horiAcc,
            horiChanceChance,
            maxHori,
            vertSpeed,
            vertGoal,
            vertGoalCallback,
            vertOpacityTrigger,
            opacityDropRate
        );
    }
}

class StaticDonut extends AnimationElement {
    constructor(ctx, x, y, containerRadius, radiusPercent, clearPercent, rgbColor) {
        super(ctx, x, y, rgbColor);

        this.radiusPercent = radiusPercent;
        this.clearPercent = clearPercent;
        this.targetRadius;
        this.targetClearRadius;
        this.containerRadius = containerRadius;
    }

    set containerRadius(newValue) {
        this.targetRadius = newValue * this.radiusPercent;
        this.targetClearRadius = newValue * this.clearPercent;
    }

    draw() {
        this.ctx.save();
        this.ctx.fillStyle = this.color;

        //Draw Circle
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.targetRadius, 0, Math.PI * 2, false);
        this.ctx.fill();

        //Clear center
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.targetClearRadius, 0, Math.PI * 2, false);
        this.ctx.clip();
        this.ctx.clearRect(
            this.x - this.targetRadius,
            this.y - this.targetRadius,
            this.targetRadius * 2,
            this.targetRadius * 2
        );

        this.ctx.restore();
    }
}

class StaticGlowOrb extends AnimationElement {
    constructor(ctx, x, y, radius, glowRangePercent, glowFadeStartPercent, glowFadeEndPercent, rgbColor) {
        super(ctx, x, y);

        this.baseRadius = radius;
        this.glowRangePercent = glowRangePercent;
        this.glowFadeStartPercent = glowFadeStartPercent;
        this.glowFadeEndPercent = glowFadeEndPercent;

        this.centerGolor = new RGB(255, 255, 255);
        this.glowColor;
        this.fadeStartColor;
        this.fadeEndColor;
        this.updateColor(rgbColor);
    }

    updateColor(rgbColor) {
        this.glowColor = rgbColor.clone();
        this.glowColor.opacity = 0.6;
        this.fadeStartColor = rgbColor.clone();
        this.fadeStartColor.opacity = 0.1;
        this.fadeEndColor = rgbColor.clone();
        this.fadeEndColor.opacity = 0;
    }

    draw() {
        this.ctx.save();

        let radius =
            this.baseRadius +
            this.baseRadius * this.glowRangePercent +
            this.baseRadius * this.glowFadeStartPercent +
            this.baseRadius * this.glowFadeEndPercent;
        let fadeEndStartPercent = 1 - this.glowFadeEndPercent;
        let fadeStartPercent = fadeEndStartPercent - this.glowFadeStartPercent;
        let glowStartPercent = fadeStartPercent - this.glowRangePercent;

        let gradient = this.ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, radius);
        gradient.addColorStop(0, this.centerGolor.string);
        gradient.addColorStop(glowStartPercent, this.centerGolor.string);
        gradient.addColorStop(fadeStartPercent, this.glowColor.string);
        gradient.addColorStop(fadeEndStartPercent, this.fadeStartColor.string);
        gradient.addColorStop(1, this.fadeEndColor.string);

        this.ctx.fillStyle = gradient;

        //Draw Circle
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, radius, 0, Math.PI * 2, false);
        this.ctx.fill();

        this.ctx.restore();
    }
}

class RotatingCircleSlice extends AnimationElement {
    constructor(ctx, x, y, startAngel, containerRadius, radiusPercent, angle, speed, rgbColor) {
        super(ctx, x, y, rgbColor);

        this.currentAngle = startAngel;
        this.angle = angle;
        this.speed = speed;
        this.bonusSpeed = 0;
        this._targetBonusSpeed = 0;
        this.oldBonusSpeed = 0;
        this.acceleration = this.DEFAULT_ACCELERATION_PERCENT;

        this.radiusPercent = radiusPercent;
        this.targetRadius;
        this.containerRadius = containerRadius;
    }

    get targetBonusSpeed() {
        return this._targetBonusSpeed;
    }

    set targetBonusSpeed(newValue) {
        this.oldBonusSpeed = this.targetBonusSpeed;
        this._targetBonusSpeed = newValue;
    }

    set containerRadius(newValue) {
        this.targetRadius = newValue * this.radiusPercent;
    }

    draw(deltaTimeSeconds) {
        this.ctx.save();
        this.ctx.fillStyle = this.color;

        //Draw Circle
        this.ctx.beginPath();
        this.ctx.moveTo(this.x, this.y);
        this.ctx.arc(this.x, this.y, this.targetRadius, this.currentAngle, this.currentAngle + this.angle, false);
        this.ctx.lineTo(this.x, this.y);
        this.ctx.fill();

        let deltaSpeed = (this.speed + this.bonusSpeed) * deltaTimeSeconds;
        this.currentAngle = (this.currentAngle + deltaSpeed) % (Math.PI * 2);

        if (this.targetBonusSpeed > this.bonusSpeed) {
            this.bonusSpeed += this.acceleration * this.targetBonusSpeed * deltaTimeSeconds;
            if (this.targetBonusSpeed < this.bonusSpeed) {
                this.bonusSpeed = this.targetBonusSpeed;
            }
        } else if (this.targetBonusSpeed < this.bonusSpeed) {
            this.bonusSpeed -= this.acceleration * this.oldBonusSpeed * deltaTimeSeconds;
            if (this.targetBonusSpeed > this.bonusSpeed) {
                this.bonusSpeed = this.targetBonusSpeed;
            }
        }

        this.ctx.restore();
    }
}

RotatingCircleSlice.prototype.DEFAULT_ACCELERATION_PERCENT = 1;

class AnimationParticle extends StaticGlowOrb {
    constructor(
        ctx,
        x,
        y,
        radius,
        glowRangePercent,
        glowFadeStartPercent,
        glowFadeEndPercent,
        rgbColor,
        speed,
        targetShape
    ) {
        super(ctx, x, y, radius, glowRangePercent, glowFadeStartPercent, glowFadeEndPercent, rgbColor);

        this.speed = speed;
        this.bonusSpeed = 0;
        this._targetBonusSpeed = 0;
        this.oldBonusSpeed = 0;
        this.acceleration = this.DEFAULT_ACCELERATION_PERCENT;

        this.targetShape = targetShape;

        this.normVector;
        this.targetDistance;
        this.movedDistance;

        this._revereDirection = false;

        this.fadeSpeed;
        this.fadeDistance;
        this.currentFade = 1;
        this.fadeOut = false;

        this.calculateVelucity();
    }

    get targetBonusSpeed() {
        return this._targetBonusSpeed;
    }

    set targetBonusSpeed(newValue) {
        this.oldBonusSpeed = this.targetBonusSpeed;
        this._targetBonusSpeed = newValue;
    }

    get velucityX() {
        return (this.speed + this.bonusSpeed) * this.normVector.x;
    }

    get velucityY() {
        return (this.speed + this.bonusSpeed) * this.normVector.y;
    }

    get reverseDirection() {
        return this._revereDirection;
    }

    set reverseDirection(newValue) {
        let old = this.reverseDirection;
        this._revereDirection = newValue;
        if (old !== newValue) {
            this.movedDistance = this.targetDistance - this.movedDistance;
        }
    }

    calculateVelucity() {
        let direction = this.targetShape.generateShortestDirection(this.x, this.y);

        this.normVector = direction.normVector;

        this.targetDistance = Math.abs(direction.distance);
        this.movedDistance = 0;
    }

    targetReached() {
        //Do Nothing
    }

    draw(deltaTimeSeconds) {
        this.ctx.save();

        let fadeModifier;
        if (this.fadeOut && this.fadeSpeed && this.targetDistance - this.movedDistance <= this.fadeDistance) {
            if (this.currentFade > 0) {
                fadeModifier = -1;
            }
        } else if (this.fadeSpeed && this.currentFade < 1) {
            fadeModifier = 1;
        }
        if (fadeModifier) {
            let bonusFadeIn = this.speed === 0 ? 0 : ((this.speed + this.bonusSpeed) / this.speed) * this.fadeSpeed;
            this.currentFade += (this.fadeSpeed + bonusFadeIn) * deltaTimeSeconds * fadeModifier;
            this.currentFade = this.currentFade > 1 ? 1 : this.currentFade < 0 ? 0 : this.currentFade;
        }
        this.ctx.globalAlpha = this.currentFade;
        super.draw(deltaTimeSeconds);

        this.ctx.restore();

        if (this.targetDistance > this.movedDistance) {
            let directionModifier = this.reverseDirection ? -1 : 1;
            this.x += this.velucityX * deltaTimeSeconds * directionModifier;
            this.y += this.velucityY * deltaTimeSeconds * directionModifier;
            this.movedDistance += (this.speed + this.bonusSpeed) * deltaTimeSeconds;
        } else {
            this.targetReached();
        }

        if (this.targetBonusSpeed > this.bonusSpeed) {
            this.bonusSpeed += this.acceleration * this.targetBonusSpeed * deltaTimeSeconds;
            if (this.targetBonusSpeed < this.bonusSpeed) {
                this.bonusSpeed = this.targetBonusSpeed;
            }
        } else if (this.targetBonusSpeed < this.bonusSpeed) {
            this.bonusSpeed -= this.acceleration * this.oldBonusSpeed * deltaTimeSeconds;
            if (this.targetBonusSpeed > this.bonusSpeed) {
                this.bonusSpeed = this.targetBonusSpeed;
            }
        }
    }
}

AnimationParticle.prototype.DEFAULT_ACCELERATION_PERCENT = 1;

class AnimationRandomParticle extends AnimationParticle {
    constructor(
        ctx,
        glowRangePercent,
        glowFadeStartPercent,
        glowFadeEndPercent,
        rgbColor,
        targetShape,
        spawnShape,
        minSpeed,
        maxSpeed,
        minRadius,
        maxRadius
    ) {
        super(ctx, 0, 0, 0, glowRangePercent, glowFadeStartPercent, glowFadeEndPercent, rgbColor, 0, targetShape);

        this.nextTargetShape;

        this.spawnShape = spawnShape;
        this.minSpeed = minSpeed;
        this.maxSpeed = maxSpeed;
        this.minRadius = minRadius;
        this.maxRadius = maxRadius;
    }

    randomize(spawnMoving) {
        let spawnPoint = this.spawnShape.getRandomPointWithin();
        this.x = spawnPoint.x;
        this.y = spawnPoint.y;

        this.speed = (this.maxSpeed - this.minSpeed) * Math.random() + this.minSpeed;
        this.bonusSpeed = this.bonusSpeed * 0.3;
        this.baseRadius = (this.maxRadius - this.minRadius) * Math.random() + this.minRadius;

        if (this.fadeSpeed) {
            this.currentFade = 0;
            this.fadeDistance = (0.5 / this.fadeSpeed) * this.speed;
        }

        this.calculateVelucity();

        if (this.reverseDirection) {
            this.x += this.normVector.x * this.targetDistance;
            this.y += this.normVector.y * this.targetDistance;
        }

        if (spawnMoving) {
            let initMove = this.targetDistance * Math.random() * 0.9;
            this.x += this.normVector.x * initMove;
            this.y += this.normVector.y * initMove;
            this.movedDistance += initMove;
        }
    }

    targetReached() {
        if (this.nextTargetShape) {
            this.targetShape = this.nextTargetShape;
            this.nextTargetShape = null;
        }
        this.randomize();
    }
}
