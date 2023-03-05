"use strict";
/*exported StoreTickRollTargetSelector*/

class StoreTickRollTargetSelector {
	constructor(rollTargets) {
		this.$container = $("#swTicketAvatarLockingContainerOuter");
		this.$mainSelector = this.$container.find("#swTicketAvatarLockingContainer");
		this.$closeButton = this.$container.find("#swTicketAvatarLockingCloseButton");
		this.$contentContainer = this.$container.find("#swTicketAvatarLockingMainContent");
		this.$targetImg = this.$container.find("#swTicketAvatarLockingPromoContainerTarget > .swTicketAvatarLockingPromoImage");
		this.$targetName = this.$container.find("#swTicketAvatarLockingPromoContainerTargetName");
		this.$noTargetDisplay = this.$container.find("#swTicketAvatarLockingPromoContainerUnselected");
		this.$targetDisplay = this.$container.find("#swTicketAvatarLockingPromoContainerTarget");

		this.$contentContainer.perfectScrollbar({
			suppressScrollX: true,
		});

		this.currentTarget;

		this.rollTargets = rollTargets.map((entry) => new StoreTickRollTargetSelectorEntry(entry, this));
		this.rollTargets.forEach((entry) => this.$contentContainer.append(entry.$html));

		this.$mainSelector.click(() => {
			if (this.currentTarget) {
				this.clearTarget();
			} else {
				this.open();
			}
		});
		this.$closeButton.click(() => {
			this.close();
		});
	}

	open() {
		this.$container.addClass("open");
		this.$contentContainer.perfectScrollbar("update");
		this.rollTargets.forEach((entry) => entry.triggerLoadImage());
	}

	close() {
		this.$container.removeClass("open");
	}

	selectTarget(target) {
		this.currentTarget = target;
		this.$targetImg.attr("srcset", target.srcSet).attr("src", target.src);
		this.$targetName.text(target.name);
		this.$noTargetDisplay.addClass("hide");
		this.$targetDisplay.removeClass("hide");
		this.close();
	}

	clearTarget() {
		this.currentTarget = null;
		this.$noTargetDisplay.removeClass("hide");
		this.$targetDisplay.addClass("hide");
	}
}

class StoreTickRollTargetSelectorEntry {
	constructor({ id, name, fileName }, controller) {
		this.id = id;
		this.name = name;
		this.$html = $(format(this.TEMPLATE, name));

		this.src = cdnFormater.newBadgeSrc(fileName);
		this.srcSet = cdnFormater.newBadgeSrcSet(fileName);

		this.imagePreloader = new PreloadImage(
			this.$html.find(".swTicketAvatarLockingItemIcon"),
			this.src,
			this.srcSet,
			false
		);

		this.$html.find(".swTicketAvatarLockingItemInner").click(() => {
			controller.selectTarget(this);
		});
	}

	triggerLoadImage() {
		this.imagePreloader.load();
	}
}

StoreTickRollTargetSelectorEntry.prototype.TEMPLATE = $("#swTicketAvatarLockingItemTemplate").html();
