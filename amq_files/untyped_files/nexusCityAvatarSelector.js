"use strict";
/*exported NexusCityAvatarSelector NexusCityAvatarClearEntry*/

class NexusCityAvatarSelector extends NexusCityWindowTab {
	constructor(
		window,
		$leftContainer,
		$rightContainer,
		$tab,
		selectorPreview,
		avatarEntryClass,
		clickHandler,
		extraOrderFilterInfo = [],
		clearPreviewOnHide = true,
		clearClickHandler = () => {}
	) {
		super(window, $leftContainer, $rightContainer, $tab);

		this.$avatarSelectionContainer = this.$leftContainer.find(".nexusCityAvatarSelecterContainer");

		this.avatarEntries = {};
		this.disabledCharacterIds = {};

		this.avatarEntryClass = avatarEntryClass;
		this.clickHandler = (avatarEntry) => {
			if (this.customSelectionCallback) {
				this.customSelectionCallback(avatarEntry);
			} else {
				clickHandler(avatarEntry);
			}
		};

		this.clearElement = new NexusCityAvatarClearEntry(clearClickHandler);

		this.selectorPreview = selectorPreview;
		this.clearPreviewOnHide = clearPreviewOnHide;

		this.customSelectionCallback = null;

		this.avatarFilter = new NexusCityFilter(
			[
				new NexusCityOrderFilter(
					this.$leftContainer.find(".ncwAvatarNameSortFilterContainer"),
					() => true,
					(a, b) => a.name.localeCompare(b.name),
					() => {
						this.updateAvatarOrder();
					}
				),
				new NexusCityOrderFilter(
					this.$leftContainer.find(".ncwAvatarLevelSortFilterContainer"),
					(a, b) => a.level !== b.level,
					(a, b) => a.level - b.level,
					() => {
						this.updateAvatarOrder();
					}
				),
				...extraOrderFilterInfo.map(({ elementIdentifier, triggerCheckFunction, compareFunction }) => {
					return new NexusCityOrderFilter(
						this.$leftContainer.find(elementIdentifier),
						triggerCheckFunction,
						compareFunction,
						() => {
							this.updateAvatarOrder();
						}
					);
				}),
			],
			(a, b) => {
				if (a.characterId !== b.characterId) {
					return a.characterId - b.characterId;
				} else {
					return a.avatarId - b.avatarId;
				}
			},
			this.$leftContainer.find(".nexusCityFilterSearchInput"),
			() => {
				this.updateAvatarOrder();
			},
			(a, b) => {
				if (a.locked !== b.locked) {
					return a.locked ? 1 : -1;
				} else {
					return 0;
				}
			}
		);

		this.$avatarSelectionContainer.perfectScrollbar({
			suppressScrollX: true,
		});
	}

	get entryList() {
		return Object.values(this.avatarEntries);
	}

	hide(noChangeHighlightTab) {
		super.hide(noChangeHighlightTab);
		if (this.clearPreviewOnHide) {
			this.selectorPreview.reset();
		}
		this.customSelectionCallback = null;
		this.clearElement.detatch();
	}

	reset() {
		Object.values(this.avatarEntries).forEach((entry) => entry.remove());
		this.avatarEntries = {};
		this.disabledCharacterIds = {};
		this.avatarFilter.reset();
		this.selectorPreview.reset();
		this.clearElement.detatch();
	}

	show(noChangeHighlightTab) {
		super.show(noChangeHighlightTab);
		this.updateScroll();
		this.triggerImageLoads();
	}

	updateScroll() {
		this.$avatarSelectionContainer.perfectScrollbar("update");
	}

	triggerImageLoads() {
		Object.values(this.avatarEntries).forEach((entry) => entry.triggerImageLoadCheck());
	}

	displayAvatars(avatarInfoList) {
		Object.values(this.avatarEntries).forEach((entry) => entry.remove());
		this.disabledCharacterIds = {};
		this.addAvatars(avatarInfoList);
	}

	addAvatars(avatarInfoList) {
		avatarInfoList.forEach((avatarInfo) => {
			let entry = new this.avatarEntryClass(
				avatarInfo,
				this.$avatarSelectionContainer,
				(avatarEntry) => {
					this.selectorPreview.displayAvatar(avatarEntry);
				},
				this.clickHandler
			);
			this.avatarEntries[entry.avatarId] = entry;
			if (this.disabledCharacterIds[entry.characterId]) {
				entry.disable();
			}
		});
		this.updateAvatarOrder();
		this.triggerImageLoads();
	}

	displayFirstAvatar() {
		let firstEntry = this.entryList[0];
		if (firstEntry) {
			this.selectorPreview.displayAvatar(firstEntry);
		}
	}

	avatarUnlocks(avatarInfoList) {
		avatarInfoList.forEach((avatarEntry) => {
			let entry = this.avatarEntries[avatarEntry.avatarInfo.avatarId];
			if (entry.locked) {
				entry.unlocked(avatarEntry.avatarInfo);
			}
		});
		this.updateAvatarOrder();
		this.triggerImageLoads();
	}

	displayClear() {
		this.$avatarSelectionContainer.prepend(this.clearElement.$body);
	}

	getAvatarInfo(avatarId) {
		return this.avatarEntries[avatarId].avatarInfo;
	}

	updateAvatarOrder() {
		let entries = Object.values(this.avatarEntries);
		entries.forEach((entry) => entry.detatch());
		this.avatarFilter.sortList(entries).forEach((entry) => {
			this.$avatarSelectionContainer.append(entry.$body);
			this.updateScroll();
		});
	}

	disableCharacter(characterId) {
		this.entryList
			.filter((entry) => entry.characterId === characterId)
			.forEach((entry) => {
				entry.disable();
			});
		this.disabledCharacterIds[characterId] = true;
	}

	enableCharacter(characterId) {
		this.entryList
			.filter((entry) => entry.characterId === characterId)
			.forEach((entry) => {
				entry.enable();
			});
		delete this.disabledCharacterIds[characterId];
	}

	updateAvatarInfo(avatarId, level, baseStats) {
		if (this.avatarEntries[avatarId]) {
			this.avatarEntries[avatarId].level = level;
			this.avatarEntries[avatarId].baseStats = baseStats;
			this.avatarEntries[avatarId].updateLevelText();
		}
	}

	updateDefaultAvatarSkin(avatarId, colorId, backgroundAvatarId, backgroundColorId, optionActive) {
		if (this.avatarEntries[avatarId]) {
			this.avatarEntries[avatarId].updateAvatarColor(colorId, optionActive);
			this.avatarEntries[avatarId].updateAvatarBackground(backgroundAvatarId, backgroundColorId);

			this.selectorPreview.avatarUpdate(this.avatarEntries[avatarId]);
		}
	}

	setSelectionCallback(callback) {
		this.customSelectionCallback = callback;
	}
}

class NexusCityAvatarEntry {
	constructor(
		{
			avatarInfo: { avatarId, colorId, backgroundAvatarId, backgroundColorId, optionActive, level, abilityInfo, genreInfo },
			baseStats,
			runes,
			locked,
			earlyAccess,
			earlyAccessEndDate,
		},
		$container,
		hoverCallback,
		clickCallback
	) {
		this.$body = $(format(this.TEMPLATE, level));
		this.$img = this.$body.find(".nexusCityAvatarSelectorAvatarImage");
		this.$emptyRuneSlotCounter = this.$body.find(".nexusCityAvatarSelectorAvatarEmptySlots");
		this.$levelText = this.$body.find(".nexusCityAvatarSelectorAvatarLevelNumber");
		this.$earlyAccessIcon = this.$body.find(".nexusCityAvatarSelectorAvatarEarlyAccessIcon");

		this.avatarId = avatarId;
		this.colorId = colorId;
		this.backgroundAvatarId = backgroundAvatarId;
		this.backgroundColorId = backgroundColorId;
		this.abilityInfo = abilityInfo;
		this.locked = locked;
		this.earlyAccess = earlyAccess;

		let targetAvatar = storeWindow.getAvatarFromAvatarId(avatarId);
		let targetAvatarColor = targetAvatar.colorMap[colorId].fullDescription;

		this.characterId = targetAvatar.characterId;

		this.level = level;
		this.baseStats = baseStats;
		this.runeInfo = runes;
		this.genreInfo = genreInfo;

		this.optionName = targetAvatarColor.optionName;
		this.optionActive = optionActive;

		this.characterId = targetAvatar.characterId;
		this.name = targetAvatar.completeName;
		this.sizeModClass = targetAvatarColor.sizeModifierClass;

		this.src = cdnFormater.newAvatarSrc(
			targetAvatarColor.avatarName,
			targetAvatarColor.outfitName,
			targetAvatarColor.optionName,
			this.optionActive,
			targetAvatarColor.colorName,
			cdnFormater.AVATAR_POSE_IDS.BASE
		);
		this.srcSet = cdnFormater.newAvatarSrcSet(
			targetAvatarColor.avatarName,
			targetAvatarColor.outfitName,
			targetAvatarColor.optionName,
			this.optionActive,
			targetAvatarColor.colorName,
			cdnFormater.AVATAR_POSE_IDS.BASE
		);

		let targetBackgroundAvatar = storeWindow.getAvatarFromAvatarId(backgroundAvatarId);
		let targetBackgroundAvatarColor = targetBackgroundAvatar.colorMap[backgroundColorId].fullDescription;

		this.backgroundSrc = cdnFormater.newAvatarBackgroundSrc(
			targetBackgroundAvatarColor.backgroundVert,
			cdnFormater.BACKGROUND_GAME_SIZE
		);

		this.$img.addClass(this.sizeModClass);

		let targetMinSize = targetAvatarColor.sizeModifier > 0 ? "150px" : "100px";

		this.imagePreload = new PreloadImage(
			this.$img,
			this.src,
			this.srcSet,
			false,
			targetMinSize,
			null,
			false,
			$container,
			false,
			this.$body
		);

		this.$body.mouseenter(() => {
			hoverCallback(this);
		});

		this.abilityHover = new GraceHoverHandler(
			this.$body,
			250,
			50,
			() => {
				nexusAbilityPopover.displayAbility(abilityInfo, this.$body, avatarId);
			},
			() => {
				nexusAbilityPopover.hide(avatarId);
			}
		);

		this.clickCallback = clickCallback;
		if (locked || (this.earlyAccess && patreon.backerLevel < this.PATREON_LEVLE_FOR_EARLY_ACCESS)) {
			this.$body.addClass("locked");
		} else {
			this.$body.click(() => {
				clickCallback(this);
			});
		}

		if (this.earlyAccess) {
			this.$earlyAccessIcon.removeClass("hide");
			this.$earlyAccessIcon.popover({
				content: "In early access for level 4+ Patreons until " + earlyAccessEndDate,
				delay: 50,
				container: "#nexusCityContainer",
				placement: "top",
				trigger: "hover",
			});
		}
	}

	unlocked({ avatarId, colorId }) {
		if (!this.locked) {
			return;
		}

		let gotNewColor = this.colorId !== colorId;
		if (gotNewColor) {
			this.updateAvatarColor(colorId);
			this.updateAvatarBackground(avatarId, colorId);
		}
		this.locked = false;
		this.$body.removeClass("locked");
		this.$body.click(() => {
			this.clickCallback(this);
		});
	}

	updateLevelText() {
		this.$levelText.text(this.level);
	}

	updateAvatarColor(colorId, optionActive) {
		this.colorId = colorId;
		if(optionActive !== undefined) {
			this.optionActive = optionActive;
		}
		let targetAvatar = storeWindow.getAvatarFromAvatarId(this.avatarId);
		let targetAvatarColor = targetAvatar.colorMap[colorId].fullDescription;

		this.$img.removeClass(this.sizeModClass);
		this.sizeModClass = targetAvatarColor.sizeModifierClass;
		this.$img.addClass(this.sizeModClass);

		this.src = cdnFormater.newAvatarSrc(
			targetAvatarColor.avatarName,
			targetAvatarColor.outfitName,
			targetAvatarColor.optionName,
			this.optionActive,
			targetAvatarColor.colorName,
			cdnFormater.AVATAR_POSE_IDS.BASE
		);
		this.srcSet = cdnFormater.newAvatarSrcSet(
			targetAvatarColor.avatarName,
			targetAvatarColor.outfitName,
			targetAvatarColor.optionName,
			this.optionActive,
			targetAvatarColor.colorName,
			cdnFormater.AVATAR_POSE_IDS.BASE
		);

		let targetMinSize = targetAvatar.sizeModifier > 0 ? "150px" : "100px";

		this.imagePreload.cancel();
		this.imagePreload = new PreloadImage(this.$img, this.src, this.srcSet, true, targetMinSize);
	}

	updateAvatarBackground(avatarId, colorId) {
		let targetAvatar = storeWindow.getAvatarFromAvatarId(avatarId);
		let targetAvatarColor = targetAvatar.colorMap[colorId].fullDescription;

		this.backgroundAvatarId = avatarId;
		this.backgroundColorId = colorId;

		this.backgroundSrc = cdnFormater.newAvatarBackgroundSrc(
			targetAvatarColor.backgroundVert,
			cdnFormater.BACKGROUND_GAME_SIZE
		);
	}

	get avatarInfo() {
		return {
			avatarId: this.avatarId,
			level: this.level,
			src: this.src,
			srcSet: this.srcSet,
			name: this.name,
			sizeModClass: this.sizeModClass,
			backgroundSrc: this.backgroundSrc,
			baseStats: this.baseStats,
			runeInfo: this.runeInfo,
			genreInfo: this.genreInfo,
			abilityInfo: this.abilityInfo,
		};
	}

	remove() {
		if (this.abilityHover) {
			this.abilityHover.destroy();
		}
		this.imagePreload.cancel();
		this.$body.remove();
	}

	detatch() {
		if (this.abilityHover) {
			this.abilityHover.hide();
		}
		this.$body.detach();
	}

	triggerImageLoadCheck() {
		this.imagePreload.lazyLoadEvent();
	}

	disable() {
		this.$body.addClass("disabled");
	}

	enable() {
		this.$body.removeClass("disabled");
	}
}
NexusCityAvatarEntry.prototype.TEMPLATE = $("#nexusAvatarSelectorTemplate").html();
NexusCityAvatarEntry.prototype.PATREON_LEVLE_FOR_EARLY_ACCESS = 4;

class NexusCityAvatarClearEntry {
	constructor(clickHandler) {
		this.$body = $(format(this.TEMPLATE));
		this.$textContainer = this.$body.find(".nexusCityAvatarSelectorAvatarLevel");

		this.$textContainer.text("Clear");

		this.level = -1;
		this.name = "Clear";

		this.$body.click(() => {
			clickHandler();
		});
	}

	detatch() {
		this.$body.detach();
	}
}
NexusCityAvatarClearEntry.prototype.TEMPLATE = $("#nexusAvatarSelectorTemplate").html();
