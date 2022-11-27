"use strict";

/*exported roomFilter*/

function RoomFilter() {
    //elements
    this.$FILTER_SEARCH_INPUT = $("#rbSearchInput");
    this.$FILTER_BUTTON = $("#rbShowFilters");
    this.$FILTER_CONTAINER = $("#rbSettingFilterContainer");

    //Main Filters
    this.$ONLY_PUBLIC_CHECKBOX = $("#rbfPublicRoom");
    this.$ONLY_IN_LOBBY = $("#rbfInLobby");
    this.$ONLY_OPEN_SLOT = $("#rbfOpen");
    this.$ONLY_FRIENDS = $("#rbfFriends");

    //Sliders
    this.$ROOM_SIZE_SLIDER = $("#rbfRoomSize");
    this.$SONG_COUNT_SLIDER = $("#rbfSongCount");
    this.$GUESS_TIME_SLIDER = $("#rbfGuessTime");
    this.$DIFFICULTY_SLIDER = $("#rbrDifficulty");

    //Checkboxes
    this.$SHOW_SELECTION_AUTO = $("#rbfShowSelectionAuto");
    this.$SHOW_SELECTION_LOOTING = $("#rbfShowSelectionLooting");

    this.$SCORING_COUNT = $("#rbfScoringCount");
    this.$SCORING_SPEED = $("#rbfScoringSpeed");
    this.$SCORING_LIVES = $("#rbfScoringLives");

    this.$OPENINGS_CHECKBOX = $("#rbfSongTypeOpening");
    this.$ENDINGS_CHECKBOX = $("#rbfSongTypeEnding");
    this.$INSERTS_CHECKBOX = $("#rbfSongTypeInsert");

    this.$WATCHED_CHECKBOX = $("#rbfSongSelectionWatched");
    this.$UNWATCHED_CHECKBOX = $("#rbfSongSelectionUnwatched");
    this.$RANDOM_CHECKBOX = $("#rbfSongSelectionRandom");

    this.$TV_TYPE_CHECKBOX = $("#rbrTvType");
    this.$MOVIE_TYPE_CHECKBOX = $("#rbrMovieType");
    this.$OVA_TYPE_CHECKBOX = $("#rbrOVAType");
    this.$ONA_TYPE_CHECKBOX = $("#rbrONAType");
    this.$SPECIAL_TYPE_CHECKBOX = $("#rbrSpecialType");

    this.$SAMPLE_POINT_CHECKBOX = $("#rbrSamplePoint");
    this.$PLAYBACK_SPEED_CHECKBOX = $("#rbrPlaybackSpeed");
    this.$ANIME_SCORE_CHECKBOX = $("#rbrAnimeScore");
    this.$VINTAGE_CHECKBOX = $("#rbrVintage");
    this.$GENRE_CHECKBOX = $("#rbrGenre");
    this.$TAG_CHECKBOX = $("#rbrTag");
    this.$POPULARITY_CHECKBOX = $("#rbrPopularity");

    this._DEFAULT_VALUES = {
        TRUE_CHECKBOXES: [
            this.$SHOW_SELECTION_AUTO,
            this.$SHOW_SELECTION_LOOTING,
            this.$SCORING_COUNT,
            this.$SCORING_SPEED,
            this.$SCORING_LIVES,
            this.$OPENINGS_CHECKBOX,
            this.$ENDINGS_CHECKBOX,
            this.$INSERTS_CHECKBOX,
            this.$WATCHED_CHECKBOX,
            this.$UNWATCHED_CHECKBOX,
            this.$RANDOM_CHECKBOX,
            this.$TV_TYPE_CHECKBOX,
            this.$MOVIE_TYPE_CHECKBOX,
            this.$OVA_TYPE_CHECKBOX,
            this.$ONA_TYPE_CHECKBOX,
            this.$SPECIAL_TYPE_CHECKBOX
        ],
        FALSE_CHECKBOXES: [
            this.$SAMPLE_POINT_CHECKBOX,
            this.$PLAYBACK_SPEED_CHECKBOX,
            this.$ANIME_SCORE_CHECKBOX,
            this.$VINTAGE_CHECKBOX,
            this.$GENRE_CHECKBOX,
            this.$TAG_CHECKBOX,
            this.$POPULARITY_CHECKBOX
        ],
        SLIDERS: [
            {
                SLIDER: this.$ROOM_SIZE_SLIDER,
                VALUE: [2, 40]
            },
            {
                SLIDER: this.$SONG_COUNT_SLIDER,
                VALUE: [5, 100]
            },
            {
                SLIDER: this.$GUESS_TIME_SLIDER,
                VALUE: [5, 60]
            },
            {
                SLIDER: this.$DIFFICULTY_SLIDER,
                VALUE: [0, 100]
            }
        ],
        SEARCH: ""
    };
}

RoomFilter.prototype.setup = function () {
    if (Cookies.get("hide_full") == "false") {
        this.$ONLY_OPEN_SLOT.attr("checked", true);
    }
    if (Cookies.get("hide_playing") == "false") {
        this.$ONLY_IN_LOBBY.attr("checked", true);
    }
    if (Cookies.get("hide_private") == "false") {
        this.$ONLY_PUBLIC_CHECKBOX.attr("checked", true);
    }
    if (Cookies.get("only_friends") == "true") {
        this.$ONLY_FRIENDS.attr("checked", true);
    }

    this.$ONLY_OPEN_SLOT.on("click", () => {
        Cookies.set("hide_full", $("#rbfOpen:checked").length === 0, {expires: 365});
        roomBrowser.applyTileFilter();
    });
    this.$ONLY_IN_LOBBY.on("click", () => {
        Cookies.set("hide_playing", $("#rbfInLobby:checked").length === 0, {expires: 365});
        roomBrowser.applyTileFilter();
    });
    this.$ONLY_PUBLIC_CHECKBOX.on("click", () => {
        Cookies.set("hide_private", $("#rbfPublicRoom:checked").length === 0, {expires: 365});
        roomBrowser.applyTileFilter();
    });
    this.$ONLY_FRIENDS.on("click", () => {
        Cookies.set("only_friends", $("#rbfFriends:checked").length === 1, {expires: 365});
        roomBrowser.applyTileFilter();
    });

    this.$FILTER_BUTTON.hover(
        function () {
            this.$FILTER_CONTAINER.addClass("open");
        }.bind(this)
    );

    var leaveTimeout;
    let leaveFunction = function () {
        if (leaveTimeout) {
            clearTimeout(leaveTimeout);
        }
        leaveTimeout = setTimeout(() => {
            if ($("#rbSettingFilterContainer:hover").length === 0 && $("#rbShowFilters:hover").length === 0) {
                this.$FILTER_CONTAINER.removeClass("open");
                leaveTimeout = null;
            }
        }, 500);
    }.bind(this);

    this.$FILTER_BUTTON.mouseleave(leaveFunction);
    this.$FILTER_CONTAINER.mouseleave(leaveFunction);

    this.setupFilterOptions();
};

RoomFilter.prototype.setupFilterOptions = function () {
    this.$ROOM_SIZE_SLIDER.slider({
        value: [2, 40],
        min: 2,
        max: 40
    });
    this.$ROOM_SIZE_SLIDER.on("change", () => {
        roomBrowser.applyTileFilter();
    });

    this.$SONG_COUNT_SLIDER.slider({
        value: [5, 100],
        ticks: [5, 100],
        ticks_labels: [5, 100],
        ticks_snap_bounds: 1
    });
    this.$SONG_COUNT_SLIDER.on("change", () => {
        roomBrowser.applyTileFilter();
    });

    this.$GUESS_TIME_SLIDER.slider({
        value: [5, 60],
        ticks: [5, 60],
        ticks_labels: [5, 60],
        ticks_snap_bounds: 1
    });
    this.$GUESS_TIME_SLIDER.on("change", () => {
        roomBrowser.applyTileFilter();
    });

    this.$DIFFICULTY_SLIDER.slider({
        value: [0, 100],
        ticks: [0, 100],
        ticks_labels: [0, 100],
        ticks_snap_bounds: 1
    });
    this.$DIFFICULTY_SLIDER.on("change", () => {
        roomBrowser.applyTileFilter();
    });

    this.$FILTER_CONTAINER.find("input[type='checkbox']").click(() => {
        roomBrowser.applyTileFilter();
    });
};

RoomFilter.prototype.testRoom = function (room) {
    let searchRegex = new RegExp(escapeRegExp(this.$FILTER_SEARCH_INPUT.val()), "i");
    let roomSizeFilter = this.$ROOM_SIZE_SLIDER.slider("getValue");
    let songCountFilter = this.$SONG_COUNT_SLIDER.slider("getValue");
    let guessTimeFilter = this.$GUESS_TIME_SLIDER.slider("getValue");
    let difficultyFilter = this.$DIFFICULTY_SLIDER.slider("getValue");

    if (
        !searchRegex.test(room.settings.roomName) &&
        !searchRegex.test(room.host) &&
        !searchRegex.test(room.id) &&
        !room.getFriendsInGame().some((name) => {
            return searchRegex.test(name);
        })
    ) {
        return false;
    }
    if (this.$ONLY_PUBLIC_CHECKBOX.prop("checked") && room.isPrivate()) {
        return false;
    }
    if (this.$ONLY_IN_LOBBY.prop("checked") && !room.isInLobby()) {
        return false;
    }
    if (this.$ONLY_OPEN_SLOT.prop("checked") && room.isFull()) {
        return false;
    }
    if (this.$ONLY_FRIENDS.prop("checked") && room.getFriendsInGame().length === 0) {
        return false;
    }
    if (roomSizeFilter[0] > room.settings.roomSize || (roomSizeFilter[1] !== 40 && roomSizeFilter[1] < room.settings.roomSize)) {
        return false;
    }
    if (songCountFilter[0] > room.settings.numberOfSongs || songCountFilter[1] < room.settings.numberOfSongs) {
        return false;
    }

    let guessTimeSetting = room.settings.guessTime;
    if (
        guessTimeSetting.randomOn &&
        (guessTimeFilter[0] > guessTimeSetting.randomValue[0] || guessTimeFilter[1] < guessTimeSetting.randomValue[1])
    ) {
        return false;
    } else if (
        !guessTimeSetting.randomOn &&
        (guessTimeFilter[0] > guessTimeSetting.standardValue || guessTimeFilter[1] < guessTimeSetting.standardValue)
    ) {
        return false;
    }

    let difficultySetting = room.settings.songDifficulity;
    if (
        difficultySetting.advancedOn &&
        (difficultyFilter[0] > difficultySetting.advancedValue[0] ||
            difficultyFilter[1] < difficultySetting.advancedValue[1])
    ) {
        return false;
    } else if (!difficultySetting.advancedOn) {
        let maxDiff, minDiff;
        if (difficultySetting.standardValue.hard) {
            maxDiff = 20;
            minDiff = 0;
        }
        if (difficultySetting.standardValue.medium) {
            minDiff = minDiff !== undefined ? minDiff : 20;
            maxDiff = 60;
        }
        if (difficultySetting.standardValue.easy) {
            minDiff = minDiff !== undefined ? minDiff : 60;
            maxDiff = 100;
        }

        if (difficultyFilter[0] > minDiff || difficultyFilter[1] < maxDiff) {
            return false;
        }
    }
    this.$SHOW_SELECTION_AUTO = $("#rbfShowSelectionAuto");
    this.$SHOW_SELECTION_LOOTING = $("#rbfShowSelectionLooting");

    this.$SCORING_COUNT = $("#rbfScoringCount");
    this.$SCORING_SPEED = $("#rbfScoringSpeed");
    this.$SCORING_LIVES = $("#rbfScoringLives");

    if (!this.$SHOW_SELECTION_AUTO.prop("checked") && room.settings.showSelection === quiz.SHOW_SELECTION_IDS.AUTO) {
        return false;
    }
    if (!this.$SHOW_SELECTION_LOOTING.prop("checked") && room.settings.showSelection === quiz.SHOW_SELECTION_IDS.LOOTING) {
        return false;
    }
    if (!this.$SCORING_COUNT.prop("checked") && room.settings.scoreType === quiz.SCORE_TYPE_IDS.COUNT) {
        return false;
    }
    if (!this.$SCORING_SPEED.prop("checked") && room.settings.scoreType === quiz.SCORE_TYPE_IDS.SPEED) {
        return false;
    }
    if (!this.$SCORING_LIVES.prop("checked") && room.settings.scoreType === quiz.SCORE_TYPE_IDS.LIVES) {
        return false;
    }

    let songTypeSettings = room.settings.songType;
    let songTypeInclusion;
    if (songTypeSettings.advancedOn && songTypeSettings.advancedValue.random === 0) {
        songTypeInclusion = {
            openings: songTypeSettings.advancedValue.openings > 0,
            endings: songTypeSettings.advancedValue.endings > 0,
            inserts: songTypeSettings.advancedValue.inserts > 0
        };
    } else {
        songTypeInclusion = songTypeSettings.standardValue;
    }

    if (!this.$OPENINGS_CHECKBOX.prop("checked") && songTypeInclusion.openings) {
        return false;
    }
    if (!this.$ENDINGS_CHECKBOX.prop("checked") && songTypeInclusion.endings) {
        return false;
    }
    if (!this.$INSERTS_CHECKBOX.prop("checked") && songTypeInclusion.inserts) {
        return false;
    }

    let songSelectionSettings = room.settings.songSelection;
    if (!this.$WATCHED_CHECKBOX.prop("checked") && songSelectionSettings.advancedValue.watched > 0) {
        return false;
    }
    if (!this.$UNWATCHED_CHECKBOX.prop("checked") && songSelectionSettings.advancedValue.unwatched > 0) {
        return false;
    }
    if (!this.$RANDOM_CHECKBOX.prop("checked") && songSelectionSettings.advancedValue.random > 0) {
        return false;
    }

    let animeTypeSetting = room.settings.type;
    if (!this.$TV_TYPE_CHECKBOX.prop("checked") && animeTypeSetting.tv) {
        return false;
    }
    if (!this.$MOVIE_TYPE_CHECKBOX.prop("checked") && animeTypeSetting.movie) {
        return false;
    }
    if (!this.$OVA_TYPE_CHECKBOX.prop("checked") && animeTypeSetting.ova) {
        return false;
    }
    if (!this.$ONA_TYPE_CHECKBOX.prop("checked") && animeTypeSetting.ona) {
        return false;
    }
    if (!this.$SPECIAL_TYPE_CHECKBOX.prop("checked") && animeTypeSetting.special) {
        return false;
    }

    if (
        this.$SAMPLE_POINT_CHECKBOX.prop("checked") &&
        !this.compareSettings(room.settings.samplePoint, hostModal.DEFUALT_SETTINGS.samplePoint)
    ) {
        return false;
    }
    if (
        this.$PLAYBACK_SPEED_CHECKBOX.prop("checked") &&
        !this.compareSettings(room.settings.playbackSpeed, hostModal.DEFUALT_SETTINGS.playbackSpeed)
    ) {
        return false;
    }
    if (
        this.$ANIME_SCORE_CHECKBOX.prop("checked") &&
        !this.compareSettings(room.settings.animeScore, hostModal.DEFUALT_SETTINGS.animeScore)
    ) {
        return false;
    }
    if (
        this.$VINTAGE_CHECKBOX.prop("checked") &&
        !this.compareSettings(room.settings.vintage, hostModal.DEFUALT_SETTINGS.vintage)
    ) {
        return false;
    }
    if (
        this.$GENRE_CHECKBOX.prop("checked") &&
        !this.compareSettings(room.settings.genre, hostModal.DEFUALT_SETTINGS.genre)
    ) {
        return false;
    }
    if (
        this.$TAG_CHECKBOX.prop("checked") &&
        !this.compareSettings(room.settings.tags, hostModal.DEFUALT_SETTINGS.tags)
    ) {
        return false;
    }
    if (
        this.$POPULARITY_CHECKBOX.prop("checked") &&
        !this.compareSettings(room.settings.songPopularity, hostModal.DEFUALT_SETTINGS.songPopularity)
    ) {
        return false;
    }

    return true;
};

RoomFilter.prototype.compareSettings = function (settingA, settingB) {
    if (settingA.randomOn !== undefined) {
        if (settingA.randomOn !== settingB.randomOn) {
            return false;
        }
        if (settingA.randomOn) {
            return JSON.stringify(settingA.randomValue) === JSON.stringify(settingB.randomValue);
        } else {
            return JSON.stringify(settingA.standardValue) === JSON.stringify(settingB.standardValue);
        }
    } else if (settingA.advancedOn !== undefined) {
        if (settingA.advancedOn !== settingB.advancedOn) {
            return false;
        }
        if (settingA.advancedOn) {
            return JSON.stringify(settingA.advancedValue) === JSON.stringify(settingB.advancedValue);
        } else {
            return JSON.stringify(settingA.standardValue) === JSON.stringify(settingB.standardValue);
        }
    } else {
        return JSON.stringify(settingA) === JSON.stringify(settingB);
    }
};

RoomFilter.prototype.reset = function () {
    this._DEFAULT_VALUES.FALSE_CHECKBOXES.forEach(($checkbox) => {
        $checkbox.prop("checked", false);
    });
    this._DEFAULT_VALUES.TRUE_CHECKBOXES.forEach(($checkbox) => {
        $checkbox.prop("checked", true);
    });
    this._DEFAULT_VALUES.SLIDERS.forEach((entry) => {
        entry.SLIDER.slider("setValue", entry.VALUE);
    });
    this.$FILTER_SEARCH_INPUT.val(this._DEFAULT_VALUES.SEARCH);
};

var roomFilter = new RoomFilter();
