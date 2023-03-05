"use strict";

class PreloadImage {
	constructor(
		$img,
		src,
		srcset,
		triggerLoad = true,
		defaultSizes = null,
		onloadCallback = null,
		noPreload = false,
		$lasyLoadContainer = null,
		strictLazy = false,
		$lasyOffsetParent = null,
		horiLasyLoad = false,
		delayLasyLoad = false,
		lasyLoadOffsetMod = 0
	) {
		this.$img = $img;
		this.src = src;
		this.srcset = srcset;
		this.defaultSizes = defaultSizes;
		this.onloadCallback = onloadCallback;
		this.loadStarted = false;
		this.$lasyLoadContainer = $lasyLoadContainer;
		this.strictLazy = strictLazy;
		this.$lasyOffsetParent = $lasyOffsetParent;
		this.horiLasyLoad = horiLasyLoad;
		this.lasyLoadOffsetMod = lasyLoadOffsetMod;

		if (!noPreload) {
			this.$img.attr("src", this.SPINNER_IMAGE.src).addClass("imagePreloading");
			this.$img.addClass("loading");
		}

		this.img;

		if (triggerLoad) {
			this.load();
		}

		this.lazyLoadCallback = this.lazyLoadEvent.bind(this);

		if (this.$lasyLoadContainer && !delayLasyLoad) {
			this.enableLazyLoadCheck();
		}
	}

	load() {
		if (this.loadStarted) {
			return;
		}
		this.loadStarted = true;
		let img = new Image();

		img.onload = () => {
			img.onload = null;
			this.$img.removeClass("loading");
			if (this.srcset) {
				this.$img.attr("srcset", img.srcset);
			}
			this.$img.attr("src", img.src).removeClass("imagePreloading");

			if (this.onloadCallback) {
				this.onloadCallback();
			}
		};

		if (this.srcset) {
			if (this.defaultSizes) {
				this.$img.attr("sizes", this.defaultSizes);
			}
			let sizes = this.$img.attr("sizes");
			img.sizes = sizes;
			img.srcset = this.srcset;
		}

		img.src = this.src;
		this.img = img;

		if (this.$lasyLoadContainer) {
			if(this.horiLasyLoad) {
				this.$lasyLoadContainer.off("ps-scroll-x", this.lazyLoadCallback);
			} else {
				this.$lasyLoadContainer.off("ps-scroll-y", this.lazyLoadCallback);
			}
		}
	}

	enableLazyLoadCheck() {
		if(this.horiLasyLoad) {
			this.$lasyLoadContainer.on("ps-scroll-x", this.lazyLoadCallback);
		} else {
			this.$lasyLoadContainer.on("ps-scroll-y", this.lazyLoadCallback);
		}
		this.lazyLoadEvent();
	}

	lazyLoadEvent() {
		if(this.$img.is(":visible") && !this.loadStarted) {
			let $offSetElement = this.$lasyOffsetParent ? this.$lasyOffsetParent : this.$img;
			let $targetContainer = this.strictLazy ? $(document) : this.$lasyLoadContainer;
			if(this.horiLasyLoad) {
				let leftOffset = this.strictLazy ? $offSetElement.offset().left : $offSetElement.position().left;
				leftOffset += this.lasyLoadOffsetMod;
				if(leftOffset + this.$img.width() <= 0) {
					return;
				}
				
				if(leftOffset > $targetContainer.width()) {
					return;
				}
				
			} else {
				let topOffset = this.strictLazy ? $offSetElement.offset().top : $offSetElement.position().top;
				topOffset += this.lasyLoadOffsetMod;
				if (topOffset + this.$img.height() <= 0) {
					return;
				}
				
				if (topOffset > $targetContainer.height()) {
					return;
				}
			}

			this.load();
		}
	}

	cancel() {
		if (this.img) {
			this.img.onload = () => {};
		}
		if (this.$lasyLoadContainer) {
			if(this.horiLasyLoad) {
				this.$lasyLoadContainer.off("ps-scroll-x", this.lazyLoadCallback);
			} else {
				this.$lasyLoadContainer.off("ps-scroll-y", this.lazyLoadCallback);
			}
		}
	}
}

PreloadImage.prototype.SPINNER_IMAGE = new Image();
PreloadImage.prototype.SPINNER_IMAGE.src = "/img/ui/spinner.svg";
