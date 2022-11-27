"use strict";

/*exported storeWindow*/

class StoreWindow {
    constructor() {
        this.$window = $("#storeWindow");
        this.$rhythmText = this.$window.find("#swRhythmText");
        this.$avatarTokenText = this.$window.find('#sAvatarTokenText');
        this.$storeIconAvatar = $("#avatarUserImg");

        this._open = false;

        this._rhythm = 0;
        this.rhythmBubbleTextController;

        this._avatarTokens = 0;
        this.avatarTokenBubbleTextController;

        this.unlockedEmoteIds = {};

        this.characterUnlockCount;
        this.avatarUnlockCount;
        this._activeAvatarBackground;
        this.mainContainer;
        this.topBar;
        this._inBackgroundMode = false;


        $(window).resize(() => {
            if (this.open) {
                this.resize();
            }
        });

        this.useAvatarListener = new Listener(
            "use avatar",
            function (payload) {
                if (!payload.succ) {
                    displayMessage("Error", "There was an error activating the avatar");
                } else {
                    this._activeAvatarBackground = payload.currentAvatar;
                    this.avatarColumn.updateActionButton();
                    this.setStoreIconAvatar(payload.currentAvatar.avatar);
                }
            }.bind(this)
        );

        this.unlockListner = new Listener(
            "unlock avatar",
            function (payload) {
                if (payload.succ) {
                    payload.unlockedAvatars.forEach((unlockedAvatar) => {
                        if (!this.characterUnlockCount[unlockedAvatar.characterId]) {
                            this.characterUnlockCount[unlockedAvatar.characterId] = 1;
                        } else {
                            this.characterUnlockCount[unlockedAvatar.characterId]++;
                        }
                        if (!this.avatarUnlockCount[unlockedAvatar.avatarId]) {
                            this.avatarUnlockCount[unlockedAvatar.avatarId] = 1;
                        } else {
                            this.avatarUnlockCount[unlockedAvatar.avatarId]++;
                        }

                        let character = this.topBar.getCharacter(unlockedAvatar.characterId);
                        character.newUnlock(unlockedAvatar.avatarId, unlockedAvatar.colorId);
                    });
                    this.avatarColumn.newUnlock();
                    if (!payload.ticketReward) {
                        xpBar.setCredits(payload.creditsLeft);
                        storePriceModal.transactionComplete();
                        this.rhythm = payload.rhythmLeft;
                    }
                    this.filterChangeEvent();
                } else {
                    storePriceModal.transactionFailed(payload.error);
                }
            }.bind(this)
        );

        this.lockListner = new Listener(
            "lock avatar",
            function (payload) {
                if (!this.characterUnlockCount[payload.characterId]) {
                    this.characterUnlockCount[payload.characterId]--;
                }
                if (!this.avatarUnlockCount[payload.avatarId]) {
                    this.avatarUnlockCount[payload.avatarId]--;
                }

                let character = this.topBar.getCharacter(payload.characterId);
                character.newLock(payload.avatarId, payload.colorId);
                this.avatarColumn.newUnlock();

                this.filterChangeEvent();
            }.bind(this)
        );

        this.emoteUnlockListner = new Listener(
            "emote unlocked",
            function (payload) {
                this.unlockedEmoteIds.push(payload.emoteId);
                this.topBar.emotes.newUnlock(payload.groupName, payload.emoteId);

                if (payload.rhythmLeft != undefined) {
                    this.rhythm = payload.rhythmLeft;
                    storePriceModal.transactionComplete();
                }
                emojiSelector.buildEntries();
                emoteSelector.buildEmoteRegex();
            }.bind(this)
        );

        this.emoteLockedListner = new Listener(
            "emote locked",
            function (payload) {
                this.unlockedEmoteIds = this.unlockedEmoteIds.filter(
                    (emoteId) => emoteId !== payload.emoteId
                );
                this.topBar.emotes.newLocked(payload.groupName, payload.emoteId);

                emojiSelector.buildEntries();
                emoteSelector.buildEmoteRegex();
            }.bind(this)
        );

        this.newFavoriteListener = new Listener(
            "new favorite avatar",
            function (payload) {
                this.topBar.favorites.newFavorite(payload);
                this.avatarColumn.updateActionButton();
            }.bind(this)
        );

        this.removeFavoriteListener = new Listener(
            "remove favorite avatar",
            function (payload) {
                this.topBar.favorites.removeFavorite(payload.favoriteId);
                this.avatarColumn.updateActionButton();
            }.bind(this)
        );

        this.useAvatarListener.bindListener();
        this.unlockListner.bindListener();
        this.lockListner.bindListener();
        this.emoteUnlockListner.bindListener();
        this.emoteLockedListner.bindListener();
        this.newFavoriteListener.bindListener();
        this.removeFavoriteListener.bindListener();
    }

    get open() {
        return this._open;
    }

    set open(newValue) {
        this._open = newValue;
        if (newValue) {
            this.show();
        } else {
            this.hide();
        }
    }

    get activeAvatar() {
        return this._activeAvatarBackground.avatar;
    }

    get activeBackground() {
        return this._activeAvatarBackground.background;
    }

    get inBackgroundMode() {
        return this._inBackgroundMode;
    }

    set inBackgroundMode(newValue) {
        this._inBackgroundMode = newValue;
        this.avatarColumn.updateBackgroundMode(this.inBackgroundMode);
        this.filterChangeEvent();
        if (this.inBackgroundMode) {
            this.$window.addClass("backgroundMode");
        } else {
            this.$window.removeClass("backgroundMode");
        }
    }

    get rhythm() {
        return this._rhythm;
    }

    set rhythm(newValue) {
        let change = newValue - this.rhythm;
        this._rhythm = newValue;
        this.$rhythmText.text(newValue);
        if (change !== 0 && this.rhythmBubbleTextController) {
            if (change > 0) {
                change = "+" + change;
            }
            this.rhythmBubbleTextController.spawnText(change);
        }
    }

    get avatarTokens() {
        return this._avatarTokens;
    }

    set avatarTokens(newValue) {
        let change = newValue - this.avatarTokens;
        this._avatarTokens = newValue;
        this.$avatarTokenText.text(newValue);
        if (change !== 0 && this.avatarTokenBubbleTextController) {
            if (change > 0) {
                change = "+" + change;
            }
            this.avatarTokenBubbleTextController.spawnText(change);
        }
    }

    setup(
        defaultDesigns,
        unlockedDesigns,
        currentAvatar,
        characterUnlockCount,
        avatarUnlockCount,
        emoteGroups,
        rhythm,
        unlockedEmoteIds,
        favoriteAvatars,
        recentTicketRewards,
        avatarTokens,
        rollTargets
    ) {
        this.characterUnlockCount = characterUnlockCount;
        this.avatarUnlockCount = avatarUnlockCount;
        this.unlockedEmoteIds = unlockedEmoteIds;
        this._activeAvatarBackground = JSON.parse(JSON.stringify(currentAvatar));

        this.mainContainer = new StoreMainContainer(this.$window);
        this.storeFilter = new StoreFilter(this.$window);
        this.avatarColumn = new StoreAvatarColumn();
        this.topBar = new StoreTopBar(
            this.$window,
            defaultDesigns,
            unlockedDesigns,
            this.mainContainer,
            emoteGroups,
            unlockedEmoteIds,
            favoriteAvatars,
            recentTicketRewards,
            rollTargets
        );

        this.rhythm = rhythm;
        this.rhythmBubbleTextController = new BubbleTextController(
            this.$window.find("#swRhythmBubbleTextSpawner")
        );

        this.avatarTokens = avatarTokens;
        this.avatarTokenBubbleTextController = new BubbleTextController(
            this.$window.find("#swAvatarTokenBubbleTextSpawner")
        );

        this.avatarColumn.displayAvatar(currentAvatar.avatar);
        this.avatarColumn.displayBackground(currentAvatar.background);
        this.setStoreIconAvatar(currentAvatar.avatar);
    }

    reset() {
        this.open = false;
        this.mainContainer.clearSelection();
        this.topBar.closeAll();
    }

    show() {
        this.$window.removeClass("hidden");
        this.resize();
    }

    showSkin(characterId, avatarId) {
        if (!this.open) {
            this.toggle();
        }
        this.getAvatar(characterId, avatarId).displayColors();
    }

    resize() {
        this.topBar.updateLayout();
        this.avatarColumn.updateLayout();
        this.topBar.tickets.resize();
    }

    hide() {
        this.$window.addClass("hidden");
    }

    toggle() {
        this.open = !this.open;
    }

    getAvatar(characterId, avatarId) {
        return this.topBar.getCharacter(characterId).getAvatar(avatarId);
    }

    getAvatarFromAvatarId(avatarId) {
        return this.topBar.getAvatar(avatarId);
    }

    filterChangeEvent() {
        this.topBar.filterUpdate(this.storeFilter.currentFilter);
    }

    toggleBackgroundSelect() {
        this.inBackgroundMode = !this.inBackgroundMode;
    }

    getAvatarBonusUnlocked(avatarId) {
        return (
            this.avatarUnlockCount[avatarId] &&
            this.avatarUnlockCount[avatarId] >= this.REQUIRED_COUNT_FOR_BONUS
        );
    }

    disableTopBar() {
        this.topBar.disable();
    }

    enableTopBar() {
        this.topBar.enable();
    }

    getAllEmotes() {
        return this.topBar.emotes.getAllEmotes();
    }

    getEmote(emoteId) {
        return this.topBar.emotes.getEmote(emoteId);
    }

    setStoreIconAvatar(currentAvatar) {

        this.$storeIconAvatar
            .attr(
                "srcset",
                cdnFormater.newAvatarHeadSrcSet(
                    currentAvatar.avatarName,
                    currentAvatar.outfitName,
                    currentAvatar.optionName,
                    currentAvatar.optionActive,
                    currentAvatar.colorName
                )
            )
            .attr(
                "src",
                cdnFormater.newAvatarHeadSrc(
                    currentAvatar.avatarName,
                    currentAvatar.outfitName,
                    currentAvatar.optionName,
                    currentAvatar.optionActive,
                    currentAvatar.colorName
                )
            );
    }

    getFavoriteId(avatar, background) {
        return this.topBar.favorites.getFavoriteId(avatar, background);
    }

    handleAvatarSelected(avatarDescription, backgroundDescription) {
        if (this.inBackgroundMode) {
            this.avatarColumn.displayBackground(backgroundDescription);
        } else {
            this.avatarColumn.displayAvatar(avatarDescription);
            this.avatarColumn.displayBackground(backgroundDescription);
        }
    }

    messageContainEmote(msg) {
        return this.topBar.emotes.messageContainEmote(msg);
    }
}

StoreWindow.prototype.REQUIRED_COUNT_FOR_BONUS = 10;

var storeWindow = new StoreWindow();
