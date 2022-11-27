"use strict";

class StoreFavorites {
    constructor(mainContanier, favoriteAvatars) {
        this.$switchStateContainer = $("#swAutoSwitchStateContainer");
        this.$switchStateContainerStateText = this.$switchStateContainer.find('#swAutoSwitchStateText');
        this.updateSwitchStateText(options.AUTO_SWITCH_AVATAR_NAMES[options.autoSwitchFavoritedAvatars]);

        this.$switchStateContainer.click(() => {
            let state = options.autoSwitchFavoritedAvatars;
            state++;
            if (!options.AUTO_SWITCH_AVATAR_NAMES[state]) {
                state = 0;
            }
            options.setAutoSwitchFavoritedAvatars(state);
            this.updateSwitchStateText(options.AUTO_SWITCH_AVATAR_NAMES[state]);
        });

        this.$noFavoritesContainer = $("#swNoFavoritesContainer");

        this.mainContanier = mainContanier;
        this._topIcon = new StoreTopIcon(
            cdnFormater.newStoreIconSrc(this.TOP_ICON_NAME),
            cdnFormater.newStoreIconSrc(this.TOP_ICON_NAME),
            (selected) => {
                if (selected) {
                    let entries = this.generateFavoriteEntryMocks();
                    mainContanier.displayContent(entries);
                    entries.forEach((entry) => {
                        entry.tile.imagePreload.lazyLoadEvent();
                    });
                    this.$switchStateContainer.removeClass('hide');
                    if (this.favoriteAvatars.length === 0) {
                        this.$noFavoritesContainer.removeClass('hide');
                    }
                    this.open = true;
                } else {
                    mainContanier.clearSelection();
                }
            }
        );

        this.open = true;
        mainContanier.addContentChangeListener(() => {
            this.$switchStateContainer.addClass('hide');
            this.$noFavoritesContainer.addClass('hide');
            this.open = false;
        });

        this.favoriteAvatars = favoriteAvatars;
    }

    get $topIcon() {
        return this._topIcon.$topIcon;
    }

    generateFavoriteEntryMocks() {
        let mocks = [];
        this.favoriteAvatars.forEach(entry => {
            let mock = new StoreColorMock(entry.avatar, entry.background);
            mocks.push(mock);
            entry.currentMock = mock;
        });
        return mocks;
    }

    getFavoriteId(avatar, background) {
        let favoriteAvatar = this.favoriteAvatars.find(
            (favorite) =>
                favorite.avatar.avatarId === avatar.avatarId &&
                favorite.avatar.colorId === avatar.colorId &&
                favorite.avatar.optionActive === avatar.optionActive &&
                favorite.background.avatarId === background.avatarId &&
                favorite.background.colorId === background.colorId
        );
        return favoriteAvatar ? favoriteAvatar.favoriteId : null;
    }

    newFavorite(favorite) {
        this.favoriteAvatars.push(favorite);
        if (this.open) {
            this.$noFavoritesContainer.addClass('hide');
            let mock = new StoreColorMock(favorite.avatar, favorite.background);
            this.mainContanier.appendMainContent(mock);
            favorite.currentMock = mock;
            mock.tile.imagePreload.lazyLoadEvent();
        }
    }

    removeFavorite(favoriteId) {
        let index = this.favoriteAvatars.findIndex((favorite => favorite.favoriteId === favoriteId));
        if (index !== -1) {
            let entry = this.favoriteAvatars.splice(index, 1)[0];
            if (entry.currentMock) {
                entry.currentMock.tile.$tile.remove();
                this.favoriteAvatars.forEach(entry => {
                    if (entry.currentMock) {
                        entry.currentMock.tile.imagePreload.lazyLoadEvent();
                    }
                });
            }
            if (this.open && this.favoriteAvatars.length === 0) {
                this.$noFavoritesContainer.removeClass('hide');
            }
        }
    }

    getActiveAvatarFavoriteIndex() {
        let avatar = storeWindow.activeAvatar;
        let background = storeWindow.activeBackground;
        let index = this.favoriteAvatars.findIndex(
            (favorite) =>
                favorite.avatar.avatarId === avatar.avatarId &&
                favorite.avatar.colorId === avatar.colorId &&
                favorite.avatar.optionActive === avatar.optionActive &&
                favorite.background.avatarId === background.avatarId &&
                favorite.background.colorId === background.colorId
        );
        return index === -1 ? null : index;
    }

    toggleRandomFavoriteAvatar() {
        let currentIndex = this.getActiveAvatarFavoriteIndex();
        if (currentIndex !== null && this.favoriteAvatars.length >= 2) {
            let newIndex = Math.floor(Math.random() * (this.favoriteAvatars.length - 1));
            if (newIndex >= currentIndex) {
                newIndex++;
            }
            this.toggleFavoritedAvatar(this.favoriteAvatars[newIndex]);
        }
    }

    toggleCycleFavoriteAvatar() {
        let currentIndex = this.getActiveAvatarFavoriteIndex();
        if (currentIndex !== null && this.favoriteAvatars.length >= 2) {
            let newIndex = currentIndex + 1;
            if (newIndex >= this.favoriteAvatars.length) {
                newIndex = 0;
            }
            this.toggleFavoritedAvatar(this.favoriteAvatars[newIndex]);
        }
    }

    toggleFavoritedAvatar(favoritedAvatar) {
        socket.sendCommand({
            type: "avatar",
            command: "use avatar",
            data: {
                avatar: favoritedAvatar.avatar,
                background: favoritedAvatar.background
            }
        });
    }

    updateSwitchStateText(newText) {
        this.$switchStateContainerStateText.text(newText);
    }
}

StoreFavorites.prototype.TOP_ICON_NAME = "Favorites";

class StoreColorMock {
    constructor(avatarInfo, backgroundInfo) {
        this.avatar = storeWindow.getAvatarFromAvatarId(avatarInfo.avatarId);
        this.avatarColor = this.avatar.colorMap[avatarInfo.colorId];

        this.backgroundAvatar = storeWindow.getAvatarFromAvatarId(backgroundInfo.avatarId);
        this.backgroundAvatarColor = this.backgroundAvatar.colorMap[backgroundInfo.colorId];

        this.optionActive = avatarInfo.optionActive;

        this.src = cdnFormater.newAvatarSrc(
            this.avatar.avatarName,
            this.avatar.outfitName,
            this.avatar.optionName,
            this.optionActive,
            this.name,
            cdnFormater.AVATAR_POSE_IDS.BASE
        );
        this.srcSet = cdnFormater.newAvatarSrcSet(
            this.avatar.avatarName,
            this.avatar.outfitName,
            this.avatar.optionName,
            this.optionActive,
            this.name,
            cdnFormater.AVATAR_POSE_IDS.BASE
        );
        this.backgroundSrc = cdnFormater.newAvatarBackgroundSrc(
            this.backgroundAvatarColor.backgroundVert,
            cdnFormater.BACKGROUND_STORE_TILE_SIZE
        );

        this.tile = new StoreAvatarTile(this);
    }

    get $content() {
        return this.tile.$tile;
    }

    get name() {
        return this.avatarColor.name;
    }

    get typeName() {
        return this.avatar.avatarName;
    }

    get notePrice() {
        return this.avatarColor.notePrice;
    }

    get realMoneyPrice() {
        return this.avatarColor.realMoneyPrice;
    }

    get ticketTier() {
        return this.avatarColor.ticketTier;
    }

    get patreonTierToUnlock() {
        return this.avatarColor.patreonTierToUnlock;
    }

    get backgroundDescription() {
        return this.backgroundAvatarColor.backgroundDescription;
    }

    get fullDescription() {
        let baseDescription = JSON.parse(JSON.stringify(this.avatarColor.fullDescription));
        baseDescription.optionActive = this.optionActive;
        return baseDescription;
    }

    get unlocked() {
        return this.avatarColor.unlocked;
    }

    get sizeModifierClass() {
        return this.avatarColor.sizeModifierClass;
    }

    updateTextSize() {
        this.tile.updateTextSize();
    }
}
