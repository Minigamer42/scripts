"use strict";
/*exported NexusBadge NexusBadgeEmpty*/

class NexusBadge {
	constructor(level, { avatarId, characterId, colorId }, size, extraClasses = []) {
		this.$body = $(this.TEMPLATE);
		this.$badgeImage = this.$body.find(".nexusBadgeImg");
		this.$avatarImage = this.$body.find(".nexusBadgeAvatarImg");

		this.characterId = characterId;
		this.avatarId = avatarId;
		this.level = level;

		this.badgeSrc = cdnFormater.newNexusBadgeSrc(level, size);

		let targetAvatar;
		if (avatarId) {
			targetAvatar = storeWindow.getAvatarFromAvatarId(avatarId);
			this.completeName = targetAvatar.completeName;
		}

		extraClasses.forEach((className) => {
			this.$body.addClass(className);
		});

		new PreloadImage(this.$badgeImage, this.badgeSrc, null, true, null, () => {
			if (avatarId) {
				let targetAvatarColor = targetAvatar.colorMap[colorId];
				let { avatarName, outfitName, colorName, optionName, optionActive } = targetAvatarColor.fullDescription;

				let avatarHeadSrc = cdnFormater.newAvatarHeadSrc(avatarName, outfitName, optionName, optionActive, colorName);
				let avatarHeadSrcSet = cdnFormater.newAvatarHeadSrcSet(
					avatarName,
					outfitName,
					optionName,
					optionActive,
					colorName
				);
				let defaultSizes = `${size}px`;
				new PreloadImage(this.$avatarImage, avatarHeadSrc, avatarHeadSrcSet, true, defaultSizes, null, false);
			}
		});
	}
}
NexusBadge.prototype.TEMPLATE = $("#nexusBadgeTemplate").html();

class NexusBadgeEmpty extends NexusBadge {
	constructor(size, extraClasses = [], popoverMessage, popoverContainerId) {
		super(1, {}, size, extraClasses);
		if (popoverMessage) {
			this.$body.popover({
				content: popoverMessage,
				container: popoverContainerId,
				delay: 50,
				placement: "top",
				trigger: "hover",
			});
		}
	}

	detatch() {
		this.$body.popover("hide");
		this.$body.detach();
	}
}
