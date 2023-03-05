"use strict";
/*exported NexusCityWorkshopRuneSelector*/

class NexusCityWorkshopRuneSelector {
	constructor($window) {
		this.$runeContainer = $window.find(".ncwwRunePickerRuneContainer");
		this.$expandButton = $window.find(".ncwwRunePickerExpandButton");
		this.$expandButtonText = $window.find(".ncwwRunePickerExpandButton > div");

		this.runeMap = {};

		this.expanded = false;

		this.selectedRune;

		let changeCallback = () => {
			this.relayout();
		};

		this.filter = new NexusCityFilter(
			[
				new NexusCityOrderFilter(
					$window.find("#ncwwRuneQualityFilterContainer"),
					(a, b) => a.level !== b.level,
					(a, b) => a.level - b.level,
					changeCallback
				),
				new NexusCityOrderFilter(
					$window.find("#ncwwRuneAbilityFilterContainer"),
					(a, b) => a.runeId !== b.runeId,
					(a, b) => a.runeId - b.runeId,
					changeCallback
				),
			],
			(a, b) => {
				if (a.runeId !== b.runeId) {
					return a.runeId - b.runeId;
				} else {
					return a.level - b.level;
				}
			},
			$window.find("#ncwwRuneNameSearch"),
			changeCallback,
			(a, b) => {
				return a.category - b.category;
			},
			new NexusCityToggleFilter($window.find("#ncwwRuneFilter"), $window.find("#ncwwRuneFilterContainer"), [
				new NexusCityToggleFilterCategory("category", [
					new NexusCityToggleFilterCategoryEntry(
						$window.find("#ncwwCategoryOffensiveFilter"),
						NEXUS_RUNE_CATEGORIES.OFFENSIVE,
						changeCallback
					),
					new NexusCityToggleFilterCategoryEntry(
						$window.find("#ncwwCategoryDefensiveFilter"),
						NEXUS_RUNE_CATEGORIES.DEFENSIVE,
						changeCallback
					),
				]),
				new NexusCityToggleFilterCategory("type", [
					new NexusCityToggleFilterCategoryEntry(
						$window.find("#ncwwTypeMajorFilter"),
						NEXUS_RUNE_TYPES.ADVANCED,
						changeCallback
					),
					new NexusCityToggleFilterCategoryEntry(
						$window.find("#ncwwTypeMinorFilter"),
						NEXUS_RUNE_TYPES.STANDARD,
						changeCallback
					),
				]),
				new NexusCityToggleFilterCategory("level", [
					new NexusCityToggleFilterCategoryEntry(
						$window.find("#ncwwQualityMinorFilter"),
						NEXUS_RUNE_LEVELS.MINOR,
						changeCallback
					),
					new NexusCityToggleFilterCategoryEntry(
						$window.find("#ncwwQualityLesserFilter"),
						NEXUS_RUNE_LEVELS.LESSER,
						changeCallback
					),
					new NexusCityToggleFilterCategoryEntry(
						$window.find("#ncwwQualityGreaterFilter"),
						NEXUS_RUNE_LEVELS.GREATOR,
						changeCallback
					),
					new NexusCityToggleFilterCategoryEntry(
						$window.find("#ncwwQualityMajorFilter"),
						NEXUS_RUNE_LEVELS.MAJOR,
						changeCallback
					),
					new NexusCityToggleFilterCategoryEntry(
						$window.find("#ncwwQualitySuperiorFilter"),
						NEXUS_RUNE_LEVELS.SUPERIOR,
						changeCallback
					),
				]),
			])
		);

		this.$runeContainer.perfectScrollbar({
			suppressScrollX: true,
			wheelSpeed: 0.9,
		});

		this.$expandButton.click(() => {
			if (this.expanded) {
				this.collapse();
			} else {
				this.expand();
			}
		});
	}

	get runeList() {
		return Object.values(this.runeMap).flatMap((runeLevelMap) => Object.values(runeLevelMap));
	}

	getRune(runeId, level) {
		return this.runeMap[runeId][level];
	}

	runeUnequiped(runeId, level) {
		this.runeMap[runeId][level].unequiped();
	}

	setupRunes(runes) {
		this.runeList.forEach((rune) => rune.remove());
		this.runeMap = {};
		runes.forEach((rune) => {
			let entry = new NexusCityWorkshopRuneSelectorRune(rune, this.$runeContainer, this);
			if (!this.runeMap[entry.runeId]) {
				this.runeMap[entry.runeId] = {};
			}
			this.runeMap[entry.runeId][entry.level] = entry;
		});
		this.relayout();
	}

	changeToExpandedSize() {
		this.$runeContainer.addClass("largeSize");
	}

	changeToNormalSize() {
		this.$runeContainer.removeClass("largeSize");
	}

	relayout() {
		this.runeList.forEach((rune) => rune.detach());
		this.filter.sortList(this.runeList).forEach((rune) => {
			this.$runeContainer.append(rune.$body);
			this.updateScroll();
		});
	}

	loadImages() {
		this.updateScroll();
		this.runeList.forEach((rune) => {
			rune.imagePreload.lazyLoadEvent();
		});
	}

	expand() {
		this.$runeContainer.addClass("expand");
		this.$expandButtonText.text("Show Less");
		this.$expandButton.width();
		this.updateScroll();
		this.expanded = true;
	}

	collapse() {
		this.$runeContainer.removeClass("expand");
		this.$expandButtonText.text("Show More");
		this.$expandButton.width();
		this.updateScroll();
		this.expanded = false;
	}

	updateScroll() {
		this.$runeContainer.perfectScrollbar("update");
	}

	scrollToRune(rune) {
		let targetScroll = rune.$body.position().top - this.SCROLL_OFFSET_TOP;
		this.$runeContainer.scrollTop(targetScroll);
	}

	runeSelected(rune) {
		if (this.selectedRune === rune) {
			this.clearSelection();
		} else {
			if (this.selectedRune) {
				this.selectedRune.selected = false;
			}
			rune.selected = true;
			this.selectedRune = rune;
			if (this.expanded) {
				this.collapse();
				this.scrollToRune(rune);
			}
		}
	}

	clearSelection() {
		if (this.selectedRune) {
			this.selectedRune.selected = false;
			this.selectedRune = null;
		}
	}

	resetSelection() {
		this.clearSelection();
		this.runeList.forEach((rune) => rune.resetSelection());
	}

	updateRunes(deletedRunes, updatedRunes) {
		this.resetSelection();
		deletedRunes.forEach(({ runeId, level }) => {
			this.runeMap[runeId][level].remove();
			delete this.runeMap[runeId][level];
		});
		updatedRunes.forEach(({ runeId, level, amount, inUseAmount }) => {
			let targetRune = this.runeMap[runeId][level];
			targetRune.amount = amount;
			targetRune.inUseCount = inUseAmount;
			targetRune.updateAmount();
		});
		this.relayout();
	}

	updateRuneAmounts(deletedRunes, updatedRunes, newRune) {
		this.resetSelection();
		deletedRunes.forEach(({ runeId, level }) => {
			this.runeMap[runeId][level].remove();
			delete this.runeMap[runeId][level];
		});
		updatedRunes.forEach(({ runeId, level, amountChange }) => {
			if (this.runeMap[runeId] && this.runeMap[runeId][level]) {
				let targetRune = this.runeMap[runeId][level];
				targetRune.amount += amountChange;
				targetRune.updateAmount();
			} else {
				let entry = new NexusCityWorkshopRuneSelectorRune(newRune, this.$runeContainer, this);
				if (!this.runeMap[entry.runeId]) {
					this.runeMap[entry.runeId] = {};
				}
				this.runeMap[entry.runeId][entry.level] = entry;
			}
		});
		this.relayout();
	}

	clearedRunePage(clearedRunes, avatarId) {
		this.resetSelection();
		clearedRunes.forEach(({ runeId, level, count }) => {
			let targetRune = this.runeMap[runeId][level];
			targetRune.inUseCount -= count;
			delete targetRune.equipedAvatarIds[avatarId];
			targetRune.updateAmount();
		});
		this.relayout();
	}
}
NexusCityWorkshopRuneSelector.prototype.SCROLL_OFFSET_TOP = 14; //px

class NexusCityWorkshopRuneSelectorRune {
	constructor(
		{
			description: {
				runeId,
				level,
				name,
				fileName,
				type,
				category,
				description,
				boostPercent,
				statPropName = null,
				customBoostName = null,
			},
			amount,
			inUseCount,
			equipedAvatarIds,
		},
		$container,
		selector
	) {
		this.runeId = runeId;
		this.level = level;
		this.name = name;
		this.fileName = fileName;
		this.type = type;
		this.category = category;
		this.selector = selector;
		this.boostPercent = boostPercent;
		this.statPropName = statPropName;
		this.customBoostName = customBoostName;
		this.description = description;

		this.amount = amount;
		this.slottedInCount = 0;
		this.inUseCount = inUseCount;
		this.equipedAvatarIds = equipedAvatarIds;

		this.$body = $(format(this.TEMPLATE, this.name));
		this.$img = this.$body.find(".ncwwRunePickerRuneImage");
		this.$amount = this.$body.find(".ncwwRunePickerRuneAmount");

		this.src = cdnFormater.newNexusRuneIconSrc(fileName);
		this.srcSet = cdnFormater.newNexusRuneIconSrcSet(fileName);

		this.updateAmount();

		this.imagePreload = new PreloadImage(this.$img, this.src, this.srcSet, false, "40px", null, false, $container);

		this.$img.click(() => {
			if (this.availableAmount > 0) {
				selector.runeSelected(this);
			}
		});

		this.hoverId = this.runeId + "-" + this.level;
		this.graceHover = new GraceHoverHandler(
			this.$body,
			250,
			50,
			() => {
				nexusRunePopover.displayRune(
					{ name, fileName, description, amount, inUseAmount: this.inUseCount, type },
					this.$body,
					this.hoverId
				);
			},
			() => {
				nexusRunePopover.hide(this.hoverId);
			}
		);
	}

	get availableAmount() {
		return this.amount - this.inUseCount - this.slottedInCount;
	}

	set selected(selected) {
		if (selected) {
			this.$body.addClass("selected");
		} else {
			this.$body.removeClass("selected");
		}
	}

	unequiped() {
		this.slottedInCount--;
		this.updateAmount();
	}

	slottedIn() {
		this.slottedInCount++;
		this.updateAmount();
		if (this.availableAmount <= 0) {
			this.selector.clearSelection();
		}
	}

	compare(target) {
		return this.runeId - target.runeId;
	}

	detach() {
		if(this.graceHover) {
			this.graceHover.hide();
		}
		this.$body.detach();
	}

	remove() {
		if(this.graceHover) {
			this.graceHover.destroy();
		}
		this.$body.remove();
		this.imagePreload.cancel();
	}

	updateAmount() {
		let amount = this.availableAmount;
		this.$amount.text(amount);

		if (amount <= 0) {
			this.$body.addClass("unavailable");
		} else {
			this.$body.removeClass("unavailable");
		}
	}

	resetSelection() {
		this.slottedInCount = 0;
		this.updateAmount();
	}
}
NexusCityWorkshopRuneSelectorRune.prototype.TEMPLATE = $("#nexusRunePickerRuneTemplate").html();
