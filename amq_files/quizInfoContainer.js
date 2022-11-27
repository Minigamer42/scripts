"use strict";

function QuizInfoContainer() {
    this.$name = $("#qpAnimeName");
    this.$nameContainer = $("#qpAnimeNameContainer");
    this.$nameHider = $("#qpAnimeNameHider");
    this.$currentSongCount = $("#qpCurrentSongCount");
    this.$totalSongCount = $("#qpTotalSongCount");
    this.$extraAnimeSongInfo = $("#qpExtraSongInfo");

    this.$songName = $("#qpSongName");
    this.$songArtist = $("#qpSongArtist");
    this.$songType = $("#qpSongType");
    this.$songVideoLink = $("#qpSongVideoLink");
    this.$songAnimeLink = $("#qpAnimeLink");
    this.$infoHider = $("#qpInfoHider");

    this.$rateContainers = $(".qpSingleRateContainer");
    this.$upvoteContainer = $("#qpUpvoteContainer");
    this.$downvoteContainer = $("#qpDownvoteContainer");
    this.$reportContainer = $("#qpReportContainer");

    this.$reportFeedbackContainer = $("#qpReportFeedbackContainer");
    this.$reportFeedbackInput = $("#qpFeedbackInput");
    this.$adminReportCheckbox = $("#qpAdminReport");

    this.REPORT_AUTO_REASONS = ["Wrong Song", "Bad Quality", "Background Noise", "Broken Video"];

    this.reportAwesomeplete = new AmqAwesomeplete(this.$reportFeedbackInput[0], {
        list: this.REPORT_AUTO_REASONS,
        minChars: 0
    });

    this.$reportFeedbackInput.focus(() => {
        if (this.reportAwesomeplete.ul.childNodes.length === 0) {
            this.reportAwesomeplete.minChars = 0;
            this.reportAwesomeplete.evaluate();
        }
        this.reportAwesomeplete.open();
    });

    this.$reportFeedbackInput.keypress((event) => {
        //On Enter
        if (event.which === 13) {
            this.$reportFeedbackInput.addClass("glow");
        } else {
            this.$reportFeedbackInput.removeClass("glow");
        }
    });

    this.$reportFeedbackInput.on("awesomplete-selectcomplete", () => {
        this.$reportFeedbackInput.addClass("glow");
    });

    this.$reportFeedbackInput.blur(() => {
        this.reportAwesomeplete.close();
    });

    this.reportSelected = false;
    this.likeSelected = false;
    this.dislikeSelected = false;

    this.FEEDBACK_TYPE = {
        NONE: 0,
        LIKE: 1,
        DISLIKE: 2,
        REPORT: 3
    };

    this.$extraAnimeNameContent = "";
    this.$nameContainer.popover({
        html: true,
        content: () => {
            return this.$extraAnimeNameContent;
        },
        trigger: "hover",
        placement: "right"
    });

    this.$extraAnimeContent = "";
    this.$extraAnimeSongInfo.popover({
        html: true,
        content: () => {
            return this.$extraAnimeContent;
        },
        trigger: "hover",
        placement: "bottom"
    });

    if (isGameAdmin) {
        this.$reportFeedbackContainer.addClass("adminEnabled");
    }
}

QuizInfoContainer.prototype.showInfo = function (
    animeNames,
    songName,
    artist,
    type,
    typeNumber,
    urls,
    siteIds,
    animeScore,
    animeType,
    vintage,
    animeDifficulty,
    animeTags,
    animeGenre,
    altAnimeNames,
    altAnimeNamesAnswers
) {
    let diffString = typeof animeDifficulty === 'number' ? Math.round(animeDifficulty) : animeDifficulty;
    this.$extraAnimeContent = $(
        format(this.EXTRA_INFO_TEMPLATE, vintage, animeScore, animeType, diffString, animeTags.join(', '), animeGenre.join(', '))
    );
    let animeName;
    if (options.useRomajiNames) {
        animeName = animeNames.romaji;
    } else {
        animeName = animeNames.english;
    }

    let altNames = [];
    altAnimeNames.forEach((name) => {
        if (animeName != name) {
            altNames.push(name);
        }
    });

    let altAnswers = [];
    altAnimeNamesAnswers.forEach((answer) => {
        if (animeName != answer && !altNames.includes(answer)) {
            altAnswers.push(answer);
        }
    });

    this.$extraAnimeNameContent = $(
        format(
            this.EXTRA_ANIME_NAME_TEMPLATE,
            altNames.map((name) => escapeHtml(name)).join("<br/>"),
            altAnswers.map((answer) => escapeHtml(answer)).join("<br/>")
        )
    );
    if (altAnswers.length == 0) {
        this.$extraAnimeNameContent.find(".altAnswers").remove();
    }

    this.$name.text(animeName);
    this.fitTextToContainer();
    this.$songName.text(songName);
    this.$songArtist.text(artist);
    this.$songType.text(this.convertTypeToText(type, typeNumber));

    let targetHost = quizVideoController.getCurrentHost();
    let targetResolution = quizVideoController.getCurrentResolution();

    let hostUrls;
    if (urls[targetHost]) {
        hostUrls = urls[targetHost];
    } else {
        console.log(
            "debug: " +
            JSON.stringify({
                targetHost,
                urls
            })
        );
        hostUrls = Object.values(urls)[0];
    }

    let sourceUrl;
    if (hostUrls[targetResolution]) {
        sourceUrl = hostUrls[targetResolution];
    } else {
        console.log(
            "debug: " +
            JSON.stringify({
                targetResolution,
                urls
            })
        );
        sourceUrl = Object.values(hostUrls)[0];
    }

    this.$songVideoLink.attr("href", sourceUrl);

    this.$songAnimeLink.attr("href", this.generateAnimeSiteUrl(siteIds));

    this.showContent();
};

QuizInfoContainer.prototype.generateAnimeSiteUrl = function (siteIds) {
    if (options.animeListLinkId === options.ANIME_LIST_IDS.ANILIST && siteIds.aniListId) {
        return options.ANIME_LIST_BASE_URL.ANILIST + siteIds.aniListId;
    } else if (options.animeListLinkId === options.ANIME_LIST_IDS.KTISU && siteIds.kitsuId) {
        return options.ANIME_LIST_BASE_URL.KTISU + siteIds.kitsuId;
    } else if (options.animeListLinkId === options.ANIME_LIST_IDS.MAL && siteIds.malId) {
        return options.ANIME_LIST_BASE_URL.MAL + siteIds.malId;
    }
    return options.ANIME_LIST_BASE_URL.ANN + siteIds.annId;
};

QuizInfoContainer.prototype.fitTextToContainer = function () {
    fitTextToContainer(this.$name, this.$nameContainer, 25, 11);
};

QuizInfoContainer.prototype.convertTypeToText = function (type, typeNumber) {
    switch (type) {
        case 1:
            return "Opening " + typeNumber;
        case 2:
            return "Ending " + typeNumber;
        case 3:
            return "Insert Song";
    }
};

QuizInfoContainer.prototype.showContent = function () {
    this.$nameHider.addClass("hide");
    this.$infoHider.addClass("hide");
};

QuizInfoContainer.prototype.hideContent = function () {
    this.$nameHider.removeClass("hide");
    this.$infoHider.removeClass("hide");
};

QuizInfoContainer.prototype.setCurrentSongCount = function (count) {
    this.$currentSongCount.text(count);
};

QuizInfoContainer.prototype.setTotalSongCount = function (count) {
    this.$totalSongCount.text(count);
};

QuizInfoContainer.prototype.sendSongFeedback = function () {
    let resolution = quizVideoController.getCurrentResolution();
    let host = quizVideoController.getCurrentHost();
    let songId = quizVideoController.getCurrentSongId();
    let adminReport = this.$adminReportCheckbox.prop("checked");

    if (resolution != undefined && songId != undefined && adminReport != undefined) {
        let feedbackPackage;

        if (this.likeSelected) {
            feedbackPackage = {
                feedbackType: this.FEEDBACK_TYPE.LIKE
            };
        } else if (this.dislikeSelected) {
            feedbackPackage = {
                feedbackType: this.FEEDBACK_TYPE.DISLIKE
            };
        } else if (this.reportSelected) {
            feedbackPackage = {
                feedbackType: this.FEEDBACK_TYPE.REPORT,
                reportComment: this.$reportFeedbackInput.val()
            };
        } else {
            feedbackPackage = {
                feedbackType: this.FEEDBACK_TYPE.NONE
            };
        }

        feedbackPackage.resolution = resolution;
        feedbackPackage.host = host;
        feedbackPackage.songId = songId;
        feedbackPackage.adminReport = adminReport;

        socket.sendCommand({
            type: "quiz",
            command: "song feedback",
            data: feedbackPackage
        });
    }
};

QuizInfoContainer.prototype.resetFeedbackSelects = function () {
    this.$rateContainers.removeClass("selected");
    this.$reportFeedbackContainer.removeClass("open");
    this.$adminReportCheckbox.prop("checked", false);
    this.$reportFeedbackInput.val("");
    this.$reportFeedbackInput.removeClass("glow");
    this.$reportFeedbackInput.blur();

    this.reportSelected = false;
    this.likeSelected = false;
    this.dislikeSelected = false;
};

QuizInfoContainer.prototype.reset = function () {
    this.setTotalSongCount("?");
    this.setCurrentSongCount("?");
    this.hideContent();
    this.resetFeedbackSelects();
};

QuizInfoContainer.prototype.upvoteSong = function () {
    if (!this.likeSelected) {
        this.resetFeedbackSelects();
        this.likeSelected = true;
        this.$upvoteContainer.addClass("selected");
    } else {
        this.resetFeedbackSelects();
    }
};

QuizInfoContainer.prototype.downvoteSong = function () {
    if (!this.dislikeSelected) {
        this.resetFeedbackSelects();
        this.dislikeSelected = true;
        this.$downvoteContainer.addClass("selected");
    } else {
        this.resetFeedbackSelects();
    }
};

QuizInfoContainer.prototype.reportSong = function () {
    if (!this.reportSelected) {
        this.resetFeedbackSelects();
        this.reportSelected = true;
        this.$reportContainer.addClass("selected");
        this.$reportFeedbackContainer.addClass("open");
        this.$reportFeedbackInput.focus();
    } else {
        this.resetFeedbackSelects();
    }
};

QuizInfoContainer.prototype.EXTRA_INFO_TEMPLATE = $("#quizExtraSongInfoTemplate").html();
QuizInfoContainer.prototype.EXTRA_ANIME_NAME_TEMPLATE = $("#quizExtraAnimeNameTemplate").html();
