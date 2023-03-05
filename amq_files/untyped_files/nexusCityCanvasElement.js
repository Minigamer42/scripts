"use strict";
/*exported NexusCityCanvasElementInfiniteSlide*/

class NexusCityCanvasElement extends AnimationRendorElement {
	constructor(ctx, x, y, cityWidth, image) {
		super(ctx, x, y, new RGB(68, 151, 234), image.width * 4, image.height * 4);

		this.cityWidth = cityWidth;
		this.image = image;

		this.targetWidth;
		this.targetHeight;

		this.render();
	}

	get cityScale() {
		return this.cityWidth / this.STANDARD_CITY_WIDTH;
	}

	render() {
		this.renderCanvas.clearCanvas();
		let ctx = this.renderCanvas.ctx;
		ctx.save();

		this.targetWidth = this.image.width * this.cityScale;
		this.targetHeight = this.image.height * this.cityScale;

		ctx.drawImage(this.image, 0, 0, this.targetWidth, this.targetHeight);

		ctx.restore();
	}

	draw() {
		this.ctx.save();

		let targetX = this.x * this.cityScale;
		let targetY = this.y * this.cityScale;

		this.ctx.drawImage(this.$renderCanvas[0], targetX, targetY);

		this.ctx.restore();
	}
}

NexusCityCanvasElement.prototype.STANDARD_CITY_WIDTH = 2160;

class NexusCityCanvasElementInfiniteSlide extends NexusCityCanvasElement {
	constructor(ctx, x, y, cityWidth, image, speed) {
		super(ctx, x, y, cityWidth, image);

		this.speed = speed;
		this.offset = 0;
	}

	draw(deltaTime) {
		this.ctx.save();

		let move = this.speed * deltaTime * this.cityScale;

		this.offset += move;
		
		if(this.offset >= this.targetWidth) {
			this.offset = 0;
		}

		let targetX = this.x * this.cityScale + this.offset;
		let targetY = this.y * this.cityScale;

		this.ctx.drawImage(this.$renderCanvas[0], targetX, targetY);
		this.ctx.drawImage(this.$renderCanvas[0], targetX - this.targetWidth, targetY);

		this.ctx.restore();
	}
}