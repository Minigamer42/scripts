'use stict';

class QuizAvatarAssetHandler {
	constructor() {
		this.assetMap = {};
	}

	loadAssets(assetNameList) {
		assetNameList.forEach(assetName => {
			if(!this.assetMap[assetName]) {
				let img = new Image();
				img.sizes = this.TARGET_SIZE;
				img.srcset = cdnFormater.newNexusAvatarOverlaySrcSet(assetName);
				img.src = cdnFormater.newNexusAvatarOverlaySrcSet(assetName);
				this.assetMap[assetName] = img;
			}
		});
	}

	getAssetSrcInfo(assetName) {
		return {
			srcset: this.assetMap[assetName].srcset,
			src: this.assetMap[assetName].src
		};
	}
}
QuizAvatarAssetHandler.prototype.TARGET_SIZE = "12vw";
