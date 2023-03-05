"use strict";

class NexusMapTile {
	constructor(
		staticCtx,
		dynamicCtx,
		extraDynamicCtx,
		$iconOverlayContainer,
		row,
		column,
		tileInnerWidth,
		incomingConDirections,
		outgoingConDirections,
		genre,
		typeId
	) {
		this.row = row;
		this.column = column;
		this.tileInnerWidth = tileInnerWidth;
		this.outgoingConDirections = outgoingConDirections;
		this.genre = genre == undefined ? "standard" : genre;
		this.typeId = typeId;

		this.canvasX;
		this.canvasY;

		this.selectable = false;

		this.topTriangleCollider;
		this.bottomTriangleCollider;
		this.centerY;

		this.staticTile = new NexusCanvasTile(
			staticCtx,
			0,
			0,
			this.tileHeight,
			incomingConDirections,
			this.genre,
			typeId
		);

		this.dynamicTile = new NexusCanvasGlowTile(dynamicCtx, 0, 0, this.tileHeight, {}, this.genre, typeId);

		this.selectAnimationTile = new NexusCanvasSelectAnimationTile(
			extraDynamicCtx,
			0,
			0,
			this.tileHeight,
			{},
			this.genre,
			typeId
		);

		this.dynamicTile.leftExtendedDistancePercent = this.staticTile.leftExtendedDistancePercent;
		this.dynamicTile.rightExtendedDistancePercent = this.staticTile.rightExtendedDistancePercent;

		this.selectAnimationTile.updateExtendDistancePercent(
			this.staticTile.leftExtendedDistancePercent,
			this.staticTile.rightExtendedDistancePercent
		);

		this.tileDescription = new NexusTileDescirption(this.typeId, this.genre);
		this.descriptionDisplayed = false;
		this.descriptionHideTimeout;
		this.descriptionDisplayTimeout;

		this.$tileIconRow = $(this.TILE_ICON_ROW_TEMPLATE);
		$iconOverlayContainer.append(this.$tileIconRow);

		this.updateCanvasTilePositoin();
		this.staticTile.render();
		this.dynamicTile.render();
		this.selectAnimationTile.render();
	}

	get tileHeight() {
		return this.tileInnerHeight / 2;
	}

	get tileInnerHeight() {
		return this.tileInnerWidth * 1.5;
	}

	get tileOuterHeight() {
		return this.staticTile.outerHeight;
	}

	get tileOuterWidth() {
		return this.staticTile.outerWidth;
	}

	get outgoingConDirectionList() {
		return Object.keys(this.outgoingConDirections).filter((direction) => this.outgoingConDirections[direction]);
	}

	get tileStandardOffsetX() {
		return this.staticTile.canvasWidth / 2;
	}

	get tileSquareBoundaryX() {
		return this.canvasX + this.tileStandardOffsetX - this.tileOuterWidth / 2;
	}

	updateCanvasTilePositoin() {
		let baseX = (this.column - this.CENTER_COLUMN_NUMBER) * this.tileOuterWidth;

		let newX = baseX - this.tileStandardOffsetX;
		let newY = this.row * this.tileOuterHeight * -1; //Build upwards - negative

		this.canvasX = newX;
		this.canvasY = newY;

		this.staticTile.x = newX;
		this.staticTile.y = newY;

		this.dynamicTile.x = newX;
		this.dynamicTile.y = newY;

		this.selectAnimationTile.x = newX;
		this.selectAnimationTile.y = newY;

		this.buildCollisionTriangels();

		let tileRowYMod = this.tileOuterHeight - this.tileInnerHeight + newY * -1;
		let rileRowLeftMod = this.tileOuterWidth * (this.column - this.CENTER_COLUMN_NUMBER);
		this.$tileIconRow.css("bottom", tileRowYMod);
		this.$tileIconRow.css("left", "calc(50% + " + rileRowLeftMod + "px)");	
	}

	buildCollisionTriangels() {
		let centerX = this.canvasX + this.staticTile.canvasWidth / 2;
		let centerY = this.canvasY + this.staticTile.bufferSize + this.staticTile.sideHeight;

		let leftCord = {
			x: centerX - this.staticTile.sideWidth - this.staticTile.bufferSize,
			y: centerY,
		};
		let rightCord = {
			x: centerX + this.staticTile.sideWidth + this.staticTile.bufferSize,
			y: centerY,
		};
		let topCord = {
			x: centerX,
			y: centerY - this.staticTile.sideHeight - this.staticTile.bufferSize,
		};
		let bottomCord = {
			x: centerX,
			y: centerY + this.staticTile.sideHeight + this.staticTile.bufferSize,
		};

		this.topTriangleCollider = new CollisionShapeTriangle(leftCord, topCord, rightCord);
		this.bottomTriangleCollider = new CollisionShapeTriangle(leftCord, rightCord, bottomCord);
		this.centerY = centerY;
	}

	setSelectable(on, incomingDirection) {
		this.selectable = on;
		if (on) {
			this.showGlow(incomingDirection);
		} else {
			this.disableGlow();
		}
	}

	disableGlow() {
		this.dynamicTile.active = false;
		this.dynamicTile.connectionIncomingDirections = {};
	}

	showGlow(connectionFromDirection) {
		this.dynamicTile.connectionIncomingDirections[connectionFromDirection] = true;
		this.staticTile.traversIncomingDirections[connectionFromDirection] = true;
		this.selectAnimationTile.highlightTile.traversIncomingDirections[connectionFromDirection] = true;
		this.dynamicTile.render();
		this.dynamicTile.active = true;
	}

	setVisited() {
		this.staticTile.visisted = true;
		this.staticTile.render();
	}

	cordinateInTile(x, y) {
		if (y < this.centerY) {
			return this.topTriangleCollider.pointInTriangle(x, y);
		} else {
			return this.bottomTriangleCollider.pointInTriangle(x, y);
		}
	}

	disable() {
		this.staticTile.disabled = true;
		this.staticTile.render();
	}

	disableFromDirection(direction) {
		this.staticTile.disabledIncomingDirection[direction] = true;
		this.staticTile.render();
	}

	mouseOnTile($container, canvasTranslateX, canvasTranslateY) {
		if (this.descriptionDisplayed) {
			clearTimeout(this.descriptionHideTimeout);
		} else if (!this.descriptionDisplayTimeout) {
			this.descriptionDisplayTimeout = setTimeout(() => {
				this.descriptionHideTimeout = null;
				$container.append(this.tileDescription.$body);
				let xPos =
					this.canvasX +
					this.staticTile.canvasWidth / 2 +
					this.staticTile.sideWidth +
					this.staticTile.bufferSize +
					canvasTranslateX;
				let yPos = this.canvasY + this.staticTile.bufferSize + this.staticTile.sideHeight + canvasTranslateY;
				this.tileDescription.display(xPos, yPos);
				this.descriptionDisplayed = true;
			}, this.DESCRIPTION_DELAY_PERIOD);
		}
	}

	runSelectAnimation() {
		this.selectAnimationTile.render();
		this.selectAnimationTile.active = true;
	}

	stopSelectAnimation() {
		this.selectAnimationTile.active = false;
	}

	mouseLeaveTile() {
		clearTimeout(this.descriptionDisplayTimeout);
		this.descriptionDisplayTimeout = null;
		this.descriptionHideTimeout = setTimeout(() => {
			this.hideDescription();
		}, this.DESCRIPTION_GRACE_PERIOD);
	}

	hideDescription() {
		clearTimeout(this.descriptionDisplayTimeout);
		clearTimeout(this.descriptionHideTimeout);
		this.tileDescription.hide();
		this.descriptionDisplayed = false;
		this.descriptionDisplayTimeout = null;
	}

	displayVote(playerVote) {
		playerVote.detach();
		this.$tileIconRow.append(playerVote.$icon);
	}

	updateTileSize(newTileInnerWidth) {
		this.tileInnerWidth = newTileInnerWidth;

		this.staticTile.sideHeight = this.tileHeight;
		this.dynamicTile.sideHeight = this.tileHeight;
		this.selectAnimationTile.sideHeight = this.tileHeight;

		this.updateCanvasTilePositoin();
		this.staticTile.render();
		this.dynamicTile.render();
		this.selectAnimationTile.render();
	}
}
NexusMapTile.prototype.DESCRIPTION_GRACE_PERIOD = 150;
NexusMapTile.prototype.DESCRIPTION_DELAY_PERIOD = 150;
NexusMapTile.prototype.CENTER_COLUMN_NUMBER = 2;
NexusMapTile.prototype.TILE_ICON_ROW_TEMPLATE = '<div class="nexusMapTileIconRow"></div>';
