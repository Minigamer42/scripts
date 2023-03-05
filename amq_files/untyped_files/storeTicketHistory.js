"use strict";
/*exported StoreTicketHistory*/

class StoreTicketHistory {
	constructor(recentTicketRewards) {
		this.$mainContainer = $("#swTicketHistoryMainContainer");
		this.$innerContainer = $("#swTicketHistoryMainContainerInner");
		this.$noRollsMessageContainer = this.$mainContainer.find('.swMainMessageContainer');

		this.historyEntries = recentTicketRewards.map(entry => new StoreTicketHistoryEntry(entry, this.$mainContainer));

		this.$mainContainer.perfectScrollbar({
			suppressScrollX: true,
			wheelSpeed: 3.5
		});
	}

	hide() {
		this.$mainContainer.addClass("hide");
		this.historyEntries.forEach(entry => entry.detatch());
	}

	show() {
		if(this.historyEntries.length) {
			this.$noRollsMessageContainer.addClass('hide');
		} else {
			this.$noRollsMessageContainer.removeClass('hide');
		}
		this.$mainContainer.removeClass("hide");
		this.historyEntries.forEach(entry => {
			this.$innerContainer.append(entry.$html);
			entry.display();
		});
		this.$mainContainer.perfectScrollbar("update");
	}

	addEntries(newEntries) {
		newEntries.forEach(entry => {
			this.historyEntries.unshift(new StoreTicketHistoryEntry(entry, this.$mainContainer));
		});
		this.historyEntries.splice(this.MAX_ELEMENTS).forEach(removedEntry => {
			removedEntry.destroy();
		});
	}
}

StoreTicketHistory.prototype.MAX_ELEMENTS = 50;

class StoreTicketHistoryEntry {
	constructor({ type, description, tier, rhythm }, $container) {
		this.loadTriggered = false;
		let name, typeName, imgSrc, imgSrcSet, sizes, sizeModClass;
		if (type === "emote") {
			typeName = "Emote";
			name = capitalizeMajorWords(description.name);
			imgSrc = cdnFormater.newEmoteSrcSet(description.name);
			imgSrcSet = cdnFormater.newEmoteSrc(description.name);
			sizes = "";
		} else {
			if (type === "avatar") {
				typeName = "Skin";
				name = capitalizeMajorWords(description.outfitName);
			} else if (type === "color") {
				typeName = description.avatarName;
				name = capitalizeMajorWords(description.colorName);
			}
			imgSrc = cdnFormater.newAvatarSrc(
				description.avatarName,
				description.outfitName,
				description.optionName,
				true,
				description.colorName,
				cdnFormater.AVATAR_POSE_IDS.BASE
			);
			imgSrcSet = cdnFormater.newAvatarSrcSet(
				description.avatarName,
				description.outfitName,
				description.optionName,
				true,
				description.colorName,
				cdnFormater.AVATAR_POSE_IDS.BASE
			);
			sizeModClass = "sizeMod" + description.sizeModifier;
			sizes = STORE_TILE_SIZE_MOD_FORMATS[sizeModClass];
		}

		this.$html = $(format(this.ENTRY_TEMPLATE, typeName, name));
		this.imagePreload = new PreloadImage(
			this.$html.find(".swTicketRollRewardImg"),
			imgSrc,
			imgSrcSet,
			false,
			sizes,
			null,
			null,
			$container,
			false,
			this.$html
		);
		this.$html.css("box-shadow", "0 0 10px 2px " + StoreOuterRewardContainer.prototype.TIER_COLORS[tier].string);

		if(rhythm) {
			this.$html.find('.swRhythmIcon').removeClass("hide");
			this.$html.find('[data-toggle="popover"]').popover();
		}

		let $rewardContainer = this.$html.find(".swTicketRollRewardContainer");
		if (type === "emote") {
			$rewardContainer.addClass("emote");
			this.$html.removeClass('clickAble');
		} else {
			$rewardContainer
				.css(
					"background-image",
					'url("' +
						cdnFormater.newAvatarBackgroundSrc(
							description.backgroundFileName,
							cdnFormater.BACKGROUND_STORE_PREVIEW_SIZE
						) +
						'")'
				)
				.addClass(description.avatarName)
				.addClass(description.outfitName.replace(" ", "-"))
				.addClass(description.colorName.replace(" ", "-"));
			this.$html.find(".swTicketRollRewardImg").addClass(sizeModClass);
			this.$html.click(() => {
				let avatar = storeWindow.getAvatar(description.characterId, description.avatarId).colorMap[description.colorId];
				storeWindow.handleAvatarSelected(avatar.fullDescription, avatar.backgroundDescription);
			});
		}
	}

	display() {
		this.imagePreload.lazyLoadEvent();
		this.updateTextSize();
	}

	updateTextSize() {
		fitTextToContainer(
			this.$html.find(".swAvatarSkinName"),
			this.$html.find(".swAvatarTileFooterContent"),
			this.TARGET_FONT_SIZE,
			this.MIN_FONT_SIZE
		);
	}

	detatch() {
		this.$html.detach();
	}

	destroy() {
		this.$html.remove();
		this.imagePreload.cancel();
	}
}

StoreTicketHistoryEntry.prototype.ENTRY_TEMPLATE = $("#swTileHistoryTileTemplate").html();
StoreTicketHistoryEntry.prototype.TARGET_FONT_SIZE = 40;
StoreTicketHistoryEntry.prototype.MIN_FONT_SIZE = 10;