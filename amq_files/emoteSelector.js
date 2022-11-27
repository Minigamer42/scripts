"use strict";
/* eslint-disable no-unexpected-multiline */

/*exported emoteSelector, EmoteSelectorInputWrapper*/

class EmoteSelector {
    constructor() {
        this.emojiCache = new EmoteSelectorCache((entry) => entry);
        this.emoteCache = new EmoteSelectorCache((entry) => entry.name);

        this.emoteList = [];
        this.emoteRegex;
    }

    setup() {
        this.buildEmoteRegex();
    }

    buildEmoteRegex() {
        let patreonEmoteList = patreon
            .getCustomEmojis()
            .filter((emoji) => emoji.active)
            .map(({name, id}) => {
                return {name, src: getCustomEmojiPath(id), srcset: null};
            });
        let unlockedEmoteNameList = storeWindow
            .getAllEmotes()
            .filter((emote) => emote.unlocked)
            .map(({name, src, srcset}) => {
                return {name, src, srcset};
            });
        this.emoteList = patreonEmoteList.concat(unlockedEmoteNameList);

        let startStringMap = {};
        this.emoteList.forEach((entry) => {
            startStringMap[entry.name.substring(0, 3)] = true;
        });

        let regexString = "^(";
        Object.keys(startStringMap).forEach((startString) => {
            regexString += startString + "|";
        });

        this.emoteRegex = new RegExp(regexString.replace(/\|$/) + ")");
        this.emoteCache.clearCache();
    }

    handleKeypress($input) {
        let currentWord = this.getCurrentWord($input);
        let entries = [];
        if (this.EMOJI_REGEX.test(currentWord)) {
            let emojiMatches = this.getEmojiMatches(currentWord);
            entries = emojiMatches.map((shortcode) => {
                let {text} = translateShortcodeToUnicode(shortcode);
                let $tweEntry = $(twemoji.parse(text));
                return {
                    name: shortcode,
                    src: $tweEntry.attr("src"),
                    srcset: null
                };
            });
        } else if (this.emoteList.length && this.emoteRegex.test(currentWord)) {
            let emoteMatches = this.getEmoteMatches(currentWord);
            entries = emoteMatches;
        }
        return {
            word: currentWord,
            entries: entries.slice(0, 10)
        };
    }

    getCurrentWord($input) {
        let text = $input.val();
        let selectionStart = $input[0].selectionStart;
        let selectionEnd = $input[0].selectionEnd;
        if (selectionStart !== selectionEnd) {
            return "";
        } else {
            let targetIndex = selectionStart;
            let prevSpaceIndex = text.lastIndexOf(" ", targetIndex - 1);
            let prevEmojiIndex = text.lastIndexOf(":", targetIndex - 1);
            let prevIndex = prevSpaceIndex > prevEmojiIndex ? prevSpaceIndex + 1 : prevEmojiIndex;
            let nextSpaceIndex = text.indexOf(" ", targetIndex);
            let begin = prevIndex < 0 ? 0 : prevIndex;
            let end = nextSpaceIndex < 0 ? text.length : nextSpaceIndex;
            return text.substring(begin, end);
        }
    }

    getEmojiMatches(currentWord) {
        if (this.emojiCache.getInCache(currentWord)) {
            return this.emojiCache.lookup(currentWord);
        } else {
            let shortCodes = getShortCodeMatchingStart(currentWord);
            this.emojiCache.setCache(currentWord, shortCodes);
            return shortCodes;
        }
    }

    getEmoteMatches(currentWord) {
        if (!this.emoteCache.getInCache(currentWord)) {
            let emotes = this.emoteList.filter((entry) => entry.name.startsWith(currentWord));
            this.emoteCache.setCache(currentWord, emotes);
        }
        return this.emoteCache.lookup(currentWord);
    }
}

EmoteSelector.prototype.EMOJI_REGEX = /^:[a-zA-Z-]{2}/;

class EmoteSelectorCache {
    constructor(nameRetriver) {
        this.currentCacheList = [];
        this.cacheRegex = null;
        this.nameRetriver = nameRetriver;
    }

    getInCache(word) {
        return this.cacheRegex && this.cacheRegex.test(word);
    }

    clearCache() {
        this.currentCacheList = [];
        this.cacheRegex = null;
    }

    setCache(word, list) {
        this.cacheRegex = new RegExp("^" + word);
        this.currentCacheList = list;
    }

    lookup(word) {
        return this.currentCacheList.filter(
            (entry) => this.nameRetriver(entry).startsWith(word) && this.nameRetriver(entry) !== word
        );
    }
}

class EmoteSelectorInputWrapper {
    constructor($input, inputIdentifer) {
        this.$input = $input;
        this.items = [];
        this.counter = 0;
        this.displayed = false;
        this.currentWord = null;
        $.contextMenu({
            selector: inputIdentifer,
            trigger: "none",
            position: (opt) => {
                let {left, top} = this.$input.offset();
                opt.$menu.css({width: 280, top: top - 10, left: left, transform: "translateY(-100%)"});
            },
            build: () => {
                let itemMap = {};
                this.items.forEach(({name, src, srcset}) => {
                    let $img = $(`<img class='amqEmoji' sizes='30px'></img>`);
                    if (srcset) {
                        $img.attr("srcset", srcset);
                    }
                    $img.attr("src", src);
                    itemMap[name] = {
                        name: name,
                        className: "context-menu-item emoteSelectorItem",
                        icon: (opt, $itemElement) => {
                            $itemElement.prepend($img);
                        },
                        callback: () => {
                            let text = this.$input.val();
                            let targetIndex = $input[0].selectionStart;
                            let prevSpaceIndex = text.lastIndexOf(" ", targetIndex - 1);
                            let prevEmojiIndex = text.lastIndexOf(":", targetIndex - 1);
                            let prevIndex = prevSpaceIndex > prevEmojiIndex ? prevSpaceIndex + 1 : prevEmojiIndex;
                            let nextSpaceIndex = text.indexOf(" ", targetIndex);
                            let begin = prevIndex < 0 ? 0 : prevIndex;
                            let end = nextSpaceIndex < 0 ? text.length : nextSpaceIndex;
                            let newText = text.slice(0, begin) + name + " " + text.slice(end);
                            let textMaxLength = this.$input.attr("maxlength");
                            if (textMaxLength && newText.length > parseInt(textMaxLength)) {
                                newText = newText.slice(0, parseInt(textMaxLength));
                            }
                            this.$input.val(newText);
                            let newCursorPosition = begin + name.length + 1;
                            this.$input[0].selectionEnd = newCursorPosition;
                        }
                    };
                });
                return {
                    items: itemMap
                };
            },
            events: {
                show: () => {
                    this.displayed = true;
                    //Manuel handle the contextMenu key events
                    setTimeout(() => {
                        $(document).off("keydown.contextMenu").on("keydown.contextMenu", this.CUSTOM_KEY_HANDLER.bind(this));
                    }, 1);
                },
                hide: () => {
                    this.displayed = false;
                }
            },
            animation: {duration: 0, show: "slideDown", hide: "slideUp"}
        });
    }

    handleKeypress() {
        if (options.disableEmojis) {
            return;
        }
        let {word, entries} = emoteSelector.handleKeypress(this.$input);
        this.items = entries;
        this.counter++;
        if (entries.length) {
            if (this.currentWord !== word) {
                this.display();
            }
        } else {
            this.hide();
        }
        this.currentWord = word;
    }

    display() {
        if (this.displayed) {
            this.$input.contextMenu("hide");
            this.$input.contextMenu();
        } else {
            this.$input.contextMenu();
            this.displayed = true;
        }
    }

    hide() {
        if (this.displayed) {
            this.$input.contextMenu("hide");
        }
    }
}

EmoteSelectorInputWrapper.prototype.CUSTOM_KEY_HANDLER = function (e) {
    var opt = {};
    let handle = {
        keyStop: function (e, opt) {
            if (!opt.isInput) {
                e.preventDefault();
            }

            e.stopPropagation();
        }
    };

    // Only get the data from $currentTrigger if it exists
    if (this.$input) {
        opt = this.$input.data("contextMenu") || {};
    }
    // If the trigger happen on a element that are above the contextmenu do this
    if (typeof opt.zIndex === "undefined") {
        opt.zIndex = 0;
    }
    var targetZIndex = 0;
    var getZIndexOfTriggerTarget = function (target) {
        if (target.style.zIndex !== "") {
            targetZIndex = target.style.zIndex;
        } else {
            if (target.offsetParent !== null && typeof target.offsetParent !== "undefined") {
                getZIndexOfTriggerTarget(target.offsetParent);
            } else if (target.parentElement !== null && typeof target.parentElement !== "undefined") {
                getZIndexOfTriggerTarget(target.parentElement);
            }
        }
    };
    getZIndexOfTriggerTarget(e.target);
    // If targetZIndex is heigher then opt.zIndex dont progress any futher.
    // This is used to make sure that if you are using a dialog with a input / textarea / contenteditable div
    // and its above the contextmenu it wont steal keys events
    if (opt.$menu && parseInt(targetZIndex, 10) > parseInt(opt.$menu.css("zIndex"), 10)) {
        return;
    }
    switch (e.keyCode) {
        case 9:
        case 38: // up
            handle.keyStop(e, opt);
            // if keyCode is [38 (up)] or [9 (tab) with shift]
            if (opt.isInput) {
                if (e.keyCode === 9 && e.shiftKey) {
                    e.preventDefault();
                    if (opt.$selected) {
                        opt.$selected.find("input, textarea, select").blur();
                    }
                    if (opt.$menu !== null && typeof opt.$menu !== "undefined") {
                        opt.$menu.trigger("prevcommand");
                    }
                    return;
                } else if (e.keyCode === 38 && opt.$selected.find("input, textarea, select").prop("type") === "checkbox") {
                    // checkboxes don't capture this key
                    e.preventDefault();
                    return;
                }
            } else if (e.keyCode !== 9 || e.shiftKey) {
                if (opt.$menu !== null && typeof opt.$menu !== "undefined") {
                    opt.$menu.trigger("prevcommand");
                }
                return;
            }
        // case 9: // tab - reached through omitted break;
        // eslint-disable-next-line no-fallthrough
        case 40: // down
            handle.keyStop(e, opt);
            if (opt.isInput) {
                if (e.keyCode === 9) {
                    e.preventDefault();
                    if (opt.$selected) {
                        opt.$selected.find("input, textarea, select").blur();
                    }
                    if (opt.$menu !== null && typeof opt.$menu !== "undefined") {
                        opt.$menu.trigger("nextcommand");
                    }
                    return;
                } else if (e.keyCode === 40 && opt.$selected.find("input, textarea, select").prop("type") === "checkbox") {
                    // checkboxes don't capture this key
                    e.preventDefault();
                    return;
                }
            } else {
                if (opt.$menu !== null && typeof opt.$menu !== "undefined") {
                    opt.$menu.trigger("nextcommand");
                }
                return;
            }
            break;
        case 35: // end
        case 36: // home
            if (opt.$selected && opt.$selected.find("input, textarea, select").length) {
                return;
            } else {
                ((opt.$selected && opt.$selected.parent()) || opt.$menu)
                    .children(":not(." + opt.classNames.disabled + ", ." + opt.classNames.notSelectable + ")")
                    [e.keyCode === 36 ? "first" : "last"]()
                    .trigger("contextmenu:focus");
                e.preventDefault();
                return;
            }

        case 13: // enter
            if (opt.isInput) {
                handle.keyStop(e, opt);
                if (opt.$selected && !opt.$selected.is("textarea, select")) {
                    e.preventDefault();
                    return;
                }
                break;
            }
            if (typeof opt.$selected !== "undefined" && opt.$selected !== null) {
                handle.keyStop(e, opt);
                opt.$selected.trigger("mouseup");
            }
            return;

        case 33: // page up
        case 34: // page down
            // prevent browser from scrolling down while menu is visible
            handle.keyStop(e, opt);
            return;

        case 27: // esc
            handle.keyStop(e, opt);
            if (opt.$menu !== null && typeof opt.$menu !== "undefined") {
                opt.$menu.trigger("contextmenu:hide");
            }
            return;

        default:
            // 0-9, a-z
            var k = String.fromCharCode(e.keyCode).toUpperCase();
            if (opt.accesskeys && opt.accesskeys[k]) {
                // according to the specs accesskeys must be invoked immediately
                opt.accesskeys[k].$node.trigger(opt.accesskeys[k].$menu ? "contextmenu:focus" : "mouseup");
                return;
            }
            break;
    }
    // pass event to selected item,
    // stop propagation to avoid endless recursion
    e.stopPropagation();
    if (typeof opt.$selected !== "undefined" && opt.$selected !== null) {
        opt.$selected.trigger(e);
    }
};

var emoteSelector = new EmoteSelector();
