"use strict";
/*exported imageBuffer*/

class ImageBuffer {
	constructor() {
		this.bufferCategoies = {
			nexusTileIcons: new ImageBufferCategory(),
			nexusDungeonBG: new ImageBufferCategory(),
			nexusCityDay: new ImageBufferCategory(),
			nexusDungeonSpriteMaps: new ImageBufferCategory(),
		};
	}

	setupImagesInBuffer(category, infoList) {
		infoList.forEach(({ name, src }) => {
			this.setupImageInBuffer(category, name, src);
		});
	}

	setupImageInBuffer(category, name, src, triggerLoad) {
		this.bufferCategoies[category].addImg(name, src, triggerLoad);
	}

	loadCategory(category) {
		let targetCategory = this.bufferCategoies[category];
		if (!targetCategory.loaded) {
			targetCategory.startLoad();
		}
	}

	waitMultipleCategoryLoad(categoryList, callback) {
		let loadedCount = 0;
		let targetCount = categoryList.length;

		categoryList.forEach((category) =>
			this.waitCategoryLoad(category, () => {
				loadedCount++;
				if (loadedCount >= targetCount) {
					callback();
				}
			})
		);
	}

	waitCategoryLoad(category, callback) {
		let targetCategory = this.bufferCategoies[category];
		if (targetCategory.loaded) {
			callback();
		} else {
			targetCategory.loadFinishCallbacks.push(callback);
			targetCategory.startLoad();
		}
	}

	waitBufferSpecficImages(category, nameList, callback) {
		let targetCategory = this.bufferCategoies[category];

		let loadTarget = 0;
		let loadCount = 0;
		nameList.forEach((name) => {
			let bufferedImage = targetCategory.getBufferedImg(name);
			if(!bufferedImage.loadDone) {
				loadTarget++;
				bufferedImage.addLoadListener(() => {
					loadCount++;
					if(loadCount >= loadTarget) {
						callback();
					}
				});
				bufferedImage.load();
			}
		});

		if(loadTarget === 0) {
			callback();
		}
	}

	getImage(category, name) {
		return this.bufferCategoies[category].getImg(name);
	}

	getImageBuffer(category, name) {
		return this.bufferCategoies[category].getBufferedImg(name);
	}
}

class ImageBufferCategory {
	constructor() {
		this.imageMap = {};
		this.loaded = false;
		this.loadFinishCallbacks = [];
	}

	addImg(name, src, forceLoad) {
		if (!this.imageMap[name]) {
			this.imageMap[name] = new BufferedImage(src, () => {
				this.handelLoadFinished();
			});

			if (forceLoad) {
				this.imageMap[name].load();
			}
		}
	}

	getImg(name) {
		return this.imageMap[name].img;
	}

	getBufferedImg(name) {
		return this.imageMap[name];
	}

	handelLoadFinished() {
		let allLoaded = !Object.values(this.imageMap).some((bufferedImage) => !bufferedImage.loadDone);
		if (allLoaded) {
			this.loadFinishCallbacks.forEach((callback) => callback());
			this.loadFinishCallbacks = [];
			this.loaded = true;
		}
	}

	startLoad() {
		Object.values(this.imageMap).forEach((bufferedImage) => bufferedImage.load());
	}
}

class BufferedImage {
	constructor(src, onloadCallback) {
		this.src = src;
		this.onloadCallback = onloadCallback;
		this.loadStarted = false;
		this.loadDone = false;
		this.img;
		this.onLoadListeners = [];
	}

	load() {
		if (this.loadStarted) {
			return;
		}

		this.loadStarted = true;
		let img = new Image();

		img.onload = () => {
			this.loadDone = true;
			this.onloadCallback();
			this.onLoadListeners.forEach((callback) => callback());
			this.onloadCallback = null;
			this.onLoadListeners = [];
		};

		img.src = this.src;
		this.img = img;
	}

	addLoadListener(callback) {
		this.onLoadListeners.push(callback);
	}
}

var imageBuffer = new ImageBuffer();
