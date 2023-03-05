'use strict';
/*exported RGB*/

class RGB {
	constructor(r = 0, g = 0, b = 0, opacity = 1) {
		this.r = r;
		this.g = g;
		this.b = b;
		this.opacity = opacity;
	}

	get string() {
		return `rgb(${this.r}, ${this.g}, ${this.b}, ${this.opacity})`;
	}

	clone() {
		return new RGB(this.r, this.g, this.b, this.opacity);
	}
}