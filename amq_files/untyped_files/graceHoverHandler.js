"use strict";
/*exported GraceHoverHandler*/

class GraceHoverHandler {
	constructor($element, openDelay, closeDelay, hoverHandler, leaveHandler) {
		this.openDelay = openDelay;
		this.closeDelay = closeDelay;
		this.hoverHandler = hoverHandler;
		this.leaveHandler = leaveHandler;
		this.$element = $element;

		this.displayed = false;
		this.openTimeout = null;
		this.closeTimeout = null;

		this.triggered = false;

		$element.hover(
			() => {
				this.triggerDisplay();
			},
			() => {
				this.hide();
			}
		);

		$element.on("mousemove", () => {
			if(!this.triggered) {
				this.triggerDisplay();
			}
		});
	}

	triggerDisplay() {
		this.triggered = true;
		clearTimeout(this.closeTimeout);
		this.closeTimeout = null;
		if (this.openTimeout) {
			clearTimeout(this.openTimeout);
		}
		if (this.displayed) {
			return;
		}
		this.openTimeout = setTimeout(() => {
			this.displayed = true;
			this.hoverHandler();
		}, this.openDelay);
	}

	hide() {
		clearTimeout(this.openTimeout);
		this.openTimeout = null;
		if (this.closeTimeout) {
			clearTimeout(this.closeTimeout);
		}
		this.closeTimeout = setTimeout(() => {
			this.displayed = false;
			this.leaveHandler();
		}, this.closeDelay);
		this.triggered = false;
	}

	destroy() {
		this.hide();
		this.$element.off("mouseenter mouseleave mousemove");
	}
}
