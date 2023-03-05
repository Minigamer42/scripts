"use strict";
/*exported audioController */

class AudioController {
	constructor() {
		this.audioGroups = {
			nexusDungeonOst: new AudioGroup(),
			cityOstGroup: new AudioGroup(),
			nexusSfx: new AudioGroup(),
		};

		this.nexusMasterVolume = 100;
	}

	getGroup(name) {
		return this.audioGroups[name];
	}

	updateNexusMasterVolume(newValue) {
		this.nexusMasterVolume = newValue;
		Object.values(this.audioGroups).forEach((group) => group.updateVolumes());
	}

	updateNexusOSTVolume(newValue) {
		this.audioGroups.nexusDungeonOst.updateLocaleVolume(newValue);
	}

	updateCityOSTVolume(newValue) {
		this.audioGroups.cityOstGroup.updateLocaleVolume(newValue);
	}

	updateNexusSfxVolume(newValue) {
		this.audioGroups.nexusSfx.updateLocaleVolume(newValue);
	}

	updateAllVolumesToNewMean() {
		Object.values(this.audioGroups).forEach((group) => group.updateVolumes());
	}
}

class AudioGroup {
	constructor() {
		this.elements = {};

		this.localeVolume = 100;
		this.fadePercent = 0;
	}

	get volume() {
		return ((this.localeVolume * (audioController.nexusMasterVolume / 100)) / 100) * ((100 - this.fadePercent) / 100);
	}

	addElement(name, element) {
		this.elements[name] = element;
		element.updateVolume(this.volume);
	}

	addDynamicBufferElement(name, src, loop, meanVolume, bufferCallback = () => {}) {
		if(this.elements[name]) {
			this.elements[name].load(bufferCallback);
		} else {
			let element = new AudioElement(src, loop, meanVolume);
			this.addElement(name, element);
			element.load(bufferCallback);
		}
	}

	waitLoad(callback) {
		let elementList = Object.values(this.elements);
		let targetCount = elementList.length;
		let currentCount = 0;
		elementList.forEach((element) => {
			element.load(() => {
				currentCount++;
				if (targetCount >= currentCount) {
					callback();
				}
			});
		});
	}

	playTrack(name, ownInstance) {
		this.elements[name].play(ownInstance);
	}

	resetAll() {
		this.fadePercent = 0;
		Object.keys(this.elements).forEach((name) => this.stopTrack(name));
		this.updateVolumes();
	}

	stopTrack(name) {
		this.elements[name].stop();
	}

	updateLocaleVolume(newVolume) {
		this.localeVolume = newVolume;
		this.updateVolumes();
	}

	updateVolumes() {
		let targetVolume = this.volume;
		Object.values(this.elements).forEach((element) => element.updateVolume(targetVolume));
	}

	fadeTrack(name, fadePercent, duration) {
		this.fadePercent = fadePercent;
		this.elements[name].fade(this.volume, duration);
	}

	pauseTrack(name) {
		this.elements[name].pause();
	}

	trackReady(name) {
		return this.elements[name] && this.elements[name].loaded;
	}
}

var audioController = new AudioController();
