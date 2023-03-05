"use strict";
/*exported NexusBasePopover*/

class NexusBasePopover {
	constructor(extraClasses = []) {
		this.$body = $(this.TEMPALTE);
		this.$headerText = this.$body.find(".nexusPopoverHeaderText");
		this.$cooldownContainer = this.$body.find(".nexusPopoverCooldownContainer");
		this.$cooldown = this.$body.find(".nexusPopoverCooldownNumber");
		this.$cooldownDisplay = this.$body.find(".qpAvatarAbilityCooldownNumber");
		this.$imageContainer = this.$body.find(".nexusPopoverImageContainer");
		this.$image = this.$body.find(".nexusPopoverImage");
		this.$name = this.$body.find(".nexusPopoverName");
		this.$description = this.$body.find(".nexusPopoverDescription");
		this.$statInfo = this.$body.find(".ncwStatsContainerOuter");
		this.$extenionContainer = this.$body.find(".nexusPopoverExtensionContainer");

		this.$runeTotalContainer = this.$body.find(".nexusPopoverRuneTotalContainer");
		this.$runeTotal = this.$body.find(".nexusPopoverRuneTotalNumber");

		this.$runeInUseContainer = this.$body.find(".nexusPopoverRuneInUseContainer");
		this.$runeInUse = this.$body.find(".nexusPopoverRuneInUseNumber");

		this.$badgeLevelContainer = this.$body.find(".nexusPopoverBadgeLevelContainer");
		this.$badgeLevel = this.$body.find(".nexusPopoverBadgeLevelNumber");
		this.$badgeStatBoostContainer = this.$body.find(".nexusPopoverBadgeStatBoostContainer");
		this.$badgeStatBoost = this.$body.find(".nexusPopoverBadgeStatBoostNumber");
		this.$badgeGenreBoostContainer = this.$body.find(".nexusPopoverBadgeGenreBoostContainer");
		this.$badgeGenreBoost = this.$body.find(".nexusPopoverBadgeGenreBoostNumber");

		extraClasses.forEach((className) => {
			this.$body.addClass(className);
		});

		this.activeExtendedPopovers = [];
		this.currentDirection = null;

		this.$currentCustomImage = null;

		this.$container = $("#overlayLayer");

		this.$statInfo.addClass("hide");

		this.currentImagePreload = null;
		this.currentHandlerId = null;
	}

	displayDefault(typeName, name, description, src, srcSet, $triggerElement, handlerId, forceDirection, $image) {
		this.hide();

		this.currentHandlerId = handlerId;

		this.setupContent(typeName, name, description, src, srcSet, true, $image);

		let extendedPopouts = description ? nexusPopoverExtendedDescriptions.getExtendedContentInDescription(description) : [];

		extendedPopouts.forEach((popout) => {
			popout.hide();

			this.$extenionContainer.append(popout.$body);
			popout.currentImagePreload.load();
			this.activeExtendedPopovers.push(popout);
		});

		//Position body relative to trigger element
		let triggerPosition = $triggerElement.offset();
		let triggerWidth = $triggerElement.outerWidth();

		let targetPositionLeft = triggerPosition.left + triggerWidth + this.MARGIN_SIZE;
		let targetPositionTop = triggerPosition.top;

		if (forceDirection === "bottom") {
			targetPositionTop = triggerPosition.top + $triggerElement.outerHeight() + this.MARGIN_SIZE;
			targetPositionLeft = triggerPosition.left;
		} else if ( //Check if positoin on left side of screen
			(targetPositionLeft > $(window).width() / 2 && forceDirection !== "left") ||
			forceDirection === "right"
		) {
			targetPositionLeft = triggerPosition.left - this.MARGIN_SIZE - this.CONTAINER_WIDTH;
			this.$extenionContainer.css("right", "").css("left", -170);
			this.currentDirection = "right";
		} else {
			this.$extenionContainer.css("left", "").css("right", -170);
			this.currentDirection = "left";
		}

		//Add to container as hidden to get height
		this.$body.css({
			left: targetPositionLeft,
			top: targetPositionTop,
			opacity: 0,
		});

		this.$container.append(this.$body);

		//Check if positions escapes bottom of screen
		if (targetPositionTop + this.$body.outerHeight() > $(window).height()) {
			targetPositionTop = $(window).height() - this.$body.outerHeight() - 20;
		}

		this.$body.css({
			top: targetPositionTop,
			opacity: 1,
		});
	}

	setupContent(typeName, name, description, src, srcSet, triggerLoad = true, $image = null) {
		this.$headerText.text(typeName);
		this.$name.text(name);
		this.$description.text(description);

		if (this.currentImagePreload) {
			this.currentImagePreload.cancel();
		}
		if (this.$currentCustomImage) {
			this.$currentCustomImage.remove();
			this.$currentCustomImage = null;
		}

		if ($image) {
			this.$imageContainer.append($image);
			this.$currentCustomImage = $image;
		} else {
			this.currentImagePreload = new PreloadImage(this.$image, src, srcSet, triggerLoad);
		}
	}

	hide(handlerId) {
		if (!handlerId || handlerId == this.currentHandlerId) {
			this.$body.detach();
			this.activeExtendedPopovers.forEach((popout) => {
				popout.hide();
			});
		}
	}
}
NexusBasePopover.prototype.TEMPALTE = $("#nexusPopoverTemplate").html();
NexusBasePopover.prototype.MARGIN_SIZE = 25; //px
NexusBasePopover.prototype.CONTAINER_WIDTH = 220; //px
