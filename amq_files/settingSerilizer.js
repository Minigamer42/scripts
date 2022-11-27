"use strict";

/*exported SettingSerilizer*/

function SettingSerilizer() {
    this._DATA_FORMATS = {
        SMALL_INT: 1,
        BIG_INT: 2,
        BOOLEAN: 3,
        PAIR_SMALL_INT: 4,
        PAIR_BIG_INT: 5,
        PAIR_LARGE_INT: 6,
        QUAD_BOOLEAN: 7,
        NINE_BOOLEAN: 8,
        TEN_BOOLEAN: 9,
        ARRAY_VINTAGE_SET: 10,
        ARRAY_TAG_GENRE_ENTRY: 11
    };

    this._SETTING_SCHEMEAS = {
        1: {
            BASE: 36,
            ARRAY_DELIMITER: "-",
            MAX_LENGTH: 300,
            SCHEMA: {
                roomSize: this._DATA_FORMATS.SMALL_INT,
                numberOfSongs: this._DATA_FORMATS.BIG_INT,
                modifiers: {
                    skipGuessing: this._DATA_FORMATS.BOOLEAN,
                    skipReplay: this._DATA_FORMATS.BOOLEAN,
                    queueing: this._DATA_FORMATS.BOOLEAN,
                    duplicates: this._DATA_FORMATS.BOOLEAN
                },
                songSelection: {
                    advancedOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: this._DATA_FORMATS.SMALL_INT,
                    advancedValue: {
                        watched: this._DATA_FORMATS.BIG_INT,
                        unwatched: this._DATA_FORMATS.BIG_INT,
                        random: this._DATA_FORMATS.BIG_INT
                    }
                },
                songType: {
                    advancedOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: {
                        openings: this._DATA_FORMATS.BOOLEAN,
                        endings: this._DATA_FORMATS.BOOLEAN,
                        inserts: this._DATA_FORMATS.BOOLEAN
                    },
                    advancedValue: {
                        openings: this._DATA_FORMATS.BIG_INT,
                        endings: this._DATA_FORMATS.BIG_INT,
                        inserts: this._DATA_FORMATS.BIG_INT,
                        random: this._DATA_FORMATS.BIG_INT
                    }
                },
                guessTime: {
                    randomOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: this._DATA_FORMATS.BIG_INT,
                    randomValue: this._DATA_FORMATS.PAIR_BIG_INT
                },
                samplePoint: {
                    randomOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: this._DATA_FORMATS.SMALL_INT,
                    randomValue: this._DATA_FORMATS.PAIR_BIG_INT
                },
                playbackSpeed: {
                    randomOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: this._DATA_FORMATS.SMALL_INT,
                    randomValue: this._DATA_FORMATS.QUAD_BOOLEAN
                },
                songDifficulity: {
                    advancedOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: {
                        easy: this._DATA_FORMATS.BOOLEAN,
                        medium: this._DATA_FORMATS.BOOLEAN,
                        hard: this._DATA_FORMATS.BOOLEAN
                    },
                    advancedValue: this._DATA_FORMATS.PAIR_BIG_INT
                },
                songPopularity: {
                    advancedOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: {
                        disliked: this._DATA_FORMATS.BOOLEAN,
                        mixed: this._DATA_FORMATS.BOOLEAN,
                        liked: this._DATA_FORMATS.BOOLEAN
                    },
                    advancedValue: this._DATA_FORMATS.PAIR_BIG_INT
                },
                playerScore: {
                    advancedOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: this._DATA_FORMATS.PAIR_SMALL_INT,
                    advancedValue: this._DATA_FORMATS.TEN_BOOLEAN
                },
                animeScore: {
                    advancedOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: this._DATA_FORMATS.PAIR_SMALL_INT,
                    advancedValue: this._DATA_FORMATS.NINE_BOOLEAN
                },
                vintage: {
                    standardValue: {
                        years: this._DATA_FORMATS.PAIR_LARGE_INT,
                        seasons: this._DATA_FORMATS.PAIR_SMALL_INT
                    },
                    advancedValueList: this._DATA_FORMATS.ARRAY_VINTAGE_SET
                },
                type: {
                    tv: this._DATA_FORMATS.BOOLEAN,
                    movie: this._DATA_FORMATS.BOOLEAN,
                    ova: this._DATA_FORMATS.BOOLEAN,
                    ona: this._DATA_FORMATS.BOOLEAN,
                    special: this._DATA_FORMATS.BOOLEAN
                },
                genre: this._DATA_FORMATS.ARRAY_TAG_GENRE_ENTRY,
                tags: this._DATA_FORMATS.ARRAY_TAG_GENRE_ENTRY
            }
        },
        2: {
            BASE: 36,
            ARRAY_DELIMITER: "-",
            MAX_LENGTH: 300,
            SCHEMA: {
                roomSize: this._DATA_FORMATS.BIG_INT,
                numberOfSongs: this._DATA_FORMATS.BIG_INT,
                modifiers: {
                    skipGuessing: this._DATA_FORMATS.BOOLEAN,
                    skipReplay: this._DATA_FORMATS.BOOLEAN,
                    queueing: this._DATA_FORMATS.BOOLEAN,
                    duplicates: this._DATA_FORMATS.BOOLEAN,
                    lootDropping: this._DATA_FORMATS.BOOLEAN
                },
                songSelection: {
                    advancedOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: this._DATA_FORMATS.SMALL_INT,
                    advancedValue: {
                        watched: this._DATA_FORMATS.BIG_INT,
                        unwatched: this._DATA_FORMATS.BIG_INT,
                        random: this._DATA_FORMATS.BIG_INT
                    }
                },
                songType: {
                    advancedOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: {
                        openings: this._DATA_FORMATS.BOOLEAN,
                        endings: this._DATA_FORMATS.BOOLEAN,
                        inserts: this._DATA_FORMATS.BOOLEAN
                    },
                    advancedValue: {
                        openings: this._DATA_FORMATS.BIG_INT,
                        endings: this._DATA_FORMATS.BIG_INT,
                        inserts: this._DATA_FORMATS.BIG_INT,
                        random: this._DATA_FORMATS.BIG_INT
                    }
                },
                guessTime: {
                    randomOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: this._DATA_FORMATS.BIG_INT,
                    randomValue: this._DATA_FORMATS.PAIR_BIG_INT
                },
                inventorySize: {
                    randomOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: this._DATA_FORMATS.BIG_INT,
                    randomValue: this._DATA_FORMATS.PAIR_BIG_INT
                },
                lootingTime: {
                    randomOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: this._DATA_FORMATS.BIG_INT,
                    randomValue: this._DATA_FORMATS.PAIR_BIG_INT
                },
                lives: this._DATA_FORMATS.SMALL_INT,
                samplePoint: {
                    randomOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: this._DATA_FORMATS.SMALL_INT,
                    randomValue: this._DATA_FORMATS.PAIR_BIG_INT
                },
                playbackSpeed: {
                    randomOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: this._DATA_FORMATS.SMALL_INT,
                    randomValue: this._DATA_FORMATS.QUAD_BOOLEAN
                },
                songDifficulity: {
                    advancedOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: {
                        easy: this._DATA_FORMATS.BOOLEAN,
                        medium: this._DATA_FORMATS.BOOLEAN,
                        hard: this._DATA_FORMATS.BOOLEAN
                    },
                    advancedValue: this._DATA_FORMATS.PAIR_BIG_INT
                },
                songPopularity: {
                    advancedOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: {
                        disliked: this._DATA_FORMATS.BOOLEAN,
                        mixed: this._DATA_FORMATS.BOOLEAN,
                        liked: this._DATA_FORMATS.BOOLEAN
                    },
                    advancedValue: this._DATA_FORMATS.PAIR_BIG_INT
                },
                playerScore: {
                    advancedOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: this._DATA_FORMATS.PAIR_SMALL_INT,
                    advancedValue: this._DATA_FORMATS.TEN_BOOLEAN
                },
                animeScore: {
                    advancedOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: this._DATA_FORMATS.PAIR_SMALL_INT,
                    advancedValue: this._DATA_FORMATS.NINE_BOOLEAN
                },
                vintage: {
                    standardValue: {
                        years: this._DATA_FORMATS.PAIR_LARGE_INT,
                        seasons: this._DATA_FORMATS.PAIR_SMALL_INT
                    },
                    advancedValueList: this._DATA_FORMATS.ARRAY_VINTAGE_SET
                },
                type: {
                    tv: this._DATA_FORMATS.BOOLEAN,
                    movie: this._DATA_FORMATS.BOOLEAN,
                    ova: this._DATA_FORMATS.BOOLEAN,
                    ona: this._DATA_FORMATS.BOOLEAN,
                    special: this._DATA_FORMATS.BOOLEAN
                },
                genre: this._DATA_FORMATS.ARRAY_TAG_GENRE_ENTRY,
                tags: this._DATA_FORMATS.ARRAY_TAG_GENRE_ENTRY
            }
        },
        3: {
            BASE: 36,
            ARRAY_DELIMITER: "-",
            MAX_LENGTH: 300,
            SCHEMA: {
                roomSize: this._DATA_FORMATS.BIG_INT,
                numberOfSongs: this._DATA_FORMATS.BIG_INT,
                teamSize: this._DATA_FORMATS.SMALL_INT,
                modifiers: {
                    skipGuessing: this._DATA_FORMATS.BOOLEAN,
                    skipReplay: this._DATA_FORMATS.BOOLEAN,
                    queueing: this._DATA_FORMATS.BOOLEAN,
                    duplicates: this._DATA_FORMATS.BOOLEAN,
                    lootDropping: this._DATA_FORMATS.BOOLEAN
                },
                songSelection: {
                    standardValue: this._DATA_FORMATS.SMALL_INT,
                    advancedValue: {
                        watched: this._DATA_FORMATS.BIG_INT,
                        unwatched: this._DATA_FORMATS.BIG_INT,
                        random: this._DATA_FORMATS.BIG_INT
                    }
                },
                songType: {
                    standardValue: {
                        openings: this._DATA_FORMATS.BOOLEAN,
                        endings: this._DATA_FORMATS.BOOLEAN,
                        inserts: this._DATA_FORMATS.BOOLEAN
                    },
                    advancedValue: {
                        openings: this._DATA_FORMATS.BIG_INT,
                        endings: this._DATA_FORMATS.BIG_INT,
                        inserts: this._DATA_FORMATS.BIG_INT,
                        random: this._DATA_FORMATS.BIG_INT
                    }
                },
                guessTime: {
                    randomOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: this._DATA_FORMATS.BIG_INT,
                    randomValue: this._DATA_FORMATS.PAIR_BIG_INT
                },
                scoreType: this._DATA_FORMATS.SMALL_INT,
                showSelection: this._DATA_FORMATS.SMALL_INT,
                inventorySize: {
                    randomOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: this._DATA_FORMATS.BIG_INT,
                    randomValue: this._DATA_FORMATS.PAIR_BIG_INT
                },
                lootingTime: {
                    randomOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: this._DATA_FORMATS.BIG_INT,
                    randomValue: this._DATA_FORMATS.PAIR_BIG_INT
                },
                lives: this._DATA_FORMATS.SMALL_INT,
                samplePoint: {
                    randomOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: this._DATA_FORMATS.SMALL_INT,
                    randomValue: this._DATA_FORMATS.PAIR_BIG_INT
                },
                playbackSpeed: {
                    randomOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: this._DATA_FORMATS.SMALL_INT,
                    randomValue: this._DATA_FORMATS.QUAD_BOOLEAN
                },
                songDifficulity: {
                    advancedOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: {
                        easy: this._DATA_FORMATS.BOOLEAN,
                        medium: this._DATA_FORMATS.BOOLEAN,
                        hard: this._DATA_FORMATS.BOOLEAN
                    },
                    advancedValue: this._DATA_FORMATS.PAIR_BIG_INT
                },
                songPopularity: {
                    advancedOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: {
                        disliked: this._DATA_FORMATS.BOOLEAN,
                        mixed: this._DATA_FORMATS.BOOLEAN,
                        liked: this._DATA_FORMATS.BOOLEAN
                    },
                    advancedValue: this._DATA_FORMATS.PAIR_BIG_INT
                },
                playerScore: {
                    advancedOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: this._DATA_FORMATS.PAIR_SMALL_INT,
                    advancedValue: this._DATA_FORMATS.TEN_BOOLEAN
                },
                animeScore: {
                    advancedOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: this._DATA_FORMATS.PAIR_SMALL_INT,
                    advancedValue: this._DATA_FORMATS.NINE_BOOLEAN
                },
                vintage: {
                    standardValue: {
                        years: this._DATA_FORMATS.PAIR_LARGE_INT,
                        seasons: this._DATA_FORMATS.PAIR_SMALL_INT
                    },
                    advancedValueList: this._DATA_FORMATS.ARRAY_VINTAGE_SET
                },
                type: {
                    tv: this._DATA_FORMATS.BOOLEAN,
                    movie: this._DATA_FORMATS.BOOLEAN,
                    ova: this._DATA_FORMATS.BOOLEAN,
                    ona: this._DATA_FORMATS.BOOLEAN,
                    special: this._DATA_FORMATS.BOOLEAN
                },
                genre: this._DATA_FORMATS.ARRAY_TAG_GENRE_ENTRY,
                tags: this._DATA_FORMATS.ARRAY_TAG_GENRE_ENTRY
            }
        },
        4: {
            BASE: 36,
            ARRAY_DELIMITER: "-",
            MAX_LENGTH: 300,
            SCHEMA: {
                roomSize: this._DATA_FORMATS.BIG_INT,
                numberOfSongs: this._DATA_FORMATS.BIG_INT,
                teamSize: this._DATA_FORMATS.SMALL_INT,
                modifiers: {
                    skipGuessing: this._DATA_FORMATS.BOOLEAN,
                    skipReplay: this._DATA_FORMATS.BOOLEAN,
                    queueing: this._DATA_FORMATS.BOOLEAN,
                    duplicates: this._DATA_FORMATS.BOOLEAN,
                    lootDropping: this._DATA_FORMATS.BOOLEAN,
                    rebroadcastSongs: this._DATA_FORMATS.BOOLEAN,
                    dubSongs: this._DATA_FORMATS.BOOLEAN
                },
                songSelection: {
                    standardValue: this._DATA_FORMATS.SMALL_INT,
                    advancedValue: {
                        watched: this._DATA_FORMATS.BIG_INT,
                        unwatched: this._DATA_FORMATS.BIG_INT,
                        random: this._DATA_FORMATS.BIG_INT
                    }
                },
                songType: {
                    standardValue: {
                        openings: this._DATA_FORMATS.BOOLEAN,
                        endings: this._DATA_FORMATS.BOOLEAN,
                        inserts: this._DATA_FORMATS.BOOLEAN
                    },
                    advancedValue: {
                        openings: this._DATA_FORMATS.BIG_INT,
                        endings: this._DATA_FORMATS.BIG_INT,
                        inserts: this._DATA_FORMATS.BIG_INT,
                        random: this._DATA_FORMATS.BIG_INT
                    }
                },
                guessTime: {
                    randomOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: this._DATA_FORMATS.BIG_INT,
                    randomValue: this._DATA_FORMATS.PAIR_BIG_INT
                },
                scoreType: this._DATA_FORMATS.SMALL_INT,
                showSelection: this._DATA_FORMATS.SMALL_INT,
                inventorySize: {
                    randomOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: this._DATA_FORMATS.BIG_INT,
                    randomValue: this._DATA_FORMATS.PAIR_BIG_INT
                },
                lootingTime: {
                    randomOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: this._DATA_FORMATS.BIG_INT,
                    randomValue: this._DATA_FORMATS.PAIR_BIG_INT
                },
                lives: this._DATA_FORMATS.SMALL_INT,
                samplePoint: {
                    randomOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: this._DATA_FORMATS.SMALL_INT,
                    randomValue: this._DATA_FORMATS.PAIR_BIG_INT
                },
                playbackSpeed: {
                    randomOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: this._DATA_FORMATS.SMALL_INT,
                    randomValue: this._DATA_FORMATS.QUAD_BOOLEAN
                },
                songDifficulity: {
                    advancedOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: {
                        easy: this._DATA_FORMATS.BOOLEAN,
                        medium: this._DATA_FORMATS.BOOLEAN,
                        hard: this._DATA_FORMATS.BOOLEAN
                    },
                    advancedValue: this._DATA_FORMATS.PAIR_BIG_INT
                },
                songPopularity: {
                    advancedOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: {
                        disliked: this._DATA_FORMATS.BOOLEAN,
                        mixed: this._DATA_FORMATS.BOOLEAN,
                        liked: this._DATA_FORMATS.BOOLEAN
                    },
                    advancedValue: this._DATA_FORMATS.PAIR_BIG_INT
                },
                playerScore: {
                    advancedOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: this._DATA_FORMATS.PAIR_SMALL_INT,
                    advancedValue: this._DATA_FORMATS.TEN_BOOLEAN
                },
                animeScore: {
                    advancedOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: this._DATA_FORMATS.PAIR_SMALL_INT,
                    advancedValue: this._DATA_FORMATS.NINE_BOOLEAN
                },
                vintage: {
                    standardValue: {
                        years: this._DATA_FORMATS.PAIR_LARGE_INT,
                        seasons: this._DATA_FORMATS.PAIR_SMALL_INT
                    },
                    advancedValueList: this._DATA_FORMATS.ARRAY_VINTAGE_SET
                },
                type: {
                    tv: this._DATA_FORMATS.BOOLEAN,
                    movie: this._DATA_FORMATS.BOOLEAN,
                    ova: this._DATA_FORMATS.BOOLEAN,
                    ona: this._DATA_FORMATS.BOOLEAN,
                    special: this._DATA_FORMATS.BOOLEAN
                },
                genre: this._DATA_FORMATS.ARRAY_TAG_GENRE_ENTRY,
                tags: this._DATA_FORMATS.ARRAY_TAG_GENRE_ENTRY
            }
        },
        5: {
            BASE: 36,
            ARRAY_DELIMITER: "-",
            MAX_LENGTH: 300,
            SCHEMA: {
                roomSize: this._DATA_FORMATS.BIG_INT,
                numberOfSongs: this._DATA_FORMATS.BIG_INT,
                teamSize: this._DATA_FORMATS.SMALL_INT,
                modifiers: {
                    skipGuessing: this._DATA_FORMATS.BOOLEAN,
                    skipReplay: this._DATA_FORMATS.BOOLEAN,
                    queueing: this._DATA_FORMATS.BOOLEAN,
                    duplicates: this._DATA_FORMATS.BOOLEAN,
                    lootDropping: this._DATA_FORMATS.BOOLEAN,
                    rebroadcastSongs: this._DATA_FORMATS.BOOLEAN,
                    dubSongs: this._DATA_FORMATS.BOOLEAN
                },
                songSelection: {
                    standardValue: this._DATA_FORMATS.SMALL_INT,
                    advancedValue: {
                        watched: this._DATA_FORMATS.BIG_INT,
                        unwatched: this._DATA_FORMATS.BIG_INT,
                        random: this._DATA_FORMATS.BIG_INT
                    }
                },
                songType: {
                    standardValue: {
                        openings: this._DATA_FORMATS.BOOLEAN,
                        endings: this._DATA_FORMATS.BOOLEAN,
                        inserts: this._DATA_FORMATS.BOOLEAN
                    },
                    advancedValue: {
                        openings: this._DATA_FORMATS.BIG_INT,
                        endings: this._DATA_FORMATS.BIG_INT,
                        inserts: this._DATA_FORMATS.BIG_INT,
                        random: this._DATA_FORMATS.BIG_INT
                    }
                },
                insertCategories: {
                    instrumental: this._DATA_FORMATS.BOOLEAN,
                    chanting: this._DATA_FORMATS.BOOLEAN,
                    character: this._DATA_FORMATS.BOOLEAN,
                    standard: this._DATA_FORMATS.BOOLEAN
                },
                guessTime: {
                    randomOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: this._DATA_FORMATS.BIG_INT,
                    randomValue: this._DATA_FORMATS.PAIR_BIG_INT
                },
                scoreType: this._DATA_FORMATS.SMALL_INT,
                showSelection: this._DATA_FORMATS.SMALL_INT,
                inventorySize: {
                    randomOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: this._DATA_FORMATS.BIG_INT,
                    randomValue: this._DATA_FORMATS.PAIR_BIG_INT
                },
                lootingTime: {
                    randomOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: this._DATA_FORMATS.BIG_INT,
                    randomValue: this._DATA_FORMATS.PAIR_BIG_INT
                },
                lives: this._DATA_FORMATS.SMALL_INT,
                samplePoint: {
                    randomOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: this._DATA_FORMATS.SMALL_INT,
                    randomValue: this._DATA_FORMATS.PAIR_BIG_INT
                },
                playbackSpeed: {
                    randomOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: this._DATA_FORMATS.SMALL_INT,
                    randomValue: this._DATA_FORMATS.QUAD_BOOLEAN
                },
                songDifficulity: {
                    advancedOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: {
                        easy: this._DATA_FORMATS.BOOLEAN,
                        medium: this._DATA_FORMATS.BOOLEAN,
                        hard: this._DATA_FORMATS.BOOLEAN
                    },
                    advancedValue: this._DATA_FORMATS.PAIR_BIG_INT
                },
                songPopularity: {
                    advancedOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: {
                        disliked: this._DATA_FORMATS.BOOLEAN,
                        mixed: this._DATA_FORMATS.BOOLEAN,
                        liked: this._DATA_FORMATS.BOOLEAN
                    },
                    advancedValue: this._DATA_FORMATS.PAIR_BIG_INT
                },
                playerScore: {
                    advancedOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: this._DATA_FORMATS.PAIR_SMALL_INT,
                    advancedValue: this._DATA_FORMATS.TEN_BOOLEAN
                },
                animeScore: {
                    advancedOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: this._DATA_FORMATS.PAIR_SMALL_INT,
                    advancedValue: this._DATA_FORMATS.NINE_BOOLEAN
                },
                vintage: {
                    standardValue: {
                        years: this._DATA_FORMATS.PAIR_LARGE_INT,
                        seasons: this._DATA_FORMATS.PAIR_SMALL_INT
                    },
                    advancedValueList: this._DATA_FORMATS.ARRAY_VINTAGE_SET
                },
                type: {
                    tv: this._DATA_FORMATS.BOOLEAN,
                    movie: this._DATA_FORMATS.BOOLEAN,
                    ova: this._DATA_FORMATS.BOOLEAN,
                    ona: this._DATA_FORMATS.BOOLEAN,
                    special: this._DATA_FORMATS.BOOLEAN
                },
                genre: this._DATA_FORMATS.ARRAY_TAG_GENRE_ENTRY,
                tags: this._DATA_FORMATS.ARRAY_TAG_GENRE_ENTRY
            }
        },
        6: {
            BASE: 36,
            ARRAY_DELIMITER: "-",
            MAX_LENGTH: 300,
            SCHEMA: {
                roomSize: this._DATA_FORMATS.BIG_INT,
                numberOfSongs: this._DATA_FORMATS.BIG_INT,
                teamSize: this._DATA_FORMATS.SMALL_INT,
                modifiers: {
                    skipGuessing: this._DATA_FORMATS.BOOLEAN,
                    skipReplay: this._DATA_FORMATS.BOOLEAN,
                    queueing: this._DATA_FORMATS.BOOLEAN,
                    duplicates: this._DATA_FORMATS.BOOLEAN,
                    lootDropping: this._DATA_FORMATS.BOOLEAN,
                    rebroadcastSongs: this._DATA_FORMATS.BOOLEAN,
                    dubSongs: this._DATA_FORMATS.BOOLEAN
                },
                songSelection: {
                    standardValue: this._DATA_FORMATS.SMALL_INT,
                    advancedValue: {
                        watched: this._DATA_FORMATS.BIG_INT,
                        unwatched: this._DATA_FORMATS.BIG_INT,
                        random: this._DATA_FORMATS.BIG_INT
                    }
                },
                watchedDistribution: this._DATA_FORMATS.SMALL_INT,
                songType: {
                    standardValue: {
                        openings: this._DATA_FORMATS.BOOLEAN,
                        endings: this._DATA_FORMATS.BOOLEAN,
                        inserts: this._DATA_FORMATS.BOOLEAN
                    },
                    advancedValue: {
                        openings: this._DATA_FORMATS.BIG_INT,
                        endings: this._DATA_FORMATS.BIG_INT,
                        inserts: this._DATA_FORMATS.BIG_INT,
                        random: this._DATA_FORMATS.BIG_INT
                    }
                },
                insertCategories: {
                    instrumental: this._DATA_FORMATS.BOOLEAN,
                    chanting: this._DATA_FORMATS.BOOLEAN,
                    character: this._DATA_FORMATS.BOOLEAN,
                    standard: this._DATA_FORMATS.BOOLEAN
                },
                guessTime: {
                    randomOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: this._DATA_FORMATS.BIG_INT,
                    randomValue: this._DATA_FORMATS.PAIR_BIG_INT
                },
                scoreType: this._DATA_FORMATS.SMALL_INT,
                showSelection: this._DATA_FORMATS.SMALL_INT,
                inventorySize: {
                    randomOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: this._DATA_FORMATS.BIG_INT,
                    randomValue: this._DATA_FORMATS.PAIR_BIG_INT
                },
                lootingTime: {
                    randomOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: this._DATA_FORMATS.BIG_INT,
                    randomValue: this._DATA_FORMATS.PAIR_BIG_INT
                },
                lives: this._DATA_FORMATS.SMALL_INT,
                samplePoint: {
                    randomOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: this._DATA_FORMATS.SMALL_INT,
                    randomValue: this._DATA_FORMATS.PAIR_BIG_INT
                },
                playbackSpeed: {
                    randomOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: this._DATA_FORMATS.SMALL_INT,
                    randomValue: this._DATA_FORMATS.QUAD_BOOLEAN
                },
                songDifficulity: {
                    advancedOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: {
                        easy: this._DATA_FORMATS.BOOLEAN,
                        medium: this._DATA_FORMATS.BOOLEAN,
                        hard: this._DATA_FORMATS.BOOLEAN
                    },
                    advancedValue: this._DATA_FORMATS.PAIR_BIG_INT
                },
                songPopularity: {
                    advancedOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: {
                        disliked: this._DATA_FORMATS.BOOLEAN,
                        mixed: this._DATA_FORMATS.BOOLEAN,
                        liked: this._DATA_FORMATS.BOOLEAN
                    },
                    advancedValue: this._DATA_FORMATS.PAIR_BIG_INT
                },
                playerScore: {
                    advancedOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: this._DATA_FORMATS.PAIR_SMALL_INT,
                    advancedValue: this._DATA_FORMATS.TEN_BOOLEAN
                },
                animeScore: {
                    advancedOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: this._DATA_FORMATS.PAIR_SMALL_INT,
                    advancedValue: this._DATA_FORMATS.NINE_BOOLEAN
                },
                vintage: {
                    standardValue: {
                        years: this._DATA_FORMATS.PAIR_LARGE_INT,
                        seasons: this._DATA_FORMATS.PAIR_SMALL_INT
                    },
                    advancedValueList: this._DATA_FORMATS.ARRAY_VINTAGE_SET
                },
                type: {
                    tv: this._DATA_FORMATS.BOOLEAN,
                    movie: this._DATA_FORMATS.BOOLEAN,
                    ova: this._DATA_FORMATS.BOOLEAN,
                    ona: this._DATA_FORMATS.BOOLEAN,
                    special: this._DATA_FORMATS.BOOLEAN
                },
                genre: this._DATA_FORMATS.ARRAY_TAG_GENRE_ENTRY,
                tags: this._DATA_FORMATS.ARRAY_TAG_GENRE_ENTRY
            }
        },
        7: {
            BASE: 36,
            ARRAY_DELIMITER: "-",
            MAX_LENGTH: 300,
            SCHEMA: {
                roomSize: this._DATA_FORMATS.BIG_INT,
                numberOfSongs: this._DATA_FORMATS.BIG_INT,
                teamSize: this._DATA_FORMATS.SMALL_INT,
                modifiers: {
                    skipGuessing: this._DATA_FORMATS.BOOLEAN,
                    skipReplay: this._DATA_FORMATS.BOOLEAN,
                    queueing: this._DATA_FORMATS.BOOLEAN,
                    duplicates: this._DATA_FORMATS.BOOLEAN,
                    lootDropping: this._DATA_FORMATS.BOOLEAN,
                    rebroadcastSongs: this._DATA_FORMATS.BOOLEAN,
                    dubSongs: this._DATA_FORMATS.BOOLEAN
                },
                songSelection: {
                    standardValue: this._DATA_FORMATS.SMALL_INT,
                    advancedValue: {
                        watched: this._DATA_FORMATS.BIG_INT,
                        unwatched: this._DATA_FORMATS.BIG_INT,
                        random: this._DATA_FORMATS.BIG_INT
                    }
                },
                watchedDistribution: this._DATA_FORMATS.SMALL_INT,
                songType: {
                    standardValue: {
                        openings: this._DATA_FORMATS.BOOLEAN,
                        endings: this._DATA_FORMATS.BOOLEAN,
                        inserts: this._DATA_FORMATS.BOOLEAN
                    },
                    advancedValue: {
                        openings: this._DATA_FORMATS.BIG_INT,
                        endings: this._DATA_FORMATS.BIG_INT,
                        inserts: this._DATA_FORMATS.BIG_INT,
                        random: this._DATA_FORMATS.BIG_INT
                    }
                },
                openingCategories: {
                    instrumental: this._DATA_FORMATS.BOOLEAN,
                    chanting: this._DATA_FORMATS.BOOLEAN,
                    character: this._DATA_FORMATS.BOOLEAN,
                    standard: this._DATA_FORMATS.BOOLEAN
                },
                endingCategories: {
                    instrumental: this._DATA_FORMATS.BOOLEAN,
                    chanting: this._DATA_FORMATS.BOOLEAN,
                    character: this._DATA_FORMATS.BOOLEAN,
                    standard: this._DATA_FORMATS.BOOLEAN
                },
                insertCategories: {
                    instrumental: this._DATA_FORMATS.BOOLEAN,
                    chanting: this._DATA_FORMATS.BOOLEAN,
                    character: this._DATA_FORMATS.BOOLEAN,
                    standard: this._DATA_FORMATS.BOOLEAN
                },
                guessTime: {
                    randomOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: this._DATA_FORMATS.BIG_INT,
                    randomValue: this._DATA_FORMATS.PAIR_BIG_INT
                },
                scoreType: this._DATA_FORMATS.SMALL_INT,
                showSelection: this._DATA_FORMATS.SMALL_INT,
                inventorySize: {
                    randomOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: this._DATA_FORMATS.BIG_INT,
                    randomValue: this._DATA_FORMATS.PAIR_BIG_INT
                },
                lootingTime: {
                    randomOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: this._DATA_FORMATS.BIG_INT,
                    randomValue: this._DATA_FORMATS.PAIR_BIG_INT
                },
                lives: this._DATA_FORMATS.SMALL_INT,
                samplePoint: {
                    randomOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: this._DATA_FORMATS.SMALL_INT,
                    randomValue: this._DATA_FORMATS.PAIR_BIG_INT
                },
                playbackSpeed: {
                    randomOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: this._DATA_FORMATS.SMALL_INT,
                    randomValue: this._DATA_FORMATS.QUAD_BOOLEAN
                },
                songDifficulity: {
                    advancedOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: {
                        easy: this._DATA_FORMATS.BOOLEAN,
                        medium: this._DATA_FORMATS.BOOLEAN,
                        hard: this._DATA_FORMATS.BOOLEAN
                    },
                    advancedValue: this._DATA_FORMATS.PAIR_BIG_INT
                },
                songPopularity: {
                    advancedOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: {
                        disliked: this._DATA_FORMATS.BOOLEAN,
                        mixed: this._DATA_FORMATS.BOOLEAN,
                        liked: this._DATA_FORMATS.BOOLEAN
                    },
                    advancedValue: this._DATA_FORMATS.PAIR_BIG_INT
                },
                playerScore: {
                    advancedOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: this._DATA_FORMATS.PAIR_SMALL_INT,
                    advancedValue: this._DATA_FORMATS.TEN_BOOLEAN
                },
                animeScore: {
                    advancedOn: this._DATA_FORMATS.BOOLEAN,
                    standardValue: this._DATA_FORMATS.PAIR_SMALL_INT,
                    advancedValue: this._DATA_FORMATS.NINE_BOOLEAN
                },
                vintage: {
                    standardValue: {
                        years: this._DATA_FORMATS.PAIR_LARGE_INT,
                        seasons: this._DATA_FORMATS.PAIR_SMALL_INT
                    },
                    advancedValueList: this._DATA_FORMATS.ARRAY_VINTAGE_SET
                },
                type: {
                    tv: this._DATA_FORMATS.BOOLEAN,
                    movie: this._DATA_FORMATS.BOOLEAN,
                    ova: this._DATA_FORMATS.BOOLEAN,
                    ona: this._DATA_FORMATS.BOOLEAN,
                    special: this._DATA_FORMATS.BOOLEAN
                },
                genre: this._DATA_FORMATS.ARRAY_TAG_GENRE_ENTRY,
                tags: this._DATA_FORMATS.ARRAY_TAG_GENRE_ENTRY
            }
        }
    };

    this._NEWEST_VERSION = 7;
    this._VERSION_BASE = 36;
}

SettingSerilizer.prototype.encode = function (settings) {
    let encodedString = "";

    encodedString += this.encodeValue(this._NEWEST_VERSION, this._DATA_FORMATS.SMALL_INT, this._VERSION_BASE, null);
    let schemaInfo = this._SETTING_SCHEMEAS[this._NEWEST_VERSION];
    let base = schemaInfo.BASE;
    let delimiter = schemaInfo.ARRAY_DELIMITER;
    let schema = schemaInfo.SCHEMA;
    Object.keys(schema).forEach((entryName) => {
        if (typeof schema[entryName] === "object") {
            encodedString += this.encodeObject(settings[entryName], schema[entryName], base, delimiter);
        } else {
            encodedString += this.encodeValue(settings[entryName], schema[entryName], base, delimiter);
        }
    });

    if (encodedString.length > schemaInfo.MAX_LENGTH) {
        throw new Error("encoding to long");
    }

    return encodedString;
};

SettingSerilizer.prototype.encodeObject = function (object, schema, base, delimiter) {
    let encodedString = "";

    Object.keys(schema).forEach((entryName) => {
        if (typeof schema[entryName] === "object") {
            encodedString += this.encodeObject(object[entryName], schema[entryName], base, delimiter);
        } else {
            encodedString += this.encodeValue(object[entryName], schema[entryName], base, delimiter);
        }
    });

    return encodedString;
};

SettingSerilizer.prototype.encodeValue = function (value, dataType, base, arrayDelimiter) {
    switch (dataType) {
        case this._DATA_FORMATS.SMALL_INT:
            return this.encodeInteger(value, base, 1);
        case this._DATA_FORMATS.BIG_INT:
            return this.encodeInteger(value, base, 2);
        case this._DATA_FORMATS.BOOLEAN:
            return value ? "1" : "0";
        case this._DATA_FORMATS.PAIR_SMALL_INT:
            return this.encodeInteger(value[0], base, 1) + this.encodeInteger(value[1], base, 1);
        case this._DATA_FORMATS.PAIR_BIG_INT:
            return this.encodeInteger(value[0], base, 2) + this.encodeInteger(value[1], base, 2);
        case this._DATA_FORMATS.PAIR_LARGE_INT:
            return this.encodeInteger(value[0], base, 3) + this.encodeInteger(value[1], base, 3);
        case this._DATA_FORMATS.QUAD_BOOLEAN:
            return this.encodeBooleanArray(value, 4);
        case this._DATA_FORMATS.NINE_BOOLEAN:
            return this.encodeBooleanArray(value, 9);
        case this._DATA_FORMATS.TEN_BOOLEAN:
            return this.encodeBooleanArray(value, 10);
        case this._DATA_FORMATS.ARRAY_VINTAGE_SET: {
            let stringResult = "";
            value.forEach((entry) => {
                stringResult += this.encodeValue(entry.years, this._DATA_FORMATS.PAIR_LARGE_INT, base, arrayDelimiter);
                stringResult += this.encodeValue(entry.seasons, this._DATA_FORMATS.PAIR_SMALL_INT, base, arrayDelimiter);
            });
            stringResult += arrayDelimiter;
            return stringResult;
        }
        case this._DATA_FORMATS.ARRAY_TAG_GENRE_ENTRY: {
            let stringResult = "";
            value.forEach((entry) => {
                stringResult += this.encodeValue(entry.id, this._DATA_FORMATS.BIG_INT, base, arrayDelimiter);
                stringResult += this.encodeValue(entry.state, this._DATA_FORMATS.SMALL_INT, base, arrayDelimiter);
            });
            stringResult += arrayDelimiter;
            return stringResult;
        }
        default:
            throw new Error("Unknown Data Type:" + dataType);
    }
};

SettingSerilizer.prototype.encodeInteger = function (value, base, encodeSize) {
    let stringValue = parseInt(value).toString(base);
    if (stringValue.length > encodeSize) {
        throw new Error("Encoded size: " + stringValue.length + ". Bigger than encodeSize: " + encodeSize);
    } else if (stringValue.length < encodeSize) {
        let missingSize = encodeSize - stringValue.length;
        let fill = new Array(missingSize + 1).join("0");
        stringValue = fill + stringValue;
    }
    return stringValue;
};

SettingSerilizer.prototype.encodeBooleanArray = function (array, expectedLength) {
    let string = "";
    array.forEach((value) => {
        string += value ? "1" : "0";
    });
    if (string.length !== expectedLength) {
        throw new Error("Unexpeced boolean array string length. Expected: " + expectedLength + ". Got: " + string.lengt);
    }
    return string;
};

SettingSerilizer.prototype.decode = function (encodedString) {
    let stringContainer = {
        string: encodedString
    };

    let versionNumber = this.decodeInteger(this.extractEncodedString(stringContainer, 1), this._VERSION_BASE);

    let schemaInfo = this._SETTING_SCHEMEAS[versionNumber];

    return this.decodeObject(
        stringContainer,
        schemaInfo.SCHEMA,
        schemaInfo.BASE,
        schemaInfo.ARRAY_DELIMITER,
        versionNumber
    );
};

SettingSerilizer.prototype.decodeObject = function (
    encodedStringContainer,
    schema,
    base,
    arrayDelimiter,
    versionNumber
) {
    let resultObject = {};
    Object.keys(schema).forEach((key) => {
        let resultValue;
        if (typeof schema[key] === "object") {
            resultValue = this.decodeObject(encodedStringContainer, schema[key], base, arrayDelimiter);
        } else {
            resultValue = this.decodeValue(encodedStringContainer, schema[key], base, arrayDelimiter);
        }
        resultObject[key] = resultValue;
    });

    if (versionNumber < 3) {
        delete resultObject.songSelection.advancedOn;
        delete resultObject.songSelection.songType;
    }

    if (versionNumber < 4) {
        resultObject.modifiers.rebroadcastSongs = true;
        resultObject.modifiers.dubSongs = true;
    }

    if (versionNumber < 5) {
        resultObject.insertCategories = {
            instrumental: true,
            chanting: true,
            character: true,
            standard: true
        };
    }

    if (versionNumber < 6) {
        resultObject.watchedDistribution = 1;
    }


    if (versionNumber < 7) {
        if (resultObject.watchedDistribution === 2) {
            resultObject.watchedDistribution = 3;
        }
        resultObject.openingCategories = {
            instrumental: true,
            chanting: true,
            character: true,
            standard: true
        };
        resultObject.endingCategories = {
            instrumental: true,
            chanting: true,
            character: true,
            standard: true
        };
    }
    return resultObject;
};

SettingSerilizer.prototype.decodeValue = function (encodedStringContainer, dataType, base, arrayDelimiter) {
    if (encodedStringContainer.string.length === 0) {
        throw "Unexpected End of String";
    }
    switch (dataType) {
        case this._DATA_FORMATS.SMALL_INT: {
            let encodeSection = this.extractEncodedString(encodedStringContainer, 1);
            return this.decodeInteger(encodeSection, base);
        }
        case this._DATA_FORMATS.BIG_INT: {
            let encodeSection = this.extractEncodedString(encodedStringContainer, 2);
            return this.decodeInteger(encodeSection, base);
        }
        case this._DATA_FORMATS.BOOLEAN: {
            let encodeSection = this.extractEncodedString(encodedStringContainer, 1);
            return encodeSection === "1" ? true : false;
        }
        case this._DATA_FORMATS.PAIR_SMALL_INT:
            return this.decodeIntegerPair(encodedStringContainer, base, 1);
        case this._DATA_FORMATS.PAIR_BIG_INT:
            return this.decodeIntegerPair(encodedStringContainer, base, 2);
        case this._DATA_FORMATS.PAIR_LARGE_INT:
            return this.decodeIntegerPair(encodedStringContainer, base, 3);
        case this._DATA_FORMATS.QUAD_BOOLEAN:
            return this.decodeBooleanArray(encodedStringContainer, 4);
        case this._DATA_FORMATS.NINE_BOOLEAN:
            return this.decodeBooleanArray(encodedStringContainer, 9);
        case this._DATA_FORMATS.TEN_BOOLEAN:
            return this.decodeBooleanArray(encodedStringContainer, 10);
        case this._DATA_FORMATS.ARRAY_VINTAGE_SET: {
            let resultArray = [];
            while (encodedStringContainer.string && encodedStringContainer.string.charAt(0) !== "-") {
                resultArray.push({
                    years: this.decodeValue(encodedStringContainer, this._DATA_FORMATS.PAIR_LARGE_INT, base, arrayDelimiter),
                    seasons: this.decodeValue(encodedStringContainer, this._DATA_FORMATS.PAIR_SMALL_INT, base, arrayDelimiter)
                });
            }
            encodedStringContainer.string = encodedStringContainer.string.slice(1);
            return resultArray;
        }
        case this._DATA_FORMATS.ARRAY_TAG_GENRE_ENTRY: {
            let resultArray = [];
            while (encodedStringContainer.string && encodedStringContainer.string.charAt(0) !== "-") {
                resultArray.push({
                    id: this.decodeValue(encodedStringContainer, this._DATA_FORMATS.BIG_INT, base, arrayDelimiter),
                    state: this.decodeValue(encodedStringContainer, this._DATA_FORMATS.SMALL_INT, base, arrayDelimiter)
                });
            }
            encodedStringContainer.string = encodedStringContainer.string.slice(1);
            return resultArray;
        }
        default:
            throw new Error("Unknown Data Type:" + dataType);
    }
};

SettingSerilizer.prototype.decodeInteger = function (encodedString, base) {
    return parseInt(encodedString, base);
};

SettingSerilizer.prototype.decodeIntegerPair = function (stringContainer, base, intEncodeSize) {
    let partOne = this.extractEncodedString(stringContainer, intEncodeSize);
    let partTwo = this.extractEncodedString(stringContainer, intEncodeSize);
    return [this.decodeInteger(partOne, base), this.decodeInteger(partTwo, base)];
};

SettingSerilizer.prototype.extractEncodedString = function (stringContainer, encodeLength) {
    let encodeSection = stringContainer.string.slice(0, encodeLength);
    stringContainer.string = stringContainer.string.slice(encodeLength);
    return encodeSection;
};

SettingSerilizer.prototype.decodeBooleanArray = function (stringContainer, arrayLength) {
    let resultArray = [];
    for (let i = 0; i < arrayLength; i++) {
        let encodedBoolean = this.extractEncodedString(stringContainer, 1);
        resultArray.push(encodedBoolean === "1" ? true : false);
    }
    return resultArray;
};
