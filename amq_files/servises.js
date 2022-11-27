"use strict";

/*exported getTime, format, selfName, displayMessage, displayOption, removeFromArray, chatValidator, escapeHtml, escapeRegExp, capitalizeMajorWords, fitTextToContainer, displayHtmlMessage, isGameAdmin, isTopAdmin, passChatMessage, getEmojiPath, getCustomEmojiPath,createHoverablePopoverHandlers, getNextBadgePath, shuffleArray, PAYPAL_ENV, setOneCheckBoxAlwaysOn, convertDurationToCountdownString, getVolumeAtMax, createBadgePopoverHtml, numberWithCommas, TICKET_TIER_RHYTHM_PRICES, popoutEmotesInMessage, taxRate*/
function getTime() {
    return new Date().getTime();
}

/**
 * Format a string with arguments. Arguments are passed as
 * extra arguements for the function
 * @param  {[string]} str [string to format]
 * @return {[string]}     [formated string]
 */
function htmlToElement(html) {
    var template = document.createElement("template");
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.childNodes;
}

// function format(str) {
// 	var args = Array.prototype.slice.call(arguments, 1);
// 	return str.replace(/{(\d+)}/g, function (match, number) {
// 		return typeof args[number] !== "undefined" ? args[number] : match;
// 	});
// }
function format(str) {
    var args = Array.prototype.slice.call(arguments, 1);
    const newStr = str.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] !== "undefined" ? args[number] : match;
    });
    return /^<.*>$/gms.test(str) ? htmlToElement(newStr) : newStr;
}

function formatNoHtml(str) {
    var args = Array.prototype.slice.call(arguments, 1);
    const newStr = str.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] !== "undefined" ? args[number] : match;
    });
    return newStr;
}

var TICKET_TIER_RHYTHM_PRICES = {
    1: 20,
    2: 60,
    3: 200,
    4: 700
};
var PAYPAL_ENV = "production"; //"sandbox";
let SWAL_ACTIVE = true;

$(function () {
    $(window).bind("beforeunload", () => {
        SWAL_ACTIVE = false;
        swal.close();
        setTimeout(() => {
            setTimeout(() => {
                SWAL_ACTIVE = true;
            }, 1000);
        }, 1);
    });
});

function displayMessage(title, msg, callback = () => {
}, outsideDismiss = true, disableSWAL = false) {
    if (SWAL_ACTIVE) {
        SWAL_ACTIVE = !disableSWAL;
        return swal({
            title: title,
            text: msg,
            onClose: callback,
            allowOutsideClick: outsideDismiss
        }).catch(swal.noop);
    }
}

function displayHtmlMessage(title, html, buttonText, callback) {
    if (!callback) {
        callback = () => {
        };
    }
    if (SWAL_ACTIVE) {
        return swal({
            title: title,
            html: html,
            confirmButtonText: buttonText,
            onClose: callback
        }).catch(swal.noop);
    }
}

function displayOption(title, msg, acceptMsg, declineMsg, callback, callbackCancel, outsideDismiss = true) {
    if (!callback) {
        callback = () => {
        };
    }
    if (!callbackCancel) {
        callbackCancel = () => {
        };
    }
    if (SWAL_ACTIVE) {
        return swal({
            title: title,
            text: msg,
            showCancelButton: true,
            confirmButtonColor: "#204d74",
            confirmButtonText: acceptMsg,
            cancelButtonText: declineMsg,
            allowOutsideClick: outsideDismiss
        }).then((result) => {
            if (result.dismiss) {
                callbackCancel();
            } else {
                callback(result.value);
            }
        });
    }
}

//Not used socialtab on and offline friend switched from array to Map.
function removeFromArray(array, element) {
    // var index = array.indexOf(element);
    let index = array.findIndex((e) => e.name === element);
    if (index > -1) {
        array.splice(index, 1);
    }
}

//Validator for chat messages
function ChatValidator() {
    this._MAX_CHAR_COUNT = 92;
}

ChatValidator.prototype.validateMsg = function (msg) {
    if (msg.length > this._MAX_CHAR_COUNT) {
        return false;
    }

    return true;
};

var chatValidator = new ChatValidator();

var selfName; //Set doing setup
var isGameAdmin; //Set doing setup
var isTopAdmin; //Set doing setup
var taxRate; //Set doing setup

var entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "/": "&#x2F;",
    "`": "&#x60;",
    "=": "&#x3D;"
};

function escapeHtml(string) {
    return String(string).replace(/[&<>"'`=/]/g, function (s) {
        return entityMap[s];
    });
}

function escapeRegExp(str) {
    return str.replace(/[-[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const SERVICES_WORDS_TO_NOT_CAPITALIZE = /^(and|or)$/;

function capitalizeMajorWords(string) {
    let wordArray = string.split(" ");
    let resultString = "";
    wordArray.forEach((word) => {
        if (SERVICES_WORDS_TO_NOT_CAPITALIZE.test(word)) {
            resultString += word;
        } else {
            resultString += capitalizeFirstLetter(word);
        }
        resultString += " ";
    });
    resultString.replace(/ $/, "");
    return resultString;
}

function fitTextToContainer($text, $container, baseFontSize, minimumSize) {
    let fontSize = baseFontSize;
    $text.css("font-size", fontSize);
    while (
        (Math.round($text.height()) > Math.round($container.height()) ||
            Math.round($text.width()) > Math.round($container.width())) &&
        fontSize > 2
        ) {
        fontSize -= 2;
        if (minimumSize > fontSize) {
            break;
        }
        $text.css("font-size", fontSize);
    }
}

const URL_REGEX =
    /\bhttps?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;

function extractUrls(message) {
    let urls = [];
    let match;
    do {
        match = URL_REGEX.exec(message);
        if (match) {
            urls.push(match[0]);
        }
    } while (match);

    return urls;
}

const EMOJI_TEMPLATE = $("#emojiTemplate").html();
const EMOTE_TEMPLATE = $("#emoteTemplate").html();

function passChatMessage(message, emojis, allowHtml) {
    let urls;
    if (!allowHtml) {
        urls = extractUrls(message);
        message = escapeHtml(message);

        urls.forEach((url, index) => {
            message = message.replace(escapeHtml(url), "<url-" + index + ">");
        });
    }

    if (!options.disableEmojis) {
        emojis.customEmojis.forEach((emoji) => {
            message = message.replace(
                new RegExp("\\b" + emoji.name + "\\b", "g"),
                formatNoHtml(EMOJI_TEMPLATE, getCustomEmojiPath(emoji.id), emoji.name)
            );
        });
        emojis.emotes.forEach((emoteId) => {
            let emote = storeWindow.getEmote(emoteId);
            message = message.replace(
                new RegExp("\\b" + emote.name + "\\b", "g"),
                formatNoHtml(EMOTE_TEMPLATE, cdnFormater.newEmoteSmallSrc(emote.name), emote.name)
            );
        });
        if (typeof twemoji !== "undefined") {
            let {text, codeMap} = translateShortcodeToUnicode(message);
            message = twemoji.parse(text, {
                attributes: function (rawText, iconId) {
                    if (codeMap[iconId]) {
                        return {
                            "data-emoteName": codeMap[iconId]
                        };
                    }
                }
            });
        }
        message = message.replace(/> </g, "><");
    }

    if (urls && urls.length) {
        urls.forEach((url, index) => {
            let $link = $('<a target="_blank" rel="noreferrer"></a>').attr("href", url).text(url);
            message = message.replace("<url-" + index + ">", $link[0].outerHTML);
        });
    }

    return message;
}

function popoutEmotesInMessage($message, containerId) {
    $message.find(".amqEmoji, .emoji").each((index, element) => {
        let $emote = $(element);
        let name = $emote.attr("data-emoteName");
        let useSrcSet = $emote.attr("data-emoteUseSrcSet");
        let src = $emote.attr("src");
        $emote.popover({
            content: createEmotePopoverHtml(name, useSrcSet, src),
            html: true,
            delay: 50,
            placement: "auto top",
            trigger: "hover",
            container: containerId
        });
    });
}

const EMOTE_POPOVER_TEMPLATE = $("#badgePopoverTemplate").html();

function createEmotePopoverHtml(name, useSrcSet, originalSrc) {
    let src, srcset;
    if (useSrcSet) {
        src = cdnFormater.newEmoteSrc(name);
        srcset = cdnFormater.newEmoteSrcSet(name);
    } else {
        src = originalSrc;
        srcset = "";
    }
    let htmlString = format(EMOTE_POPOVER_TEMPLATE, name, "", src, srcset, "");
    if (!name) {
        htmlString = htmlString.replace("{0}", "");
    }
    return htmlString;
}

const ANIMATED_EMOJI_HANDLE_REGEX =
    /^hibS?RB|^honRB|^komRB|^miyRB|^shiRB|^komwRB|^miywRB|^noeRB|^kyoRB|^hikRB|^noesRB|^honsRB/;

function getEmojiPath(emojiName) {
    let extension;
    if (ANIMATED_EMOJI_HANDLE_REGEX.test(emojiName)) {
        extension = ".gif";
    } else {
        extension = ".png";
    }
    return "/img/emojis/" + emojiName + extension;
}

const CUSTOM_EMOJI_BASE_PATH = "/emoji?id=";

function getCustomEmojiPath(id) {
    return CUSTOM_EMOJI_BASE_PATH + id;
}

function createHoverablePopoverHandlers($parent, playerName) {
    let timeout;

    let parentHovered = false;
    $parent.hover(
        () => {
            parentHovered = true;
        },
        () => {
            parentHovered = false;
        }
    );

    let onMouseEnter = function () {
        var _this = this;
        if (!$(".popover").length) {
            $(this).popover("show");
            if (socialTab.isFriend(playerName)) {
                $(".popover").find(".playerCommandIconAddFriend").addClass("disabled");
            } else if (socialTab.isBlocked(playerName)) {
                $(".popover").find(".playerCommandIconBlock").addClass("disabled");
            }
            $('[data-toggle="tooltip"]').tooltip();
            $(".popover").on("mouseleave", function () {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                timeout = setTimeout(function () {
                    if (!$(".popover:hover").length && !parentHovered) {
                        $(_this).popover("hide");
                    }
                }, 300);
            });
        }
    };
    let onMouseLeave = function () {
        var _this = this;
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
        timeout = setTimeout(function () {
            if (!$(".popover:hover").length && !parentHovered) {
                $(_this).popover("hide");
            }
        }, 300);
    };

    let onClick = function () {
        $(this).popover("toggle");
        if ($(".popover").length) {
            var _this = this;
            if (socialTab.isFriend(playerName)) {
                $(".popover").find(".playerCommandIconAddFriend").addClass("disabled");
            } else if (socialTab.isBlocked(playerName)) {
                $(".popover").find(".playerCommandIconBlock").addClass("disabled");
            }
            $('[data-toggle="tooltip"]').tooltip();
            $(".popover").on("mouseleave", function () {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                timeout = setTimeout(function () {
                    if (!$(".popover:hover").length && !parentHovered) {
                        $(_this).popover("hide");
                    }
                }, 300);
            });
        }
    };

    return {
        onMouseEnter: onMouseEnter,
        onMouseLeave: onMouseLeave,
        onClick: onClick
    };
}

function shuffleArray(array) {
    let counter = array.length;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        let index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}

//Obscured function, checks if addtional listeners are present
function getVolumeAtMax() {
    let nextVideoInfoListeners = socket.listners["quiz next video info"];
    return nextVideoInfoListeners != undefined && nextVideoInfoListeners.length > 1;
}

function setOneCheckBoxAlwaysOn(checkboxList, alertMessage) {
    checkboxList.forEach(($checkbox) => {
        $checkbox.click((event) => {
            let on = $checkbox.is(":checked");
            if (!on) {
                let otherOn = checkboxList.some(($otherCheckbox) => {
                    if ($checkbox === $otherCheckbox) {
                        return false;
                    }
                    return $otherCheckbox.is(":checked");
                });
                if (!otherOn) {
                    event.preventDefault();
                    displayMessage(alertMessage);
                }
            }
        });
    });
}

function convertDurationToCountdownString(duration) {
    let hours = duration.hours() + duration.days() * 24;
    let timeString;
    if (hours > 0) {
        timeString = formatCountdownNumber(hours) + ":" + formatCountdownNumber(duration.minutes());
    } else {
        timeString = formatCountdownNumber(duration.minutes()) + ":" + formatCountdownNumber(duration.seconds());
    }
    return timeString;
}

function formatCountdownNumber(value) {
    if (value > 9) {
        return "" + value;
    } else {
        return "0" + value;
    }
}

const BADGE_POPOVER_TEMPLATE = $("#badgePopoverTemplate").html();

function createBadgePopoverHtml(fileName, badgeName, badgeDescription) {
    let header, footer, headerClass;
    if (badgeDescription) {
        header = badgeName;
        footer = badgeDescription;
    } else {
        footer = badgeName;
        headerClass = "hide";
    }
    let src = cdnFormater.newBadgeSrc(fileName);
    let srcset = cdnFormater.newBadgeSrcSet(fileName);

    return format(BADGE_POPOVER_TEMPLATE, header, footer, src, srcset, headerClass);
}

function numberWithCommas(x) {
    if (x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    } else {
        return "";
    }
}
