"use strict";
/*exported AudioLoopElementChain*/

class AudioLoopElementChain {
	constructor(introSource, bodySrc, meanVolume) {
		this.introElement = new AudioElement(introSource, false, meanVolume);
		this.bodyElement = new AudioElement(bodySrc, true, meanVolume);

		this.inBody = false;
		this.stopped = true;

		this.introElement.endListener.push(() => {
			if(!this.stopped) {
				this.bodyElement.play();
			}
			this.inBody = true;
		});
	}

	get loaded() {
		return this.introElement.loaded && this.bodyElement.loaded;
	}

	get activeElement() {
		return this.inBody ? this.bodyElement : this.introElement;
	}

	load(callback) {
		if (this.loaded) {
			callback();
		} else {
			[this.introElement, this.bodyElement].forEach((element) => {
				if (!element.loaded) {
					element.load(() => {
						if (this.loaded) {
							callback();
						}
					});
				}
			});
		}
	}

	play() {
		this.stopped = false;
		this.activeElement.play();
	}

	pause() {
		this.stopped = true;
		this.bodyElement.pause();
		this.introElement.pause();
	}

	reset() {
		this.bodyElement.reset();
		this.introElement.reset();
		this.inBody = false;
		this.stopped = true;
	}

	stop() {
		this.bodyElement.stop();
		this.introElement.stop();
		this.inBody = false;
		this.stopped = true;
	}

	updateVolume(newVolume) {
		this.bodyElement.updateVolume(newVolume);
		this.introElement.updateVolume(newVolume);
	}

	fade(targetVolume, duration) {
		this.bodyElement.fade(targetVolume, duration);
		this.introElement.fade(targetVolume, duration);
		if(targetVolume === 0) {
			this.stopped = true;
		} else {
			this.stopped = false;
		}
	}
}
