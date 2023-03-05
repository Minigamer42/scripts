"use strict";
/*exported NexusCityWorkshopAvatarSelector*/

class NexusCityWorkshopAvatarSelector extends NexusCityAvatarSelector {
	constructor(window) {
		super(
			window,
			window.$window.find("#ncwwLeftAvatarSelectorContainer"),
			window.$window.find("#ncwwAvatarSelectorRightColumn"),
			window.$window.find("#ncwwSelectAvatarTab"),
			new NexusCityWorkshopAvatarSelectorPreview(window.$window.find("#ncwwSelectorAvatarPreviewContainer")),
			NexusCityWorkshopAvatarEntry,
			(avatarEntry) => {
				window.displayRuneSetup(avatarEntry.avatarInfo);
			},
			[
				{
					elementIdentifier: "#ncwwEmptySlotsSortFilterContainer",
					triggerCheckFunction: (a, b) => a.emptyRuneSlotCount !== b.emptyRuneSlotCount,
					compareFunction: (a, b) => a.emptyRuneSlotCount - b.emptyRuneSlotCount,
				},
			]
		);

		this.$avatarSelectionContainer.perfectScrollbar({
			suppressScrollX: true,
		});
	}

	updateAvatarRunes(avatarId, runeInfo, emptyRuneSlotCount) {
		this.avatarEntries[avatarId].runeInfo = runeInfo;
		this.avatarEntries[avatarId].emptyRuneSlotCount = emptyRuneSlotCount;
	}
}

class NexusCityWorkshopAvatarEntry extends NexusCityAvatarEntry {
	constructor(
		avatarInfo,
		$container,
		hoverCallback,
		clickCallback
	) {
		super(avatarInfo,
			$container,
			hoverCallback,
			clickCallback);

		this.emptyRuneSlotCount = avatarInfo.emptyRuneSlots;
	}

	get avatarInfo() {
		let info = super.avatarInfo;
		info.emptyRuneSlotCount = this.emptyRuneSlotCount;
		
		return info;
	}

	get emptyRuneSlotCount() {
		return this._emptyRuneSlotCount;
	}

	set emptyRuneSlotCount(newValue) {
		this._emptyRuneSlotCount = newValue;
		if (newValue === 0) {
			this.$emptyRuneSlotCounter.addClass("hide");
		} else {
			this.$emptyRuneSlotCounter.text(newValue);
			this.$emptyRuneSlotCounter.removeClass("hide");
		}
	}
}

class NexusCityWorkshopAvatarSelectorPreview {
	constructor($container) {
		this.$container = $container;
		this.$img = $container.find("#ncwwSelectorAvatarPreviewImage");
		this.$name = $container.find("#ncwwSelectorAvatarPreviewName");

		this.imagePreload;
	}

	reset() {
		this.$img.attr("src", "").attr("srcset", "").attr("sizes", "");
		this.$name.text("Avatar");
		this.$container.css("background-image", "");
	}

	displayAvatar(avatarEntry) {
		if (this.imagePreload) {
			this.imagePreload.cancel();
		}

		this.$img.addClass("hide");
		this.$img.width(); //Force dom reload before displaying image
		this.$img.removeClass("sizeMod20 sizeMod0 sizeMod51").addClass(avatarEntry.sizeModClass);
		this.imagePreload = new PreloadImage(this.$img, avatarEntry.src, avatarEntry.srcSet, true, "250px", () => {
			this.$img.removeClass("hide");
			this.$name.text(avatarEntry.name);
		});

		this.$container.css("background-image", `url(${avatarEntry.backgroundSrc})`);
	}
}
