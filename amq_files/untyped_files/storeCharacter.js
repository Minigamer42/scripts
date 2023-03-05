"use strict";
/*exported StoreCharacter */

class StoreCharacter {
	constructor(description, unlockedAvatars, mainContainer) {
		this.characterId = description.characterId;
		this.$characterIcon;

		this.avatars = [];
		this.defaultAvatar;

		this.previewTilesInited = false;

		description.avatars.forEach((avatarDescription) => {
			let storeAvatar = new StoreAvatar(
				avatarDescription,
				unlockedAvatars[avatarDescription.avatarId],
				mainContainer,
				this
			);
			this.avatars.push(storeAvatar);
			if (storeAvatar.defaultAvatar) {
				this.defaultAvatar = storeAvatar;
			}
		});
		this.sortAvatars();

		let src = cdnFormater.newStoreAvatarIconSrc(
			this.defaultAvatar.avatarName,
			this.DEFAULT_STORE_AVATAR_ICON_NAME
		);
		let srcSet = cdnFormater.newStoreAvatarIconSrcSet(
			this.defaultAvatar.avatarName,
			this.DEFAULT_STORE_AVATAR_ICON_NAME
		);
		let callback = function (selected) {
			if (selected) {
				this.intPreviewTiles();
				mainContainer.displayContent(this.avatars);
			} else {
				mainContainer.clearSelection();
				this.clearAvatarSelection();
			}
		}.bind(this);

		let badgeSrc = cdnFormater.newStoreIconSrc(this.defaultAvatar.badgeFileName);
		let badgeSrcSet = cdnFormater.newBadgeSrcSet(this.defaultAvatar.badgeFileName);
		this.topIcon = new StoreTopIcon(src, srcSet, callback, [this.defaultAvatar.avatarName], badgeSrc, badgeSrcSet);
		this.topIcon.appendChildren(this.avatars.map((storeAvatar) => storeAvatar.$topIcon));
		this.updateStatus();
	}

	set open(newValue) {
		this.topIcon.open = newValue;
		if (!newValue) {
			this.clearAvatarSelection();
		}
	}

	get $topIcon() {
		return this.topIcon.$topIcon;
	}

	get width() {
		return this.topIcon.width;
	}

	set inFilter(newValue) {
		this.topIcon.inFilter = newValue;
	}

	updateStatus() {
		let totalCount = 0;
		this.avatars.forEach(avatar => totalCount += avatar.colorCount);
		let currentCount = storeWindow.characterUnlockCount[this.characterId];
		if(!currentCount) {
			currentCount = 0;
		}
		this.topIcon.updateStatus(currentCount, totalCount);
	}

	getAvatar(avatarId) {
		return this.avatars.find((avatar) => {
			return avatar.avatarId === avatarId;
		});
	}

	newUnlock(avatarId, colorId) {
		this.getAvatar(avatarId).newUnlock(colorId);
		this.updateStatus();
	}

	newLock(avatarId, colorId) {
		this.getAvatar(avatarId).newLock(colorId);
		this.updateStatus();
	}

	sortAvatars() {
		this.avatars = this.avatars.sort((a, b) => {
			if (a.defaultAvatar !== b.defaultAvatar) {
				return a.defaultAvatar ? -1 : 1;
			} else if (a.active !== b.active) {
				return a.active ? -1 : 1;
			} else {
				return a.avatarId - b.avatarId;
			}
		});
	}

	loadAvatarTopIcons() {
		this.avatars.forEach((avatar) => {
			avatar.loadTopIcon();
		});
	}

	intPreviewTiles() {
		if (!this.previewTilesInited) {
			this.avatars.forEach((avatar) => {
				avatar.initPreviewTile();
			});
			this.previewTilesInited = true;
		}
	}

	clearAvatarSelection() {
		this.avatars.forEach((avatar) => {
			avatar.iconSelected = false;
		});
	}

	filterUpdate(newFilter) {
		this.avatars.forEach((avatar) => {
			avatar.filterUpdate(newFilter);
		});

		this.inFilter = this.avatars.some((avatar) => avatar.inFilter);
	}
}

StoreCharacter.prototype.DEFAULT_STORE_AVATAR_ICON_NAME = "main";

class StoreAvatar {
	constructor(description, unlockedColors, mainContainer, parentCharacter) {
		this.parentCharacter = parentCharacter;

		this.avatarId = description.avatarId;
		this.outfitId = description.outfitId;
		this.avatarName = description.avatarName;
		this.outfitName = description.outfitName;
		this.optionName = description.optionName;
		this.backgroundVert = description.backgroundVert;
		this.artist = description.artist;
		this.world = description.world;
		this.lore = description.lore;
		this.badgeFileName = description.badgeFileName;
		this.badgeName = description.badgeName;
		this.sizeModifier = description.sizeModifier;
		this.legacy = description.legacy;

		this._inFilter = true;

		this.notePrice = description.notePrice;
		this.realMoneyPrice = description.realMoneyPrice;
		this.patreonTierToUnlock = description.patreonTierToUnlock;

		this.active = description.active;
		this.defaultAvatar = description.defaultAvatar;
		this.exclusive = description.exclusive;
		this.ticketTier = description.tierId;
		this.limited = description.limited;

		this.defaultColorName = description.colorName;
		this.defaultColorId = description.defaultColorId;
		this.unlockedColors = unlockedColors ? unlockedColors : {};

		this._unlocked = this.unlockedColors[this.defaultColorId] != undefined;
		this.gotSkins = Object.keys(this.unlockedColors).length > 0;

		this.colorsLoaded = false;
		this.colors = [];
		this.colorMap = {};

		description.colors.forEach((color) => {
			let storeColor = new StoreColor(this, color, this.unlockedColors[color.colorId]);
			this.colors.push(storeColor);
			this.colorMap[color.colorId] = storeColor;
		});
		this.sortColors();

		this.mainContainer = mainContainer;

		this.src = cdnFormater.newAvatarSrc(
			this.avatarName,
			this.outfitName,
			this.optionName,
			true,
			this.defaultColorName,
			cdnFormater.AVATAR_POSE_IDS.BASE
		);
		this.srcSet = cdnFormater.newAvatarSrcSet(
			this.avatarName,
			this.outfitName,
			this.optionName,
			true,
			this.defaultColorName,
			cdnFormater.AVATAR_POSE_IDS.BASE
		);
		this.backgroundSrc = cdnFormater.newAvatarBackgroundSrc(
			this.backgroundVert,
			cdnFormater.BACKGROUND_STORE_TILE_SIZE
		);

		this.tileLoaded = false;
		this.tile = new StorePreviewTile(this);

		this.topIconImagePreloader;
		this.buildTopIconDomObject();
		this.updateStatus();
	}

	get colorCount() {
		return this.colors.length;
	}

	get unlockedColorCount() {
		return this.colors.filter((color) => color.unlocked).length;
	}

	get backgroundUnlocked() {
		return this.unlockedColorCount >= 10;
	}

	get $content() {
		return this.tile.$tile;
	}

	get sizeModifierClass() {
		return "sizeMod" + this.sizeModifier;
	}

	updateTextSize() {
		this.tile.updateTextSize();
	}

	get typeName() {
		if (!this.active) {
			return "Unavailable";
		} if(this.limited) {
			return 'Limited';	
		} else if (this.exclusive) {
			return "Exclusive";
		} else {
			return "Standard";
		}
	}

	get completeName () {
		let skinName = this.outfitName === 'Standard' ? "" : `${this.outfitName} `;
		return skinName + this.avatarName;
	}

	set iconSelected(active) {
		if (active) {
			storeWindow.topBar.clearAvatarSelection();
			this.$topIcon.addClass("selected");
		} else {
			this.$topIcon.removeClass("selected");
		}
	}

	get inFilter() {
		return this._inFilter;
	}

	set inFilter(newValue) {
		this._inFilter = newValue;
		if (this.$topIcon) {
			if (this.inFilter) {
				this.$topIcon.removeClass("storeFade");
			} else {
				this.$topIcon.addClass("storeFade");
			}
		}

		if (this.tile) {
			this.tile.storeFade = !this.inFilter;
		}
	}

	get colorUnlocked() {
		return this.gotSkins;
	}

	get unlocked() {
		return (
			this._unlocked &&
			(!storeWindow.inBackgroundMode || storeWindow.getAvatarBonusUnlocked(this.avatarId))
		);
	}

	set unlocked(newValue) {
		this._unlocked = newValue;
	}

	get $topIcon() {
		return this.topIcon.$topIcon;
	}

	get characterId() {
		return this.parentCharacter.characterId;
	}

	newUnlock(colorId) {
		if (!this.gotSkins) {
			this.gotSkins = true;
			this.tile.addUnlockedClass();
		}
		if (colorId === this.defaultColorId) {
			this.unlocked = true;
			this.colors.forEach((color) => {
				color.avatarUnlocked();
			});
		}
		this.unlockedColors[colorId] = true;
		if (this.colorMap[colorId]) {
			this.colorMap[colorId].setUnlocked();
		}
		this.updateStatus();
		
	}

	newLock(colorId) {
		this.unlockedColors[colorId] = false;
		if (this.colorMap[colorId]) {
			this.colorMap[colorId].setLocked();
		}
		this.updateStatus();
	}

	buildTopIconDomObject() {
		let src = cdnFormater.newStoreAvatarIconSrc(this.avatarName, this.outfitName);
		let srcset = cdnFormater.newStoreAvatarIconSrcSet(this.avatarName, this.outfitName);
		let badgeSrc = cdnFormater.newStoreIconSrc(this.badgeFileName);
		let badgeSrcSet = cdnFormater.newBadgeSrcSet(this.badgeFileName);

		this.topIcon = new StoreTopIconSkin(badgeSrc, badgeSrcSet);

		this.$topIcon.click(() => {
			this.displayColors();
		});

		let $image = this.$topIcon.find(".swTopBarSkinImage");
		this.topIconImagePreloader = new PreloadImage($image, src, srcset, false);
	}

	initPreviewTile() {
		if (!this.tileLoaded) {
			this.tile.imagePreload.load();
			this.tileLoaded = true;
		}
	}

	loadTopIcon() {
		this.topIconImagePreloader.load();
	}

	displayColors() {
		this.mainContainer.displayContent(this.colors);
		if (!this.colorsLoaded) {
			this.colors.forEach((color) => {
				color.tile.imagePreload.lazyLoadEvent();
			});
			this.colorsLoaded = true;
		}
		this.iconSelected = true;
		this.parentCharacter.active = false;
	}

	sortColors() {
		this.colors = this.colors.sort((a, b) => {
			if (a.inFilter !== b.inFilter) {
				return a.inFilter ? -1 : 1;
			} else if (a.unlocked !== b.unlocked) {
				return a.unlocked ? -1 : 1;
			} else if (a.defaultColor !== b.defaultColor) {
				return a.defaultColor ? -1 : 1;
			} else if (a.unlocked) {
				if (a.exclusive !== b.exclusive) {
					return a.exclusive ? -1 : 1;
				} else if (a.ticketTier && b.ticketTier) {
					return b.ticketTier - a.ticketTier;
				}
			} else {
				if (a.exclusive !== b.exclusive) {
					return a.exclusive ? 1 : -1;
				} else if (a.ticketTier && b.ticketTier) {
					return a.ticketTier - b.ticketTier;
				}
			}

			if (!a.unlocked && a.active !== b.active) {
				return a.active ? -1 : 1;
			} else {
				return b.colorId - a.colorId;
			}
		});
	}

	getColorUnlocked(colorId) {
		return this.colorMap[colorId].unlocked;
	}

	filterUpdate(newFilter) {
		this.colors.forEach((color) => color.filterUpdate(newFilter));
		this.sortColors();
		this.inFilter = this.colors.some((color) => color.inFilter);
	}

	updateStatus() {
		let currentCount = storeWindow.avatarUnlockCount[this.avatarId];
		if(!currentCount) {
			currentCount = 0;
		}
		this.topIcon.updateStatus(currentCount, this.colorCount);
	}
}

StoreAvatar.prototype.AVATAR_ICON_TEMPLATE = $("#swTopBarAvatarTemplate").html();

class StoreColor {
	constructor(avatar, colorDescription, unlocked) {
		this.avatar = avatar;

		this.colorId = colorDescription.colorId;
		this.name = colorDescription.name;
		this.colorPrice = colorDescription.price;
		this.defaultColor = colorDescription.defaultColor;
		this.sizeModifier = colorDescription.sizeModifier;
		this.unique = colorDescription.unique;
		this.eventColor = colorDescription.eventColor;

		this.editor = colorDescription.editor;

		this._inFilter = true;
		this.unlocked = unlocked === true;
		this.active = colorDescription.active;
		this.limited = colorDescription.limited;
		this.exclusive = colorDescription.exclusive;
		this.ticketTier = colorDescription.tierId;

		this.backgroundId = colorDescription.backgroundId;
		this.backgroundVert = colorDescription.backgroundVert;

		this.src = cdnFormater.newAvatarSrc(
			this.avatar.avatarName,
			this.avatar.outfitName,
			this.avatar.optionName,
			true,
			this.name,
			cdnFormater.AVATAR_POSE_IDS.BASE
		);
		this.srcSet = cdnFormater.newAvatarSrcSet(
			this.avatar.avatarName,
			this.avatar.outfitName,
			this.avatar.optionName,
			true,
			this.name,
			cdnFormater.AVATAR_POSE_IDS.BASE
		);
		this.backgroundSrc = cdnFormater.newAvatarBackgroundSrc(
			this.backgroundVert,
			cdnFormater.BACKGROUND_STORE_TILE_SIZE
		);

		this.tile = new StoreAvatarTile(this);
	}

	get sizeModifierClass() {
		return "sizeMod" + this.sizeModifier;
	}

	get $content() {
		return this.tile.$tile;
	}

	updateTextSize() {
		this.tile.updateTextSize();
	}

	get notePrice() {
		let price = 0;
		if (!this.avatar.unlocked && !this.ticketTier) {
			price += this.avatar.notePrice;
		}
		if (!this.unlocked) {
			price += this.colorPrice;
		}
		return price;
	}

	get realMoneyPrice() {
		let price = 0;
		if (!this.avatar.unlocked) {
			price += this.avatar.realMoneyPrice;
		}
		return price;
	}

	get patreonTierToUnlock() {
		if (!this.avatar.unlocked) {
			return this.avatar.patreonTierToUnlock;
		} else {
			return false;
		}
	}

	get typeName() {
		if(this.unique) {
			return 'Unique';
		} else if (!this.active || !this.avatar.active) {
			return "Unavailable";
		} else if (this.avatar.limited || this.limited) {
			return "Limited";
		} else if (this.avatar.exclusive || this.exclusive) {
			return "Exclusive";
		} else {
			return "Standard";
		}
	}

	get avatarId() {
		return this.avatar.avatarId;
	}

	get characterId() {
		return this.avatar.parentCharacter.characterId;
	}

	get fullDescription() {
		return {
			colorId: this.colorId,
			avatarId: this.avatar.avatarId,
			characterId: this.avatar.parentCharacter.characterId,
			active: this.avatar.active,
			avatarName: this.avatar.avatarName,
			outfitName: this.avatar.outfitName,
			colorName: this.name,
			backgroundVert: this.backgroundVert,
			colorActive: this.active,
			editor: this.editor,
			optionName: this.avatar.optionName,
			optionActive: true,
			avatarNotePrice: this.avatar.notePrice,
			avatarRealMoneyPrice: this.avatar.realMoneyPrice,
			colorNotePrice: this.colorPrice,
			defaultColor: this.defaultColor,
			ticketTier: this.ticketTier,
			avatarTicketTier: this.avatar.ticketTier,
			sizeModifier: this.sizeModifier,
			sizeModifierClass: this.sizeModifierClass,
		};
	}

	get backgroundDescription() {
		return {
			avatarName: this.avatar.avatarName,
			outfitName: this.avatar.outfitName,
			avatarId: this.avatar.avatarId,
			characterId: this.avatar.parentCharacter.characterId,
			colorId: this.colorId,
			backgroundVert: this.backgroundVert,
		};
	}

	get inFilter() {
		return this._inFilter;
	}

	set inFilter(newValue) {
		this._inFilter = newValue;
		this.tile.storeFade = !this.inFilter;
	}

	avatarUnlocked() {
		if(!this.exclusive) {
			this.tile.updateFirstRowString(numberWithCommas(this.colorPrice));
		}
		this.tile.turnOffSecondRow();
	}

	setUnlocked() {
		this.unlocked = true;
		this.tile.addUnlockedClass();
	}

	setLocked() {
		this.unlocked = false;
		this.tile.removeUnlockedClass();
	}

	filterUpdate(newFilter) {
		if (!newFilter.locked && (!this.unlocked || (!this.ticketTier && !this.avatar.unlocked))) {
			this.inFilter = false;
		} else if (!newFilter.unlocked && (this.unlocked)) {
			this.inFilter = false;
		} else if (!newFilter.avaliable && this.active && this.avatar.active) {
			this.inFilter = false;
		} else if (!newFilter.unavaliable && (!this.active || !this.avatar.active)) {
			this.inFilter = false;
		} else if (!newFilter.limited && (this.limited || this.avatar.limited)) {
			this.inFilter = false;
		} else if (!newFilter.unlimited && (!this.limited && !this.avatar.limited)) {
			this.inFilter = false;
		} else if (!newFilter.premium && (this.exclusive || this.avatar.exclusive)) {
			this.inFilter = false;
		} else if (!newFilter.standard && !this.exclusive && !this.avatar.exclusive) {
			this.inFilter = false;
		} else {
			this.inFilter = true;
		}
	}

	getAvatarBaseSrcInfo(optionActive) {
		let src = cdnFormater.newAvatarSrc(
			this.avatar.avatarName,
			this.avatar.outfitName,
			this.avatar.optionName,
			optionActive,
			this.name,
			cdnFormater.AVATAR_POSE_IDS.BASE
		);

		let srcSet = cdnFormater.newAvatarSrcSet(
			this.avatar.avatarName,
			this.avatar.outfitName,
			this.avatar.optionName,
			optionActive,
			this.name,
			cdnFormater.AVATAR_POSE_IDS.BASE
		);

		return {
			src: src,
			srcSet: srcSet,
		};
	}
}
