"use strict";

/*exported emojiSelector*/

class EmojiSelector {
    constructor() {
        this.$container = $("#gcEmojiPickerContainer");
        this.$button = $("#gcEmojiPickerButton");
        this.$lockInContainer = $("#gcEmojiLockInContainer");

        this.$allEmoteContainer = this.$container.find("#gcEmojiPickerAllContainer > .gcEmojiPickerEmoteContainer");
        this.$recentEmoteContainer = this.$container.find("#gcEmojiPickerRecentContainer > .gcEmojiPickerEmoteContainer");

        this.isOpen = false;
        this.entries = [];
        this.recentEmotes = [];
        this.MAX_NUMBER_OF_RECENT = 18;

        this.$button.click(() => {
            if (this.isOpen) {
                this.close();
            } else {
                this.open();
            }
        });

        this.$lockInContainer.click(() => {
            if (this.isOpen) {
                this.close();
            } else {
                this.open();
            }
        });

        $("body").click(() => {
            if (this.isOpen) {
                this.close();
            }
        });

        $(".gcInputContainer").click((event) => {
            if (this.isOpen) {
                event.stopPropagation();
            }
        });

        this.$container.perfectScrollbar({
            suppressScrollX: true,
            minScrollbarLength: 50
        });
    }

    setup(recentEmotes) {
        this.buildEntries();
        this.setupRecent(recentEmotes);
    }

    setupRecent(recentEmotes) {
        recentEmotes.forEach((recentEmote) => {
            this.insertRecentEmote(recentEmote.emoteId, recentEmote.emojiId, recentEmote.shortCode);
        });
        this.buildRecent();
    }

    insertRecentEmote(emoteId, emojiId, shortCode) {
        let emoteEntry;
        let activeIndex;
        if (emoteId) {
            let emote = storeWindow.getEmote(emoteId);
            activeIndex = this.recentEmotes.findIndex(entry => entry.emoteId === emoteId);
            emoteEntry = this.createEmoteEntry(emote, emote.emoteId);
        } else if (emojiId) {
            let emoji = patreon.getCustomEmoji(emojiId);
            activeIndex = this.recentEmotes.findIndex(entry => entry.emojiId === emojiId);
            emoteEntry = this.createEmojiEntry(emoji, emojiId);
        } else if (shortCode) {
            activeIndex = this.recentEmotes.findIndex(entry => entry.shortCode === shortCode);
            emoteEntry = this.createShortCodeEntry(shortCode);
        }
        if (activeIndex !== -1) {
            this.recentEmotes.splice(activeIndex, 1);
        }
        if (emoteEntry) {
            this.recentEmotes.unshift(emoteEntry);
            this.recentEmotes.splice(this.MAX_NUMBER_OF_RECENT, 999);
        }
    }

    buildRecent() {
        this.$recentEmoteContainer.find(".amqEmoji").detach();
        this.recentEmotes.forEach((emote) => {
            this.$recentEmoteContainer.append(emote.$entry);
            emote.preLoadImage.lazyLoadEvent();
        });
    }

    buildEntries() {
        this.entries = [];
        this.$allEmoteContainer.find(".amqEmoji").remove();
        let patreonEmojis = patreon.getCustomEmojis();
        let emotes = storeWindow.getAllEmotes();

        patreonEmojis
            .filter((emoji) => emoji.active)
            .forEach((emojiInfo) => {
                this.insertEmoji(emojiInfo);
            });
        emotes
            .filter((emote) => emote.unlocked)
            .forEach((emoteInfo) => {
                this.insertEmote(emoteInfo);
            });
        patreonEmojis
            .filter((emoji) => !emoji.active)
            .forEach((emojiInfo) => {
                this.insertEmoji(emojiInfo);
            });
        emotes
            .filter((emote) => !emote.unlocked)
            .forEach((emoteInfo) => {
                this.insertEmote(emoteInfo);
            });
    }

    createEmoteEntry(emoteInfo, emoteId) {
        return new EmojiSelectorEntry(
            emoteInfo.name,
            emoteInfo.src,
            emoteInfo.srcSet,
            !emoteInfo.unlocked,
            this.$container,
            emoteId
        );
    }

    insertEmote(emoteInfo) {
        let emoteEntry = this.createEmoteEntry(emoteInfo);
        this.entries.push(emoteEntry);
        this.$allEmoteContainer.append(emoteEntry.$entry);
    }

    createEmojiEntry(emojiInfo, emojiId) {
        return new EmojiSelectorEntry(
            emojiInfo.name,
            getCustomEmojiPath(emojiInfo.id),
            null,
            !emojiInfo.active,
            this.$container,
            null,
            emojiId
        );
    }

    insertEmoji(emojiInfo) {
        let emoteEntry = this.createEmojiEntry(emojiInfo);
        this.entries.push(emoteEntry);
        this.$allEmoteContainer.append(emoteEntry.$entry);
    }

    createShortCodeEntry(shortcode) {
        if (typeof twemoji !== "undefined") {
            let {text} = translateShortcodeToUnicode(shortcode);
            let $tweEntry = $(twemoji.parse(text));
            return new EmojiSelectorEntry(
                shortcode,
                $tweEntry.attr("src"),
                null,
                false,
                this.$container,
                null,
                null,
                shortcode
            );
        } else {
            return null;
        }
    }

    removeRecentEmoji(emojiId) {
        let index = this.recentEmotes.findIndex(entry => entry.emojiId === emojiId);
        if (index !== -1) {
            this.recentEmotes.splice(index, 1);
            this.buildRecent();
        }
    }

    open() {
        this.isOpen = true;
        this.$container.removeClass("hide");

        this.entries.forEach((entry) => entry.preLoadImage.lazyLoadEvent());
        this.recentEmotes.forEach((entry) => entry.preLoadImage.lazyLoadEvent());
        this.$container.perfectScrollbar("update");
    }

    close() {
        this.isOpen = false;
        this.$container.addClass("hide");
    }

    setLockInMode(on) {
        if (on) {
            this.$button.addClass('hide');
            this.$lockInContainer.removeClass('hide');
        } else {
            this.$button.removeClass('hide');
            this.$lockInContainer.addClass('hide');
            this.clearLockedInEmote();
        }
    }

    lockInEmoteInMsg(msg) {
        let $img;
        if (messageContainsShortcodes(msg)) {
            $img = $(twemoji.parse(translateShortcodeToUnicode(msg).text));
        } else if (storeWindow.messageContainEmote(msg)) {
            let emote = storeWindow.getAllEmotes().find(emote => emote.name === msg);
            if (emote.unlocked) {
                $img = $(`<img src="${emote.smallSrc}" srcset="${emote.srcSet}" sizes="30px"></img>`);

            }
        } else if (patreon.msgContainsCustomEmoji(msg)) {
            let emoji = patreon.getEmojiFromName(msg);
            if (emoji.active) {
                let src = getCustomEmojiPath(emoji.id);
                $img = $(`<img src="${src}"></img>`);
            }
        }
        if ($img) {
            this.setLockedInEmote($img);
            socket.sendCommand(
                {
                    type: "lobby",
                    command: "lock in emote",
                    data: {
                        emote: msg
                    }
                }
            );
        }
    }

    clearLockedInEmote() {
        this.$lockInContainer.html("");
    }

    setLockedInEmote($emote) {
        this.clearLockedInEmote();
        this.$lockInContainer.append($emote);
    }
}

class EmojiSelectorEntry {
    constructor(name, src, srcSet, locked, $container, emoteId, emojiId, shortCode) {
        this.name = name;

        this.emoteId = emoteId;
        this.emojiId = emojiId;
        this.shortCode = shortCode;

        this.$entry = $(format(this.TEMPLATE, "", this.name));
        if (locked) {
            this.$entry.addClass("locked");
        } else {
            this.$entry.click(() => {
                gameChat.insertEmoji(this.name);
            });
        }
        this.preLoadImage = new PreloadImage(this.$entry, src, srcSet, false, null, null, null, $container, true);
    }
}

EmojiSelectorEntry.prototype.TEMPLATE = $("#emojiTemplate").html();

var emojiSelector = new EmojiSelector();
