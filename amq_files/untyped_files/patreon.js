"use strict";
/*exported patreon */

function Patreon() {
	this.$modal = $("#patreonModal");
	this.$content = $("#patreonModal .modal-body");
	this.linkedTemplate = $("#linkedPatreonTemplate").html();
	this.unlinkedTemplate = $("#unlinkedPatreonTemplate").html();
	this._emojiTab;

	this._patreonChangeListner;
	this.backerLevel = 0;
	this.delinked = false;

	this.$modal.on("show.bs.modal", function () {
		if (guestRegistrationController.isGuest) {
			displayMessage(
				"Unavailable for Guest Accounts",
				"Patreon features are unavailable for guest accounts"
			);
			this.$modal.modal("hide");
		}
	});

	// Work around for bug releating to SweetAlert2 input fields while modals are open
	this.$modal.on("shown.bs.modal", function () {
		$(document).off("focusin.modal");
	});
}

Patreon.prototype.setup = function (
	patreonId,
	backerLevel,
	badgeLevel,
	usersCustomEmojis,
	patreonBadgeInfo,
	desynced
) {
	this._patreonChangeListner = new Listener(
		"patreon changed",
		function (payload) {
			this.updateModalContent(
				payload.patreonId,
				payload.backerLevel,
				payload.badgeLevel,
				payload.patreonBadgeInfo.current,
				payload.patreonBadgeInfo.next,
				payload.usersCustomEmojis
			);
			nameChangeModal.updateTokenCount(payload.nameChangeTokens);
		}.bind(this)
	);
	this._patreonChangeListner.bindListener();
	this._desyncListener = new Listener(
		"patreon descyned",
		function () {
			this.setDelinked();
		}.bind(this)
	);
	this._desyncListener.bindListener();

	this._emojiTab = new EmojiPreviewTab();

	this.updateModalContent(
		patreonId,
		backerLevel,
		badgeLevel,
		patreonBadgeInfo.current,
		patreonBadgeInfo.next,
		usersCustomEmojis,
		desynced
	);
};

Patreon.prototype.updateModalContent = function (
	patreonId,
	backerLevel,
	badgeLevel,
	currentBadge,
	nextBadge,
	usersCustomEmojis,
	desynced
) {
	let htmlContent;
	if (patreonId) {
		let $htmlContent = $(
			format(
				this.linkedTemplate,
				patreonId,
				badgeLevel,
				cdnFormater.newBadgeSrc(currentBadge.fileName),
				cdnFormater.newBadgeSrcSet(currentBadge.fileName),
				currentBadge.name,
				currentBadge.unlockDescription,
				cdnFormater.newBadgeSrc(nextBadge.fileName),
				cdnFormater.newBadgeSrcSet(nextBadge.fileName),
				nextBadge.name,
				nextBadge.unlockDescription
			)
		);
		for (let i = 1; i <= backerLevel; i++) {
			$htmlContent.find(".lbEntry:nth-of-type(" + i + ")").addClass("active");
		}
		htmlContent = $htmlContent.html();

		this.backerLevel = backerLevel;

		if (desynced) {
			this.setDelinked();
		} else {
			this.$content.removeClass("delinked");
			this.delinked = false;
		}
	} else {
		htmlContent = this.unlinkedTemplate;

		this.backerLevel = 0;
	}

	this.$content.html(htmlContent);

	this._emojiTab.updateContent(usersCustomEmojis, backerLevel);
};

Patreon.prototype.unlinkPatreon = function () {
	socket.sendCommand({
		type: "patreon",
		command: "unlink patreon",
	});
};

Patreon.prototype.updatePatreonInfo = function () {
	if (this.delinked) {
		this.triggerOAuth(true);
	} else {
		socket.sendCommand({
			type: "patreon",
			command: "request update",
		});
	}
};

Patreon.prototype.triggerOAuth = function(relink) {
	window.open(
		"https://www.patreon.com/oauth2/authorize?response_type=code&client_id=" +
			PATREON_CLIENT_ID +
			"&scope=identity" +
			"&redirect_uri=" +
			PATREON_REDIRECT_URL + (relink ? "?relink=true" : ''),
		"",
		"width=500,height=750"
	);
};

Patreon.prototype.getCustomEmojis = function () {
	return this._emojiTab.getEmojiDescriptoins();
};

Patreon.prototype.getCustomEmoji = function (emojiId) {
	return this._emojiTab.getEmojiDescription(emojiId);
};

Patreon.prototype.msgContainsCustomEmoji = function(msg) {
	return this._emojiTab.emojiRegex && this._emojiTab.emojiRegex.test(msg);
};

Patreon.prototype.getEmojiFromName = function(name) {
	return this.getCustomEmojis().find(entry => entry.name === name);
};

Patreon.prototype.showModal = function () {
	this.$modal.modal("show");
};

Patreon.prototype.setDelinked = function () {
	displayMessage("Patreon Desynced", "Please relink your Patreon from the Patreon window");
	this.$content.addClass("delinked");
	this.delinked = true;
};

var patreon = new Patreon();
