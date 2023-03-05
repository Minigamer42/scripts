'use strict';
/*exported AudioElement*/

class AudioElement {
	constructor(src, loop, meanVolume) {
		this.howl = new Howl({
			preload: false,
			src: [src],
			loop,
			onload: () => {
				this.loaded = true;
				
				this.loadListeners.forEach(listener => listener());
				this.loadListeners = [];
			},
			onend: () => {
				this.endListener.forEach(listener => listener());
			},
		});
		this.loaded = false;
		this.activeId;

		this.loadListeners = [];
		this.endListener = [];
		this.meanVolume = meanVolume;
	}

	load(callback) {
		if(this.loaded) {
			callback();
		} else {
			this.howl.load();
			if(callback) {
				this.loadListeners.push(callback);
			}
		}
	}

	play(ownInstance) {
		if(ownInstance) {
			this.howl.play();
		} else {
			this.activeId = this.howl.play(this.activeId);
		}
	}

	pause() {
		this.howl.pause(this.activeId);
	}

	reset() {
		if(this.activeId) {
			this.howl.seek(0, this.activeId);
		}
	}
	
	stop() {
		if(this.activeId) {
			this.howl.stop(this.activeId);
		}
	}

	updateVolume(newVolume) {
		let targetVolume = equalizeVolume(newVolume, this.meanVolume);
		this.howl.volume(targetVolume);
	}

	fade(targetVolume, duration) {
		if(this.activeId) {
			targetVolume = equalizeVolume(targetVolume, this.meanVolume);
			this.howl.fade(this.howl.volume(), targetVolume, duration);
		}
	}
}