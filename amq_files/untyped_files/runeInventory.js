'use strict';
/*exported RuneInventory*/

class RuneInventory {
	constructor() {
		this.$container = $("#nexusRuneContainerOuter");
		this.$count = this.$container.find("#nexusRuneCount");
		this.$combatWarning = this.$container.find("#nexusRuneContainerWarning");
		this.$standardMsg = this.$container.find("#nexusRuneContainerUnlockMessage");
		this.$noRunesMsg = this.$container.find("#nexusRuneContainerNoRuneMessage");
		this.$runeContainer = this.$container.find("#nexusRuneContainerContent");

		this._count = 0;
		this.graceHovers = [];
	}

	set count(newValue) {
		this.$count.text(newValue);
		this._count = newValue;
	}

	get count() {
		return this._count;
	}

	resetGraceHovers() {
		this.graceHovers.forEach((graceHover) => graceHover.destroy());
		this.graceHovers = [];
	}

	reset() {
		this.resetGraceHovers();
		this.count = 0;
		this.$combatWarning.removeClass("hide");
		this.$standardMsg.addClass("hide");
		this.$noRunesMsg.removeClass("hide");
		this.$runeContainer.html("");
	}

	addRune({ name, fileName, description, type, baseName, baseFileName}) {
		name = name ? name : baseName;
		fileName = fileName ? fileName : baseFileName;
		let src = cdnFormater.newNexusRuneIconSrc(fileName);
		let srcSet = cdnFormater.newNexusRuneIconSrcSet(fileName);
		let $img = $("<img class='nexusRuneContainerRune'/>");

		new PreloadImage($img, src, srcSet, true, "50px");

		let id = name + Math.round(Math.random() * 1000000);

		this.graceHovers.push(new GraceHoverHandler($img, 250, 50, () => {
			nexusRunePopover.displayRune({ name, fileName, description, type }, $img, id);
		}, () => {
			nexusRunePopover.hide(id);
		}));

		this.$noRunesMsg.addClass("hide");

		this.$runeContainer.append($img);
		this.count++;
	}

	combatWon() {
		this.$combatWarning.addClass("hide");
		this.$standardMsg.removeClass("hide");
	}
}