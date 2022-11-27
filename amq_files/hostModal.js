"use strict";

/*exported hostModal*/
function HostModal() {
    this.$view = $("#mhHostModal");
    this.$title = this.$view.find(".modal-title");
    this.$hostButton = $("#mhHostButton");
    this.$changeButton = $("#mhChangeButton");
    this.$JOIN_BUTTON = $("#mhJoinGame");
    this.$SPECTATE_BUTTON = $("#mhSpectateGame");
    this.$PREVIEW_BUTTON_CONTAINER = $("#mhRoomTilePreviewButtons");
    this.$MODE_BUTTON = $("#mhHostModeButton");
    this.$SHOW_HIDE_PASSWORD_BUTTON = $("#mhPasswordInputShowHide");

    this.$LIFE_SETTING_CONTAINER = $("#mhLifeContainer");
    this.$GUESS_TIME_SETTING_CONTAINER = $("#mhQuizGuessTimeContainer");
    this.$SONG_SELECTION_OUTER_CONTAINER = $("#mhSongSelectionOuterContainer");
    this.$BATTLE_ROYALE_SETTING_ROW = $("#mhQuizBattleRoyaleSettingRow");
    this.$LOOT_DROPPING_CONTAINER = $("#mhLootDroppingContainer");

    this.$ROOM_SIZE_LIMITED_CONTAINER = $("#mhRoomSizeLimitedContainer");
    this.$ROOM_SIZE_UNLIMITED_CONTAINER = $("#mhRoomSizeUnlimitedContainer");

    this.numberOfSongsSliderCombo;
    this.$songPool = $("#mhSongPool");

    this.$privateCheckbox = $("#mhPrivateRoom");
    this.$passwordInput = $("#mhPasswordInput");

    this.$songTypeInsert = $("#mhSongTypeInsert");
    this.$songTypeEnding = $("#mhSongTypeEnding");
    this.$songTypeOpening = $("#mhSongTypeOpening");

    this.$roomName = $("#mhRoomNameInput");

    this.$showSelection = $("#mhShowSelection");
    this.inventorySizeSliderCombo;
    this.inventorySizeRangeSliderCombo;
    this.inventorySizeRandomSwitch;
    this.lootingTimeSliderCombo;
    this.lootingTimeRangeSliderCombo;
    this.lootingTimeRandomSwitch;

    this.$scoring = $("#mhScoring");
    this.lifeSliderCombo;

    this.roomSizeSliderCombo;

    this.watchedSliderCombo;
    this.unwatchedSliderCombo;
    this.randomWatchedSliderCombo;

    this.showWatchedSliderCombo;
    this.showUnwatchedSliderCombo;
    this.showRandomWatchedSliderCombo;

    this.$watchedDistribution = $("#mhWatchedDistribution");

    this.openingsSliderCombo;
    this.endingsSliderCombo;
    this.insertSliderCombo;
    this.randomSliderCombo;

    this.playLengthSliderCombo;
    this.playLengthRangeSliderCombo;
    this.playLengthRandomSwitch;

    this.$skipGuessing = $("#mhGuessSkipping");
    this.$skipReplay = $("#mhReplaySkipping");
    this.$duplicateShows = $("#mhDuplicateShows");
    this.$lootDropping = $("#mhLootDropping");
    this.$queueing = $("#mhQueueing");
    this.$rebroadcastSongs = $("#mhRebroadcastSongs");
    this.$dubSongs = $("#mhDubSongs");

    this.$playbackSpeed = $("#mhPlaybackSpeed");
    this.playbackSpeedRandomSwitch;
    this.playbackSpeedToggleSlider;

    this.$playerScore = $("#mhPlayerScore");
    this.playerScoreAdvancedSwitch;
    this.playerScoreToggleSlider;

    this.$animeScore = $("#mhAnimeScore");
    this.animeScoreAdvancedSwitch;
    this.animeScoreToggleSlider;

    this.vintageRangeSliderCombo;
    this.fromSeasonSelector;
    this.toSeasonSelector;
    this.vintageAdvancedFilter;
    this.$vintageAddToFilterButton = $("#mhAddVintageFilter");

    this.genreFilter;
    this.tagFilter;

    this.$songDiffHard = $("#mhSongDiffHard");
    this.$songDiffMedium = $("#mhSongDiffMedium");
    this.$songDiffEasy = $("#mhSongDiffEasy");
    this.songDiffRangeSliderCombo;
    this.songDiffAdvancedSwitch;

    this.$songPopLiked = $("#mhSongPopLiked");
    this.$songPopMixed = $("#mhSongPopMixed");
    this.$songPopDisliked = $("#mhSongPopDisliked");
    this.songPopRangeSliderCombo;
    this.songPopAdvancedSwitch;

    this.$samplePoint = $("#mhSamplePoint");
    this.samplePointRangeSliderCombo;
    this.samplePointRandomSwitch;

    this.$animeTvCheckbox = $("#mhAnimeTV");
    this.$animeMovieCheckbox = $("#mhAnimeMovie");
    this.$animeOVACheckbox = $("#mhAnimeOVA");
    this.$animeONACheckbox = $("#mhAnimeONA");
    this.$animeSpecialCheckbox = $("#mhAnimeSpecial");

    this.$openingCategoryOptions = $("#mhOpeningCategoryContainer .customCheckbox");
    this.$openingInstrumentalCheckbox = $("#mhOpeningInstrumental");
    this.$openingChantingCheckbox = $("#mhOpeningChanting");
    this.$openingCharacterCheckbox = $("#mhOpeningCharacter");
    this.$openingStandardCheckbox = $("#mhOpeningStandard");

    this.$endingCategoryOptions = $("#mhEndingCategoryContainer .customCheckbox");
    this.$endingInstrumentalCheckbox = $("#mhEndingInstrumental");
    this.$endingChantingCheckbox = $("#mhEndingChanting");
    this.$endingCharacterCheckbox = $("#mhEndingCharacter");
    this.$endingStandardCheckbox = $("#mhEndingStandard");

    this.$insertCategoryOptions = $("#mhInsertCategoryContainer .customCheckbox");
    this.$insertInstrumentalCheckbox = $("#mhInsertInstrumental");
    this.$insertChantingCheckbox = $("#mhInsertChanting");
    this.$insertCharacterCheckbox = $("#mhInsertCharacter");
    this.$insertStandardCheckbox = $("#mhInsertStandard");

    this.$gameMode = $("#mhGameMode");

    this.$teamSizeContainer = $("#mhTeamSizeContainer");
    this.$teamSize = $("#mhTeamSize");

    this.$tabContainer = $("#mhHostSettingContainer > .tabContainer");
    this.$mainContainer = $("#mhMainContainer");
    this.$mainContainerInner = $("#mhMainContainerInner");
    this.$settingContainers = this.$mainContainer.find(".mhSettingContainer");
    this.$quickTab = $("#mhQuickTab");
    this.$advancedTab = $("#mhAdvancedTab");

    this.$ANIME_SETTING_CONTAINER = $("#mhAnimeSettings");
    this.$GENERAL_SETTING_CONTAINER = $("#mhGeneralSettings");
    this.$MODE_SETTING_CONTAINER = $("#mhModeSettings");
    this.$QUIZ_SETTING_CONTAINER = $("#mhQuizSettings");

    this.MAX_LEVEL_FOR_HARD_DEFAULT_OFF = 20;

    this.DEFUALT_SETTINGS = {
        roomName: "",
        privateRoom: false,
        password: "",
        roomSize: 8,
        teamSize: 1,
        numberOfSongs: 20,
        modifiers: {
            skipGuessing: true,
            skipReplay: true,
            queueing: true,
            duplicates: true,
            lootDropping: true,
            rebroadcastSongs: true,
            dubSongs: false
        },
        songSelection: {
            standardValue: 3,
            advancedValue: {
                watched: 20,
                unwatched: 0,
                random: 0
            }
        },
        watchedDistribution: 1,
        songType: {
            standardValue: {
                openings: true,
                endings: true,
                inserts: false
            },
            advancedValue: {
                openings: 0,
                endings: 0,
                inserts: 0,
                random: 20
            }
        },
        openingCategories: {
            instrumental: true,
            chanting: true,
            character: true,
            standard: true
        },
        endingCategories: {
            instrumental: true,
            chanting: true,
            character: true,
            standard: true
        },
        insertCategories: {
            instrumental: true,
            chanting: true,
            character: true,
            standard: true
        },
        guessTime: {
            randomOn: false,
            standardValue: 20,
            randomValue: [5, 60]
        },
        scoreType: 1,
        showSelection: 1,
        inventorySize: {
            randomOn: false,
            standardValue: 20,
            randomValue: [1, 99]
        },
        lootingTime: {
            randomOn: false,
            standardValue: 90,
            randomValue: [10, 150]
        },
        lives: 5,
        samplePoint: {
            randomOn: true,
            standardValue: 1,
            randomValue: [0, 100]
        },
        playbackSpeed: {
            randomOn: false,
            standardValue: 1,
            randomValue: [true, true, true, true]
        },
        songDifficulity: {
            advancedOn: false,
            standardValue: {
                easy: true,
                medium: true,
                hard: true
            },
            advancedValue: [0, 100]
        },
        songPopularity: {
            advancedOn: false,
            standardValue: {
                disliked: true,
                mixed: true,
                liked: true
            },
            advancedValue: [0, 100]
        },
        playerScore: {
            advancedOn: false,
            standardValue: [1, 10],
            advancedValue: [true, true, true, true, true, true, true, true, true, true]
        },
        animeScore: {
            advancedOn: false,
            standardValue: [2, 10],
            advancedValue: [true, true, true, true, true, true, true, true, true]
        },
        vintage: {
            standardValue: {
                years: [1944, 2022],
                seasons: [0, 3]
            },
            advancedValueList: []
        },
        type: {
            tv: true,
            movie: true,
            ova: true,
            ona: true,
            special: true
        },
        genre: [],
        tags: []
    };

    this.$mainContainerInner.perfectScrollbar({
        suppressScrollX: true
    });

    this._settingStorage; //Setup in setup

    this.soloMode = false;
    this.gameMode;

    let $passwordInput = this.$passwordInput;
    this.$privateCheckbox.change(function () {
        if (this.checked) {
            $passwordInput.removeClass("hide");
        } else {
            $passwordInput.addClass("hide");
            $passwordInput.val("");
        }
    });

    this._previewRoomTile;
    this.$JOIN_BUTTON.click(() => {
        this._previewRoomTile.joinGame();
        this.hide();
    });
    this.$SPECTATE_BUTTON.click(() => {
        this._previewRoomTile.spectateGame();
        this.hide();
    });

    this.passwordHidden = true;
    this.$SHOW_HIDE_PASSWORD_BUTTON.click(() => {
        this.setPasswordHidden(!this.passwordHidden);
    });

    this.$view.on("hide.bs.modal", () => {
        if (this._previewRoomTile) {
            this._previewRoomTile.settingPreviewClosed();
            this._previewRoomTile = null;
            this.reset();
        }
        this.setPasswordHidden(true);
        this.hideLoadContainer();
    });

    // Work around for bug releating to SweetAlert2 input fields while modals are open
    $("#mhHostModal").on("shown.bs.modal", function () {
        $(document).off("focusin.modal");
    });
}

HostModal.prototype.show = function () {
    this.$view.modal("show");
};

HostModal.prototype.setup = function (genreInfo, tagInfo, savedSettings) {
    this._settingStorage = new SettingStorage(savedSettings);

    this.numberOfSongsSliderCombo = new SliderTextCombo($("#mhNumberOfSongs"), $("#mhNumberOfSongsText"), {
        min: 5,
        max: 100
    });

    this.genreFilter = new DropDownSettingFilter($("#mhGenreFilter"), $("#mhGenreInput"), genreInfo);
    this.tagFilter = new DropDownSettingFilter($("#mhTagFilter"), $("#mhTagInput"), tagInfo);

    setOneCheckBoxAlwaysOn(
        [
            this.$animeMovieCheckbox,
            this.$animeONACheckbox,
            this.$animeOVACheckbox,
            this.$animeSpecialCheckbox,
            this.$animeTvCheckbox
        ],
        "One Anime Type Must be Selected"
    );

    setOneCheckBoxAlwaysOn(
        [
            this.$openingInstrumentalCheckbox,
            this.$openingChantingCheckbox,
            this.$openingCharacterCheckbox,
            this.$openingStandardCheckbox
        ],
        "One Opening Category Must be Selected"
    );

    setOneCheckBoxAlwaysOn(
        [
            this.$endingInstrumentalCheckbox,
            this.$endingChantingCheckbox,
            this.$endingCharacterCheckbox,
            this.$endingStandardCheckbox
        ],
        "One Ending Category Must be Selected"
    );

    setOneCheckBoxAlwaysOn(
        [
            this.$insertInstrumentalCheckbox,
            this.$insertChantingCheckbox,
            this.$insertCharacterCheckbox,
            this.$insertStandardCheckbox
        ],
        "One Insert Category Must be Selected"
    );

    this.setupRoomSize();
    this.setupShowSelection();
    this.setupScoring();
    this.setupSongSelection();
    this.setupSongTypes();
    this.setupPlayLength();
    this.setupPlaybackSpeed();
    this.setupSamplePoint();
    this.setupPlayerScore();
    this.setupAnimeScore();
    this.setupVintage();
    this.setupSongDifficulty();
    this.setupSongPopularity();
    this.setupGameMode();
    this.setupTeamSize();

    $("#mhHostModal").on(
        "shown.bs.modal",
        function () {
            this.relayout();
        }.bind(this)
    );
};

HostModal.prototype.setupRoomSize = function () {
    this.roomSizeSliderCombo = new SliderTextCombo($("#mhRoomSize"), $("#mhRoomSizeText"), {
        min: 2,
        max: 40,
        value: 8
    });
};

HostModal.prototype.setupShowSelection = function () {
    let toolTips = [
        "Game randomly picks shows from within the settings",
        "Play a looting phase before the quiz, where players move around collecting the shows used for the quiz"
    ];
    this.$showSelection
        .slider({
            ticks: [1, 2],
            ticks_labels: ["Auto", "Looting"],
            ticks_snap_bounds: 1,
            tooltip: "hide",
            selection: "none"
        })
        .on("change", (event) => {
            if (event.value.newValue === 2) {
                this.$BATTLE_ROYALE_SETTING_ROW.removeClass("hide");
                this.inventorySizeSliderCombo.relayout();
                this.lootingTimeSliderCombo.relayout();
            } else {
                this.$BATTLE_ROYALE_SETTING_ROW.addClass("hide");
            }
            this.updateSelectedGameMode();
        });

    this.inventorySizeSliderCombo = new SliderTextCombo($("#mhInventorySize"), $("#mhInventorySizeText"), {
        min: 1,
        max: 99,
        value: 20,
        selection: "none"
    });

    this.inventorySizeRangeSliderCombo = new SliderTextCombo(
        $("#mhInventorySizeRange"),
        [$("#mhInventorySizeMin"), $("#mhInventorySizeMax")],
        {
            min: 1,
            max: 99,
            value: [1, 99],
            range: true
        }
    );

    this.inventorySizeRandomSwitch = new Switch($("#mhInventorySizeRandomSwitch"));
    this.inventorySizeRandomSwitch.addContainerToggle(
        $("#mhInventorySizeRangeContainer"),
        $("#mhInventorySizeSpecificContainer")
    );

    this.lootingTimeSliderCombo = new SliderTextCombo($("#mhLootingTime"), $("#mhLootingTimeText"), {
        min: 10,
        max: 150,
        value: 90,
        selection: "none",
        formatter: function (value) {
            return value + " seconds";
        }
    });

    this.lootingTimeRangeSliderCombo = new SliderTextCombo(
        $("#mhLootingTimeRange"),
        [$("#mhLootingTimeMin"), $("#mhLootingTimeMax")],
        {
            min: 10,
            max: 150,
            value: [10, 150],
            range: true,
            formatter: function (value) {
                return value[0] + "-" + value[1] + " seconds";
            }
        }
    );

    this.lootingTimeRandomSwitch = new Switch($("#mhLootingTimeRandomSwitch"));
    this.lootingTimeRandomSwitch.addContainerToggle(
        $("#mhLootingTimeRangeContainer"),
        $("#mhLootingTimeSpecificContainer")
    );

    this.setTickPopovers(toolTips, $("#mhShowSelectionSlider"), this.$showSelection, 1);
};

HostModal.prototype.setupScoring = function () {
    let toolTips = [
        "Players earn 1 point for each show they guess correctly",
        "Players earn more points the quicker they guessed the song",
        "Players start with a set amount of lives, and lose 1 each time they get a song wrong another player guessed"
    ];
    this.$scoring
        .slider({
            ticks: [1, 2, 3],
            ticks_labels: ["Count", "Speed", "Lives"],
            ticks_snap_bounds: 1,
            tooltip: "hide",
            selection: "none"
        })
        .on("change", (event) => {
            if (event.value.newValue === 3) {
                this.$LIFE_SETTING_CONTAINER.removeClass("hide");
                this.lifeSliderCombo.relayout();
            } else {
                this.$LIFE_SETTING_CONTAINER.addClass("hide");
            }
            this.updateSelectedGameMode();
        });

    this.lifeSliderCombo = new SliderTextCombo($("#mhLife"), $("#mhLifeText"), {
        min: 1,
        max: 5,
        value: 5
    });
    this.setTickPopovers(toolTips, $("#mhScoringSlider"), this.$scoring, 1);
};

HostModal.prototype.setupGameMode = function () {
    let toolTips = [
        "Compete in guessing the most songs",
        "Get more points the quicker you guess the show",
        "Start with lives, losing one each time you miss a show",
        "Start in looting phase, collecting the shows that will appear in the quiz"
    ];
    this.$gameMode
        .slider({
            ticks: [1, 2, 3, 4],
            ticks_labels: ["Standard", "Quick Draw", "Last Man Standing", "Battle Royale"],
            ticks_snap_bounds: 1,
            tooltip: "hide",
            selection: "none"
        })
        .on("change", (event) => {
            switch (event.value.newValue) {
                case 1:
                    this.$scoring.slider("setValue", 1, false, true);
                    this.$showSelection.slider("setValue", 1, false, true);
                    break;
                case 2:
                    this.$scoring.slider("setValue", 2, false, true);
                    this.$showSelection.slider("setValue", 1, false, true);
                    break;
                case 3:
                    this.$scoring.slider("setValue", 3, false, true);
                    this.$showSelection.slider("setValue", 1, false, true);
                    break;
                case 4:
                    this.$scoring.slider("setValue", 3, false, true);
                    this.$showSelection.slider("setValue", 2, false, true);
                    break;
            }
        });
    this.setTickPopovers(toolTips, $("#mhGameModeSlider"), this.$gameMode, 1);
};

HostModal.prototype.setupTeamSize = function () {
    this.$teamSize.slider({
        ticks: [1, 2, 3, 4, 5, 6, 7, 8],
        ticks_labels: ["Solo", "2", "3", "4", "5", "6", "7", "8"],
        ticks_snap_bounds: 1,
        selection: "none",
        formatter: function (value) {
            return value === 1 ? "Solo" : value;
        }
    });
};

HostModal.prototype.setupSongSelection = function () {
    this.$songPool
        .slider({
            ticks: [1, 2, 3],
            ticks_labels: ["Random", "Mix", "Watched"],
            ticks_snap_bounds: 1,
            selection: "none",
            formatter: function (value) {
                switch (value) {
                    case 1:
                        return "Random";
                    case 2:
                        return "Mix";
                    case 3:
                        return "Watched";
                    default:
                        return "Unknown";
                }
            }
        })
        .on("change", (event) => {
            let numberOfSongs = this.numberOfSongsSliderCombo.getValue();
            let watched = 0;
            let unwatched = 0;
            let random = 0;
            switch (event.value.newValue) {
                case 1:
                    random = numberOfSongs;
                    break;
                case 2:
                    watched = Math.ceil(numberOfSongs * 0.8);
                    unwatched = Math.floor(numberOfSongs * 0.2);
                    break;
                case 3:
                    watched = numberOfSongs;
                    break;
            }
            this.watchedSliderCombo.setValue(watched);
            this.unwatchedSliderCombo.setValue(unwatched);
            this.randomWatchedSliderCombo.setValue(random);
        });

    this.watchedSliderCombo = new SliderTextCombo($("#mhWatched"), $("#mhWatchedText"), {
        min: 0,
        max: 20,
        value: this.numberOfSongsSliderCombo.getValue()
    });
    this.unwatchedSliderCombo = new SliderTextCombo($("#mhUnwatched"), $("#mhUnwatchedText"), {
        min: 0,
        max: 20,
        value: 0
    });
    this.randomWatchedSliderCombo = new SliderTextCombo($("#mhRandomWatched"), $("#mhRandomWatchedText"), {
        min: 0,
        max: 20,
        value: 0
    });
    let songSelectionSliderGroup = [this.watchedSliderCombo, this.unwatchedSliderCombo, this.randomWatchedSliderCombo];
    songSelectionSliderGroup.forEach((slider) => {
        slider.addValueGroup(songSelectionSliderGroup);
        slider.addListener(() => {
            this.updateStandardSongSelection();
        });
    });

    this.numberOfSongsSliderCombo.addListener(createAdvancedDistributionSongListener(songSelectionSliderGroup));

    this.$watchedDistribution.slider({
        ticks: [1, 2, 3],
        ticks_labels: ["Random", "Weighted", "Equal"],
        ticks_snap_bounds: 1,
        selection: "none",
        value: 1,
        formatter: function (value) {
            switch (value) {
                case 1:
                    return "Random";
                case 2:
                    return "Weighted";
                case 3:
                    return "Equal";
                default:
                    return "Unknown";
            }
        }
    });

    this.watchedSliderCombo.addListener((newValue) => {
        if (newValue) {
            this.$watchedDistribution.slider('enable');
        } else {
            this.$watchedDistribution.slider('disable');
        }
    });
};

HostModal.prototype.setupSongTypes = function () {
    this.openingsSliderCombo = new SliderTextCombo($("#mhOpenings"), $("#mhOpeningsText"), {
        min: 0,
        max: 20,
        value: 0
    });
    this.endingsSliderCombo = new SliderTextCombo($("#mhEndings"), $("#mhEndingsText"), {
        min: 0,
        max: 20,
        value: 0
    });
    this.insertSliderCombo = new SliderTextCombo($("#mhInserts"), $("#mhInsertsText"), {
        min: 0,
        max: 20,
        value: 0,
        enabled: false
    });
    this.randomSliderCombo = new SliderTextCombo($("#mhRandomType"), $("#mhRandomTypeText"), {
        min: 0,
        max: 20,
        value: this.numberOfSongsSliderCombo.getValue()
    });

    let songTypeInputPairs = [
        {
            $checkbox: this.$songTypeOpening,
            sliderCombo: this.openingsSliderCombo,
            extraHandlers: [
                (on) => {
                    if (on) {
                        this.$openingCategoryOptions.removeClass("disabled");
                    } else {
                        this.$openingCategoryOptions.addClass("disabled");
                    }
                }
            ]
        },
        {
            $checkbox: this.$songTypeEnding,
            sliderCombo: this.endingsSliderCombo,
            extraHandlers: [
                (on) => {
                    if (on) {
                        this.$endingCategoryOptions.removeClass("disabled");
                    } else {
                        this.$endingCategoryOptions.addClass("disabled");
                    }
                }
            ]
        },
        {
            $checkbox: this.$songTypeInsert,
            sliderCombo: this.insertSliderCombo,
            extraHandlers: [
                (on) => {
                    if (on) {
                        this.$insertCategoryOptions.removeClass("disabled");
                    } else {
                        this.$insertCategoryOptions.addClass("disabled");
                    }
                }
            ]
        }
    ];

    let songTypeSliderGroup = [
        this.openingsSliderCombo,
        this.endingsSliderCombo,
        this.insertSliderCombo,
        this.randomSliderCombo
    ];

    songTypeInputPairs.forEach((pair) => {
        pair.$checkbox.click(() => {
            let on = pair.$checkbox.is(":checked");
            if (on) {
                pair.sliderCombo.setDisabled(false);
            } else {
                let otherOn = songTypeInputPairs.some((otherPair) => {
                    if (pair === otherPair) {
                        return false;
                    }
                    return otherPair.$checkbox.is(":checked");
                });
                if (!otherOn) {
                    pair.$checkbox.prop("checked", true);
                    displayMessage("One Song Type Must be Selected");
                } else {
                    pair.sliderCombo.setDisabled(true);
                }
            }
            if (pair.extraHandlers) {
                pair.extraHandlers.forEach((handler) => handler(on));
            }
        });
    });

    songTypeSliderGroup.forEach((slider) => {
        slider.addValueGroup(songTypeSliderGroup);
    });

    this.numberOfSongsSliderCombo.addListener(createAdvancedDistributionSongListener(songTypeSliderGroup));
};

HostModal.prototype.setupPlayLength = function () {
    this.playLengthSliderCombo = new SliderTextCombo($("#mhPlayLength"), $("#mhPlayLengthText"), {
        min: 5,
        max: 60,
        value: 20,
        formatter: function (value) {
            return value + " sec";
        }
    });

    this.playLengthRangeSliderCombo = new SliderTextCombo(
        $("#mhPlayLengthRange"),
        [$("#mhPlayLengthMin"), $("#mhPlayLengthMax")],
        {
            min: 5,
            max: 60,
            value: [5, 60],
            range: true,
            formatter: function (value) {
                return value[0] + "-" + value[1] + " seconds";
            }
        }
    );

    this.playLengthRandomSwitch = new Switch($("#mhPlayLengthRandomSwitch"));
    this.playLengthRandomSwitch.addContainerToggle($("#mhPlayLengthRangeContainer"), $("#mhPlayLengthSpecificContainer"));
};

HostModal.prototype.setupPlaybackSpeed = function () {
    this.$playbackSpeed.slider({
        ticks: [1, 1.5, 2, 4],
        ticks_labels: [1, 1.5, 2, 4],
        ticks_positions: [0, 33, 66, 100],
        ticks_snap_bounds: 3,
        selection: "none",
        step: 0.5,
        max: 4,
        min: 1,
        value: 1
    });

    this.playbackSpeedToggleSlider = new ToggleSlider($("#mhPlaybackSpeedRandomSlider"), [1, 1.5, 2, 4]);

    this.playbackSpeedRandomSwitch = new Switch($("#mhPlaybackSpeedRandomSwitch"));
    this.playbackSpeedRandomSwitch.addContainerToggle(
        $("#mhPlaybackSpeedRandomContainer"),
        $("#mhPlaybackSpeedSpecificContainer")
    );
};

HostModal.prototype.setupSamplePoint = function () {
    this.$samplePoint.slider({
        ticks: [1, 2, 3],
        ticks_labels: ["Start", "Middle", "End"],
        ticks_snap_bounds: 1,
        selection: "none",
        min: 1,
        max: 3,
        value: 1,
        formatter: function (value) {
            switch (value) {
                case 1:
                    return "Start";
                case 2:
                    return "Middle";
                case 3:
                    return "End";
                default:
                    return "Unknown";
            }
        }
    });

    this.samplePointRangeSliderCombo = new SliderTextCombo(
        $("#mhSamplePointRange"),
        [$("#mhSamplePointMin"), $("#mhSamplePointMax")],
        {
            min: 0,
            max: 100,
            value: [0, 100],
            range: true,
            formatter: function (value) {
                return value[0] + "-" + value[1] + "% into the song";
            }
        }
    );

    this.samplePointRandomSwitch = new Switch($("#mhSamplePointRandomSwitch"));
    this.samplePointRandomSwitch.addContainerToggle(
        $("#mhSamplePointRangeContainer"),
        $("#mhSamplePointSpecificContainer")
    );
    this.samplePointRandomSwitch.setOn(true);
    this.samplePointRandomSwitch.addListener((on) => {
        if (!on) {
            this.$samplePoint.slider("relayout");
        }
    });
};

HostModal.prototype.setupPlayerScore = function () {
    this.$playerScore.slider({
        ticks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        ticks_labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        ticks_snap_bounds: 1,
        value: [1, 10],
        step: 1,
        min: 1,
        max: 10
    });

    this.playerScoreToggleSlider = new ToggleSlider($("#mhPlayerScoreAdvancedSelector"), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

    this.playerScoreAdvancedSwitch = new Switch($("#mhPlayerScoreSwitch"));
    this.playerScoreAdvancedSwitch.addContainerToggle(
        $("#mhPlayerScoreAdvancedContainer"),
        $("#mhPlayerScoreStandardContainer")
    );
    this.playerScoreAdvancedSwitch.addListener((on) => {
        if (!on) {
            this.$playerScore.slider("relayout");
        }
    });
};

HostModal.prototype.setupAnimeScore = function () {
    this.$animeScore.slider({
        ticks: [2, 3, 4, 5, 6, 7, 8, 9, 10],
        ticks_labels: [2, 3, 4, 5, 6, 7, 8, 9, 10],
        ticks_snap_bounds: 1,
        value: [2, 10],
        step: 1,
        min: 2,
        max: 10
    });

    this.animeScoreToggleSlider = new ToggleSlider($("#mhAnimeScoreAdvancedSelector"), [2, 3, 4, 5, 6, 7, 8, 9, 10]);

    this.animeScoreAdvancedSwitch = new Switch($("#mhAnimeScoreSwitch"));
    this.animeScoreAdvancedSwitch.addContainerToggle(
        $("#mhAnimeScoreAdvancedContainer"),
        $("#mhAnimeScoreStandardContainer")
    );
    this.animeScoreAdvancedSwitch.addListener((on) => {
        if (!on) {
            this.$animeScore.slider("relayout");
        }
    });
};

HostModal.prototype.setupVintage = function () {
    this.vintageRangeSliderCombo = new SliderTextCombo($("#mhVintage"), [$("#mhVintageMin"), $("#mhVintageMax")], {
        min: 1944,
        max: 2022,
        value: [1944, 2022],
        range: true,
        formatter: function (value) {
            return value[0] + "-" + value[1];
        }
    });

    this.fromSeasonSelector = new SeasonSelector($("#mhFromSeasonSelectors"));
    this.fromSeasonSelector.setValue(0);
    this.toSeasonSelector = new SeasonSelector($("#mhToSeasonSelectors"));
    this.toSeasonSelector.setValue(3);

    this.fromSeasonSelector.addListener((fromValue) => {
        let sliderValue = this.vintageRangeSliderCombo.getValue();
        let toValue = this.toSeasonSelector.getValue();
        if (sliderValue[0] === sliderValue[1] && fromValue > toValue) {
            this.toSeasonSelector.setValue(fromValue);
            this.fromSeasonSelector.setValue(toValue);
        }
    });

    this.toSeasonSelector.addListener((toValue) => {
        let sliderValue = this.vintageRangeSliderCombo.getValue();
        let fromValue = this.fromSeasonSelector.getValue();
        if (sliderValue[0] === sliderValue[1] && toValue < fromValue) {
            this.fromSeasonSelector.setValue(toValue);
            this.toSeasonSelector.setValue(fromValue);
        }
    });

    this.vintageRangeSliderCombo.addListener((newValues) => {
        if (newValues[0] === newValues[1]) {
            let toValue = this.toSeasonSelector.getValue();
            let fromValue = this.fromSeasonSelector.getValue();
            if (toValue < fromValue) {
                this.toSeasonSelector.setValue(fromValue);
                this.fromSeasonSelector.setValue(toValue);
            }
        }
    });

    this.vintageAdvancedFilter = new SettingFilter(
        $("#mhVintageFilter"),
        (value) => {
            let fromYear = value.years[0];
            let toYear = value.years[1];

            let fromSeasonIndex = value.seasons[0];
            let toSeasonIndex = value.seasons[1];

            let $entry = $(format(SETTING_FILTER_ENTRY_TEMPLATES.VINTAGE, fromYear + "-" + toYear));
            $entry.find(".fromSeasons > .mhSeasonSelector").eq(fromSeasonIndex).addClass("selected");
            $entry.find(".toSeasons > .mhSeasonSelector").eq(toSeasonIndex).addClass("selected");

            return $entry;
        },
        (valueA, valueB) => {
            return (
                valueA.years[0] === valueB.years[0] &&
                valueA.years[1] === valueB.years[1] &&
                valueA.seasons[0] === valueB.seasons[0] &&
                valueA.seasons[1] === valueB.seasons[1]
            );
        }
    );

    this.$vintageAddToFilterButton.click(() => {
        this.vintageAdvancedFilter.addValue({
            years: this.vintageRangeSliderCombo.getValue(),
            seasons: [this.fromSeasonSelector.getValue(), this.toSeasonSelector.getValue()]
        });
    });
};

HostModal.prototype.setupSongDifficulty = function () {
    this.songDiffRangeSliderCombo = new SliderTextCombo(
        $("#mhSongDiffRange"),
        [$("#mhSongDiffMin"), $("#mhSongDiffMax")],
        {
            min: 0,
            max: 100,
            value: [0, 100],
            range: true,
            formatter: function (value) {
                return value[0] + "-" + value[1] + "% Correct Guesses";
            }
        }
    );

    this.songDiffAdvancedSwitch = new Switch($("#mhSongDiffAdvancedSwitch"));
    this.songDiffAdvancedSwitch.addContainerToggle($("#mhSongDiffAdvancedContainer"), $("#mhSongDiffStandcardContainer"));

    setOneCheckBoxAlwaysOn(
        [this.$songDiffEasy, this.$songDiffMedium, this.$songDiffHard],
        "One Song Difficulty Must be Selected"
    );
};

HostModal.prototype.setupSongPopularity = function () {
    this.songPopRangeSliderCombo = new SliderTextCombo($("#mhSongPopRange"), [$("#mhSongPopMin"), $("#mhSongPopMax")], {
        min: 0,
        max: 100,
        value: [0, 100],
        range: true,
        formatter: function (value) {
            return value[0] + "-" + value[1] + "% Liked";
        }
    });

    this.songPopAdvancedSwitch = new Switch($("#mhSongPopAdvancedSwitch"));
    this.songPopAdvancedSwitch.addContainerToggle($("#mhSongPopAdvancedContainer"), $("#mhSongPopStandcardContainer"));

    setOneCheckBoxAlwaysOn(
        [this.$songPopDisliked, this.$songPopLiked, this.$songPopMixed],
        "One Song Popularity Must be Selected"
    );
};

HostModal.prototype.showSettings = function () {
    if (this.gameMode === "Ranked") {
        this.$ROOM_SIZE_LIMITED_CONTAINER.addClass("hide");
        this.$ROOM_SIZE_UNLIMITED_CONTAINER.removeClass("hide");
    } else {
        this.$ROOM_SIZE_LIMITED_CONTAINER.removeClass("hide");
        this.$ROOM_SIZE_UNLIMITED_CONTAINER.addClass("hide");
    }
    this.$title.text(this.gameMode + " Game");
    this.relayout();
};

HostModal.prototype.relayout = function () {
    this.$view.addClass("relayouting");
    this.$view.removeClass("relayouting");
    this.$gameMode.slider("relayout");
    this.relayoutGeneralTab();
    this.relayoutQuizTab();
    this.relayoutAnimeTab();
    this.relayoutModeTab();

    this.$mainContainerInner.perfectScrollbar("update");
};

HostModal.prototype.relayoutModeTab = function () {
    this.$showSelection.slider("relayout");
    this.$scoring.slider("relayout");
};

HostModal.prototype.relayoutGeneralTab = function () {
    this.numberOfSongsSliderCombo.relayout();
    this.roomSizeSliderCombo.relayout();
    this.$songPool.slider("relayout");
    this.$watchedDistribution.slider("relayout");
    this.$teamSize.slider("relayout");
};

HostModal.prototype.relayoutQuizTab = function () {
    this.playLengthSliderCombo.relayout();
    this.inventorySizeSliderCombo.relayout();
    this.lootingTimeSliderCombo.relayout();
    this.lifeSliderCombo.relayout();
    this.$samplePoint.slider("relayout");
    this.$playbackSpeed.slider("relayout");
};

HostModal.prototype.relayoutAnimeTab = function () {
    this.$playerScore.slider("relayout");
    this.$animeScore.slider("relayout");
    this.vintageRangeSliderCombo.relayout();
    this.vintageAdvancedFilter.relayout();
};

HostModal.prototype.getSettings = function (onlyValidateStaticSettings) {
    //Clear possible old alerts
    $("#mhHostModal .alert-danger").removeClass("alert-danger");

    let roomName = this.$roomName.val();
    let privateRoom = this.$privateCheckbox.is(":checked") && !this.soloMode;
    let password = this.$passwordInput.val();
    if (!onlyValidateStaticSettings) {
        if (!roomName) {
            displayMessage("A room name must be provided");
            this.$roomName.addClass("alert-danger");
            return false;
        }
        if (roomName.length > 20) {
            displayMessage("Room name too long", "Please keep it under 20 symbols");
            this.$roomName.addClass("alert-danger");
            return false;
        }
        if (privateRoom && !password.length) {
            displayMessage("A password must be provided");
            this.$passwordInput.addClass("alert-danger");
            return false;
        }
    }

    let advancedPlayerScore = this.playerScoreAdvancedSwitch.getOn();
    if (advancedPlayerScore) {
        let oneOn = this.playerScoreToggleSlider.getValues().some((on) => {
            return on;
        });
        if (!oneOn) {
            displayMessage("At least one player score must be toggled on");
            return false;
        }
    }

    let advancedAnimeScore = this.animeScoreAdvancedSwitch.getOn();
    if (advancedAnimeScore) {
        let oneOn = this.animeScoreToggleSlider.getValues().some((on) => {
            return on;
        });
        if (!oneOn) {
            displayMessage("At least one anime score must be toggled on");
            return false;
        }
    }

    let advancedPlaybackSpeed = this.playbackSpeedRandomSwitch.getOn();
    if (advancedPlaybackSpeed) {
        let oneOn = this.playbackSpeedToggleSlider.getValues().some((on) => {
            return on;
        });
        if (!oneOn) {
            displayMessage("At least one playback speed must be toggled on");
            return false;
        }
    }

    return {
        roomName: roomName,
        privateRoom: privateRoom,
        password: password,
        roomSize: this.roomSizeSliderCombo.getValue(),
        numberOfSongs: this.numberOfSongsSliderCombo.getValue(),
        teamSize: this.$teamSize.slider("getValue"),
        modifiers: {
            skipGuessing: this.$skipGuessing.is(":checked"),
            skipReplay: this.$skipReplay.is(":checked"),
            duplicates: this.$duplicateShows.is(":checked"),
            queueing: this.$queueing.is(":checked"),
            lootDropping: this.$lootDropping.is(":checked"),
            rebroadcastSongs: this.$rebroadcastSongs.is(":checked"),
            dubSongs: this.$dubSongs.is(":checked")
        },
        songSelection: {
            standardValue: this.$songPool.slider("getValue"),
            advancedValue: {
                watched: this.watchedSliderCombo.getValue(),
                unwatched: this.unwatchedSliderCombo.getValue(),
                random: this.randomWatchedSliderCombo.getValue()
            }
        },
        watchedDistribution: this.$watchedDistribution.slider('getValue'),
        songType: {
            standardValue: {
                openings: this.$songTypeOpening.is(":checked"),
                endings: this.$songTypeEnding.is(":checked"),
                inserts: this.$songTypeInsert.is(":checked")
            },
            advancedValue: {
                openings: this.openingsSliderCombo.getValue(),
                endings: this.endingsSliderCombo.getValue(),
                inserts: this.insertSliderCombo.getValue(),
                random: this.randomSliderCombo.getValue()
            }
        },
        openingCategories: {
            instrumental: this.$openingInstrumentalCheckbox.is(":checked"),
            chanting: this.$openingChantingCheckbox.is(":checked"),
            character: this.$openingCharacterCheckbox.is(":checked"),
            standard: this.$openingStandardCheckbox.is(":checked")
        },
        endingCategories: {
            instrumental: this.$endingInstrumentalCheckbox.is(":checked"),
            chanting: this.$endingChantingCheckbox.is(":checked"),
            character: this.$endingCharacterCheckbox.is(":checked"),
            standard: this.$endingStandardCheckbox.is(":checked")
        },
        insertCategories: {
            instrumental: this.$insertInstrumentalCheckbox.is(":checked"),
            chanting: this.$insertChantingCheckbox.is(":checked"),
            character: this.$insertCharacterCheckbox.is(":checked"),
            standard: this.$insertStandardCheckbox.is(":checked")
        },
        guessTime: {
            randomOn: this.playLengthRandomSwitch.getOn(),
            standardValue: this.playLengthSliderCombo.getValue(),
            randomValue: this.playLengthRangeSliderCombo.getValue()
        },
        scoreType: this.$scoring.slider("getValue"),
        showSelection: this.$showSelection.slider("getValue"),
        inventorySize: {
            randomOn: this.inventorySizeRandomSwitch.getOn(),
            standardValue: this.inventorySizeSliderCombo.getValue(),
            randomValue: this.inventorySizeRangeSliderCombo.getValue()
        },
        lootingTime: {
            randomOn: this.lootingTimeRandomSwitch.getOn(),
            standardValue: this.lootingTimeSliderCombo.getValue(),
            randomValue: this.lootingTimeRangeSliderCombo.getValue()
        },
        lives: this.lifeSliderCombo.getValue(),
        samplePoint: {
            randomOn: this.samplePointRandomSwitch.getOn(),
            standardValue: this.$samplePoint.slider("getValue"),
            randomValue: this.samplePointRangeSliderCombo.getValue()
        },
        playbackSpeed: {
            randomOn: advancedPlaybackSpeed,
            standardValue: this.$playbackSpeed.slider("getValue"),
            randomValue: this.playbackSpeedToggleSlider.getValues()
        },
        songDifficulity: {
            advancedOn: this.songDiffAdvancedSwitch.getOn(),
            standardValue: {
                easy: this.$songDiffEasy.is(":checked"),
                medium: this.$songDiffMedium.is(":checked"),
                hard: this.$songDiffHard.is(":checked")
            },
            advancedValue: this.songDiffRangeSliderCombo.getValue()
        },
        songPopularity: {
            advancedOn: this.songPopAdvancedSwitch.getOn(),
            standardValue: {
                disliked: this.$songPopDisliked.is(":checked"),
                mixed: this.$songPopMixed.is(":checked"),
                liked: this.$songPopLiked.is(":checked")
            },
            advancedValue: this.songPopRangeSliderCombo.getValue()
        },
        playerScore: {
            advancedOn: advancedPlayerScore,
            standardValue: this.$playerScore.slider("getValue"),
            advancedValue: this.playerScoreToggleSlider.getValues()
        },
        animeScore: {
            advancedOn: advancedAnimeScore,
            standardValue: this.$animeScore.slider("getValue"),
            advancedValue: this.animeScoreToggleSlider.getValues()
        },
        vintage: {
            standardValue: {
                years: this.vintageRangeSliderCombo.getValue(),
                seasons: [this.fromSeasonSelector.getValue(), this.toSeasonSelector.getValue()]
            },
            advancedValueList: this.vintageAdvancedFilter.getValues()
        },
        type: {
            tv: this.$animeTvCheckbox.is(":checked"),
            movie: this.$animeMovieCheckbox.is(":checked"),
            ova: this.$animeOVACheckbox.is(":checked"),
            ona: this.$animeONACheckbox.is(":checked"),
            special: this.$animeSpecialCheckbox.is(":checked")
        },
        genre: this.genreFilter.getValues(),
        tags: this.tagFilter.getValues(),
        gameMode: this.gameMode
    };
};

HostModal.prototype.hide = function () {
    $("#mhHostModal").modal("hide");
};

HostModal.prototype.displayHostSolo = function () {
    this.setModeHostGame(true);
    hostModal.show();
};

HostModal.prototype.reset = function () {
    $("#mhHostModal .alert-danger").removeClass("alert-danger");

    let defaultSettings = this.DEFUALT_SETTINGS;
    if (xpBar.level < this.MAX_LEVEL_FOR_HARD_DEFAULT_OFF) {
        defaultSettings = JSON.parse(JSON.stringify(this.DEFUALT_SETTINGS));
        defaultSettings.songDifficulity.standardValue.hard = false;
    }
    this.changeSettings(defaultSettings);
    this.changeView("quick");
};

HostModal.prototype.setModeHostGame = function (soloMode) {
    this.$view.find(".modal-body").removeClass("disabled");
    this.resetMode();
    this.$MODE_BUTTON.removeClass("hidden");
    this.$title.text("Setup Game");
    this.$hostButton.removeClass("hidden");
    this.$settingContainers.removeClass("disabled");
    if (soloMode) {
        this.soloMode = true;
        this.gameMode = "Solo";
        this.$view.addClass("soloMode");
        this.$roomName.val("Solo");
    } else {
        this.soloMode = false;
        this.gameMode = "Multiplayer";
    }
    this._settingStorage.setLoadingEnabled(true);
};

HostModal.prototype.setModeGameSettings = function (host, soloMode) {
    this.$title.text(this.gameMode + " Game Settings");
    this.resetMode();
    if (host) {
        this.$settingContainers.removeClass("disabled");
        this.$changeButton.removeClass("hidden");
        this.$MODE_BUTTON.text("Game Mode").removeClass("hidden");
        this._settingStorage.setLoadingEnabled(true);
    } else {
        this.$settingContainers.addClass("disabled");
        this._settingStorage.setLoadingEnabled(false);
    }
    if (soloMode) {
        this.soloMode = true;
        this.$view.addClass("soloMode");
    }
};

HostModal.prototype.setModePreviewGame = function (tile) {
    this.resetMode();
    this._previewRoomTile = tile;
    this.$title.text(this.gameMode + " Game Settings");
    this.$settingContainers.addClass("disabled");
    this.$PREVIEW_BUTTON_CONTAINER.removeClass("hidden");
    this._settingStorage.setLoadingEnabled(false);
};

HostModal.prototype.resetMode = function () {
    this.$PREVIEW_BUTTON_CONTAINER.addClass("hidden");
    this.$hostButton.addClass("hidden");
    this.$changeButton.addClass("hidden");
    this.$changeButton.addClass("hidden");
    this.$MODE_BUTTON.addClass("hidden");
    this.$view.removeClass("soloMode");
    this.soloMode = false;
};

HostModal.prototype.changeSettings = function (changes) {
    Object.keys(changes).forEach((key) => {
        setTimeout(() => {
            this.updateSetting(key, changes[key]);
        }, 1);
    });
};

HostModal.prototype.updateSetting = function (setting, change) {
    if (typeof change === "object") {
        change = JSON.parse(JSON.stringify(change));
    }
    switch (setting) {
        case "roomName":
            this.$roomName.val(change);
            break;
        case "privateRoom":
            this.setCheckBox(this.$privateCheckbox, change);
            if (change) {
                this.$passwordInput.removeClass("hide");
            } else {
                this.$passwordInput.addClass("hide");
            }
            break;
        case "password":
            this.$passwordInput.val(change);
            break;
        case "roomSize": {
            this.roomSizeSliderCombo.setValue(change);
            break;
        }
        case "teamSize": {
            this.$teamSize.slider("setValue", change);
            break;
        }
        case "numberOfSongs":
            this.numberOfSongsSliderCombo.setValue(change);
            break;
        case "modifiers":
            this.setCheckBox(this.$skipGuessing, change.skipGuessing);
            this.setCheckBox(this.$skipReplay, change.skipReplay);
            this.setCheckBox(this.$duplicateShows, change.duplicates);
            this.setCheckBox(this.$lootDropping, change.lootDropping);
            this.setCheckBox(this.$queueing, change.queueing);
            this.setCheckBox(this.$rebroadcastSongs, change.rebroadcastSongs);
            this.setCheckBox(this.$dubSongs, change.dubSongs);
            break;
        case "songSelection":
            this.$songPool.slider("setValue", change.standardValue);
            this.watchedSliderCombo.setValue(change.advancedValue.watched);
            this.unwatchedSliderCombo.setValue(change.advancedValue.unwatched);
            this.randomWatchedSliderCombo.setValue(change.advancedValue.random);
            break;
        case 'watchedDistribution':
            this.$watchedDistribution.slider('setValue', change);
            break;
        case "songType":
            this.setCheckBox(this.$songTypeOpening, change.standardValue.openings);
            this.setCheckBox(this.$songTypeEnding, change.standardValue.endings);
            this.setCheckBox(this.$songTypeInsert, change.standardValue.inserts);
            this.openingsSliderCombo.setDisabled(!change.standardValue.openings);
            this.endingsSliderCombo.setDisabled(!change.standardValue.endings);
            this.insertSliderCombo.setDisabled(!change.standardValue.inserts);
            this.openingsSliderCombo.setValue(change.advancedValue.openings);
            this.endingsSliderCombo.setValue(change.advancedValue.endings);
            this.insertSliderCombo.setValue(change.advancedValue.inserts);
            this.randomSliderCombo.setValue(change.advancedValue.random);
            if (change.standardValue.openings) {
                this.$openingCategoryOptions.removeClass("disabled");
            } else {
                this.$openingCategoryOptions.addClass("disabled");
            }
            if (change.standardValue.endings) {
                this.$endingCategoryOptions.removeClass("disabled");
            } else {
                this.$endingCategoryOptions.addClass("disabled");
            }
            if (change.standardValue.inserts) {
                this.$insertCategoryOptions.removeClass("disabled");
            } else {
                this.$insertCategoryOptions.addClass("disabled");
            }
            break;
        case "openingCategories":
            this.setCheckBox(this.$openingInstrumentalCheckbox, change.instrumental);
            this.setCheckBox(this.$openingChantingCheckbox, change.chanting);
            this.setCheckBox(this.$openingCharacterCheckbox, change.character);
            this.setCheckBox(this.$openingStandardCheckbox, change.standard);
            break;
        case "endingCategories":
            this.setCheckBox(this.$endingInstrumentalCheckbox, change.instrumental);
            this.setCheckBox(this.$endingChantingCheckbox, change.chanting);
            this.setCheckBox(this.$endingCharacterCheckbox, change.character);
            this.setCheckBox(this.$endingStandardCheckbox, change.standard);
            break;
        case "insertCategories":
            this.setCheckBox(this.$insertInstrumentalCheckbox, change.instrumental);
            this.setCheckBox(this.$insertChantingCheckbox, change.chanting);
            this.setCheckBox(this.$insertCharacterCheckbox, change.character);
            this.setCheckBox(this.$insertStandardCheckbox, change.standard);
            break;
        case "guessTime":
            this.playLengthSliderCombo.setValue(change.standardValue);
            this.playLengthRangeSliderCombo.setValue(change.randomValue);
            this.playLengthRandomSwitch.setOn(change.randomOn);
            break;
        case "scoreType":
            this.$scoring.slider("setValue", change, false, true);
            break;
        case "showSelection":
            this.$showSelection.slider("setValue", change, false, true);
            break;
        case "inventorySize":
            this.inventorySizeSliderCombo.setValue(change.standardValue);
            this.inventorySizeRangeSliderCombo.setValue(change.randomValue);
            this.inventorySizeRandomSwitch.setOn(change.randomOn);
            break;
        case "lootingTime":
            this.lootingTimeSliderCombo.setValue(change.standardValue);
            this.lootingTimeRangeSliderCombo.setValue(change.randomValue);
            this.lootingTimeRandomSwitch.setOn(change.randomOn);
            break;
        case "lives":
            this.lifeSliderCombo.setValue(change);
            break;
        case "samplePoint":
            this.samplePointRangeSliderCombo.setValue(change.randomValue);
            this.$samplePoint.slider("setValue", change.standardValue);
            this.samplePointRandomSwitch.setOn(change.randomOn);
            break;
        case "playbackSpeed":
            this.playbackSpeedToggleSlider.setValue(change.randomValue);
            this.$playbackSpeed.slider("setValue", change.standardValue);
            this.playbackSpeedRandomSwitch.setOn(change.randomOn);
            break;
        case "songDifficulity":
            this.songDiffRangeSliderCombo.setValue(change.advancedValue);
            this.setCheckBox(this.$songDiffEasy, change.standardValue.easy);
            this.setCheckBox(this.$songDiffMedium, change.standardValue.medium);
            this.setCheckBox(this.$songDiffHard, change.standardValue.hard);
            this.songDiffAdvancedSwitch.setOn(change.advancedOn);
            break;
        case "songPopularity":
            this.songPopRangeSliderCombo.setValue(change.advancedValue);
            this.setCheckBox(this.$songPopDisliked, change.standardValue.disliked);
            this.setCheckBox(this.$songPopMixed, change.standardValue.mixed);
            this.setCheckBox(this.$songPopLiked, change.standardValue.liked);
            this.songPopAdvancedSwitch.setOn(change.advancedOn);
            break;
        case "playerScore":
            this.playerScoreToggleSlider.setValue(change.advancedValue);
            this.$playerScore.slider("setValue", change.standardValue);
            this.playerScoreAdvancedSwitch.setOn(change.advancedOn);
            break;
        case "animeScore":
            this.animeScoreToggleSlider.setValue(change.advancedValue);
            this.$animeScore.slider("setValue", change.standardValue);
            this.animeScoreAdvancedSwitch.setOn(change.advancedOn);
            break;
        case "vintage":
            this.vintageRangeSliderCombo.setValue(change.standardValue.years, true);
            this.fromSeasonSelector.setValue(change.standardValue.seasons[0]);
            this.toSeasonSelector.setValue(change.standardValue.seasons[1]);
            this.vintageAdvancedFilter.clear();
            change.advancedValueList.forEach((value) => {
                this.vintageAdvancedFilter.addValue(value);
            });
            break;
        case "type":
            this.setCheckBox(this.$animeTvCheckbox, change.tv);
            this.setCheckBox(this.$animeMovieCheckbox, change.movie);
            this.setCheckBox(this.$animeOVACheckbox, change.ova);
            this.setCheckBox(this.$animeONACheckbox, change.ona);
            this.setCheckBox(this.$animeSpecialCheckbox, change.special);
            break;
        case "genre":
            this.genreFilter.clear();
            change.forEach((value) => {
                this.genreFilter.addValue(value);
            });
            break;
        case "tags":
            this.tagFilter.clear();
            change.forEach((value) => {
                this.tagFilter.addValue(value);
            });
            break;
        case "gameMode":
            this.gameMode = change;
    }
};

HostModal.prototype.setCheckBox = function (checkBoxElement, checked) {
    checkBoxElement.prop("checked", checked);
};

HostModal.prototype.changeView = function (viewName) {
    this.$tabContainer.find(".tab").removeClass("selected");

    switch (viewName) {
        case "quick":
            this.$mainContainer.addClass("mhQuickView");
            this.$quickTab.addClass("selected");
            this.relayout();
            break;
        case "advanced":
            this.$mainContainer.removeClass("mhQuickView");
            this.$advancedTab.addClass("selected");
            this.relayout();
            break;
    }
};

HostModal.prototype.showLoadContainer = function () {
    this._settingStorage.setLoadContainerHidden(false);
};

HostModal.prototype.hideLoadContainer = function () {
    this._settingStorage.setLoadContainerHidden(true);
};

HostModal.prototype.toggleLoadContainer = function () {
    if (this._settingStorage.loadContainerShown()) {
        this.showLoadContainer();
    } else {
        this.hideLoadContainer();
    }
};

HostModal.prototype.show = function () {
    this.$view.modal("show");
};

HostModal.prototype.toggleJoinButton = function (on) {
    if (on) {
        this.$JOIN_BUTTON.removeClass("disabled");
    } else {
        this.$JOIN_BUTTON.addClass("disabled");
    }
};

HostModal.prototype.saveSettings = function () {
    this._settingStorage.saveSettings(this.getSettings(true));
};

HostModal.prototype.randomizePlayerScore = function () {
    this.changeSettings({
        playerScore: settingRandomizer.parseSettingRange(settingRandomizer.animeSettingRange.playerScore)
    });
};

HostModal.prototype.randomizeAnimeScore = function () {
    this.changeSettings({
        animeScore: settingRandomizer.getRandomAnimeScoreSetting()
    });
};

HostModal.prototype.randomizeVintage = function () {
    this.changeSettings({
        vintage: settingRandomizer.getRandomVintageSetting()
    });
};

HostModal.prototype.randomizeGenre = function () {
    this.changeSettings({
        genre: settingRandomizer.randomTagGenreFilters(settingRandomizer._genreIds)
    });
};

HostModal.prototype.randomizeTag = function () {
    let optionalGenre = this.genreFilter.getValues().some((entry) => {
        return entry.state === settingRandomizer._GENRE_TAG_STATES.OPTIONAL;
    });
    this.changeSettings({
        tags: settingRandomizer.randomTagGenreFilters(settingRandomizer._tagIds, optionalGenre)
    });
};

HostModal.prototype.updateSelectedGameMode = function () {
    let targetValue;
    if (this.$showSelection.slider("getValue") === this.SHOW_SELECTION_IDS.LOOTING) {
        targetValue = 4;
    } else {
        targetValue = this.$scoring.slider("getValue");
    }
    this.$gameMode.slider("setValue", targetValue);
};

HostModal.prototype.updateStandardSongSelection = function () {
    let watchedCount = this.watchedSliderCombo.getValue();
    let randomCount = this.randomWatchedSliderCombo.getValue();

    let numberOfSongs = this.numberOfSongsSliderCombo.getValue();

    if (watchedCount === numberOfSongs) {
        this.$songPool.slider("setValue", 3);
    } else if (randomCount === numberOfSongs) {
        this.$songPool.slider("setValue", 1);
    } else {
        this.$songPool.slider("setValue", 2);
    }
};

HostModal.prototype.setTickPopovers = function (textArray, $slider, $controller, defaultValue) {
    textArray.forEach((text, index) => {
        $slider.find(`.slider-tick:nth-child(${index + 1})`).popover({
            content: text,
            delay: 50,
            placement: "top",
            trigger: "hover",
            container: "#mhHostModal"
        });
    });
    let $sliderHandle = $slider.find(".slider-handle");
    $sliderHandle.popover({
        content: textArray[defaultValue - 1],
        delay: 50,
        placement: "top",
        trigger: "hover",
        container: "#mhHostModal"
    });
    $controller.on("change", (event) => {
        $sliderHandle.data("bs.popover").options.content = textArray[event.value.newValue - 1];
    });
};

HostModal.prototype.scrollToContainer = function (containerName) {
    let $container;
    switch (containerName) {
        case "anime":
            $container = this.$ANIME_SETTING_CONTAINER;
            break;
        case "general":
            $container = this.$GENERAL_SETTING_CONTAINER;
            break;
        case "mode":
            $container = this.$MODE_SETTING_CONTAINER;
            break;
        case "quiz":
            $container = this.$QUIZ_SETTING_CONTAINER;
            break;
    }
    let currentScroll = this.$mainContainerInner[0].scrollTop;
    let newScroll = $container.position().top + currentScroll - 30;
    this.$mainContainerInner.animate({scrollTop: newScroll}, 250);
};

HostModal.prototype.getTutorialSettings = function () {
    let settings = JSON.parse(JSON.stringify(this.DEFUALT_SETTINGS));
    settings.roomName = "Tutorial";
    settings.numberOfSongs = 5;
    settings.modifiers.duplicates = false;
    settings.songSelection.standardValue = 3;
    settings.songSelection.advancedValue.watched = 5;
    settings.songSelection.advancedValue.unwatched = 0;
    settings.songType.standardValue.endings = false;
    settings.songDifficulity.standardValue.medium = false;
    settings.songDifficulity.standardValue.hard = false;
    return settings;
};

HostModal.prototype.setPasswordHidden = function (hidden) {
    this.passwordHidden = hidden;
    if (hidden) {
        this.$SHOW_HIDE_PASSWORD_BUTTON.removeClass('show');
        this.$passwordInput.attr('type', 'password');
    } else {
        this.$SHOW_HIDE_PASSWORD_BUTTON.addClass('show');
        this.$passwordInput.attr('type', 'text');
    }
};

HostModal.prototype.SHOW_SELECTION_IDS = {
    AUTO: 1,
    LOOTING: 2
};

HostModal.prototype.SHOW_SELECTION_IDS = {
    AUTO: 1,
    LOOTING: 2
};

function createAdvancedDistributionSongListener(sliderComboList) {
    return (newValue, oldValue) => {
        let sliderComboes = sliderComboList;

        let valueChange = newValue - oldValue;

        let sumChange = 0;
        let entries = [];
        sliderComboes.forEach((sliderCombo) => {
            let currentValue = sliderCombo.getValue();
            let sharePercent = currentValue / oldValue;
            let change = Math.floor(valueChange * sharePercent);
            sumChange += change;
            entries.push({
                percent: sharePercent,
                currentValue: currentValue,
                change: change,
                sliderCombo: sliderCombo
            });
        });

        //Sort decending
        entries.sort((a, b) => {
            return Math.abs(b.sharePercent) - Math.abs(a.sharePercent);
        });

        let index = 0;
        while (sumChange < valueChange) {
            if (index > entries.length) {
                index = 0;
            }
            entries[index].change++;
            sumChange++;
            index++;
        }

        entries.forEach((entry) => {
            entry.sliderCombo.setMax(newValue);
            entry.sliderCombo.setValue(entry.currentValue + entry.change);
        });
    };
}

var hostModal = new HostModal();
