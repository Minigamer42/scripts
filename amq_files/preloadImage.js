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
        $lasyOffsetParent = null
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

        if (!noPreload) {
            this.$img.attr("src", this.SPINNER_IMAGE.src).addClass("imagePreloading");
        }

        this.img;

        if (triggerLoad) {
            this.load();
        }

        if (this.$lasyLoadContainer) {
            this.$lasyLoadContainer.on("ps-scroll-y", this.lazyLoadEvent.bind(this));
            this.lazyLoadEvent();
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
            this.$lasyLoadContainer.off("ps-scroll-y", this.lazyLoadEvent.bind(this));
        }
    }

    lazyLoadEvent() {
        if (this.$img.is(":visible")) {
            let $offSetElement = this.$lasyOffsetParent ? this.$lasyOffsetParent : this.$img;
            let topOffset = this.strictLazy ? $offSetElement.position().top : $offSetElement.offset().top;
            if (topOffset + this.$img.height() <= 0) {
                return;
            }
            let $targetContainer = this.strictLazy ? this.$lasyLoadContainer : $(document);
            if (topOffset > $targetContainer.height()) {
                return;
            }
            this.load();
        }
    }

    cancel() {
        if (this.img) {
            this.img.onload = () => {
            };
        }
        if (this.$lasyLoadContainer) {
            this.$lasyLoadContainer.off("ps-scroll-y", this.lazyLoadEvent.bind(this));
        }
    }
}

PreloadImage.prototype.SPINNER_IMAGE = new Image();
PreloadImage.prototype.SPINNER_IMAGE.src = "/img/ui/spinner.svg";
