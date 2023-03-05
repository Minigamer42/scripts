"use strict";
/*exported NexusStoreWindow*/

class NexusStoreWindow extends NexusDungeonBaseWindow {
	constructor() {
		super($("#nexusStoreContainer"));
		this.$nexusStoreArtifactRow = this.$window.find("#nexusStoreArtifactRow");
		this.$nexusStoreRuneModRow = this.$window.find("#nexusStoreRuneModRow");
		this.$closeButton = this.$window.find("#nexusStoreCloseButton");
		this.shopEntries = [];
		this.itemBrought = false;

		this.rewardPreview = new NexusWindowItemPreview(this.$window);

		this.$closeButton.click(() => {
			if (this.itemBrought) {
				this.endShopSession();
			} else {
				displayOption("No Items Bought", "Continue without buying anything?", "Continue", "Cancel", () => {
					this.endShopSession();
				});
			}
		});
	}

	open() {
		super.open();

		if(!tutorial.state.nexusCraftingStation) {
			nexusTutorialController.startDungeonCraftingStationTutorial(
				this.$closeButton
			);
		}
	}

	close() {
		super.close();
		this.rewardPreview.reset();
	}

	endShopSession() {
		socket.sendCommand({
			type: "nexus",
			command: "end shop session",
		});
	}

	setupContent(artifacts, runeMods, currentFragmentCount, avatarDescriptions, maxThree) {
		this.$nexusStoreArtifactRow.html("");
		this.$nexusStoreRuneModRow.html("");
		this.shopEntries = [];
		this.itemBrought = false;
		if(artifacts.some((artifact) => artifact.brought) || runeMods.some((runeMod) => runeMod.brought)) {
			this.itemBrought = true;
		}

		artifacts.forEach((artifactInfo) => {
			let storeArtifact = new NexusStoreArtifact(artifactInfo, avatarDescriptions, this.rewardPreview, maxThree);
			storeArtifact.updateState(currentFragmentCount);
			this.$nexusStoreArtifactRow.append(storeArtifact.$body);
			this.shopEntries.push(storeArtifact);
		});

		runeMods.forEach((runeModInfo) => {
			let storeRuneMod = new NexusStoreRuneMod(runeModInfo, this.rewardPreview);
			storeRuneMod.updateState(currentFragmentCount);
			this.$nexusStoreRuneModRow.append(storeRuneMod.$body);
			this.shopEntries.push(storeRuneMod);
		});
	}

	itemBought(shopId, fragmentCount, avatarName, maxThree, unlockCount) {
		let targetArtifact = this.shopEntries.find((artifact) => artifact.shopId === shopId);
		targetArtifact.displayBought(avatarName);
		this.shopEntries.forEach((artifact) => {
			artifact.updateState(fragmentCount);
			if(maxThree && unlockCount >= 3) {
				artifact.removeTarget(avatarName);
			}
		});

		this.itemBrought = true;
	}

	displayShopVote(avatarName, shopId, voteIcon, gamePlayerId) {
		let targetEntry = this.shopEntries.find((entry) => entry.shopId === shopId);
		if (targetEntry) {
			this.shopEntries.forEach((entry) => entry.clearPlayerVote(gamePlayerId));
			targetEntry.displayVote(avatarName, voteIcon, gamePlayerId);
		}
	}
}

class NexusStoreArtifact extends NexusArtifactOptionBase {
	constructor({ name, fileName, description, shopId, price, brought, avatarName }, avatarDescriptions, rewardPreview, maxThree) {
		super({ name, fileName, description }, avatarDescriptions, rewardPreview, maxThree);
		this.$priceText = this.$body.find(".nexusStorePriceText");
		this.$priceContainer = this.$body.find(".nexusStorePrice");

		this.shopId = shopId;
		this.price = price;

		this.$priceText.text(this.price);
		this.$priceContainer.removeClass("hide");

		if(brought) {
			this.displayBought(avatarName);
		}
	}

	updateState(currentFragmentCount) {
		if (currentFragmentCount < this.price) {
			this.active = false;
			this.$body.addClass("unaffordable");
		} else {
			this.$body.removeClass("unaffordable");
		}
	}

	displayBought(avatarName) {
		this.$priceContainer.addClass("hide");
		this.$body.addClass("bought");
		this.active = false;
		let targetAvatar = this.getTagerAvatar(avatarName);
		if(targetAvatar) {
			this.selectAvatar(targetAvatar.$selectedImage, avatarName);
		}
		this.clearAllPlayerVotes();
	}

	handleAvatarSelect(avatarName) {
		socket.sendCommand({
			type: "nexus",
			command: "buy shop item",
			data: {
				shopId: this.shopId,
				avatarName,
			},
		});
	}

	selectAvatar($avatarImg, avatarName) {
		super.selectAvatar($avatarImg, avatarName);
		this.active = false;
	}
}

class NexusStoreRuneMod extends NexusOptionBase {
	constructor({ name, fileName, description, shopId, price, brought }, rewardPreview) {
		super({ name, fileName, description }, rewardPreview);
		this.$priceText = this.$body.find(".nexusStorePriceText");

		this.shopId = shopId;
		this.price = price;

		this.$priceText.text(this.price);

		this.$body.click(() => {
			socket.sendCommand({
				type: "nexus",
				command: "buy shop item",
				data: {
					shopId: this.shopId,
				},
			});
		});

		if(brought) {
			this.displayBought();
		}
	}

	createImgSrc(fileName) {
		return cdnFormater.newNexusRuneIconSrc(fileName);
	}

	createImgSrcSet(fileName) {
		return cdnFormater.newNexusRuneIconSrcSet(fileName);
	}

	updateState(currentFragmentCount) {
		if (currentFragmentCount < this.price) {
			this.active = false;
			this.$body.addClass("unaffordable");
		} else {
			this.$body.removeClass("unaffordable");
		}
	}

	displayBought() {
		this.$priceText.text("Bought");
		this.$body.addClass("bought");
		this.active = false;
	}
}
NexusStoreRuneMod.prototype.TEMPLATE = $("#nexusStoreRuneTemplate").html();
