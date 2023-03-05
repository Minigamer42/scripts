'use strict';

//Works for square spires, fills out the entire canvas
class SpriteAnimation {
	constructor(canvas, spriteName, flipSprite = false, scale = 1, randomOffset = false, speed = 1) {
		this.canvas = canvas;
		this.speed = speed;
		this.flipSprite = flipSprite;

		let targetWidth = this.canvasWidth * scale;

		this.spriteSheet = spriteSheetBuffer.getSpriteSheet(spriteName, targetWidth);
		if(!this.spriteSheet) {
			throw new Error("Sprite Not Loaded");
		}

		this.offsetX = 0;
		this.offsetY = 0;

		if(randomOffset && scale !== 1) {
			this.offsetX = Math.round((this.canvasWidth - targetWidth) * Math.random());
			this.offsetY = Math.round((this.canvasHeight - targetWidth) * Math.random());
		}

		this.currentFrameNumber = 0;
		this.animationStartTimestamp;
		this.animationRunning = false;
		this.finishCallback;
	}

	get canvasWidth() {
		return this.canvas.canvas.clientWidth;
	}

	get canvasHeight() {
		return this.canvas.canvas.clientWidth;
	}

	get spriteFrameCount() {
		return this.spriteSheet.frameCount;
	}

	drawCurrentFrame() {
		this.canvas.save();
		this.canvas.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
		let sprite = this.spriteSheet.getFrame(this.currentFrameNumber);

		if(this.flipSprite) {
			this.canvas.scale(-1, 1);
		}
		let widthMod = this.flipSprite ? -1 : 1;
		this.canvas.drawImage(sprite.canvas, this.offsetX, this.offsetY, this.canvasWidth * widthMod, this.canvasHeight);
		this.canvas.restore();
	}

	startAnimation(finishCallback) {
		if(this.animationRunning) {
			return false;
		}

		this.finishCallback = finishCallback;

		this.drawCurrentFrame();
		this.animationRunning = true;
		this.animationStartTimestamp = new Date().valueOf();
		this.tickAnimation();
	}

	tickAnimation() {
		let currentTimestamp = new Date().valueOf();
		let timePassedSeconds = (currentTimestamp - this.animationStartTimestamp) / 1000;
		
		let targetFrameNumber = Math.floor(this.FPS * timePassedSeconds * this.speed);
		if(targetFrameNumber >= this.spriteFrameCount) {
			//Animation finished
			this.animationRunning = false;
			if(this.finishCallback) {
				this.finishCallback();
			}
			return;
		}

		if(targetFrameNumber !== this.currentFrameNumber) {
			this.currentFrameNumber = targetFrameNumber;
			this.drawCurrentFrame();
		}
		requestAnimationFrame(() => {
			this.tickAnimation();
		});
	}
}
SpriteAnimation.prototype.FPS = 60;