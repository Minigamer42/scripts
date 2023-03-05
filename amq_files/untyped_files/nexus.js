"use strict";
/*exported nexus NEXUS_EVENTS NEXUS_RUNE_TYPES NEXUS_RUNE_CATEGORIES NEXUS_RUNE_LEVELS NEXUS_HIT_EFFECT_IDS*/

const NEXUS_EVENTS = {
	DAMAGE: "damage",
	ENEMY_STATE: "enemyState",
	ENEMY_TARGET: "enemyTarget",
	SWAP_TARGET: "swapTarget",
	NEW_TURN_AVATAR: "newTurnAvatar",
	SWAP_AVATARS: "swapAvatars",
	PLAYER_TARGET: "playerTarget",
	AVATAR_STATE: "avatarState",
	PRE_PLAY: "preplay",
	ABILITY_ENABLED_CHANGE: "abilityEnabledChange",
	ANIME_NAME_HINT: "animeNameHint",
	ABILITY_COOLDOWN_CHANGE: "abilityCooldownChane",
	NEW_BUFF: "newBuff",
	BUFF_UPDATE: "buffUpdate",
	BUFF_END: "buffEnd",
	HP_CHANGE: "hpChange",
	DISPLAY_AVATAR_OVERLAY: "displayAvatarOverlay",
	REMOVE_AVATAR_OVERLAY: "removeAvatarOverlay",
	DISABLED_ACTION: "disabledAction",
	QUEUE_EVENT: "queueEvent",
	DELAY_EVENT: "delayEvent",
	HEAL_EVENT: "heal",
	FLASH_ICON: "flashIcon",
	SHIELD_UPDATE: "shieldUpdate",
	HIDE_GENRE: "hideGenre",
	SHOW_GENRE: "showGenre",
	SONG_INFO_HINT: "songInfoHint",
	PLAY_SFX: "playSFX",
	COMABT_TUTORIAL: "combatTutorial",
	SET_CLONE_EFFECT: "setCloneEffect",
	REMOVE_CLONE_EFFECT: "removeCloneEffect",
};

const NEXUS_RUNE_TYPES = {
	STANDARD: 1,
	ADVANCED: 2,
};
const NEXUS_RUNE_CATEGORIES = {
	OFFENSIVE: 1,
	DEFENSIVE: 2,
};
const NEXUS_RUNE_LEVELS = {
	MINOR: 1,
	LESSER: 2,
	GREATOR: 3,
	MAJOR: 4,
	SUPERIOR: 5,
};

const NEXUS_HIT_EFFECT_IDS = {
	SHAKE: 1,
	PUSH: 2,
	PUSH_ONE_WAY: 3,
};

class Nexus {
	constructor() {
		this.$view = $("#nexus");

		this.$loadingScreen = $("#nexusLoadingScreen");

		this.staticMainCanvas;
		this.animatedMainCanvas;
		this.mapController;
		this.cityController;
		this.statBaseMax;

		this._nexusMapInitListener = new Listener("nexus map init", () => {
			this.changeToDungeon();
		});
		this._nexusMapInitListener.bindListener();
	}

	get inNexusLobby() {
		return this.cityController.dungeonSelectionWindow.dungeonSetupTab.inLobby;
	}

	get inCoopLobby() {
		return this.cityController.dungeonSelectionWindow.dungeonSetupTab.coopLobby;
	}

	get inNexusGame() {
		return this.mapController.active;
	}

	setup(statBaseMax, nexusBuffs) {
		this.mapController = new NexusMapController();
		this.cityController = new NexusCity(statBaseMax);
		this.statBaseMax = statBaseMax;

		let tileIconInfoList = ["enemy", "boss", "entrance", "event", "store"].map((name) => {
			return {
				name,
				src: cdnFormater.newNexusTileIconSrc(name),
			};
		});
		imageBuffer.setupImagesInBuffer("nexusTileIcons", tileIconInfoList);

		nexusBuffs.forEach((buffInfo) => {
			nexusPopoverExtendedDescriptions.addBuffDescription(buffInfo);
		});

		let dungeonBgInfoList = [
			"standard",
			"comedy",
			"action",
			"adventure",
			"fantasy",
			"drama",
			"sci-fi",
			"romance",
			"slice of life",
			"supernatural",
			"mecha",
			"ecchi",
			"mystery",
			"sports",
			"music",
			"horror",
			"psychological",
			"mahou shoujo",
			"thriller",
		].map((name) => {
			return {
				name,
				src: cdnFormater.newNexusDungeonBackgroundSrc(name),
			};
		});
		imageBuffer.setupImagesInBuffer("nexusDungeonBG", dungeonBgInfoList);

		let nexusCityDayInfoList = [
			"arena",
			"base-city",
			"building-1",
			"building-2",
			"cafe",
			"clouds",
			"guild-hall",
			"inn",
			"lab",
			"sky",
			"skyline",
			"tower",
		].map((name) => {
			return {
				name,
				src: cdnFormater.newNexusCityDaySrc(name),
			};
		});
		imageBuffer.setupImagesInBuffer("nexusCityDay", nexusCityDayInfoList);

		let dungeonOstAudioGroup = audioController.getGroup("nexusDungeonOst");
		dungeonOstAudioGroup.addElement(
			"standard",
			new AudioLoopElementChain(
				cdnFormater.newNexusDungeonOstSrc("standard-intro"),
				cdnFormater.newNexusDungeonOstSrc("standard-loop"),
				-18
			)
		);

		let cityOstAudioGroup = audioController.getGroup("cityOstGroup");
		cityOstAudioGroup.addElement(
			"day",
			new AudioLoopElementChain(
				cdnFormater.newNexusCityOstSrc("city-day-intro"),
				cdnFormater.newNexusCityOstSrc("city-day-loop"),
				-19
			)
		);
	}

	changeToDungeon() {
		this.cityController.hide();
		this.cityController.fadeOutOst();
		this.mapController.show();
		this.mapController.initMap();
	}

	changeToNexus() {
		this.mapController.hide();
		this.cityController.show();
		this.cityController.init();
		this.mapController.closeMap();
	}

	openView(callback, arg) {
		this.$view.removeClass("hide");

		imageBuffer.loadCategory("nexusTileIcons");
		imageBuffer.loadCategory("nexusCityDay");

		if (!arg.rejoin) {
			if (arg.activeNexusSession) {
				this.mapController.initMap(arg.activeNexusSession);
			} else {
				this.cityController.show();
				this.cityController.init();
			}
		}

		callback();
	}

	closeView(args) {
		if (!args.keepNexusOpen) {
			this.$view.addClass("hide");
			if(!args.activeNexusSession && !args.nexusClose) {
				this.cityController.hide();
			}
		}
	}

	displayLoading() {
		this.$loadingScreen.addClass("display");
	}

	hideLoading() {
		this.$loadingScreen.removeClass("display");
	}
}

var nexus = new Nexus();
