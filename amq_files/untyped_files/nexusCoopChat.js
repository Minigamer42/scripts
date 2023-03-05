"use strict";
/*exported nexusCoopChat*/

class NexusCoopChat {
	constructor() {
		this.$container = $("#nexusCoopContainer");
		this.$chatContainer = this.$container.find("#nexusCoopChatContainer");
		this.$chatMessageContainer = this.$container.find("#nexusCoopChatContainerInner");
		this.$chatInput = this.$container.find("#nexusCoopChatInput");
		this.$playerContainer = this.$container.find("#nexusCoopPlayerContainer");
		this.$playerCount = this.$container.find("#nexusCoopPlayerCount");
		this.$chatTab = this.$container.find("#nexusCoopChatTab");
		this.$playerTab = this.$container.find("#nexusCoopPlayerTab");
		this.$dragTrigger = this.$container.find("#nexusCoopDragOption");

		this.chatMesageList = [];

		this.lastMouseX;
		this.lastMouseY;

		this.playerMap = {};
		this.hostName = null;

		this.$chatMessageContainer.perfectScrollbar({
			suppressScrollX: true,
			minScrollbarLength: 20,
		});

		this.$playerContainer.perfectScrollbar({
			suppressScrollX: true,
			minScrollbarLength: 20,
		});

		this.$chatInput.keypress((e) => {
			if (e.which == 13) {
				let message = this.$chatInput.val();
				if (message) {
					socket.sendCommand({
						type: "nexus",
						command: "coop chat message",
						data: {
							message,
						},
					});
					this.$chatInput.val("");
				}
				e.preventDefault();
			}
		});

		this.$chatInput.on("focusin", () => {
			quiz.setInputInFocus(false);
		});

		this.$chatTab.click(() => {
			this.displayChat();
		});

		this.$playerTab.click(() => {
			this.displayPlayers();
		});

		this.$dragTrigger.mousedown((e) => {
			if (e.which == 1) {
				this.lastMouseX = e.pageX;
				this.lastMouseY = e.pageY;
				this.updatePositionOnDrag(e.pageX, e.pageY);
				this.$container.addClass("dragged");
				let dragged = false;
				$(document).on("mousemove", (e) => {
					dragged = true;
					this.$dragTrigger.popover("hide");
					this.updatePositionOnDrag(e.pageX, e.pageY);
				});
				$(document).one("mouseup", () => {
					$(document).off("mousemove");
					if(!dragged) {
						this.resetDrag();
					}
				});
			}
		});

		this.$dragTrigger.popover({
			trigger: "hover",
			content: "Drag to move, click to reset",
			container: "#nexus",
			placement: "auto top",
		});

		this._nexusCoopChatMessageListener = new Listener("nexus coop chat message", (payload) => {
			this.displayMessage(payload);
		});
		this._nexusCoopChatMessageListener.bindListener();

		this._nexusCoopServerMessageListener = new Listener("nexus server message", (payload) => {
			this.displayServerMessage(payload);
		});
		this._nexusCoopServerMessageListener.bindListener();

		this._newNexusPlayerListener = new Listener("new nexus player", (payload) => {
			this.addPlayer(payload);
		});
		this._newNexusPlayerListener.bindListener();

		this._nexusPlayerLeaveListener = new Listener("nexus player leave", (payload) => {
			let playerRow = this.playerMap[payload.name];
			if (playerRow) {
				playerRow.remove();
				delete this.playerMap[payload.name];
				this.updatePlayerCount();
			}
			if (payload.newHost) {
				this.playerMap[payload.newHost].setHost();
				this.updateHostOptions(payload.newHost);
			}
		});
		this._nexusPlayerLeaveListener.bindListener();

		this._nexusLobbyHostChangeListener = new Listener("nexus lobby host change", (payload) => {
			let { newHost, oldHost } = payload;
			this.playerMap[newHost].setHost();
			this.updateHostOptions(newHost);
			this.playerMap[oldHost].unsetHost();
		});
		this._nexusLobbyHostChangeListener.bindListener();

		this._nexusPlayerDisconectListener = new Listener("nexus player disconect", (payload) => {
			this.playerMap[payload.name].setDisconnected();
		});
		this._nexusPlayerDisconectListener.bindListener();

		this._nexusPlayerReconectListener = new Listener("nexus player reconect", (payload) => {
			this.playerMap[payload.name].unsetDisconnected();
		});
		this._nexusPlayerReconectListener.bindListener();
	}

	updatePositionOnDrag(pageX, pageY) {
		//Make sure none of the container is outside the window
		let left = this.$container.position().left + pageX - this.lastMouseX;
		let top = this.$container.position().top + pageY - this.lastMouseY;
		if (left < 0) {
			left = 0;
		} else if (left + this.$container.width() > $(window).width()) {
			left = $(window).width() - this.$container.width();
		}
		if (top < 0) {
			top = 0;
		} else if (top + this.$container.height() > $(window).height()) {
			top = $(window).height() - this.$container.height();
		}
		//Use transform to set position to avoid layout thrashing
		this.$container.css("transform", `translate(${left}px, ${top}px)`);

		this.lastMouseX = pageX;
		this.lastMouseY = pageY;
	}

	resetDrag() {
		this.$container.css("transform", "");
		this.$container.removeClass("dragged");
	}

	setGameMode() {
		this.$container.addClass("gameMode");
		this.$chatMessageContainer.perfectScrollbar("update");
		this.$playerContainer.perfectScrollbar("update");
	}

	setNexusMode() {
		this.$container.addClass("nexusMode");
	}

	clearGameMode() {
		this.$container.removeClass("gameMode");
		this.$chatMessageContainer.perfectScrollbar("update");
		this.$playerContainer.perfectScrollbar("update");
	}

	clearNexusMode() {
		this.$container.removeClass("nexusMode");
	}

	displayChat() {
		this.$chatContainer.removeClass("hide");
		this.$playerContainer.addClass("hide");
		this.$chatTab.addClass("selected");
		this.$playerTab.removeClass("selected");
		this.$chatMessageContainer.perfectScrollbar("update");
	}

	displayPlayers() {
		this.$chatContainer.addClass("hide");
		this.$playerContainer.removeClass("hide");
		this.$chatTab.removeClass("selected");
		this.$playerTab.addClass("selected");
		this.$playerContainer.perfectScrollbar("update");
		Object.values(this.playerMap).forEach((playerRow) => {
			playerRow.updateNameSize();
		});
	}

	setupPlayers(playerList, hostName) {
		playerList.forEach((playerInfo) => {
			this.addPlayer(playerInfo);
		});
		this.updateHostOptions(hostName);
	}

	updateHostOptions(hostName) {
		this.hostName = hostName;
		if (hostName === selfName) {
			Object.values(this.playerMap).forEach((playerRow) => {
				playerRow.enableHostOptions();
			});
		} else {
			Object.values(this.playerMap).forEach((playerRow) => {
				playerRow.disableHostOptions();
			});
		}
	}

	addPlayer(playerInfo) {
		let playerRow = new NexusCoopPlayerRow(playerInfo);
		this.playerMap[playerInfo.name] = playerRow;
		this.$playerContainer.append(playerRow.$body);
		this.updatePlayerCount();
		if (this.hostName === selfName) {
			playerRow.enableHostOptions();
		}
	}

	updatePlayerCount() {
		this.$playerCount.text(Object.keys(this.playerMap).length);
	}

	displayMessage({ sender, message, emojis, badges }) {
		let $chatMessage = $(format(this.CHAT_MESSAGE_TEMPLATE, escapeHtml(sender), passChatMessage(message, emojis)));
		popoutEmotesInMessage($chatMessage, "#nexusCoopMainContainer");
		let $badgeContainer = $chatMessage.find(".nexusCoopChatBadgeContainer");
		badges.forEach((badge) => {
			let $badge = $(this.BADGE_TEMPLATE);
			new PreloadImage($badge, cdnFormater.newBadgeSrc(badge.fileName), cdnFormater.newBadgeSrcSet(badge.fileName));
			$badge.popover({
				content: createBadgePopoverHtml(badge.fileName, badge.name),
				html: true,
				delay: 50,
				placement: "auto top",
				trigger: "hover",
				container: "#gcChatContent",
			});
			$badgeContainer.append($badge);
		});

		if (selfName !== sender) {
			let $username = $chatMessage.find(".nexusCoopChatName");
			$username.addClass("clickAble");
			let openProfileFunction = () => {
				playerProfileController.loadProfileIfClosed(sender, $username, {}, () => {}, false, true);
			};
			$username.click(openProfileFunction);
		}

		this.chatMesageList.push($chatMessage);

		if (this.chageMessageList > this.MAX_CHAT_MESSAGES) {
			let oldestMessage = this.chatMesageList.shift();
			oldestMessage.remove();
		}

		this.insertMsg($chatMessage);
	}

	displayServerMessage({ message }) {
		let $chatMessage = $(format(this.SERVER_MESSAGE_TEMPLATE, escapeHtml(message)));
		this.chatMesageList.push($chatMessage);

		if (this.chageMessageList > this.MAX_CHAT_MESSAGES) {
			let oldestMessage = this.chatMesageList.shift();
			oldestMessage.remove();
		}

		this.insertMsg($chatMessage);
	}

	insertMsg($meesage) {
		let atBottom =
			this.$chatMessageContainer.scrollTop() + this.$chatMessageContainer.innerHeight() >=
			this.$chatMessageContainer[0].scrollHeight - 100;
		this.$chatMessageContainer.append($meesage);
		this.$chatMessageContainer.perfectScrollbar("update");
		if (atBottom) {
			this.$chatMessageContainer.scrollTop(this.$chatMessageContainer.prop("scrollHeight"));
		}
	}

	show() {
		this.$container.removeClass("hide");
	}

	hide() {
		this.$container.addClass("hide");
		this.reset();
	}

	reset() {
		this.chatMesageList.forEach(($message) => {
			$message.remove();
		});
		this.chatMesageList = [];
		this.$chatMessageContainer.perfectScrollbar("update");

		Object.values(this.playerMap).forEach((playerRow) => {
			playerRow.remove();
		});
		this.playerMap = {};
		this.hostName = null;

		this.displayChat();
		this.clearNexusMode();
	}
}
NexusCoopChat.prototype.CHAT_MESSAGE_TEMPLATE = $("#nexusCoopChatMessageTemplate").html();
NexusCoopChat.prototype.SERVER_MESSAGE_TEMPLATE =
	'<div class="nexusCoopChatMessage"><span class="nexusCoopChatMessageText">{0}</span></div>';
NexusCoopChat.prototype.BADGE_TEMPLATE = '<img class="nexusCoopChatBadge" sizes="17px">';
NexusCoopChat.prototype.MAX_CHAT_MESSAGES = 100;

var nexusCoopChat = new NexusCoopChat();
