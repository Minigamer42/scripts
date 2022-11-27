"use strict";

/*exported cdnFormater*/

class CDNFormater {
    constructor() {
        this.CDN_URL = "https://cdn.animemusicquiz.com";
        this.AVATAR_URL = this.CDN_URL + "/v1/avatars";
        this.BADGE_URL = this.CDN_URL + "/v1/badges";
        this.EMOTE_URL = this.CDN_URL + "/v1/emotes";
        this.STORE_ICON_URL = this.CDN_URL + "/v1/store-categories";
        this.BACKGROUND_URL = this.CDN_URL + "/v1/backgrounds";
        this.TICKET_URL = this.CDN_URL + "/v1/ui/currency";

        this.AVATAR_SIZES = [100, 150, 250, 350, 500, 600, 900];
        this.AVATAR_POSE_FILENAMES = {
            1: "Basic.webp",
            2: "Thinking.webp",
            3: "Waiting.webp",
            4: "Wrong.webp",
            5: "Right.webp",
            6: "Confused.webp"
        };
        this.AVATAR_POSE_IDS = {
            BASE: 1,
            THINKING: 2,
            WAITING: 3,
            WRONG: 4,
            RIGHT: 5,
            CONFUSED: 6
        };

        this.AVATAR_HEAD_SIZES = [100, 150, 250]; //width
        this.AVATAR_HEAD_FILENAME = "Head.webp";

        this.BADGE_SIZES = [30, 50, 100, 200, 300, 450]; //width
        this.PATREON_PREVIEW_BADGE_FILENAME = "patreon-36.webp";

        this.STORE_ICON_SIZES = [130, 150, 200]; //height
        this.STORE_ICON_HEIGHT_WIDTH_MAP = {
            130: 172,
            150: 198,
            200: 264
        };

        this.BACKGROUND_SIZES = [200, 250, 400];
        this.BACKGROUND_STORE_TILE_SIZE = 400;
        this.BACKGROUND_STORE_PREVIEW_SIZE = 250;
        this.BACKGROUND_ROOM_BROWSER_SIZE = 250;
        this.BACKGROUND_GAME_SIZE = 200;

        this.EMOTE_SIZES = [150, 100, 50, 30];

        this.TICKET_SIZES = [250, 200, 100, 50, 30];
        this.TICKET_FILE_NAMES = {
            1: "ticket1.webp",
            2: "ticket2.webp",
            3: "ticket3.webp",
            4: "ticket4.webp"
        };

        this.RHYTHM_ICON_PATH = "https://cdn.animemusicquiz.com/v1/ui/currency/30px/rhythm.webp";
    }

    newAvatarSrc(avatar, outfit, option, optionOn, color, poseId) {
        let maxSize = this.AVATAR_SIZES[this.AVATAR_SIZES.length - 1];
        if (!optionOn) {
            option = "No " + option;
        }
        return this.buildUrl(
            this.AVATAR_URL,
            avatar,
            outfit,
            option,
            color,
            this.newSizePath(maxSize),
            this.AVATAR_POSE_FILENAMES[poseId]
        );
    }

    newAvatarSrcSet(avatar, outfit, option, optionOn, color, poseId) {
        let srcset = "";
        if (!optionOn) {
            option = "No " + option;
        }
        this.AVATAR_SIZES.forEach((size) => {
            srcset +=
                this.buildUrl(
                    this.AVATAR_URL,
                    avatar,
                    outfit,
                    option,
                    color,
                    this.newSizePath(size),
                    this.AVATAR_POSE_FILENAMES[poseId]
                ) +
                " " +
                size +
                "w,";
        });
        return srcset.replace(/,$/, "");
    }

    newAvatarHeadSrc(avatar, outfit, option, optionOn, color) {
        let maxSize = this.AVATAR_HEAD_SIZES[this.AVATAR_HEAD_SIZES.length - 1];
        if (!optionOn) {
            option = "No " + option;
        }
        return this.buildUrl(
            this.AVATAR_URL,
            avatar,
            outfit,
            option,
            color,
            this.newSizePath(maxSize),
            this.AVATAR_HEAD_FILENAME
        );
    }

    newAvatarHeadSrcSet(avatar, outfit, option, optionOn, color) {
        let srcset = "";
        if (!optionOn) {
            option = "No " + option;
        }
        this.AVATAR_HEAD_SIZES.forEach((size) => {
            srcset +=
                this.buildUrl(
                    this.AVATAR_URL,
                    avatar,
                    outfit,
                    option,
                    color,
                    this.newSizePath(size),
                    this.AVATAR_HEAD_FILENAME
                ) +
                " " +
                size +
                "w,";
        });
        return srcset.replace(/,$/, "");
    }

    newAvatarBackgroundSrc(fileName, size) {
        if (/.svg/.test(fileName)) {
            return this.buildUrl(this.BACKGROUND_URL, "svg", fileName);
        } else {
            return this.buildUrl(this.BACKGROUND_URL, this.newSizePath(size), fileName);
        }
    }

    newBadgeSrc(fileName) {
        let maxSize = this.BADGE_SIZES[this.BADGE_SIZES.length - 1];
        return this.buildUrl(this.BADGE_URL, this.newSizePath(maxSize), fileName);
    }

    newBadgeSrcSet(fileName) {
        let srcset = "";
        this.BADGE_SIZES.forEach((size) => {
            srcset += this.buildUrl(this.BADGE_URL, this.newSizePath(size), fileName) + " " + size + "w,";
        });
        return srcset.replace(/,$/, "");
    }

    newStoreIconSrc(name) {
        let maxSize = this.STORE_ICON_SIZES[this.STORE_ICON_SIZES.length - 1];
        return this.buildUrl(this.STORE_ICON_URL, this.newSizePath(maxSize), name + ".webp");
    }

    newStoreIconSrcSet(name) {
        let srcset = "";
        this.STORE_ICON_SIZES.forEach((size) => {
            srcset +=
                this.buildUrl(this.STORE_ICON_URL, this.newSizePath(size), name + ".webp") +
                " " +
                this.STORE_ICON_HEIGHT_WIDTH_MAP[size] +
                "w,";
        });
        return srcset.replace(/,$/, "");
    }

    newStoreAvatarIconSrc(avatarName, outfitName) {
        return this.newStoreIconSrc(avatarName + "_" + this.formatScoreIconOutfitName(outfitName));
    }

    newStoreAvatarIconSrcSet(avatarName, outfitName) {
        return this.newStoreIconSrcSet(avatarName + "_" + this.formatScoreIconOutfitName(outfitName));
    }

    newEmoteSrc(emoteName) {
        let maxSize = this.EMOTE_SIZES[0];
        return this.buildUrl(this.EMOTE_URL, this.newSizePath(maxSize), emoteName + ".webp");
    }

    newEmoteSmallSrc(emoteName) {
        let minSize = this.EMOTE_SIZES[this.EMOTE_SIZES.length - 1];
        return this.buildUrl(this.EMOTE_URL, this.newSizePath(minSize), emoteName + ".webp");
    }

    newEmoteSrcSet(emoteName) {
        let srcset = "";
        this.EMOTE_SIZES.forEach((size) => {
            srcset +=
                this.buildUrl(this.EMOTE_URL, this.newSizePath(size), emoteName + ".webp") + " " + size + "w,";
        });
        return srcset.replace(/,$/, "");
    }

    newTicketSrc(ticketTier) {
        let maxSize = this.TICKET_SIZES[0];
        return this.buildUrl(this.TICKET_URL, this.newSizePath(maxSize), this.TICKET_FILE_NAMES[ticketTier]);
    }

    newTicketSrcSet(ticketTier) {
        let srcset = "";
        this.TICKET_SIZES.forEach((size) => {
            srcset +=
                this.buildUrl(this.TICKET_URL, this.newSizePath(size), this.TICKET_FILE_NAMES[ticketTier]) +
                " " +
                size +
                "w,";
        });
        return srcset.replace(/,$/, "");
    }

    formatScoreIconOutfitName(name) {
        return name.toLowerCase().replace(/[ -]/g, "_");
    }

    newSizePath(size) {
        return size + "px";
    }

    buildUrl() {
        return encodeURI(
            Object.values(arguments).reduce((accumulator, arg) => {
                if (accumulator && !/\/$/.test(accumulator)) {
                    accumulator += "/";
                }
                return accumulator + arg;
            }, "")
        );
    }
}

var cdnFormater = new CDNFormater();
