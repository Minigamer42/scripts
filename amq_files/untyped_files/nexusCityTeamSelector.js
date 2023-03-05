"use strict";
/* exported NexusCityTeamSetupTab*/

class NexusCityTeamSetupTab extends NexusCityWindowTab {
	constructor(window, $leftContainer, $rightContainer, $tab, $teamContainer, teamRowClass, avatarInfoDisplay) {
		super(window, $leftContainer, $rightContainer, $tab);

		this.$teamContainer = $teamContainer;

		this.teamRowClass = teamRowClass;
		this.avatarInfoDisplay = avatarInfoDisplay;

		this.teamMap = {};

		this.$leftContainer.perfectScrollbar({
			suppressScrollX: true,
		});
	}

	get currentTeamCount() {
		return Object.keys(this.teamMap).length;
	}

	show(noChangeHighlightTab) {
		super.show(noChangeHighlightTab);
		this.$leftContainer.perfectScrollbar("update");
		Object.values(this.teamMap).forEach((team) => {
			team.triggerLazyLoad();
		});
	}

	handleTeamAvatarSlotClick() {
		//Nothing by default
	}

	handleTeamClick() {
		//Nothing by default
	}

	handleTeamAvatarBadgeClick() {
		//Nothing by default
	}

	handleTeamAvatarSlotHover(slot) {
		if (slot.avatarInfo && this.avatarInfoDisplay) {
			this.avatarInfoDisplay.displayAvatar(slot.avatarInfo);
		}
	}

	addTeam(teamInfo) {
		let teamRow = new this.teamRowClass(teamInfo, this.window, this, this.$leftContainer, this.currentTeamCount + 1);
		this.$teamContainer.append(teamRow.$body);
		this.teamMap[teamRow.teamId] = teamRow;
	}

	setupTeams(teams) {
		this.$teamContainer.html("");
		this.teamMap = {};

		teams.forEach((team) => {
			this.addTeam(team);
		});
	}

	updateAvatarLevels(avatarInfoList) {
		Object.values(this.teamMap).forEach((team) => {
			team.updateAvatarLevels(avatarInfoList);
		});
	}
}

class NexusCityTeamRow {
	constructor({ teamId, name, avatars, badges }, window, tab, $container, teamNumber) {
		this.$body = $(format(this.TEMPLATE, name));

		this.teamId = teamId;
		this.name = name;
		this.$container = $container;
		this.window = window;

		let zIndex = 100 - teamNumber;
		this.$body.css("z-index", zIndex);

		this.slots = {
			1: new NexusCityTeamSlot(this.$body.find(".nciwTeamAvatar.slotOne"), teamId, 1, tab, this.editableBadge),
			2: new NexusCityTeamSlot(this.$body.find(".nciwTeamAvatar.slotTwo"), teamId, 2, tab, this.editableBadge),
			3: new NexusCityTeamSlot(this.$body.find(".nciwTeamAvatar.slotThree"), teamId, 3, tab, this.editableBadge),
			4: new NexusCityTeamSlot(this.$body.find(".nciwTeamAvatar.slotFour"), teamId, 4, tab, this.editableBadge),
		};

		this.updateAvatars(avatars);
		this.updateBadges(badges);

		this.$body.click(() => {
			tab.handleTeamClick(this);
		});
	}

	get editableBadge() {
		return false;
	}

	getTeamCharacterIds() {
		return Object.values(this.slots)
			.filter((slot) => slot.gotAvatar)
			.map((slot) => slot.characterId);
	}

	updateAvatars(avatars) {
		let avatarInSlotMap = {
			1: false,
			2: false,
			3: false,
			4: false,
		};
		avatars.forEach(({ avatarId, colorId, backgroundAvatarId, backgroundColorId, slot, optionActive }) => {
			avatarInSlotMap[slot] = true;
			if (this.slots[slot].checkNewAvatarDescription(avatarId, colorId, backgroundAvatarId, backgroundColorId)) {
				let avatarInfo = this.window.avatarSelectionTab.getAvatarInfo(avatarId);

				let avatarDescription = storeWindow.getAvatarFromAvatarId(avatarId).colorMap[colorId];
				let backgroundAvatarDescription =
					storeWindow.getAvatarFromAvatarId(backgroundAvatarId).colorMap[backgroundColorId];

				let { src, srcSet } = avatarDescription.getAvatarBaseSrcInfo(optionActive);

				avatarInfo.src = src;
				avatarInfo.srcSet = srcSet;
				avatarInfo.sizeModClass = avatarDescription.sizeModifierClass;
				avatarInfo.backgroundSrc = backgroundAvatarDescription.backgroundSrc;

				this.slots[slot].displayAvatar(avatarInfo, this.$container, this.$body);
			}
		});
		Object.keys(avatarInSlotMap)
			.filter((slot) => !avatarInSlotMap[slot])
			.forEach((slot) => {
				this.slots[slot].displayEmpty();
			});
	}

	updateBadges(badges) {
		let badgeInSlotMap = {
			1: false,
			2: false,
			3: false,
			4: false,
		};
		badges.forEach((badgeInfo) => {
			this.slots[badgeInfo.slot].updateBadge(badgeInfo);
			badgeInSlotMap[badgeInfo.slot] = true;
		});
		Object.keys(badgeInSlotMap)
			.filter((slot) => !badgeInSlotMap[slot])
			.forEach((slot) => {
				this.slots[slot].clearBadge();
			});
	}

	triggerLazyLoad() {
		Object.values(this.slots).forEach((slot) => {
			if (slot.preloadImage) {
				slot.preloadImage.lazyLoadEvent();
			}
		});
	}

	updateAvatarLevels(avatarInfoList) {
		Object.values(this.slots).forEach((slot) => {
			slot.updateAvatarLevel(avatarInfoList);
		});
	}
}
NexusCityTeamRow.prototype.TEMPLATE = $("#nciwAvatarTeamRowTemplate").html();

class NexusCityTeamSlot {
	constructor($body, teamId, slotId, tab, editableBadge) {
		this.$body = $body;
		this.$img = $body.find(".nciwTeamAvatarImage");
		this.$badgeContainer = $body.find(".nciwTeamAvatarSlotBadgeContainer");

		this.$emptyNumber = this.$body.find(".nciwTeamAvatarSlotNumberEmpty");
		this.$selectedNumber = this.$body.find(".nciwTeamAvatarSlotNumberSelected");

		this.editableBadge = editableBadge;

		if (this.editableBadge) {
			this.emptyBadge = new NexusBadgeEmpty(
				100,
				this.badgeClasses,
				"Select an avatar badge to power up this avatar",
				"#nexusCityInnWindow"
			);
			this.$badgeContainer.append(this.emptyBadge.$body);
			this.currentBadge = this.emptyBadge;
		} else {
			this.currentBadge = null;
		}
		this.badgeGraceHover = null;

		this.teamId = teamId;
		this.slotId = slotId;

		this.avatarInfo = null;

		this.preloadImage;

		this.$body.click(() => {
			tab.handleTeamAvatarSlotClick(this);
		});

		this.$body.hover(() => {
			tab.handleTeamAvatarSlotHover(this);
		});

		this.$badgeContainer.click((event) => {
			tab.handleTeamAvatarBadgeClick(this);
			event.stopPropagation();
		});
	}

	get badgeClasses() {
		if (this.editableBadge) {
			return ["clickAble"];
		} else {
			return [];
		}
	}

	get gotAvatar() {
		return this.avatarInfo != null;
	}

	get characterId() {
		if (this.gotAvatar) {
			let avatar = storeWindow.getAvatarFromAvatarId(this.avatarInfo.avatarId);
			return avatar.characterId;
		} else {
			return null;
		}
	}

	get gotBadge() {
		if (this.editableBadge) {
			return this.currentBadge != this.emptyBadge;
		} else {
			return this.currentBadge != null;
		}
	}

	checkNewAvatarDescription(avatarId, colorId, backgroundAvatarId, backgroundColorId) {
		return (
			!this.avatarInfo ||
			this.avatarInfo.avatarId !== avatarId ||
			this.avatarInfo.colorId !== colorId ||
			this.avatarInfo.backgroundAvatarId !== backgroundAvatarId ||
			this.avatarInfo.backgroundColorId !== backgroundColorId
		);
	}

	displayLoading() {
		this.avatarInfo = null;
		this.$img.addClass("loading");
		this.$img.removeClass("sizeMod0 sizeMod20 sizeMod51");
		this.$img.attr("src", PreloadImage.prototype.SPINNER_IMAGE.src);

		this.$emptyNumber.addClass("hide");
		this.$selectedNumber.removeClass("hide");
	}

	displayAvatar(avatarInfo, $lazyLoadContainer, $row) {
		this.avatarInfo = avatarInfo;

		if (this.preloadImage) {
			this.preloadImage.cancel();
		}

		this.preloadImage = new PreloadImage(
			this.$img,
			avatarInfo.src,
			avatarInfo.srcSet,
			false,
			null,
			() => {
				this.$img.removeClass("sizeMod0 sizeMod20 sizeMod51");
				this.$img.addClass(avatarInfo.sizeModClass);
			},
			false,
			$lazyLoadContainer,
			false,
			$row
		);

		this.$emptyNumber.addClass("hide");
		this.$selectedNumber.removeClass("hide");
		this.$badgeContainer.removeClass("hide");
	}

	updateBadge(badgeInfo) {
		let newBadge = new NexusBadge(badgeInfo.level, badgeInfo, 100, this.badgeClasses);
		this.clearBadgeContainer();
		this.$badgeContainer.append(newBadge.$body);
		this.$badgeContainer.removeClass("empty");
		this.currentBadge = newBadge;

		this.badgeGraceHover = new GraceHoverHandler(
			this.currentBadge.$body,
			150,
			50,
			() => {
				nexusBadgePopover.displayBadge(badgeInfo, this.$badgeContainer, badgeInfo.avatarId);
			},
			() => {
				nexusBadgePopover.hide(badgeInfo.avatarId);
			}
		);
	}

	clearBadge() {
		this.clearBadgeContainer();
		if (this.editableBadge) {
			this.$badgeContainer.append(this.emptyBadge.$body);
			this.currentBadge = this.emptyBadge;
		}
	}

	clearBadgeContainer() {
		if (this.editableBadge && this.currentBadge === this.emptyBadge) {
			this.emptyBadge.detatch();
		}
		this.$badgeContainer.html("");
		this.$badgeContainer.addClass("empty");
		if (this.badgeGraceHover) {
			this.badgeGraceHover.destroy();
			this.badgeGraceHover = null;
		}
	}

	updateAvatarLevel(avatarInfoList) {
		if (this.avatarInfo) {
			let avatarInfo = avatarInfoList.find((avatarInfo) => avatarInfo.avatarId === this.avatarInfo.avatarId);
			if (avatarInfo) {
				this.avatarInfo.level = avatarInfo.level;
			}
		}
	}

	displayEmpty() {
		this.avatarInfo = null;
		if (this.preloadImage) {
			this.preloadImage.cancel();
			this.preloadImage = null;
		}
		this.$img.removeClass("sizeMod0 sizeMod20 sizeMod51");
		this.$img.attr("src", "");
		this.$img.attr("srcset", "");

		this.$emptyNumber.removeClass("hide");
		this.$selectedNumber.addClass("hide");
		this.$badgeContainer.addClass("hide");
	}
}
