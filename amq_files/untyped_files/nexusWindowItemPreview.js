'use strict';
/*exported NexusWindowItemPreview*/

class NexusWindowItemPreview {
	constructor($window) {
		let $preview = $window.find(".nexusMapWindowPreviewContainerOuter");
		this.$img = $preview.find(".nexusMapWindowPreviewImage");
		this.$title = $preview.find(".ncwStandardInfoContainerHeader");
		this.$text = $preview.find(".ncwStandardInfoContainerContent");

		this.imagePreload;
	}

	displayItem(name, description, imgSrc, imgSrcSet) {
		this.$title.html(name);
		this.$text.html(description);

		if(this.imagePreload) {
			this.imagePreload.cancel();
		}

		this.imagePreload = new PreloadImage(
			this.$img,
			imgSrc,
			imgSrcSet,
			true,
			"40px");
	}

	reset() {
		this.$title.html("");
		this.$text.html("");
		this.$img.attr("src", "");
		this.$img.attr("srcset", "");
	}
}