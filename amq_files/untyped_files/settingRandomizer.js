'use strict';
/*exported settingRandomizer*/

function SettingRandomizer() {
	this._RANGE_TYPES = {
		INTEGER: 1,
		INTEGER_PAIR: 2,
		INTEGER_SET: 3,
		BOOLEAN_ARRAY: 4,
		BOOLEAN_MAP: 5
	};

	this.generalSettingRanges = {
		numberOfSongs: {
			min: 5,
			max: 100
		},
		songSelection: {
			advanced: true,
			standardValue: {
				min: 1,
				max: 3
			},
			advancedValue: {
				fields: ['watched', 'unwatched', 'random']
			}
		},
		songType: {
			advanced: true,
			standardValue: {
				fields: ['openings', 'endings', 'inserts']
			},
			advancedValue: {
				fields: ['openings', 'endings', 'inserts', 'random']
			}
		}
	};

	this.quizSettingRanges = {
		guessTime: {
			random: true,
			standardValue: {
				type: this._RANGE_TYPES.INTEGER,
				min: 5,
				max: 60
			},
			randomValue: {
				type: this._RANGE_TYPES.INTEGER_PAIR,
				min: 5,
				max: 60
			}
		},
		extraGuessTime: {
			random: true,
			standardValue: {
				type: this._RANGE_TYPES.INTEGER,
				min: 0,
				max: 15
			},
			randomValue: {
				type: this._RANGE_TYPES.INTEGER_PAIR,
				min: 0,
				max: 15
			}
		},
		samplePoint: {
			random: true,
			standardValue: {
				type: this._RANGE_TYPES.INTEGER,
				min: 5,
				max: 60
			},
			randomValue: {
				type: this._RANGE_TYPES.INTEGER_PAIR,
				min: 5,
				max: 60
			}
		},
		playbackSpeed: {
			random: true,
			standardValue: {
				type: this._RANGE_TYPES.INTEGER_SET,
				set: [1, 1.5, 2, 4]
			},
			randomValue: {
				type: this._RANGE_TYPES.BOOLEAN_ARRAY,
				size: 4,
				atLeastOneRandom: true
			}
		},
		songDifficulity: {
			advanced: true,
			standardValue: {
				type: this._RANGE_TYPES.BOOLEAN_MAP,
				fields: ['easy', 'medium', 'hard'],
				atLeastOneRandom: true
			},
			advancedValue: {
				type: this._RANGE_TYPES.INTEGER_PAIR,
				min: 0,
				max: 100,
				minRange: 10
			}
		},
		songPopularity: {
			advanced: true,
			standardValue: {
				type: this._RANGE_TYPES.BOOLEAN_MAP,
				fields: ['disliked', 'mixed', 'liked'],
				atLeastOneRandom: true
			},
			advancedValue: {
				type: this._RANGE_TYPES.INTEGER_PAIR,
				min: 0,
				max: 100,
				minRange: 10
			}
		},
	};

	this.animeSettingRange = {
		playerScore: {
			advanced: true,
			standardValue: {
				type: this._RANGE_TYPES.INTEGER_PAIR,
				min: 2,
				max: 10,
				minRange: 1
			},
			advancedValue: {
				type: this._RANGE_TYPES.BOOLEAN_ARRAY,
				size: 4,
				atLeastOneRandom: true
			}
		},
		type: {
			type: this._RANGE_TYPES.BOOLEAN_MAP,
			fields: ['tv', 'movie', 'ova', 'ona', 'special'],
			atLeastOneRandom: true
		}
	};

	this._ANIME_SCORE_CONSTANTS = {
		RANGE: {
			min: 2,
			max: 10
		},
		MAIN_RANGE: {
			min: 4,
			max: 6
		}
	};

	this._VINTAGE_CONSTANTS = {
		RANGE: {
			YEARS: {
				min: 1944,
				max: 2023
			},
			SEASONS: {
				min: 0,
				max: 3
			}

		},
		WEIGHTED_YEARS: {
			1944: 15,
			1980: 35,
			1990: 40,
			2000: 60,
			2010: 80,
			2023: 100
		}
	};

	this._MAX_TAG_GENRE_FILTER_AMOUNT = 5;
	this._GENRE_TAG_STATES = {
		INCLUDE: 1,
		EXLUCDE: 2,
		OPTIONAL: 3
	};
	
	//Populated in Setup
	this._genreIds = [];
	this._tagIds = [];
}

SettingRandomizer.prototype.setup = function (genreList, tagList) {
	this._genreIds = genreList.map(a => {return a.id;});
	this._tagIds = tagList.map(a => {return a.id;});
};

SettingRandomizer.prototype.getRandomGeneralSettings = function () {
	let settingUpdate = {};

	let numberOfSongsRange = this.generalSettingRanges.numberOfSongs;
	let numberOfSongs = this.getRandomInteger(numberOfSongsRange.min, numberOfSongsRange.max);
	settingUpdate.numberOfSongs = numberOfSongs;

	settingUpdate.songSelection = this.getRandomSongSelection(numberOfSongs);
	settingUpdate.songType = this.getRandomSongType(numberOfSongs);

	return settingUpdate;
};

SettingRandomizer.prototype.getRandomQuizSettings = function () {
	let setting = {};
	Object.keys(this.quizSettingRanges).forEach(field => {
		setting[field] = this.parseSettingRange(this.quizSettingRanges[field]);
	});
	return setting;
};

SettingRandomizer.prototype.getRandomAnimeSettings = function () {
	let setting = {};
	Object.keys(this.animeSettingRange).forEach(field => {
		setting[field] = this.parseSettingRange(this.animeSettingRange[field]);
	});

	setting.animeScore = this.getRandomAnimeScoreSetting();
	setting.vintage = this.getRandomVintageSetting();
	
	let genreFilters = this.randomTagGenreFilters(this._genreIds);
	setting.genre = genreFilters;
	let optionalGenres = genreFilters.some(entry => {
		return entry.state === this._GENRE_TAG_STATES.OPTIONAL;
	});
	setting.tags = this.randomTagGenreFilters(this._tagIds, optionalGenres);

	return setting;
};

SettingRandomizer.prototype.getRandomSongSelection = function (numberOfSongs) {
	let songSelection = {};
	let songSelectionRange = this.generalSettingRanges.songSelection;
	let advancedOn = this.randomBoolean();
	songSelection.advancedOn = advancedOn;
	songSelection.standardValue = this.getRandomInteger(songSelectionRange.standardValue.min, songSelectionRange.standardValue.max);

	if (advancedOn) {
		songSelection.advancedValue = {};
		let amountLeft = numberOfSongs;
		shuffleArray(songSelectionRange.advancedValue.fields).forEach(field => {
			let amountToField = this.getRandomInteger(0, amountLeft);
			amountLeft -= amountToField;
			songSelection.advancedValue[field] = amountToField;
		});
		songSelection.advancedValue.random += amountLeft;
	} else {
		let numberOfWatched;
		let numberOfUnwatched;
		let numberOfRandom;
		switch (songSelection.standardValue) {
			case 1: numberOfRandom = numberOfSongs; break;
			case 2:
				numberOfWatched = Math.ceil(numberOfSongs * 0.8);
				numberOfUnwatched = Math.floor(numberOfSongs * 0.2);
				break;
			case 3: numberOfWatched = numberOfSongs; break;
		}

		songSelection.advancedValue = {
			watched: numberOfWatched,
			unwatched: numberOfUnwatched,
			random: numberOfRandom
		};
	}

	return songSelection;
};

SettingRandomizer.prototype.getRandomSongType = function (numberOfSongs) {
	let songType = {};
	let songTypeRange = this.generalSettingRanges.songType;

	let standardValue = {};
	let standardValueFields = songTypeRange.standardValue.fields;
	let randomValues = this.getRandomBooleanArray(standardValueFields.length, true);
	standardValueFields.forEach((field, index) => {
		standardValue[field] = randomValues[index];
	});
	songType.standardValue = standardValue;

	let advancedOn = this.randomBoolean();
	songType.advancedOn = advancedOn;

	if (advancedOn) {
		songType.advancedValue = {};
		let amountLeft = numberOfSongs;
		shuffleArray(songTypeRange.advancedValue.fields).forEach(field => {
			if (standardValue[field]) {
				let amountToField = this.getRandomInteger(0, amountLeft);
				amountLeft -= amountToField;
				songType.advancedValue[field] = amountToField;
			}
		});
		songType.advancedValue.random = amountLeft;
	} else {
		songType.advancedValue = {
			openings: 0,
			endings: 0,
			inserts: 0,
			random: numberOfSongs
		};
	}

	return songType;
};

SettingRandomizer.prototype.getRandomAnimeScoreSetting = function () {
	let animeScoreArray = [];
	let newTrueSet = false;
	let trueCount = 0;
	for (let i = 0; i < 9; i++) {
		let value;
		if (newTrueSet) {
			value = true;
			newTrueSet = false;
		} else {
			value = this.randomBoolean();
		}
		animeScoreArray.push(value);
		if (value && i > 2) {
			trueCount++;
		}
		if (i > 0 && !animeScoreArray[i - 1]) {
			newTrueSet = true;
		}
	}
	this._ANIME_SCORE_CONSTANTS = {
		RANGE: {
			min: 2,
			max: 10
		},
		MAIN_RANGE: {
			min: 4,
			max: 6
		}
	};

	if (trueCount < 2) {
		let min = this._ANIME_SCORE_CONSTANTS.MAIN_RANGE.min;
		let max = this._ANIME_SCORE_CONSTANTS.MAIN_RANGE.max;
		let rangeStart = Math.round((max - min) * Math.random()) + min;
		animeScoreArray[rangeStart] = true;
		animeScoreArray[rangeStart + 1] = true;
	}

	let min = this._ANIME_SCORE_CONSTANTS.RANGE.min;
	let max = this._ANIME_SCORE_CONSTANTS.RANGE.max;
	return {
		advancedOn: this.randomBoolean(),
		standardValue: this.getRandomIntegerPair(min, max),
		advancedValue: animeScoreArray
	};
};

SettingRandomizer.prototype.getRandomVintageSetting = function () {
	let vintageSetting = {
		standardValue: this.randomVintage(true),
		advancedValueList: []
	};

	if (this.randomBoolean()) {
		for (let i = 0; i < this.getRandomInteger(2, 5); i++) {
			vintageSetting.advancedValueList.push(this.randomVintage(true));
		}
	}

	return vintageSetting;
};

SettingRandomizer.prototype.randomVintage = function (useWeightedSeason) {
	let vintage = {};
	let yearRange = this._VINTAGE_CONSTANTS.RANGE.YEARS;
	if (useWeightedSeason) {
		let weightedYearRange = [];
		while (weightedYearRange.length < 2) {
			let randomRoll = this.getRandomInteger(0, 100);
			let year;
			Object.keys(this._VINTAGE_CONSTANTS.WEIGHTED_YEARS).some(field => {
				if (this._VINTAGE_CONSTANTS.WEIGHTED_YEARS[field] >= randomRoll) {
					year = parseInt(field);
					return true;
				}
			});
			if (year < yearRange.min) {
				year = yearRange.min;
			}
			if (year > yearRange.max) {
				year = yearRange.max;
			}
			if (!weightedYearRange.includes(year)) {
				weightedYearRange.push(year);
			}
		}
		weightedYearRange.sort();
		vintage.years = this.getRandomIntegerPair(weightedYearRange[0], weightedYearRange[1]);
	} else {
		vintage.years = this.getRandomIntegerPair(yearRange.min, yearRange.max);
	}

	let seasonRange = this._VINTAGE_CONSTANTS.RANGE.SEASONS;
	vintage.seasons = this.getRandomIntegerPair(seasonRange.min, seasonRange.max);
	return vintage;
};

SettingRandomizer.prototype.randomTagGenreFilters = function (list, onlyExclude) {
	let amount = Math.round(Math.random() * this._MAX_TAG_GENRE_FILTER_AMOUNT);
	let filterEntries = [];
	let selectedsIds = [];
	let optionalTagIncluded = false;
	for (let i = 0; i < amount; i++) {
		let genreTagState;
		if((i + 1 < amount || optionalTagIncluded) && !onlyExclude) {
			genreTagState = Math.round(Math.random()) + 2;
		} else {
			genreTagState = this._GENRE_TAG_STATES.EXLUCDE;
		}

		let loopCount = 0;
		do {
			let id = this.getNewFromList(list, selectedsIds);
			selectedsIds.push(id);
			filterEntries.push({
				id: id,
				state: genreTagState
			});
			loopCount++;
		} while(genreTagState === this._GENRE_TAG_STATES.OPTIONAL && loopCount < 2 && !optionalTagIncluded);
		if(genreTagState === this._GENRE_TAG_STATES.OPTIONAL && !optionalTagIncluded) {
			i++;
			optionalTagIncluded = true;
		}
	}

	return filterEntries;
};

SettingRandomizer.prototype.getNewFromList = function(list, alreadySelectedList) {
	let selected;
	do {
		selected = list[Math.floor(list.length * Math.random())];
	} while(alreadySelectedList.includes(selected));

	return selected;
};


SettingRandomizer.prototype.parseSettingRange = function (settingRange) {
	let setting = {};

	if (settingRange.standardValue) {
		setting.standardValue = this.parseSettingValue(settingRange.standardValue);
	}

	if (settingRange.random) {
		setting.randomOn = this.randomBoolean();
		setting.randomValue = this.parseSettingValue(settingRange.randomValue);
	} else if (settingRange.advanced) {
		setting.advancedOn = this.randomBoolean();
		setting.advancedValue = this.parseSettingValue(settingRange.advancedValue);
	} else {
		setting = this.parseSettingValue(settingRange);
	}

	return setting;
};

SettingRandomizer.prototype.parseSettingValue = function (value) {
	switch (value.type) {
		case this._RANGE_TYPES.INTEGER:
			return this.getRandomInteger(value.min, value.max);
		case this._RANGE_TYPES.INTEGER_PAIR: {
			let valueOne = this.getRandomInteger(value.min, value.max);
			let valueTwo = this.getRandomInteger(value.min, value.max);
			let high, low;
			if (valueOne < valueTwo) {
				high = valueTwo;
				low = valueOne;
			} else {
				high = valueOne;
				low = valueTwo;
			}

			if (value.minRange && high - low < value.minRange) {
				if (low + value.minRange <= value.max) {
					high = low + value.minRange;
				} else {
					low = high - value.minRange;
				}
			}
			return [low, high];
		}
		case this._RANGE_TYPES.INTEGER_SET:
			return value.set[Math.floor(value.set.length * Math.random())];
		case this._RANGE_TYPES.BOOLEAN_ARRAY:
			return this.getRandomBooleanArray(value.size, value.atLeastOneRandom);
		case this._RANGE_TYPES.BOOLEAN_MAP: {
			let booleanArray = this.getRandomBooleanArray(value.fields.length, value.atLeastOneRandom);
			let map = {};
			value.fields.forEach((field, index) => {
				map[field] = booleanArray[index];
			});
			return map;
		}

	}
};

SettingRandomizer.prototype.getRandomInteger = function (min, max) {
	return Math.round((max - min) * Math.random()) + min;
};

SettingRandomizer.prototype.getRandomIntegerPair = function (min, max) {
	return [this.getRandomInteger(min, max), this.getRandomInteger(min, max)].sort();
};

SettingRandomizer.prototype.randomBoolean = function () {
	return Math.random() < 0.5;
};

SettingRandomizer.prototype.selectRandomFromList = function (list) {
	return list[Math.floor(list.length * Math.random())];
};

SettingRandomizer.prototype.getRandomBooleanArray = function (length, atLeastOneRandom) {
	let randomArray = [];
	for (let i = 0; i < length; i++) {
		randomArray.push(this.randomBoolean());
	}
	if (atLeastOneRandom && !randomArray.some(entry => { return entry; })) {
		randomArray[Math.floor(randomArray.length * Math.random())] = true;
	}

	return randomArray;
};

var settingRandomizer = new SettingRandomizer();