"use strict";

/*exported EmoteBubler*/

class EmoteBubler {
    constructor() {
        this.canvas = new AnimationCanvas($("#gcEmoteAnimationCanvas"));
        this.aniamtionController = new SimpleAnimationController(this.canvas);
        this.emoteImageCatch = {};
        this.emojiImageCatch = {};
        this.shortCodeCatch = {};
    }

    newBubbleEventList(bubbleEvents) {
        bubbleEvents = shuffleArray(bubbleEvents);
        let bubbleGroups = [];
        while (bubbleEvents.length) {
            bubbleGroups.push(bubbleEvents.splice(0, this.MAX_GROUP_SIZE));
        }
        if (bubbleGroups.length === 1) {
            this.spawnBubbleGroup(bubbleGroups[0]);
        } else {
            bubbleGroups.forEach((group, index) => {
                setTimeout(() => {
                    this.spawnBubbleGroup(group);
                }, index * this.GROUP_SPAWN_SPEED);
            });
        }
    }

    spawnBubbleGroup(group) {
        group.forEach(({emoteIds, shortCodes, customEmojiIds}) => {
            this.newBubles(emoteIds, shortCodes, customEmojiIds);
        });
    }

    newBubles(emoteIds, shortCodes, customEmojiIds) {
        if (emoteIds) {
            emoteIds.forEach((emoteId) => {
                this.insertEmoteBuble(emoteId);
            });
        }
        if (shortCodes) {
            shortCodes.forEach((shortCode) => {
                this.insertShortCodeBuble(shortCode);
            });
        }
        if (customEmojiIds) {
            customEmojiIds.forEach(emojiId => {
                this.insertEmojiBuble(emojiId);
            });
        }
    }

    insertEmoteBuble(emoteId) {
        if (this.emoteImageCatch[emoteId]) {
            this.createNewBuble(this.emoteImageCatch[emoteId]);
        } else {
            let src = storeWindow.getEmote(emoteId).smallSrc;
            let img = new Image();
            img.addEventListener(
                "load",
                () => {
                    if (!this.emoteImageCatch[emoteId]) {
                        this.emoteImageCatch[emoteId] = this.createOffscrenImageCanvas(img, this.IMAGE_SIZE);
                    }
                    this.createNewBuble(this.emoteImageCatch[emoteId]);
                },
                false
            );
            img.src = src;
        }
    }

    insertEmojiBuble(emojiId) {
        if (this.emojiImageCatch[emojiId]) {
            this.createNewBuble(this.emojiImageCatch[emojiId]);
        } else {
            let src = getCustomEmojiPath(emojiId);
            let img = new Image();
            img.addEventListener(
                "load",
                () => {
                    if (!this.emojiImageCatch[emojiId]) {
                        this.emojiImageCatch[emojiId] = this.createOffscrenImageCanvas(img, this.IMAGE_SIZE);
                    }
                    this.createNewBuble(this.emojiImageCatch[emojiId]);
                },
                false
            );
            img.src = src;
        }
    }

    insertShortCodeBuble(shortCode) {
        if (this.shortCodeCatch[shortCode]) {
            this.createNewBuble(this.shortCodeCatch[shortCode]);
        } else if (typeof twemoji !== "undefined") {
            let {text} = translateShortcodeToUnicode(shortCode);
            let src = $(twemoji.parse(text)).attr("src");
            let img = new Image();
            img.addEventListener(
                "load",
                () => {
                    if (!this.shortCodeCatch[shortCode]) {
                        this.shortCodeCatch[shortCode] = this.createOffscrenImageCanvas(img, this.IMAGE_SIZE);
                    }
                    this.createNewBuble(this.shortCodeCatch[shortCode]);
                },
                false
            );
            img.src = src;
        }
    }

    createNewBuble(imageCanvas) {
        let startX = Math.round(Math.random() * (this.canvas.width - this.SPAWN_MARGIN_SIZE * 2) + this.SPAWN_MARGIN_SIZE);
        let startY = Math.round(this.canvas.height);

        let element = new RandomBubleImageElement(
            this.canvas.ctx,
            startX,
            startY,
            imageCanvas,
            this.MIN_HORI_ACC,
            this.MAX_HORI_ACC,
            this.MIN_HORI_CHANGE_CHANCE,
            this.MAX_HORI_CHANGE_CHANCE,
            this.MIN_MAX_HORI,
            this.MAX_MAX_HORI,
            this.MIN_VERT,
            this.MAX_VERT,
            0,
            () => {
                this.removeBuble(element);
            },
            this.canvas.height * this.FADE_OUT_START_PERCENT,
            this.FADE_OUT_RATE
        );

        this.canvas.content.push(element);
        if (this.canvas.content.length === 1) {
            this.aniamtionController.start();
        }
    }

    createOffscrenImageCanvas(img, size) {
        let $canvas = $("<canvas>");
        $canvas.attr("width", size);
        $canvas.attr("height", size);
        let ctx = $canvas[0].getContext("2d");
        ctx.drawImage(img, 0, 0, size, size);
        return $canvas[0];
    }

    removeBuble(element) {
        let index = this.canvas.content.findIndex((ele) => ele === element);
        if (index !== -1) {
            this.canvas.content.splice(index, 1);
        }
        if (this.canvas.content.length === 0) {
            this.aniamtionController.stop();
        }
    }

    resize() {
        this.canvas.updateCanvasSize();
    }
}

EmoteBubler.prototype.SPAWN_MARGIN_SIZE = 40; //px
EmoteBubler.prototype.MIN_HORI_ACC = 20; //px/s
EmoteBubler.prototype.MAX_HORI_ACC = 20; //px/s
EmoteBubler.prototype.MIN_HORI_CHANGE_CHANCE = 0.1; //%
EmoteBubler.prototype.MAX_HORI_CHANGE_CHANCE = 0.1; //%
EmoteBubler.prototype.MIN_MAX_HORI = 20; //px/s
EmoteBubler.prototype.MAX_MAX_HORI = 40; //px/s
EmoteBubler.prototype.MIN_VERT = -120; //px/s
EmoteBubler.prototype.MAX_VERT = -170; //px/s
EmoteBubler.prototype.IMAGE_SIZE = 30; //px
EmoteBubler.prototype.FADE_OUT_START_PERCENT = 0.45; //%
EmoteBubler.prototype.FADE_OUT_RATE = 1.5; //%/s

EmoteBubler.prototype.MAX_GROUP_SIZE = 5;
EmoteBubler.prototype.GROUP_SPAWN_SPEED = 20; //ms