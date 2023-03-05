"use strict";
/*exported NexusAvatarStatusController*/

class NexusAvatarStatusController {
	constructor() {
		this.$statusContainer = $("#nexusAvatarStatusContainerOuter");
		this.entries = {};
		this.entryList = [];
	}

	addAvatar(avatarInfo) {
		let entry = new NexusAvatarStatusEntry(avatarInfo);
		this.$statusContainer.append(entry.$body);
		this.entries[entry.name] = entry;
		this.entryList.push(entry);
		entry.resizeName();
	}

	getAvatar(avatarName) {
		return this.entries[avatarName];
	}

	reset() {
		this.entries = {};
		this.entryList = [];
		this.$statusContainer.html("");
	}

	updateHp(name, newHp) {
		this.entries[name].updateHp(newHp);
	}

	updateCooldown(name, currentCooldown) {
		this.entries[name].currentCooldown = currentCooldown;
	}

	getAvatarDescriptions() {
		return this.entryList.map((entry) => entry.avatarDescription);
	}

	addArtifactToAvatar(avatarName, artifactInfo) {
		this.entries[avatarName].addArtifact(artifactInfo);
	}

	removeArtifactFromAvatar(avatarName, artifactName) {
		this.entries[avatarName].removeArtifact(artifactName);
	}
}

class NexusAvatarStatusEntry {
	constructor({ name, hp, maxHp, avatar, artifacts, baseStats, runeInfo, genreInfo, abilityInfo, statusDisplayName, badgeInfo }) {
		this.name = name;
		this.hp = hp;
		this.maxHp = maxHp;
		this.avatarInfo = avatar;
		this.currentCooldown = abilityInfo.currentCooldown;

		this.artifactMap = {};
		this.artifactGraceHoverMap = {};

		this.currentArtifactHeight = this.ARTIFACT_DEFAULT_SIZE;

		let targetName = statusDisplayName;

		this.$body = $(format(this.TEMPLATE, targetName, this.hp));
		this.$hpBar = this.$body.find(".naHpBar");
		this.$emptyMessage = this.$body.find(".naArtifactBarEmptyMessage");
		this.$artifactRow = this.$body.find(".naArtifactRow");
		this.$artifactRowInner = this.$body.find(".naArtifactRowInner");
		this.$image = this.$body.find(".naStatusAvatarImage");
		this.$hpText = this.$body.find(".naHpText");
		this.$nameContainer = this.$body.find(".naName");
		this.$name = this.$body.find(".naNameInner");


		let {avatarName, colorName, optionActive, optionName, outfitName} = avatar.avatar;

		let src = cdnFormater.newAvatarHeadSrc(avatarName, outfitName, optionName, optionActive, colorName);
		let srcSet = cdnFormater.newAvatarHeadSrcSet(avatarName, outfitName, optionName, optionActive, colorName);

		new PreloadImage(this.$image, src, srcSet);

		artifacts.forEach((artifact) => {
			this.addArtifact(artifact);
		});

		this.graceHover = new GraceHoverHandler(this.$image, 250, 50, () => {
			abilityInfo.currentCooldown = this.currentCooldown;
			nexusAvatarPopover.displayAvatar({ name, baseStats, runeInfo, genreInfo, abilityInfo, badgeInfo}, src, srcSet, this.$image, name);
		}, () => {
			nexusAvatarPopover.hide(name);
		});

		this.updateHpBar();

		$(window).resize(() => {
			if (Object.values(this.artifactMap).length > 0) {
				this.resetArtifactSize();
			}
		});
	}

	get hpPercent() {
		return (this.hp / this.maxHp) * 100;
	}

	get avatarDescription() {
		return {
			avatarInfo: this.avatarInfo,
			alive: this.hp > 0,
			artifactCount: this.artifactCount
		};
	}

	get artifactCount() {
		return Object.keys(this.artifactMap).length;
	}

	get artifacts() {
		return Object.values(this.artifactMap);
	}

	resizeName() {
		fitTextToContainer(this.$name, this.$nameContainer, 32, 10);
	}

	updateHp(newHp) {
		this.hp = newHp;
		this.updateHpBar();
		this.$hpText.text(newHp);
	}

	updateHpBar() {
		this.$hpBar.css("transform", `translateX(${100 - this.hpPercent}%)`);
		this.$hpBar.removeClass("hp50Percent hp20Percent");
		if (this.hpPercent <= 20) {
			this.$hpBar.addClass("hp20Percent");
		} else if (this.hpPercent <= 50) {
			this.$hpBar.addClass("hp50Percent");
		}
	}

	addArtifact({ name, fileName, description }) {
		let $artifact = $(this.ARTIFACT_TEMPLATE);
		new PreloadImage(
			$artifact,
			cdnFormater.newNexusArtifactIconSrc(fileName),
			cdnFormater.newNexusArtifactIconSrcSet(fileName),
			true,
			"30px"
		);

		this.artifactGraceHoverMap[name] = new GraceHoverHandler($artifact, 250, 50, () => {
			nexusArtifactPopover.displayArtifact({ name, fileName, description }, $artifact, name);
		}, () => {
			nexusArtifactPopover.hide(name);
		});

		this.$artifactRowInner.append($artifact);
		this.$emptyMessage.addClass("hide");
		
		this.artifactMap[name] = $artifact;
		this.resizeArtifacts();
	}

	artifactsLargerThanContainer() {
		return this.$artifactRowInner.height() > this.$artifactRow.height() + this.ARTIFACT_SIZE_GRACE;
	}

	resizeArtifacts() {
		let targetSize = this.currentArtifactHeight;
		while(this.artifactsLargerThanContainer() && targetSize > this.ARTIFACT_MIN_SIZE) {
			targetSize -= this.ARTIFACT_SIZE_STEP;
			this.$artifactRowInner.find(".naArtifact").css("height", targetSize);
		}
		this.currentArtifactHeight = targetSize;
	}
	
	resetArtifactSize() {
		this.$artifactRowInner.find(".naArtifact").css("height", this.ARTIFACT_DEFAULT_SIZE);
		this.currentArtifactHeight = this.ARTIFACT_DEFAULT_SIZE;
		this.resizeArtifacts();
	}

	removeArtifact(artifactName) {
		this.artifactGraceHoverMap[artifactName].destroy();
		this.artifactMap[artifactName].remove();
		delete this.artifactMap[artifactName];
		if(Object.keys(this.artifactMap).length === 0) {
			this.$emptyMessage.removeClass("hide");
		}
		this.resetArtifactSize();
	}
}
NexusAvatarStatusEntry.prototype.TEMPLATE = $("#nexusAvatarStatusBarTemplate").html();
NexusAvatarStatusEntry.prototype.ARTIFACT_TEMPLATE = "<img class='naArtifact'/>";
NexusAvatarStatusEntry.prototype.ARTIFACT_DEFAULT_SIZE = 30;
NexusAvatarStatusEntry.prototype.ARTIFACT_MIN_SIZE = 14;
NexusAvatarStatusEntry.prototype.ARTIFACT_SIZE_STEP = 2;
NexusAvatarStatusEntry.prototype.ARTIFACT_SIZE_GRACE = 10;
