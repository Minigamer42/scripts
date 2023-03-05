'use strict';
/*exported SpriteSheet*/

class SpriteSheet {
	constructor(sheetBufferedImage, spriteSize, colCount, rowCount) {
		this.frames = [];
		for(let row = 0; row < rowCount; row++) {
			for(let col = 0; col < colCount; col++) {
				this.frames.push(new SpriteSheetFrame(sheetBufferedImage, spriteSize, col, row));
			}
		}

		this.cachedLoaded = false;
	}

	get loaded() {
		if(!this.cachedLoaded) {
			this.cachedLoaded = !this.frames.some(frame => !frame.frameReady);
		}

		return this.cachedLoaded;
	}

	get frameCount() {
		return this.frames.length;
	}

	getFrame(frameNumber) {
		return this.frames[frameNumber];
	}
}

class SpriteSheetFrame {
	constructor(bufferedImage, spriteSize, col, row) {
		this.$canvas = $(`<canvas width="${spriteSize}" height="${spriteSize}"></canvas>`);
		this.canvas = this.$canvas[0];
		this.ctx = this.canvas.getContext('2d');

		this.frameReady = false;

		if(bufferedImage.loadDone) {
			this.loadImage(bufferedImage.img, spriteSize, col, row);
		} else {
			bufferedImage.addLoadListener(() => {
				this.loadImage(bufferedImage.img, spriteSize, col, row);
			});
		}
	}

	loadImage(image, spriteSize, col, row) {
		let xOffset = spriteSize * col * -1;
		let yOffset = spriteSize * row * -1;
		this.ctx.drawImage(image, xOffset, yOffset);
		this.frameReady = true;
	}
}