"use strict";
/*exported NexusCityAvatarInfoDisplay*/

class NexusCityAvatarInfoDisplay {
	constructor($container, statBaseMax, autoScroll) {
		this.$avatarImage = $container.find(".ncwAvatarPreviewImage");
		this.$avatarContainer = $container.find(".ncwAvatarPreview");
		this.$nameContainer = $container.find(".ncwAvatarNameContainer");
		this.$name = $container.find(".ncwAvatarName");
		this.$level = $container.find(".ncwAvatarLevel");
		this.$specialBuffList = $container.find(".ncwSpecialBuffList");

		this.autoScroll = autoScroll;
		this.autoScrollInterval;

		this.currentAvatarId = null;

		this.speciaBuffs = {};
		this.specialBuffList = [];

		this.statsBars = {
			cont: new NexusCityAvatarInfoDisplayStatLine($container.find(".ncwContStat")),
			def: new NexusCityAvatarInfoDisplayStatLine($container.find(".ncwDefStat")),
			dodge: new NexusCityAvatarInfoDisplayStatLine($container.find(".ncwDodgeStat")),
			atk: new NexusCityAvatarInfoDisplayStatLine($container.find(".ncwAtkStat")),
			acc: new NexusCityAvatarInfoDisplayStatLine($container.find(".ncwAccStat")),
		};

		if (!this.autoScroll) {
			this.$specialBuffList.perfectScrollbar({
				suppressScrollX: true,
			});
		}

		this.genreIcons = {
			Strong: {
				0: new NexusCityAvatarInfoDisplayGenreIcon($container.find(".ncwStatGenreInfoStateStrong .ncwStatGenreInfoIcon.icon-1"), true),
				1: new NexusCityAvatarInfoDisplayGenreIcon($container.find(".ncwStatGenreInfoStateStrong .ncwStatGenreInfoIcon.icon-2"), true),
				2: new NexusCityAvatarInfoDisplayGenreIcon($container.find(".ncwStatGenreInfoStateStrong .ncwStatGenreInfoIcon.icon-3"), true),
			},
			Weak: {
				0: new NexusCityAvatarInfoDisplayGenreIcon($container.find(".ncwStatGenreInfoStateWeak .ncwStatGenreInfoIcon.icon-1")),
				1: new NexusCityAvatarInfoDisplayGenreIcon($container.find(".ncwStatGenreInfoStateWeak .ncwStatGenreInfoIcon.icon-2")),
			},
		};

		this.statBaseMax = statBaseMax;

		this.imagePreload;
	}
	
	reset() {
		this.resetBoosts();
	}

	displayAvatar({avatarId, src, srcSet, backgroundSrc, name, level, sizeModClass, baseStats, runeInfo, genreInfo }) {
		if (this.imagePreload) {
			this.imagePreload.cancel();
		}

		this.currentAvatarId = avatarId;

		this.imagePreload = new PreloadImage(this.$avatarImage, src, srcSet, true, "200px");

		this.$avatarImage.removeClass("sizeMod20 sizeMod0 sizeMod51").addClass(sizeModClass);
		this.$avatarContainer.css("background-image", `url(${backgroundSrc})`);

		this.$name.text(name);
		this.$level.text(level);

		this.displayStats(baseStats, runeInfo, genreInfo);
	}

	displayStats(baseStats, runeInfo, genreInfo) {
		Object.keys(baseStats).forEach((statName) => {
			this.statsBars[statName].setupBaseState(baseStats[statName], this.statBaseMax);
		});

		this.setRuneBoosts(runeInfo, true);

		genreInfo.strengths.forEach((genre, index) => {
			this.genreIcons.Strong[index].displayGenre(genre);
		});
		genreInfo.weaknesses.forEach((genre, index) => {
			this.genreIcons.Weak[index].displayGenre(genre);
		});

		this.updateBuffScroll();
		if(this.autoScroll) {
			this.triggerAutoScroll();
		}
	}

	avatarUpdate({avatarId, src, srcSet, backgroundSrc, sizeModClass}) {
		if(avatarId === this.currentAvatarId) {
			if (this.imagePreload) {
				this.imagePreload.cancel();
			}

			this.imagePreload = new PreloadImage(this.$avatarImage, src, srcSet, true, "200px");
			this.$avatarImage.removeClass("sizeMod20 sizeMod0 sizeMod51").addClass(sizeModClass);
			this.$avatarContainer.css("background-image", `url(${backgroundSrc})`);
		}
	}

	relayout() {
		fitTextToContainer(this.$name, this.$nameContainer, 22, 10);
		this.updateBuffScroll();
	}

	setRuneBoosts(runes, noScroll) {
		this.$specialBuffList.html("");
		this.speciaBuffs = {};
		this.specialBuffList = [];
		runes.forEach((rune) => {
			if (rune.statPropName) {
				this.statsBars[rune.statPropName].runePercentIncrease += rune.boostPercent;
			} else {
				this.handleNewSpecialRune(rune, noScroll);
			}
		});
		Object.values(this.statsBars).forEach((bar) => bar.updateRuneIncrease());
	}

	newRune(rune) {
		if (rune.statPropName) {
			this.statsBars[rune.statPropName].runePercentIncrease += rune.boostPercent;
			this.statsBars[rune.statPropName].updateRuneIncrease();
		} else {
			this.handleNewSpecialRune(rune);
		}
		this.updateBuffScroll();
	}

	removeRune(rune) {
		if (rune.statPropName) {
			this.statsBars[rune.statPropName].runePercentIncrease -= rune.boostPercent;
			this.statsBars[rune.statPropName].updateRuneIncrease();
		} else {
			this.speciaBuffs[rune.runeId].percent -= rune.boostPercent;
			if (this.speciaBuffs[rune.runeId].percent) {
				this.speciaBuffs[rune.runeId].updateText();
			} else {
				this.speciaBuffs[rune.runeId].$body.remove();
				delete this.speciaBuffs[rune.runeId];
			}
		}
		this.updateBuffScroll();
	}

	handleNewSpecialRune(rune, noScroll) {
		if (this.speciaBuffs[rune.runeId]) {
			this.speciaBuffs[rune.runeId].percent += rune.boostPercent;
			this.speciaBuffs[rune.runeId].updateText();
		} else {
			this.speciaBuffs[rune.runeId] = new NexusCityAvatarInfoDisplaySpecialStatLine(
				rune.customBoostName,
				rune.boostPercent,
				rune.type === NEXUS_RUNE_TYPES.ADVANCED ? rune.name : null
			);
			this.$specialBuffList.append(this.speciaBuffs[rune.runeId].$body);
			this.specialBuffList.push(this.speciaBuffs[rune.runeId]);
		}
		if (!noScroll) {
			this.speciaBuffs[rune.runeId].$body[0].scrollIntoView({ block: "nearest" });
		}
	}

	resetBoosts() {
		Object.values(this.statsBars).forEach((bar) => {
			bar.runePercentIncrease = 0;
			bar.updateRuneIncrease();
		});
		this.updateBuffScroll();
		clearInterval(this.autoScrollInterval);
	}

	updateBuffScroll() {
		if(!this.autoScroll) {
			this.$specialBuffList.perfectScrollbar("update");
		}
	}
	
	triggerAutoScroll() {
		clearInterval(this.autoScrollInterval);
		let specialRuneLines = this.specialBuffList;
		if (specialRuneLines.length < 2) {
			return;
		}
		let $exampleLine = specialRuneLines[1].$body;
		let elementHeight = $exampleLine.height();
		let elementSpacing = parseInt($exampleLine.css('marginTop'));
		let containerHeight = this.$specialBuffList.height();

		if(containerHeight >= (elementHeight * specialRuneLines.length + elementSpacing * (specialRuneLines.length - 1))) {
			return;
		}

		let targetScroll = elementHeight + elementSpacing;
		let currentElementScroll = 0;
		let currentIndex = 0;
		let currentItem = specialRuneLines[0];

		this.$specialBuffList.append(currentItem.$clone);

		let lastTickTime = Date.now();
		this.autoScrollInterval = setInterval(() => {
			let timeDiff = Date.now() - lastTickTime;
			lastTickTime  = Date.now();
			
			let scrollAmount = this.AUTO_SCROLL_SPEED * timeDiff;
			currentElementScroll += scrollAmount;

			if (currentElementScroll > targetScroll) {
				let $currentBody = currentItem.$body;
				let $currentClone = currentItem.$clone;
				$currentBody.detach();
				$currentBody.css('margin-top', "");
				currentItem.$clone = $currentBody;
				currentItem.$body = $currentClone;

				currentIndex = (currentIndex + 1) % specialRuneLines.length;
				currentItem = specialRuneLines[currentIndex];
				this.$specialBuffList.append(currentItem.$clone);

				currentElementScroll = currentElementScroll - targetScroll;
			}

			currentItem.$body.css('margin-top', -currentElementScroll + "px");
		} , this.AUTO_SCROLL_FRAME_SPEED);
	}
}
NexusCityAvatarInfoDisplay.prototype.AUTO_SCROLL_FRAME_SPEED = 1000 / 100;
NexusCityAvatarInfoDisplay.prototype.AUTO_SCROLL_SPEED = 0.03; // px per ms 

class NexusCityAvatarInfoDisplayStatLine {
	constructor($container) {
		this.$baseBar = $container.find(".ncwStatBaseBar");
		this.$baseValueText = $container.find(".ncwStatBaseAmount");
		this.$runeIncreaseText = $container.find(".ncwStatAmountIncrease");
		this.$runeIncreaseBar = $container.find(".ncwStatIncreaseBar");

		this.baseStat;
		this.maxStat;
		this.runePercentIncrease = 0;
	}

	setupBaseState(baseStat, maxStat) {
		let percent = (baseStat / maxStat - 1) * 100;
		this.$baseBar.css("transform", `translateX(${percent}%)`);
		let statsString = baseStat - Math.floor(baseStat) < 0.05 ? Math.floor(baseStat) : baseStat.toFixed(1);
		this.$baseValueText.text(statsString);
		this.baseStat = baseStat;
		this.maxStat = maxStat;
		this.runePercentIncrease = 0;
	}

	updateRuneIncrease() {
		if (this.runePercentIncrease === 0) {
			this.$runeIncreaseText.text("");
			this.$runeIncreaseBar.css("transform", `translateX(-100%)`);
		} else {
			let mathPercent = this.runePercentIncrease / 100;
			let increaseAmount = this.baseStat * mathPercent;
			let percent = ((this.baseStat + increaseAmount) / this.maxStat - 1) * 100;
			this.$runeIncreaseBar.css("transform", `translateX(${percent}%)`);

			let increaseString =
				increaseAmount - Math.floor(increaseAmount) < 0.05 ? Math.floor(increaseAmount) : increaseAmount.toFixed(1);
			this.$runeIncreaseText.text(`+${increaseString}`);
		}
	}

}

class NexusCityAvatarInfoDisplaySpecialStatLine {
	constructor(name, percent, fullName) {
		this.name = name;
		this.percent = percent;
		this.fullName = fullName;
		this.$body = $(this.TEMPLATE);
		this.$clone = $(this.TEMPLATE);
		this.updateText();
	}

	get percentString() {
		return this.percent - Math.floor(this.percent) < 0.05 ? Math.floor(this.percent) : this.percent.toFixed(1);
	}

	get description() {
		if (this.fullName) {
			return this.fullName;
		} else {
			return `${this.percent ? `+${this.percentString}% ` : ""}${this.name}`;
		}
	}

	updateText() {
		this.$body.text(this.description);
		this.$clone.text(this.description);
	}
}
NexusCityAvatarInfoDisplaySpecialStatLine.prototype.TEMPLATE = "<div class='ncwSpecialBuff'></div>";


class NexusCityAvatarInfoDisplayGenreIcon {
	constructor($icon, strong) {
		this.$icon = $icon;
		this.strong = strong;

		this.popoverMessage = "";
		this.popoverTitle = "";

		this.$icon.popover({
			title: () => this.popoverTitle,
			content: () => this.popoverMessage,
			container: '#nexus',
			delay: 50,
			placement: 'top',
			trigger: 'hover'
		});
	}

	displayGenre({name, active}) {
		let src = cdnFormater.newNexusGenreIconSrc(name);
		let srcset = cdnFormater.newNexusGenreIconSrcSet(name);
		this.$icon.attr("srcset", srcset);
		this.$icon.attr("src", src);
		let message = `Increase damage ${this.strong ? "done" : "taken"} during ${name} shows.`;

		this.popoverMessage = message;
		this.popoverTitle = name;

		if(active) {
			this.$icon.addClass("active");
		} else {
			this.$icon.removeClass("active");
		}
	}

	reset() {
		this.$icon.attr("srcset", "");
		this.$icon.attr("src", "");
		this.$icon.removeClass("active");
	}
}