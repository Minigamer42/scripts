"use strict";
/*exported spriteSheetBuffer*/

class SpriteSheetBuffer {
	constructor() {
		this.spriteSheets = {};
	}

	get maxSize() {
		return this.SPRITE_SIZES[this.SPRITE_SIZES.length - 1];
	}

	loadSheet(name, targetSize) {
		let size = this.getSizeFromTargetSize(targetSize);
		if (this.spriteSheets[name] && this.spriteSheets[name][size]) {
			//Already loaded
			return;
		}
		if (!this.spriteSheets[name]) {
			this.spriteSheets[name] = {};
		}

		let src = cdnFormater.newNexusSpriteSheetSrc(name, size * this.SPRITE_SHEET_COL_COUNT);

		let bufferName = name + size;

		imageBuffer.setupImageInBuffer(this.BUFFER_CATEGORY, bufferName, src, true);

		let bufferedImage = imageBuffer.getImageBuffer(this.BUFFER_CATEGORY, bufferName);

		this.spriteSheets[name][size] = new SpriteSheet(
			bufferedImage,
			size,
			this.SPRITE_SHEET_COL_COUNT,
			this.SPRITE_SHEET_ROW_COUNT
		);
	}

	loadAttackVFXSheet(name) {
		let totalWidth = $( document ).width();
		let targetWidth = (totalWidth / 4) * 0.9;
		this.loadSheet(name, targetWidth);
	}

	getSpriteSheet(name, targetSize) {
		if (!this.spriteSheets[name]) {
			return null;
		}

		let size = this.getSizeFromTargetSize(targetSize);

		if (this.spriteSheets[name][size] && this.spriteSheets[name][size].loaded) {
			return this.spriteSheets[name][size];
		}

		let backupSpriteSize = this.SPRITE_SIZES.filter((spriteSize) => spriteSize !== size)
			.sort((a, b) => b - a)
			.find((spriteSize) => this.spriteSheets[name][spriteSize] && this.spriteSheets[name][spriteSize].loaded);

		if (backupSpriteSize) {
			return this.spriteSheets[name][backupSpriteSize];
		} else {
			return null;
		}
	}

	getSizeFromTargetSize(targetSize) {
		return targetSize >= this.maxSize ? this.maxSize : this.SPRITE_SIZES.find((size) => size >= targetSize);
	}
}
SpriteSheetBuffer.prototype.SPRITE_SIZES = [128, 256, 512];
SpriteSheetBuffer.prototype.SPRITE_SHEET_ROW_COUNT = 8;
SpriteSheetBuffer.prototype.SPRITE_SHEET_COL_COUNT = 8;
SpriteSheetBuffer.prototype.BUFFER_CATEGORY = "nexusDungeonSpriteMaps";

var spriteSheetBuffer = new SpriteSheetBuffer();
