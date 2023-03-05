"use strict";

class NexusCanvasTile extends AnimationRendorElement {
	constructor(ctx, x, y, sideHeight, incomingConDirections, genre, typeId) {
		super(ctx, x, y, new RGB(68, 151, 234), 500);

		this.sideHeight = sideHeight;
		this.genre = genre;
		this.typeId = typeId;
		this.visisted = false;
		this.disabled = false;

		this.connectionIncomingDirections = incomingConDirections;
		this.traversIncomingDirections = {};
		this.disabledIncomingDirection = {};

		let extendMinPercent = this.SIDE_CONNECTION_EXTEND_DISTANCE_MIN_PERCENT;
		let extendMaxPercent = this.SIDE_CONNECTION_EXTEND_DISTANCE_MAX_PERCENT;

		this.leftExtendedDistancePercent = extendMinPercent + Math.random() * (extendMaxPercent - extendMinPercent);
		this.rightExtendedDistancePercent = extendMinPercent + Math.random() * (extendMaxPercent - extendMinPercent);
	}

	get glowVersion() {
		return false;
	}

	get bufferSize() {
		return this.SHADOW_BLUR;
	}

	get sideWidth() {
		return this.sideHeight / 1.5;
	}

	get tileSpacingHeight() {
		return this.sideHeight / 1.5;
	}

	get tileSpacingWidth() {
		return this.sideWidth;
	}

	get circleIntersectionDiameter() {
		return this.sideWidth / 2;
	}

	get downHeight() {
		return this.sideHeight - (this.circleIntersectionDiameter * 0.5 * this.sideHeight) / this.sideWidth;
	}

	get downWidth() {
		return this.sideWidth - this.circleIntersectionDiameter * 0.5;
	}

	get circleBufferSize() {
		return this.lineWidth / 2;
	}

	get outerHeight() {
		return (
			this.sideHeight +
			this.downHeight +
			this.circleBufferSize +
			this.circleIntersectionDiameter +
			this.tileSpacingHeight
		);
	}

	get outerWidth() {
		return this.sideWidth * 2 + this.tileSpacingWidth * 2;
	}

	get iconSize() {
		return this.sideWidth * 1.25;
	}

	get lineWidth() {
		if(this.sideHeight < this.STANDARD_TILE_SIDE_HEIGH) {
			return this.SMALL_SIDE_WIDTH;
		} else {
			return this.STANDARD_LINE_WIDTH;
		}
	}

	render() {
		this.renderCanvas.clearCanvas();
		let ctx = this.renderCanvas.ctx;
		ctx.save();
		
		if (this.disabled) {
			ctx.globalAlpha = this.DISABLED_ALPHA;
		}

		ctx.lineWidth = this.lineWidth;
		ctx.shadowBlur = this.SHADOW_BLUR;
		ctx.shadowColor = this.ZONE_COLORS[this.genre].GLOW.string;
		ctx.fillStyle = this.ZONE_COLORS[this.genre].FILL.string;

		this.drawShape(ctx, this.glowVersion, this.connectionIncomingDirections);

		ctx.lineWidth = 2;
		ctx.shadowBlur = 0;
		ctx.strokeStyle = this.VISITED_HIGHLIHT_COLOR.string;

		if (!this.glowVersion && this.visisted) {
			ctx.shadowBlur = this.VISITED_HIGHLIHT_SHADOW_BLUR;
			ctx.shadowColor = this.VISITED_HIGHLIHT_SHADOW_COLOR.string;
			this.drawShape(ctx, true, this.traversIncomingDirections);
		}

		ctx.restore();
	}

	drawShape(ctx, onlyLines, incomingDirections) {
		let height = this.sideHeight;
		let width = this.sideWidth;
		let circleIntersectionDiameter = this.circleIntersectionDiameter;
		let downHeight = this.downHeight;
		let downWidth = this.downWidth;

		let buffer = this.bufferSize;
		let circleBuffer = this.circleBufferSize;

		ctx.beginPath();

		//Start bottom left circle
		let currentX = this.canvasWidth / 2 - width + downWidth;
		let currentY = 0 + height + downHeight + buffer;

		ctx.moveTo(currentX, currentY);

		// //Line to left edge
		currentX -= downWidth;
		currentY -= downHeight;

		ctx.lineTo(currentX, currentY);

		//Line to top edge
		currentX += width;
		currentY -= height;

		ctx.lineTo(currentX, currentY);

		//Line to right edge
		currentX += width;
		currentY += height;

		ctx.lineTo(currentX, currentY);

		//Line to bottom right edge
		currentX -= downWidth;
		currentY += downHeight;

		ctx.lineTo(currentX, currentY);

		//Circle Part
		let circleRadius = circleIntersectionDiameter / (2 * Math.sin(Math.PI / 4));
		let circleStartChange = Math.sin(Math.PI / 4) * circleRadius;

		currentX -= circleStartChange;
		currentY += circleStartChange;

		ctx.arc(currentX, currentY, circleRadius, -Math.PI / 4, (-Math.PI * 3) / 4, true);

		if (!onlyLines) {
			ctx.fill();
		}

		ctx.closePath();

		//Circle Below
		currentX = this.canvasWidth / 2;
		currentY = height + downHeight + buffer + circleBuffer;

		ctx.moveTo(currentX, currentY);

		currentY += circleIntersectionDiameter / 2;

		ctx.arc(currentX, currentY, circleIntersectionDiameter / 2, -Math.PI / 2, Math.PI * 1.5);

		this.doStroke(ctx);

		//Connections
		let circleCenterX = currentX;
		let circleCenterY = currentY;

		if (incomingDirections.up) {
			ctx.save();
			ctx.beginPath();
			if (this.disabledIncomingDirection.up) {
				ctx.globalAlpha = this.DISABLED_ALPHA;
			}

			currentY += circleIntersectionDiameter / 2;
			ctx.moveTo(currentX, currentY);

			currentY += this.tileSpacingHeight;

			ctx.lineTo(currentX, currentY);

			currentX = circleCenterX;
			currentY = circleCenterY;

			this.doStroke(ctx);

			ctx.restore();
		}

		if (incomingDirections.left) {
			ctx.save();
			ctx.beginPath();
			if (this.disabledIncomingDirection.left) {
				ctx.globalAlpha = this.DISABLED_ALPHA;
			}

			let {
				circleVectorX,
				circleVectorY,
				firstHoriDistance,
				firstVertDistance,
				lastVertDistance,
				lastHoriDistance,
				extraHoriTravelDistance,
			} = this.calculateSideConnectionSizes(this.rightExtendedDistancePercent);

			currentX += circleVectorX;
			currentY += circleVectorY;

			ctx.moveTo(currentX, currentY);

			currentX += firstHoriDistance;
			currentY += firstVertDistance;

			ctx.lineTo(currentX, currentY);

			currentX += extraHoriTravelDistance;

			ctx.lineTo(currentX, currentY);

			currentX += lastHoriDistance;
			currentY += lastVertDistance;

			ctx.lineTo(currentX, currentY);

			currentX = circleCenterX;
			currentY = circleCenterY;

			this.doStroke(ctx);

			ctx.restore();
		}

		if (incomingDirections.right) {
			ctx.save();
			ctx.beginPath();
			if (this.disabledIncomingDirection.right) {
				ctx.globalAlpha = this.DISABLED_ALPHA;
			}

			let {
				circleVectorX,
				circleVectorY,
				firstHoriDistance,
				firstVertDistance,
				lastVertDistance,
				lastHoriDistance,
				extraHoriTravelDistance,
			} = this.calculateSideConnectionSizes(this.leftExtendedDistancePercent);

			currentX -= circleVectorX;
			currentY += circleVectorY;

			ctx.moveTo(currentX, currentY);

			currentX -= firstHoriDistance;
			currentY += firstVertDistance;

			ctx.lineTo(currentX, currentY);

			currentX -= extraHoriTravelDistance;

			ctx.lineTo(currentX, currentY);

			currentX -= lastHoriDistance;
			currentY += lastVertDistance;

			ctx.lineTo(currentX, currentY);

			currentX = circleCenterX;
			currentY = circleCenterY;

			this.doStroke(ctx);

			ctx.restore();
		}

		//Draw Icon
		if (!onlyLines) {
			ctx.save();
			currentX = this.canvasWidth / 2 - this.iconSize / 2;
			currentY = height + buffer - this.iconSize / 2;

			ctx.globalAlpha = this.ICON_TRANSPARANCY;
			let img = imageBuffer.getImage("nexusTileIcons", this.TYPE_IMAGE_NAMES[this.typeId]);
			ctx.drawImage(img, currentX, currentY, this.iconSize, this.iconSize);
			ctx.restore();
		}
	}

	doStroke(ctx) {
		if (this.glowVersion) {
			ctx.save();
			ctx.shadowBlur = 10;
			ctx.shadowColor = "RGB(255, 255, 255)";
			for (let i = 0; i < 5; i++) {
				ctx.stroke();
			}
			ctx.shadowBlur = 20;
			for (let i = 0; i < 2; i++) {
				ctx.stroke();
			}
			ctx.restore();
			for (let i = 0; i < 3; i++) {
				ctx.stroke();
			}
		} else {
			ctx.stroke();
		}
	}

	calculateSideConnectionSizes(horiShiftPercent) {
		let circleVectorX = (this.circleIntersectionDiameter / 2) * this.SIDE_BASE_ANGLE_VECTOR_X;
		let circleVectorY = (this.circleIntersectionDiameter / 2) * this.SIDE_BASE_ANGLE_VECTOR_Y;

		let horiDistanceToTravel =
			this.sideWidth * 2 +
			this.tileSpacingWidth * 2 -
			circleVectorX -
			Math.sin(this.SIDE_CONNECTION_ANGLE) * this.SIDE_CONNECTION_ENDPOINT_SIDE_DROP;
		let vertDistanceToTravel =
			this.tileSpacingHeight +
			this.circleIntersectionDiameter / 2 -
			circleVectorY +
			Math.cos(this.SIDE_CONNECTION_ANGLE) * this.SIDE_CONNECTION_ENDPOINT_SIDE_DROP;

		let extraHoriTravelDistance = horiDistanceToTravel - vertDistanceToTravel * Math.tan(this.SIDE_CONNECTION_ANGLE);

		let firstHoriDistance = horiDistanceToTravel * horiShiftPercent;
		let firstVertDistance = firstHoriDistance / Math.tan(this.SIDE_CONNECTION_ANGLE);

		let lastVertDistance = vertDistanceToTravel - firstVertDistance;
		let lastHoriDistance = horiDistanceToTravel - firstHoriDistance - extraHoriTravelDistance;

		return {
			circleVectorX,
			circleVectorY,
			firstHoriDistance,
			firstVertDistance,
			lastVertDistance,
			lastHoriDistance,
			extraHoriTravelDistance,
		};
	}
}
NexusCanvasTile.prototype.STANDARD_TILE_SIDE_HEIGH = 60;
NexusCanvasTile.prototype.STANDARD_LINE_WIDTH = 6;
NexusCanvasTile.prototype.SMALL_SIDE_WIDTH = 3;
NexusCanvasTile.prototype.SHADOW_BLUR = 20;
NexusCanvasTile.prototype.SIDE_CONNECTION_ANGLE = Math.atan(100 / 150) + 0.11;
NexusCanvasTile.prototype.SIDE_BASE_ANGLE_VECTOR_X = Math.sin(NexusCanvasTile.prototype.SIDE_CONNECTION_ANGLE);
NexusCanvasTile.prototype.SIDE_BASE_ANGLE_VECTOR_Y = Math.cos(NexusCanvasTile.prototype.SIDE_CONNECTION_ANGLE);
NexusCanvasTile.prototype.SIDE_CONNECTION_EXTEND_DISTANCE_MIN_PERCENT = 0.1;
NexusCanvasTile.prototype.SIDE_CONNECTION_EXTEND_DISTANCE_MAX_PERCENT = 0.2;
NexusCanvasTile.prototype.SIDE_CONNECTION_ENDPOINT_SIDE_DROP = 20; //px
NexusCanvasTile.prototype.ICON_TRANSPARANCY = 0.6;
NexusCanvasTile.prototype.DISABLED_ALPHA = 0.35;
NexusCanvasTile.prototype.VISITED_HIGHLIHT_COLOR = new RGB(200, 255, 255, 1);
NexusCanvasTile.prototype.VISITED_HIGHLIHT_SHADOW_COLOR = new RGB(255, 255, 255, 1);
NexusCanvasTile.prototype.VISITED_HIGHLIHT_SHADOW_BLUR = 5;
NexusCanvasTile.prototype.ZONE_COLORS = {
	standard: {
		FILL: new RGB(0, 106, 183, 0.3),
		GLOW: new RGB(68, 151, 234, 1),
	},
	comedy: {
		FILL: new RGB(255, 153, 0, 0.3),
		GLOW: new RGB(255, 153, 0, 1),
	},
	action: {
		FILL: new RGB(237, 61, 18, 0.3),
		GLOW: new RGB(237, 61, 18, 1),
	},
	adventure: {
		FILL: new RGB(30, 197, 106, 0.3),
		GLOW: new RGB(30, 197, 106, 1),
	},
	fantasy: {
		FILL: new RGB(199, 58, 221, 0.3),
		GLOW: new RGB(199, 58, 221, 1),
	},
	drama: {
		FILL: new RGB(233, 62, 12, 0.3),
		GLOW: new RGB(233, 62, 12, 1),
	},
	"sci-fi": {
		FILL: new RGB(56, 102, 138, 0.3),
		GLOW: new RGB(56, 102, 138, 1),
	},
	romance: {
		FILL: new RGB(249, 6, 67, 0.3),
		GLOW: new RGB(249, 6, 67, 1),
	},
	"slice of life": {
		FILL: new RGB(255, 207, 4, 0.3),
		GLOW: new RGB(255, 207, 4, 1),
	},
	supernatural: {
		FILL: new RGB(158, 40, 167, 0.3),
		GLOW: new RGB(158, 40, 167, 1),
	},
	mecha: {
		FILL: new RGB(109, 152, 185, 0.3),
		GLOW: new RGB(109, 152, 185, 1),
	},
	ecchi: {
		FILL: new RGB(255, 2, 139, 0.3),
		GLOW: new RGB(255, 2, 139, 1),
	},
	mystery: {
		FILL: new RGB(111, 23, 132, 0.3),
		GLOW: new RGB(111, 23, 132, 1),
	},
	sports: {
		FILL: new RGB(17, 209, 85, 0.3),
		GLOW: new RGB(17, 209, 85, 1),
	},
	music: {
		FILL: new RGB(250, 211, 0, 0.3),
		GLOW: new RGB(250, 211, 0, 1),
	},
	horror: {
		FILL: new RGB(31, 0, 36, 0.3),
		GLOW: new RGB(31, 0, 36, 1),
	},
	psychological: {
		FILL: new RGB(73, 0, 83, 0.3),
		GLOW: new RGB(73, 0, 83, 1),
	},
	"mahou shoujo": {
		FILL: new RGB(0, 228, 255, 0.3),
		GLOW: new RGB(0, 228, 255, 1),
	},
	thriller: {
		FILL: new RGB(96, 89, 99, 0.3),
		GLOW: new RGB(96, 89, 99, 1),
	},
};
NexusCanvasTile.prototype.TYPE_IMAGE_NAMES = {
	1: "entrance",
	2: "boss",
	3: "enemy",
	4: "event",
	5: "store",
};

class NexusCanvasGlowTile extends NexusCanvasTile {
	constructor(ctx, x, y, sideHeight, incomingConDirections, genre, typeId) {
		super(ctx, x, y, sideHeight, incomingConDirections, genre, typeId);
		this.alphaState = this.ALPHA_MIN;
		this.direction = 1; //1 or -1
		this.active = false;
	}

	get glowVersion() {
		return true;
	}

	draw(deltaTimeSeconds) {
		if (!this.active) {
			return;
		}

		this.updateAlpha(deltaTimeSeconds);

		this.ctx.save();

		this.ctx.globalAlpha = this.alphaState;

		super.draw();

		this.ctx.restore();
	}

	updateAlpha(deltaTimeSeconds) {
		let alphaChange = this.CYCLE_SPEED * deltaTimeSeconds;
		this.alphaState += alphaChange * this.direction;
		if (this.alphaState > this.ALPHA_MAX) {
			this.alphaState = this.ALPHA_MAX;
			this.direction = -1;
		} else if (this.alphaState < this.ALPHA_MIN) {
			this.alphaState = this.ALPHA_MIN;
			this.direction = 1;
		}
	}
}

NexusCanvasGlowTile.prototype.ALPHA_MIN = 0.4;
NexusCanvasGlowTile.prototype.ALPHA_MAX = 1;
NexusCanvasGlowTile.prototype.CYCLE_SPEED = 0.5; //alpha per second

class NexusCanvasSelectHightlightTile extends NexusCanvasTile {
	constructor(ctx, x, y, sideHeight, incomingConDirections, genre, typeId) {
		super(ctx, x, y, sideHeight, incomingConDirections, genre, typeId);
	}

	render() {
		this.renderCanvas.clearCanvas();
		let ctx = this.renderCanvas.ctx;
		ctx.save();

		ctx.shadowColor = this.ZONE_COLORS[this.genre].GLOW.string;
		ctx.fillStyle = this.ZONE_COLORS[this.genre].FILL.string;

		ctx.lineWidth = 2;
		ctx.strokeStyle = this.VISITED_HIGHLIHT_COLOR.string;
		ctx.shadowBlur = this.VISITED_HIGHLIHT_SHADOW_BLUR;
		this.drawShape(ctx, true, this.traversIncomingDirections);

		ctx.restore();
	}

}

class NexusCanvasSelectAnimationTile extends NexusCanvasTile {
	constructor(ctx, x, y, sideHeight, incomingConDirections, genre, typeId) {
		super(ctx, x, y, sideHeight, incomingConDirections, genre, typeId);

		let renderCtx = this.renderCanvas.ctx;
		this.highlightTile = new NexusCanvasSelectHightlightTile(renderCtx, 0, 0, sideHeight, incomingConDirections, genre, typeId);
		
		this.active = false;
		this.clearPercent = this.START_CLEAR_PERCENT;
	}

	updateExtendDistancePercent(leftExtendedDistancePercent, rightExtendedDistancePercent) {
		this.highlightTile.leftExtendedDistancePercent = leftExtendedDistancePercent;
		this.highlightTile.rightExtendedDistancePercent = rightExtendedDistancePercent;
	}

	render() {
		this.highlightTile.render();
	}

	draw(deltaTimeSeconds) {
		if(!this.active) {
			return;
		}
		this.renderCanvas.clearCanvas();
		this.highlightTile.draw();
		this.clearPercent -=  this.START_CLEAR_PERCENT * (deltaTimeSeconds / this.ANIMATION_TIME);
		if(this.clearPercent < 0) {
			this.clearPercent = 0;
		}
		let clearHeight = this.canvasHeight * this.clearPercent;
		this.renderCanvas.ctx.clearRect(0, 0, this.canvasWidth, clearHeight);
		super.draw();
	}
}
NexusCanvasSelectAnimationTile.prototype.ANIMATION_TIME = 0.6; //seconds
NexusCanvasSelectAnimationTile.prototype.START_CLEAR_PERCENT = 0.65; //seconds