"use strict";

class TileBackdropCanvas extends BaseCanvas {
	constructor($canvas, backdropWidth) {
		super($canvas);
		this.backdropWidth = backdropWidth;
	}

	drawBackdrop(newSize) {
		if(newSize != null) {
			this.backdropWidth = newSize;
		}
		this.clearCanvas();

		this.ctx.save();

		this.ctx.fillStyle = this.BACKDROP_COLOR.string;

		let centerX = this.width / 2;
		let startX = centerX - this.backdropWidth / 2;
		let endX = centerX + this.backdropWidth / 2;
		let startY = 0;
		let endY = this.height;

		this.ctx.fillRect(startX, startY, this.backdropWidth, this.height);

		this.ctx.strokeStyle = this.BORDER_COLOR.string;
		this.ctx.shadowColor = this.BORDER_GLOW.string;
		this.ctx.shadowBlur = this.SHADOW_BLUR;
		this.ctx.lineWidth = this.BORDER_SIZE;

		this.ctx.beginPath();

		this.ctx.moveTo(startX, startY);
		this.ctx.lineTo(startX, endY);

		this.ctx.moveTo(endX, startY);
		this.ctx.lineTo(endX, endY);

		this.ctx.stroke();

		this.ctx.restore();
	}

	redraw() {
		this.drawBackdrop();
	}

	updateContent() {
		//Do nothing by default
	}
}

TileBackdropCanvas.prototype.BACKDROP_COLOR = new RGB(0, 106, 183, 0.3);
TileBackdropCanvas.prototype.BORDER_COLOR = new RGB(68, 151, 234, 0.8);
TileBackdropCanvas.prototype.BORDER_GLOW = new RGB(128, 199, 255, 1);
TileBackdropCanvas.prototype.SHADOW_BLUR = 25;
TileBackdropCanvas.prototype.BORDER_SIZE = 10;
