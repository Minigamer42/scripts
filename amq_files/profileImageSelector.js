"use strict";

/*exported ProfileImageSelector*/

class ProfileImageSelector {
    constructor($profile, avatarImage, emoteImageId, avatarSrc, avatarSrcSet) {
        this.$avatarButton = $profile.find(".ppImageSelectorAvatar");
        this.$emoteContainer = $profile.find(".ppImageSelectorEmoteContainer");
        this.$profileImage = $profile.find('.ppProfileImg');

        this.displayLoaded = false;

        this.emoteImageId = emoteImageId;
        this.avatarImage = avatarImage;
        this.avatarSrc = avatarSrc;
        this.avatarSrcSet = avatarSrcSet;

        if (this.avatarImage) {
            this.$avatarButton.addClass('selected');
        }

        this.$avatarButton.click(() => {
            this.newSelect(true, null);
        });

        this.emoteEntries = {};
        storeWindow
            .getAllEmotes()
            .sort((a, b) => {
                if (a.unlocked === b.unlocked) {
                    return 0;
                } else {
                    return a.unlocked ? -1 : 1;
                }
            })
            .forEach((emoteInfo) => {
                let emoteEntry = new ProfileImageSelectorEmote(
                    emoteInfo,
                    emoteInfo.emoteId === emoteImageId,
                    this.$emoteContainer,
                    this.newSelect.bind(this)
                );
                this.emoteEntries[emoteInfo.emoteId] = emoteEntry;
                this.$emoteContainer.append(emoteEntry.$tile);
            });

        this.$emoteContainer.perfectScrollbar({
            suppressScrollX: true,
            minScrollbarLength: 50
        });
    }

    newSelect(avatarImage, emoteId) {
        if (this.avatarImage) {
            this.$avatarButton.removeClass('selected');
        }
        if (this.emoteImageId != undefined) {
            this.emoteEntries[this.emoteImageId].selected = false;
        }
        if (avatarImage) {
            this.$avatarButton.addClass('selected');
            this.$profileImage
                .attr('srcset', this.avatarSrcSet)
                .attr('src', this.avatarSrc);
        } else {
            this.emoteImageId = emoteId;
            this.emoteEntries[this.emoteImageId].selected = true;
            this.$profileImage
                .attr('srcset', this.emoteEntries[this.emoteImageId].srcSet)
                .attr('src', this.emoteEntries[this.emoteImageId].src);
        }

        socket.sendCommand({
            type: 'social',
            command: 'player profile set image',
            data: {
                avatarImage,
                emoteId
            }
        });
    }

    displayed() {
        if (!this.displayLoaded) {
            this.displayLoaded = true;
            this.$emoteContainer.perfectScrollbar('update');
            Object.values(this.emoteEntries).forEach(emote => emote.preLoadImage.lazyLoadEvent());
        }
    }

}

class ProfileImageSelectorEmote {
    constructor(emoteInfo, active, $emoteContainer, selectHandler) {
        this.$tile = $(format(this.TEMPALTE));

        this.src = emoteInfo.src;
        this.srcSet = emoteInfo.srcSet;
        this.id = emoteInfo.emoteId;
        this.selected = active;

        if (!emoteInfo.unlocked) {
            this.$tile.addClass('locked');
        }

        this.$tile.click(() => {
            selectHandler(null, this.id);
        });

        this.preLoadImage = new PreloadImage(
            this.$tile,
            this.src,
            this.srcSet,
            false,
            null,
            null,
            null,
            $emoteContainer,
            true
        );
    }

    set selected(newValue) {
        if (newValue) {
            this.$tile.addClass("selected");
        } else {
            this.$tile.removeClass("selected");
        }
    }
}

ProfileImageSelectorEmote.prototype.TEMPALTE = $("#playerProfileEmoteOption").html();
