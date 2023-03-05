"use strict";
/*exported settingMessageFormater*/

function SettingMessageFormater() {
	this.ARROW_HTML = ' <i class="fa fa-long-arrow-right" aria-hidden="true"></i> ';
}

SettingMessageFormater.prototype.format = function (newEntry, oldEntry, settingName) {
	let changeLines = [];
	let baseValueString;

	let advancedChanged = newEntry.advancedOn !== oldEntry.advancedOn;
	let randomChanged = newEntry.randomOn !== oldEntry.randomOn;
	if (advancedChanged) {
		changeLines.push(
			"Advanced: " +
				this.translateOnOff(oldEntry.advancedOn) +
				this.ARROW_HTML +
				this.translateOnOff(newEntry.advancedOn)
		);
	} else if (randomChanged) {
		changeLines.push(
			"Random: " + this.translateOnOff(oldEntry.randomOn) + this.ARROW_HTML + this.translateOnOff(newEntry.randomOn)
		);
	}

	if (newEntry.advancedOn && settingName === "songSelection") {
		let newAdvancedValue = newEntry.advancedValue;
		let oldAdvancedValue = oldEntry.advancedValue;

		Object.keys(newAdvancedValue).forEach((key) => {
			let base = capitalizeFirstLetter(key) + ": ";
			if (advancedChanged) {
				changeLines.push(base + newAdvancedValue[key]);
			} else if (newAdvancedValue[key] !== oldAdvancedValue[key]) {
				changeLines.push(base + oldAdvancedValue[key] + this.ARROW_HTML + newAdvancedValue[key]);
			}
		});
	} else if (newEntry.advancedOn && settingName === "songType") {
		let newAdvancedValue = newEntry.advancedValue;
		let oldAdvancedValue = oldEntry.advancedValue;
		if (JSON.stringify(newEntry.standardValue) !== JSON.stringify(oldEntry.standardValue)) {
			let oldEntryText = this.translateSettingValueToText(oldEntry.standardValue, settingName);
			let newEntryText = this.translateSettingValueToText(newEntry.standardValue, settingName);
			baseValueString = ": " + oldEntryText + this.ARROW_HTML + newEntryText;
		}
		Object.keys(newAdvancedValue).forEach((key) => {
			if (key === "random" || newEntry.standardValue[key]) {
				let base = capitalizeFirstLetter(key) + ": ";
				if (advancedChanged) {
					changeLines.push(base + newAdvancedValue[key]);
				} else if (newAdvancedValue[key] !== oldAdvancedValue[key]) {
					changeLines.push(base + oldAdvancedValue[key] + this.ARROW_HTML + newAdvancedValue[key]);
				}
			}
		});
	} else if (settingName === "vintage") {
		if (newEntry.advancedValueList.length) {
			newEntry.advancedValueList.some((entry, index) => {
				if (newEntry.advancedValueList.length > 5 && index === 4) {
					return true;
				} else if (index === 5) {
					return true;
				}
				changeLines.push(this.translateVintageEntry(entry));
			});
			let listLength = newEntry.advancedValueList.length;
			if (listLength > 5) {
				changeLines.push("+" + (listLength - 4) + " more...");
			}
		} else {
			let newText = this.translateVintageEntry(newEntry.standardValue);
			if (oldEntry.advancedValueList.length) {
				baseValueString = ": " + newText;
			} else {
				let oldText = this.translateVintageEntry(oldEntry.standardValue);
				baseValueString = ": " + oldText + this.ARROW_HTML + newText;
			}
		}
	} else if (settingName === "genre" || settingName === "tags") {
		if (newEntry.length) {
			newEntry.some((entry, index) => {
				if (newEntry.length > 5 && index === 4) {
					return true;
				} else if (index === 5) {
					return true;
				}
				let name;
				if (settingName === "genre") {
					name = idTranslator.genreNames[entry.id];
				} else {
					name = idTranslator.tagNames[entry.id];
				}
				changeLines.push(this.formatGenreTagString(entry, name));
			});
			let listLength = newEntry.length;
			if (listLength > 5) {
				changeLines.push("+" + (listLength - 4) + " more...");
			}
		} else {
			baseValueString = ": None";
		}
	} else {
		let oldValue;
		let newValue;
		let rangeTranslator;

		if (newEntry.randomOn) {
			newValue = newEntry.randomValue;
			oldValue = oldEntry.randomValue;
			if (settingName === "playbackSpeed") {
				rangeTranslator = (index) => {
					switch (index) {
						case 0:
							return 1;
						case 1:
							return 1.5;
						case 2:
							return 2;
						case 3:
							return 4;
					}
				};
			}
		} else if (newEntry.advancedOn) {
			newValue = newEntry.advancedValue;
			oldValue = oldEntry.advancedValue;
			if (settingName === "playerScore") {
				rangeTranslator = (index) => {
					return index + 1;
				};
			} else if (settingName === "animeScore") {
				rangeTranslator = (index) => {
					return index + 2;
				};
			}
		} else if (newEntry.standardValue !== undefined) {
			newValue = newEntry.standardValue;
			oldValue = oldEntry.standardValue;
		} else {
			newValue = newEntry;
			oldValue = oldEntry;
		}

		let newText = this.translateSettingValueToText(newValue, settingName, rangeTranslator);

		if (advancedChanged || randomChanged) {
			baseValueString = ": " + newText;
		} else {
			let oldText = this.translateSettingValueToText(oldValue, settingName, rangeTranslator);
			baseValueString = ": " + oldText + this.ARROW_HTML + newText;
		}
	}

	let changeString = "<b>" + this.translateSettingNameToText(settingName) + "</b>";

	if (baseValueString) {
		changeString += baseValueString;
	}

	changeLines.forEach((line) => {
		changeString += "<br/>" + line;
	});
	changeString += "<br/>";

	return changeString;
};

SettingMessageFormater.prototype.translateOnOff = function (on) {
	if (on) {
		return "On";
	} else {
		return "Off";
	}
};

SettingMessageFormater.prototype.translateVintageSeason = function (seasonId) {
	switch (seasonId) {
		case 0:
			return "Winter";
		case 1:
			return "Spring";
		case 2:
			return "Summer";
		case 3:
			return "Fall";
	}
};

SettingMessageFormater.prototype.translateVintageEntry = function (entry) {
	return (
		this.translateVintageSeason(entry.seasons[0]) +
		" " +
		entry.years[0] +
		" - " +
		entry.years[1] +
		" " +
		this.translateVintageSeason(entry.seasons[1])
	);
};

SettingMessageFormater.prototype.formatGenreTagString = function (entry, name) {
	let baseString;
	switch (entry.state) {
		case 1:
			baseString = "+ ";
			break;
		case 2:
			baseString = "-&nbsp; ";
			break;
		case 3:
			baseString = "~ ";
			break;
	}
	baseString += name;
	return baseString;
};

SettingMessageFormater.prototype.translateSettingNameToText = function (setting) {
	switch (setting) {
		case "vintage":
			return "Vintage";
		case "animeScore":
			return "Anime Score";
		case "playerScore":
			return "Player Score";
		case "samplePoint":
			return "Sample Point";
		case "guessTime":
			return "Guess Time";
		case "inventorySize":
			return "Inventory Size";
		case "lootingTime":
			return "Looting Time";
		case "songSelection":
			return "Song Selection";
		case "showSelection":
			return "Show Selection";
		case "numberOfSongs":
			return "Number of Songs";
		case "roomSize":
			return "Number of Players";
		case "songPopularity":
			return "Song Popularity";
		case "songDifficulity":
			return "Song Difficulty";
		case "songType":
			return "Song Types";
		case "openingCategories":
			return "Opening Categories";
		case "endingCategories":
			return "Ending Categories";
		case "insertCategories":
			return "Insert Categories";
		case "roomName":
			return "Room Name";
		case "privateRoom":
			return "Room Private";
		case "password":
			return "Password";
		case "playbackSpeed":
			return "Playback Speed";
		case "gameMode":
			return "Game Mode";
		case "modifiers":
			return "Modifiers";
		case "type":
			return "Type";
		case "genre":
			return "Genre";
		case "tags":
			return "Tags";
		case "lives":
			return "Lives";
		case "scoreType":
			return "Scoring";
		case "teamSize":
			return "Team Size";
		case "watchedDistribution":
			return "Watched Distribution";
	}
};

SettingMessageFormater.prototype.translateSettingValueToText = function (setting, settingName, rangeTranslator) {
	if (setting instanceof Array) {
		if (rangeTranslator) {
			let text = "";
			let rangeStart = null;
			setting.forEach((on, index) => {
				if (on) {
					if (rangeStart === null) {
						rangeStart = rangeTranslator(index);
					}
					if (!setting[index + 1]) {
						let rangeStop = rangeTranslator(index);
						if (rangeStart === rangeStop) {
							text += rangeStart + ", ";
						} else {
							text += rangeStart + "-" + rangeStop + ", ";
						}
						rangeStart = null;
					}
				}
			});
			return text.slice(0, -2);
		} else {
			return setting[0] + "-" + setting[1];
		}
	} else if (setting instanceof Object) {
		let textForm = "";
		let oneSelected = false;
		Object.keys(setting).forEach((key) => {
			if (setting[key]) {
				textForm += this.translateSubSetting(key, settingName) + ", ";
				oneSelected = true;
			}
		});
		if (oneSelected) {
			return textForm.slice(0, -2);
		} else {
			return "None";
		}
	} else {
		switch (settingName) {
			case "songSelection":
				switch (setting) {
					case 1:
						return "Random";
					case 2:
						return "Mainly Watched";
					case 3:
						return "Only Watched";
				}
				break;
			case "showSelection":
				switch (setting) {
					case 1:
						return "Auto";
					case 2:
						return "Looting";
				}
				break;
			case "scoreType":
				switch (setting) {
					case 1:
						return "Count";
					case 2:
						return "Speed";
					case 3:
						return "Lives";
				}
				break;
			case "samplePoint":
				switch (setting) {
					case 1:
						return "Start";
					case 2:
						return "Middle";
					case 3:
						return "End";
					case 4:
						return "Random";
				}
				break;
			case "watchedDistribution":
				switch (setting) {
					case 1:
						return "Random";
					case 2:
						return "Weighted";
					case 3:
						return "Equal";
				}
				break;
			case "roomName":
				return escapeHtml(setting);
		}

		return escapeHtml(setting);
	}
};

SettingMessageFormater.prototype.translateSubSetting = function (value, settingName) {
	if (settingName === "modifiers") {
		switch (value) {
			case "skipGuessing":
				return "Skip Guessing";
			case "skipReplay":
				return "Skip Replay";
			case "duplicates":
				return "Duplicates";
			case "lootDropping":
				return "Loot Dropping";
			case "rebroadcastSongs":
				return "Rebroadcast Songs";
			case "dubSongs":
				return "Dub Songs";
		}
	} else if (settingName === "type") {
		switch (value) {
			case "ova":
				return "OVA";
			case "ona":
				return "ONA";
		}
	}
	return capitalizeFirstLetter(value);
};

var settingMessageFormater = new SettingMessageFormater();
