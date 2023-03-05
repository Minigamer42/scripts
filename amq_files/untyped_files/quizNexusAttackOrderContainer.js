'use strict';
/*exported QuizNexusAttackOrderContainer*/

class QuizNexusAttackOrderContainer {
	constructor() {
		this.$container = $("#qpNexusAttackOrderContainerInner");
	}

	addIcon(icon) {
		icon.detach();
		this.$container.prepend(icon.$body);
	}

	reset() {
		this.$container.html("");
	}
}