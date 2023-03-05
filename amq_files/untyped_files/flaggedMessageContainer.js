"use strict";
/*exported FlaggedMessageContainer*/

class FlaggedMessageContainer {
	constructor() {
		this.$container = $("#qpModFlaggedMessageContainer");
		this.$contentContainer = this.$container.find("#qpModFlaggedMessageContainerMessages");
		this.$counter = this.$container.find("#qpModFlaggedMessageCount");
		this.$displayButton = this.$container.find("#qpModFlaggedMessagesIcon");
		this.$clearAllButton = this.$container.find('#qpModFlaggedMessageClearAll');

		this.entryMap = {};

		this.$contentContainer.perfectScrollbar({
			suppressScrollX: true,
			wheelSpeed: 0.5,
		});

		this.$displayButton.click(() => {
			this.toggleDisplay();
		});

		this.$clearAllButton.click(() => {
			this.clear();
		});
	}

	show() {
		this.$container.removeClass("hide");
	}

	hide() {
		this.$container.addClass("hide");
	}

	toggleDisplay() {
		if (this.$container.hasClass("open")) {
			this.$container.removeClass("open");
		} else {
			this.$container.addClass("open");
		}
	}

	addEntry({ messagePayload, rankedChatBanState, rankedChatBanTime }) {
		let entry = new FlaggedMessageContainerEntry(messagePayload, rankedChatBanState, rankedChatBanTime, this);
		this.$contentContainer.append(entry.$html);
		if (this.entryMap[entry.messageId]) {
			this.entryMap[entry.messageId].remove();
		}
		this.entryMap[entry.messageId] = entry;
		this.$contentContainer.perfectScrollbar("update");
		this.updateCount();
	}

	removeEntry(messageId) {
		this.entryMap[messageId].remove();
		delete this.entryMap[messageId];
		this.$contentContainer.perfectScrollbar("update");
		this.updateCount();
	}

	updateCount() {
		let count = Object.values(this.entryMap).filter(entry => entry.active).length;
		this.$counter.text(count);
	}

	setMessageWarned(messageId) {
		if(this.entryMap[messageId]) {
			this.entryMap[messageId].showResult('Warning');
			this.updateCount();
		}
	}

	setMessageBanned(messageId) {
		if(this.entryMap[messageId]) {
			this.entryMap[messageId].showResult('Banned');
			this.updateCount();
		}
	}

	clear() {
		Object.values(this.entryMap).forEach((entry) => {
			entry.remove();
		});
		this.entryMap = {};
		this.$contentContainer.perfectScrollbar("update");
		this.updateCount();
	}
}

class FlaggedMessageContainerEntry {
	constructor({ sender, message, messageId, emojis }, rankedChatBanState, rankedChatBanTime, controller) {
		this.$html = $(format(this.TEMPLATE, sender, passChatMessage(message, emojis)));
		this.$warnButton = this.$html.find(".qpModFlaggedMessageButtonWarn");
		this.$banButton = this.$html.find(".qpModFlaggedMessageButtonBan");
		this.$resultContainer = this.$html.find(".qpModFlaggedMessageResult");
		this.$resultText = this.$html.find(".qpModFlaggedMessageResult > div");

		this.messageId = messageId;
		this.controller = controller;
		this.active = true;

		this.$html.find(".qpModFlaggedMessageName").popover({
			content: `Ranked Chat Ban Count: ${rankedChatBanState}. Last Ban: ${rankedChatBanTime}`,
			delay: 50,
			container: "#qpModFlaggedMessageContainer",
			placement: "auto",
			trigger: "hover",
		});

		this.$html.find(".close").click(() => {
			this.controller.removeEntry(this.messageId);
		});

		this.$warnButton.click(() => {
			swal({
				title: `Send Warning to ${sender}`,
				input: 'text',
				inputPlaceholder: 'Warning Message',
				showCancelButton: true,
				confirmButtonText: 'Send'
			}).then(result => {
				if (result.value != undefined) {
					if(result.value) {
						socket.sendCommand({
							type: "lobby",
							command: "message flag warning",
							data: {
								messageId: messageId,
								warning: result.value,
								playerName: sender,
							},
						});
					} else {
						displayMessage("A Message Must be Provided");
					}
				}
			});
		});

		this.$banButton.click(() => {
			swal({
				title: `Ranked Chat Ban ${sender}`,
				input: 'text',
				inputPlaceholder: 'Reason',
				showCancelButton: true,
				confirmButtonText: 'Ban'
			}).then(result => {
				if (result.value != undefined) {
					if(result.value) {
						socket.sendCommand({
							type: "lobby",
							command: "message flag ban",
							data: {
								messageId: messageId,
								reason: result.value,
								playerName: sender,
							},
						});
					} else {
						displayMessage("A Reason Must be Provided");
					}
				}
			});
		});
	}

	showResult(text) {
		this.$warnButton.addClass('hide');
		this.$banButton.addClass('hide');
		this.$resultText.text(text);
		this.$resultContainer.removeClass('hide');
		this.active = false;
	}

	remove() {
		this.$html.remove();
	}
}

FlaggedMessageContainerEntry.prototype.TEMPLATE = $("#modFlaggedMessageEntryTemplate").html();
