"use strict";
/*exported AnimationCanvasCenter BackgroundImageCanvas*/

class BaseCanvas {
	constructor($canvas) {
		this.$canvas = $canvas;

		this.ctx = this.$canvas[0].getContext("2d");

		this.ctx.save();

		this.width = 0;
		this.height = 0;
	}

	updateCanvasSize(skipRedraw) {
		this.width = this.$canvas.width();
		this.height = this.$canvas.height();
		this.$canvas.attr("height", this.height).attr("width", this.width);

		this.updateContent();
		if (!skipRedraw) {
			this.redraw();
		}
	}

	clearCanvas() {
		this.ctx.clearRect(0, 0, this.width, this.height);
	}
}

class AnimationCanvas extends BaseCanvas {
	constructor($canvas) {
		super($canvas);

		this.translateX = 0;
		this.translateY = 0;
		this.dragEnabled = true;
		this.clickEnabled = true;
		this.dragActive = false;
		this.scale = 1;

		this.content = [];
		this.translateChangeListeners = [];

		this.onDragStartHandler;
		this.onDragEndHandler;
		this.onDragHandler;
		this.onDragLeaveHandler;

		this.horiMinDragLimit;
		this.horiMaxDragLimit;
		this.vertMinDragLimit;
		this.vertMaxDragLimit;

		this.inputEventsActive = true;

		this.mouseDownListeners = [];
		this.$canvas.on("mousedown", (event) => {
			if (!this.inputEventsActive) {
				return;
			}
			this.populateMouseEvent(event);
			this.mouseDownListeners.forEach((handler) => handler(event));
		});

		this.mouseMoveListeners = [];
		this.$canvas.on("mousemove", (event) => {
			if (!this.inputEventsActive) {
				return;
			}
			this.populateMouseEvent(event);
			this.mouseMoveListeners.forEach((handler) => handler(event));
		});

		this.mouseUpListeners = [];
		this.$canvas.on("mouseup", (event) => {
			if (!this.inputEventsActive) {
				return;
			}
			this.populateMouseEvent(event);
			this.mouseUpListeners.forEach((handler) => handler(event));
		});

		this.mouseLeaveListeners = [];
		this.$canvas.on("mouseleave", (event) => {
			if (!this.inputEventsActive) {
				return;
			}
			this.populateMouseEvent(event);
			this.mouseLeaveListeners.forEach((handler) => handler(event));
		});

		this.wheelListeners = [];
		this.$canvas.on("wheel", (event) => {
			if (!this.inputEventsActive) {
				return;
			}
			this.wheelListeners.forEach((handler) => handler(event));
		});

		this.clickListeners = [];
		let startX, startY;
		this.mouseDownListeners.push((event) => {
			startX = event.offsetX;
			startY = event.offsetY;
		});
		this.mouseUpListeners.push((event) => {
			let endX = event.offsetX;
			let endY = event.offsetY;
			let distance = Math.sqrt(Math.pow(Math.abs(startX - endX), 2) + Math.pow(Math.abs(startY - endY), 2));
			if (distance < this.CLICK_MOVE_DISTANCE_GRACE) {
				this.populateMouseEvent(event);
				this.clickListeners.forEach((handler) => handler(event));
			}
		});
	}

	populateMouseEvent(event) {
		event.canvasX = event.offsetX - this.translateX;
		event.canvasY = event.offsetY - this.translateY;
	}

	attachDragListener(onDragStart, onDrag, onDragEnd) {
		this.detatchDragListener();
		this.dragActive = false;
		let exitTriggerActive = false;
		let x, y;

		let dragEndHandler = (endX, endY) => {
			this.dragActive = false;
			exitTriggerActive = false;
			if (onDragEnd) {
				onDragEnd(endX, endY);
			}
		};

		this.onDragStartHandler = (event) => {
			if (this.dragEnabled) {
				x = event.offsetX;
				y = event.offsetY;
				this.dragActive = true;
				if (onDragStart) {
					onDragStart(x, y);
				}
			}
		};
		this.mouseDownListeners.push(this.onDragStartHandler);

		this.onDragHandler = (event) => {
			if (this.dragActive) {
				if (!this.dragEnabled || (event.buttons !== 1 && exitTriggerActive)) {
					dragEndHandler(event.offsetX, event.offsetY);
				} else {
					let changeX = event.offsetX - x;
					let changeY = event.offsetY - y;

					x = event.offsetX;
					y = event.offsetY;
					onDrag(changeX, changeY);
				}
			}
		};
		this.mouseMoveListeners.push(this.onDragHandler);

		this.onDragEndHandler = (event) => {
			if (this.dragActive) {
				dragEndHandler(event.offsetX, event.offsetY);
			}
		};
		this.mouseUpListeners.push(this.onDragEndHandler);

		this.onDragLeaveHandler = () => {
			if (this.dragActive) {
				exitTriggerActive = true;
			}
		};
		this.mouseLeaveListeners.push(this.onDragLeaveHandler);
	}

	disableDrag() {
		this.dragEnabled = false;
	}

	enableDrag() {
		this.dragEnabled = true;
	}

	detatchDragListener() {
		this.mouseDownListeners = this.mouseDownListeners.filter((handler) => handler !== this.onDragStartHandler);
		this.onDragStartHandler = null;
		this.mouseMoveListeners = this.mouseMoveListeners.filter((handler) => handler !== this.onDragHandler);
		this.onDragHandler = null;
		this.mouseUpListeners = this.mouseUpListeners.filter((handler) => handler !== this.onDragEndHandler);
		this.onDragEndHandler = null;
		this.mouseLeaveListeners = this.mouseLeaveListeners.filter((handler) => handler !== this.onDragLeaveHandler);
		this.onDragLeaveHandler = null;
		this.dragActive = false;
	}

	updateCanvasSize(skipRedraw) {
		this.width = this.$canvas.width();
		this.height = this.$canvas.height();
		this.$canvas.attr("height", this.height).attr("width", this.width);

		this.ctx.restore();
		this.translateX = 0;
		this.translateY = 0;

		this.translateToDefault();

		this.ctx.save();

		this.updateContent();
		if (!skipRedraw) {
			this.redraw(0);
		}
	}

	updateTranslate(x, y) {
		if (this.horiMinDragLimit && this.horiMinDragLimit > x) {
			x = this.horiMinDragLimit;
		} else if (this.horiMaxDragLimit && this.horiMaxDragLimit < x) {
			x = this.horiMaxDragLimit;
		}
		if (this.vertMinDragLimit && this.vertMinDragLimit > y) {
			y = this.vertMinDragLimit;
		} else if (this.vertMaxDragLimit && this.vertMaxDragLimit < y) {
			y = this.vertMaxDragLimit;
		}

		let changeX = x - this.translateX;
		let changeY = y - this.translateY;
		this.translateX = x;
		this.translateY = y;
		this.ctx.translate(changeX, changeY);

		this.translateChangeListeners.forEach((handler) => handler(x, y));
	}

	calculateDefaultTranslate() {
		return { x: 0, y: 0 };
	}

	translateToDefault() {
		let { x, y } = this.calculateDefaultTranslate();
		this.updateTranslate(x, y);
	}

	updateContent() {
		//Do nothing by default
	}

	clearCanvas() {
		let x = -1 * this.translateX;
		let y = -1 * this.translateY;
		let width = this.width;
		let height = this.height;
		if (this.scale !== 1) {
			x = x * (1 / this.scale);
			y = y * (1 / this.scale);
			width = width * (1 / this.scale);
			height = height * (1 / this.scale);
		}
		this.ctx.clearRect(x, y, width, height);
	}

	redraw(deltaTimeSeconds) {
		this.ctx.save();
		this.ctx.scale(this.scale, this.scale);
		this.clearCanvas();
		this.content.forEach((canvasContent) => canvasContent.draw(deltaTimeSeconds));
		this.ctx.restore();
	}

	setDragLimits(horiMin, horiMax, vertMin, vertMax, grazeSize = 0) {
		this.horiMinDragLimit = horiMin;
		this.horiMaxDragLimit = horiMax;
		this.vertMinDragLimit = vertMin - grazeSize;
		this.vertMaxDragLimit = vertMax + grazeSize;
	}

	calculateDragMinMaxValues(minSize, maxSize, defaultCord, grazeSize, tileSize, sideSize) {
		let min = 0 - maxSize + grazeSize + tileSize;
		let max = sideSize + minSize - grazeSize - tileSize;
		return { min, max };
	}

	addTranslateChangeListener(handler) {
		this.translateChangeListeners.push(handler);
	}

	attachMouseMoveListener(handler) {
		this.mouseMoveListeners.push(handler);
	}

	setClickable(on) {
		if (on) {
			this.$canvas.addClass("clickAble");
		} else {
			this.$canvas.removeClass("clickAble");
		}
	}

	attachClickListener(handler) {
		this.clickListeners.push(handler);
	}

	attachWheelistener(handler) {
		this.wheelListeners.push(handler);
	}

	attachMouseLeavelistener(handler) {
		this.mouseLeaveListeners.push(handler);
	}
}
AnimationCanvas.prototype.CLICK_MOVE_DISTANCE_GRACE = 30;

class AnimationCanvasCenter extends AnimationCanvas {
	constructor($canvas) {
		super($canvas);
	}

	calculateDefaultTranslate() {
		return { x: this.width / 2, y: this.height / 2 };
	}
}

class BackgroundImageCanvas extends BaseCanvas {
	constructor($canvas) {
		super($canvas);
		this.currentImage;
	}

	displayImage(image, force) {
		if (this.currentImage !== image || force) {
			this.clearCanvas();
			this.currentImage = image;
			let imageHeight = image.height;
			let imageWidth = image.width;

			let heightRatio = this.height / imageHeight;
			let widthRatio = this.width / imageWidth;

			let targetRatio = heightRatio > widthRatio ? heightRatio : widthRatio;

			let targetHeight = image.height * targetRatio;
			let targetWidth = image.width * widthRatio;

			let xOffset = ((targetWidth - this.width) / 2) * -1;
			let yOffset = ((targetHeight - this.height) / 2) * -1;

			this.ctx.save();

			this.ctx.drawImage(image, xOffset, yOffset, targetWidth, targetHeight);

			this.ctx.restore();
		}
	}

	reset() {
		this.currentImage = null;
		this.clearCanvas();
	}

	redraw() {
		if (this.currentImage) {
			this.displayImage(this.currentImage, true);
		}
	}

	updateContent() {
		//Do nothing by default
	}
}

BackgroundImageCanvas.prototype.BACKGROUND_DARKEN_PERCENT = 0.2;
