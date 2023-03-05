"use strict";
/*exported NexusMapRewardWindow*/

class NexusMapRewardWindow extends NexusDungeonBaseWindow {
	constructor() {
		super($("#nexusMapRewardContainer"));
		this.$closeButton = this.$window.find("#nexusMapRewardCloseButton");
		this.$fragmentCounter = this.$window.find("#nexusMapRewardFragmentCount");
		this.$artifactRow = this.$window.find("#nexusMapRewardArtifactRow");
		this.$runeModRow = this.$window.find("#nexusMapRewardRuneModRow");
		this.$runeModNoDropText = this.$window.find("#nexusMapRewardNoRuneModText");
		this.$runeCounter = this.$window.find("#nexusMapRewardRuneCounter");
		this.$runeCounterText = this.$runeCounter.find("div");

		this.rewardPreview = new NexusWindowItemPreview(this.$window);

		this.currentArtifacts = [];
		this.currentRuneMods = [];

		this.$closeButton.click(() => {
			let targetArtifactsInfo = this.getSelectedArtifactsInfo();
			if (this.currentArtifacts.length === 0) {
				socket.sendCommand({
					type: "nexus",
					command: "close artifact reward",
				});
			} else if (targetArtifactsInfo.length) {
				socket.sendCommand({
					type: "nexus",
					command: "select artifact reward",
					data: {
						artifacts: targetArtifactsInfo,
					},
				});
			} else {
				displayOption("Skip Artifact?", null, "Skip", "Cancel", () => {
					socket.sendCommand({
						type: "nexus",
						command: "select artifact reward",
						data: {
							artifacts: [],
						},
					});
				});
			}
		});

		this._nexusHighlightArtifactReward = new Listener(
			"nexus highlight artifact reward",
			({ avatarName, artifactName }) => {
				this.highlightTargetArtifact(artifactName, avatarName);
			}
		);
		this._nexusHighlightArtifactReward.bindListener();

		this._nexusCloseArtifactReward = new Listener("nexus close artifact reward", () => {
			this.close();
		});
		this._nexusCloseArtifactReward.bindListener();
	}

	set fragments(newValue) {
		this.$fragmentCounter.text(newValue);
	}

	open() {
		super.open();
		if(!tutorial.state.nexusDungeonRewards) {
			nexusTutorialController.startDungeonRewardsTutorial(
				this.$fragmentCounter,
				this.$artifactRow,
				this.$runeModRow,
				this.$closeButton
			);
		}
	}

	close() {
		super.close();
		this.rewardPreview.reset();
		this.currentArtifacts.forEach((artifact) => artifact.clearAllPlayerVotes());
	}

	highlightTargetArtifact(artifactName, avatarName) {
		let targetArtifact = this.currentArtifacts.find((artifact) => artifact.name === artifactName);
		if (targetArtifact) {
			targetArtifact.highlightAvatar(avatarName);
		}
	}

	displayArtifacts(artifacts, avatarDescriptions, soloReward, maxThree) {
		this.currentArtifacts.forEach((artifact) => artifact.remove());

		this.currentArtifacts = artifacts.map(
			(artifactInfo) =>
				new NexusArtifactRewardOption(artifactInfo, avatarDescriptions, this, soloReward, this.rewardPreview, maxThree)
		);
		this.currentArtifacts.forEach((rewardOption) => {
			this.$artifactRow.append(rewardOption.$body);
		});
	}

	displayRuneMods(runeMods) {
		this.currentRuneMods.forEach((entry) => entry.remove());
		if (runeMods.length) {
			this.$runeCounterText.text(runeMods.length + " rune" + (runeMods.length === 1 ? "" : "s"));
			this.$runeCounter.removeClass("hide");
			this.$runeModNoDropText.addClass("hide");
		} else {
			this.$runeCounter.addClass("hide");
			this.$runeModNoDropText.removeClass("hide");
		}
		this.currentRuneMods = runeMods.map(({ name, fileName, description }) => {
			let entry = new NexusRuneModReward(name, fileName, description, this.rewardPreview);
			this.$runeModRow.append(entry.$body);
			return entry;
		});
	}

	clearAllArtifactSelections() {
		this.currentArtifacts.forEach((artifact) => artifact.clearSelection());
	}

	getSelectedArtifactsInfo() {
		return this.currentArtifacts
			.filter((artifact) => artifact.selectedAvatar !== null)
			.map((artifact) => {
				return {
					artifactName: artifact.name,
					avatarName: artifact.selectedAvatar,
				};
			});
	}

	displayArtifactVote(avatarName, artifactName, voteIcon, gamePlayerId) {
		let targetArtifact = this.currentArtifacts.find((artifact) => artifact.name === artifactName);
		if (targetArtifact) {
			this.currentArtifacts.forEach((artifact) => artifact.clearPlayerVote(gamePlayerId));
			targetArtifact.displayVote(avatarName, voteIcon, gamePlayerId);
		}
	}
}
class NexusOptionBase {
	constructor({ name, fileName, description }, rewardPreview) {
		this.name = name;
		this.$body = $(this.TEMPLATE);
		this.$img = this.$body.find(".nexusMapRewardArtifactImage");
		this.$voteContainer = this.$body.find(".nexusMapRewardArtifactHighlightContainer");

		this.active = true;
		this.voteHighlights = {};

		let imgSrc = this.createImgSrc(fileName);
		let imgSrcSet = this.createImgSrcSet(fileName);

		this.imagePreload = new PreloadImage(this.$img, imgSrc, imgSrcSet, true, "100px");

		this.$body.hover(() => {
			rewardPreview.displayItem(name, description, imgSrc, imgSrcSet);
		});
	}

	createImgSrc() {
		throw new Error("Should be implemented by subclass");
	}

	createImgSrcSet() {
		throw new Error("Should be implemented by subclass");
	}

	remove() {
		this.$body.remove();
	}

	displayVote(avatarName, voteIcon, gamePlayerId) {
		let $row = $(this.VOTE_ROW_TEMPLATE);
		voteIcon.detach();
		$row.append(voteIcon.$icon);
		this.voteHighlights[gamePlayerId] = $row;
		this.$voteContainer.append($row);
	}

	clearPlayerVote(gamePlayerId) {
		let $row = this.voteHighlights[gamePlayerId];
		if ($row) {
			$row.detach();
			delete this.voteHighlights[gamePlayerId];
		}
	}

	clearAllPlayerVotes() {
		Object.values(this.voteHighlights).forEach(($row) => $row.detach());
		this.voteHighlights = {};
	}
}
NexusOptionBase.prototype.VOTE_ROW_TEMPLATE = '<div class="nexusMapRewardArtifactHighlight"></div>';

class NexusArtifactOptionBase extends NexusOptionBase {
	constructor({ name, fileName, description }, avatarDescriptions, rewardPreview, maxThree) {
		super({ name, fileName, description }, rewardPreview);
		this.$avatarTargetContainer = this.$body.find(".nexusMapRewardArtifactTargetContainer");
		this.$selectedAvatarContainer = this.$body.find(".nexusMapRewardArtifactSelectedTarget");

		this.selectedAvatar = null;
		this.targetsShown = false;
		this.artifactName = name;

		if (maxThree) {
			avatarDescriptions = avatarDescriptions.filter((description) => description.artifactCount < 3);
		}

		this.avatarTargets = avatarDescriptions.map((description) => {
			let target = new NexusArtifactRewardAvatarTarget(description.avatarInfo.avatar, (avatarName) => {
				this.handleAvatarSelect(avatarName);
				this.hideTargetContainer();
			});

			this.$avatarTargetContainer.append(target.$body);
			return target;
		});

		this.hideHandlerFunction = this.hideTargetContainer.bind(this);

		this.$body.click((event) => {
			if (!this.active) {
				return;
			}
			if (this.targetsShown) {
				event.stopPropagation();
			} else {
				this.clearSelection();
				this.displayTargetContainer();
			}
		});
	}

	createImgSrc(fileName) {
		return cdnFormater.newNexusArtifactIconSrc(fileName);
	}

	createImgSrcSet(fileName) {
		return cdnFormater.newNexusArtifactIconSrcSet(fileName);
	}

	displayTargetContainer() {
		if (!this.targetsShown) {
			this.$avatarTargetContainer.removeClass("hide");
			$(document).click(this.hideHandlerFunction);
			//Set the flag after the click event have resolved, to avoid triggering the hide function.
			setTimeout(() => {
				this.targetsShown = true;
			}, 1);
		}
	}

	hideTargetContainer() {
		if (this.targetsShown) {
			this.$avatarTargetContainer.addClass("hide");
			$(document).off("click", this.hideHandlerFunction);
			this.targetsShown = false;
		}
	}

	highlightAvatar(avatarName) {
		let targetAvatar = this.getTagerAvatar(avatarName);
		if (targetAvatar) {
			this.selectAvatar(targetAvatar.$selectedImage, avatarName);
		}
	}

	getTagerAvatar(avatarName) {
		return this.avatarTargets.find((target) => target.name === avatarName);
	}

	removeTarget(avatarName) {
		let targetAvatar = this.getTagerAvatar(avatarName);
		if (targetAvatar) {
			targetAvatar.remove();
			this.avatarTargets = this.avatarTargets.filter((target) => target.name !== avatarName);
		}
	}

	handleAvatarSelect(avatarName) {
		socket.sendCommand({
			type: "nexus",
			command: "highlight artifact reward",
			data: {
				avatarName,
				artifactName: this.artifactName,
			},
		});
	}

	selectAvatar($avatarImg, avatarName) {
		if (this.soloReward) {
			this.rewardWindow.clearAllArtifactSelections();
		}
		this.$selectedAvatarContainer.html("");
		this.$selectedAvatarContainer.append($avatarImg);
		this.$selectedAvatarContainer.removeClass("hide");
		this.selectedAvatar = avatarName;
		this.hideTargetContainer();
	}

	clearSelection() {
		this.$selectedAvatarContainer.addClass("hide");
		this.selectedAvatar = null;
	}

	displayVote(avatarName, voteIcon, gamePlayerId) {
		let targetAvatar = this.getTagerAvatar(avatarName);
		if (targetAvatar) {
			super.displayVote(avatarName, voteIcon, gamePlayerId);
			let $img = $("<img class='nexusMapRewardArtifactHighlightAvatarImage' sizes='30px'></div>");
			$img.attr("srcset", targetAvatar.preloadImage.img.srcset);
			$img.attr("src", targetAvatar.preloadImage.img.src);

			let $row = this.voteHighlights[gamePlayerId];
			$row.append($img);
		}
	}
}
NexusArtifactOptionBase.prototype.TEMPLATE = $("#nexusArtifactRewardTemplate").html();

class NexusArtifactRewardOption extends NexusArtifactOptionBase {
	constructor({ name, fileName, description }, avatarDescriptions, rewardWindow, soloReward, rewardPreview, maxThree) {
		super({ name, fileName, description }, avatarDescriptions, rewardPreview, maxThree);

		this.rewardWindow = rewardWindow;
		this.soloReward = soloReward;
	}
}

class NexusArtifactRewardAvatarTarget {
	constructor({ avatarName, outfitName, optionName, optionActive, colorName }, clickHandler) {
		this.name = avatarName;
		this.$body = $(this.TEMPLATE);
		this.$img = this.$body.find(".nexusMapRewardArtifactTargetImg");
		new PreloadImage(
			this.$img,
			cdnFormater.newAvatarHeadSrc(avatarName, outfitName, optionName, optionActive, colorName),
			cdnFormater.newAvatarHeadSrcSet(avatarName, outfitName, optionName, optionActive, colorName),
			true,
			"40px"
		);

		this.$selectedImage = $(this.SELECTED_ICON_TEMPLATE);

		this.preloadImage = new PreloadImage(
			this.$selectedImage,
			cdnFormater.newAvatarHeadSrc(avatarName, outfitName, optionName, optionActive, colorName),
			cdnFormater.newAvatarHeadSrcSet(avatarName, outfitName, optionName, optionActive, colorName),
			true,
			"40px"
		);

		this.$body.click((event) => {
			clickHandler(avatarName);
			event.stopPropagation();
		});
	}

	remove() {
		this.$body.remove();
	}
}
NexusArtifactRewardAvatarTarget.prototype.TEMPLATE =
	"<div class='nexusMapRewardArtifactTarget'><img class='nexusMapRewardArtifactTargetImg'></div>";
NexusArtifactRewardAvatarTarget.prototype.SELECTED_ICON_TEMPLATE =
	"<img class='nexusMapRewardArtifactSelectedTargetImg'/>";

class NexusRuneModReward {
	constructor(name, fileName, description, rewardPreview) {
		this.$body = $(format(this.TEMPLATE, name));
		this.$img = this.$body.find(".nexusMapRewardRuneModImg");

		let imgSrc = cdnFormater.newNexusRuneIconSrc(fileName);
		let imgSrcSet = cdnFormater.newNexusRuneIconSrcSet(fileName);

		this.imagePreload = new PreloadImage(this.$img, imgSrc, imgSrcSet, true, "80px");

		this.$body.hover(() => {
			rewardPreview.displayItem(name, description, imgSrc, imgSrcSet);
		});
	}

	remove() {
		this.$body.remove();
	}
}

NexusRuneModReward.prototype.TEMPLATE = $("#nexusRuneModRewardTemplate").html();
