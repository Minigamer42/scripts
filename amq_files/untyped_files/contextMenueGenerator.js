"use strict";
/*exported contextMenueGenerator*/
function ContextMenueGenerator() {
	this.menuOpen = false;

	//Precent default contextmenu on social tab entries
	$(document).on("contextmenu", ".stPlayerName", () => {
		return false;
	});

	this._itemFields = {
		Chat: (player) => {
			return {
				name: "Chat",
				callback: () => {
					socialTab.startChat(player);
				},
			};
		},
		InviteToGame: (player) => {
			return {
				name: "Invite to Game",
				callback: () => {
					if (guestRegistrationController.isGuest) {
						displayMessage("Unavailable for Guess Accounts", "Guest accounts are not able to send game invites");
					} else if (!(lobby.inLobby || quiz.inQuiz || nexus.inNexusLobby)) {
						displayMessage("You're not in a game");
					} else if ((lobby.inLobby && lobby.soloMode) || (quiz.inQuiz && quiz.soloMode) || (nexus.inNexusLobby && !nexus.inCoopLobby)) {
						displayMessage("Can't Invite Players when Playing Solo");
					} else {
						socket.sendCommand({
							type: "social",
							command: "invite to game",
							data: {
								target: player,
							},
						});
					}
				},
			};
		},
		FriendRequest: (player) => {
			return {
				name: "Send Friend Request",
				callback: function () {
					socialTab.sendFriendRequest(player);
				},
			};
		},
		Block: (player) => {
			return {
				name: "Block",
				callback: function () {
					socialTab.blockPlayer(player);
				},
			};
		},
		Report: (player) => {
			return {
				name: "Report",
				callback: function () {
					reportModal.show(player);
				},
			};
		},
		RemoveFriend: (player) => {
			return {
				name: "Remove Friend",
				callback: () => {
					//Send remove friend message to server
					socket.sendCommand({
						type: "social",
						command: "remove friend",
						data: {
							target: player,
						},
					});
					//Remove friend local
					socialTab.removeFriend(player);
				},
			};
		},
		JoinGame: (player) => {
			return {
				name: "Join Game",
				callback: () => {
					let gameState = socialTab.onlineFriends[player].gameState;
					if(gameState.private) {
						roomBrowser.spectateGameWithPassword(gameState.gameId);
					} else {
						roomBrowser.fireSpectateGame(gameState.gameId);
					}
				},
			};
		},
		InspectGame: (player) => {
			return {
				name: "Inspect Game",
				callback: () => {
					let spectateGameListner = new Listener(
						"Spectate Game",
						function (response) {
							if (response.error) {
								displayMessage(response.errorMsg);
							} else {
								if (response.inLobby) {
									roomBrowser.joinLobby(response, true);
								} else {
									roomBrowser.joinGame(response);
								}
							}
							spectateGameListner.unbindListener();
						}.bind(this)
					);

					spectateGameListner.bindListener();
					setTimeout(() => {
						spectateGameListner.unbindListener();
					}, 5000);

					socket.sendCommand({
						type: "social",
						command: "inspect game",
						data: {
							target: player,
						},
					});
				},
			};
		},
	};
}

ContextMenueGenerator.prototype.generateStandardContextMenu = function ($entry, selector, player, trigger = "none") {
	this.createClickTrigger($entry.find(selector));
	$entry.contextMenu({
		selector: selector,
		trigger: trigger,
		build: () => {
			return {
				items: this.generatePlayerItemsObject(
					["Chat", "InviteToGame", "FriendRequest", "Block", "Report", "InspectGame"],
					player
				),
				events: {
					show: function (options) {
						if (socialTab.isFriend(player)) {
							options.items.FriendRequest.disabled = true;
						} else if (player === selfName) {
							options.items.FriendRequest.disabled = true;
							options.items.Chat.disabled = true;
							options.items.Block.disabled = true;
							options.items.Report.disabled = true;
							options.items.InviteToGame.disabled = true;
						} else if (socialTab.isBlocked(player)) {
							options.items.Block.disabled = true;
						} else {
							options.items.Block.disabled = false;
						}
						options.items.InspectGame.visible = isTopAdmin;
					}.bind(this),
				},
			};
		},
		events: {
			show: () => {
				this.menuOpen = true;
			},
			hide: () => {
				this.menuOpen = false;
			},
		},
	});
};

ContextMenueGenerator.prototype.generateFriendListContextMenu = function ($entry, selector, player, trigger = "none") {
	this.createClickTrigger($entry.find(selector));
	$entry.contextMenu({
		selector: selector,
		trigger: trigger,
		build: () => {
			return {
				items: this.generatePlayerItemsObject(
					["Chat", "InviteToGame", "JoinGame", "RemoveFriend", "Block", "Report"],
					player
				),
				events: {
					show: function (options) {
						if (socialTab.offlineFriends[player]) {
							options.items.Chat.disabled = true;
							options.items.InviteToGame.disabled = true;
							options.items.JoinGame.disabled = true;
						} else {
							options.items.Chat.disabled = false;
							options.items.InviteToGame.disabled = false;
							let gameState = socialTab.onlineFriends[player].gameState;
							options.items.JoinGame.disabled = !gameState || gameState.gameId == undefined;
						}
					}.bind(this),
				},
			};
		},
		events: {
			show: () => {
				this.menuOpen = true;
			},
			hide: () => {
				this.menuOpen = false;
			},
		},
	});
};

ContextMenueGenerator.prototype.generatePlayerItemsObject = function (itemFieldList, player) {
	let items = {};

	itemFieldList.forEach((item) => {
		items[item] = this._itemFields[item](player);
	});
	return items;
};

ContextMenueGenerator.prototype.generateNonPlayerItemsObject = function (itemFieldList) {
	let items = {};

	itemFieldList.forEach((item) => {
		items[item] = this._itemFields[item];
	});
	return items;
};

ContextMenueGenerator.prototype.generateSocialStatusContextMenu = function ($entry, selector, trigger = "right") {
	$entry.contextMenu({
		selector: selector,
		trigger: trigger,
		build: () => {
			return {
				items: {
					SocialStatusOnline: {
						name: "Online",
						callback: function () {
							socialTab.changeSocialStatus(1);
						},
						icon: "fa-circle",
					},
					SocialStatusDoNotDisturb: {
						name: "Do Not Disturb",
						callback: function () {
							socialTab.changeSocialStatus(2);
						},
						icon: "fa-circle",
					},
					SocialStatusAway: {
						name: "Away",
						callback: function () {
							socialTab.changeSocialStatus(3);
						},
						icon: "fa-circle",
					},
				},
			};
		},
		events: {
			show: () => {
				this.menuOpen = true;
			},
			hide: () => {
				this.menuOpen = false;
			},
		},
	});
};

ContextMenueGenerator.prototype.createClickTrigger = function ($element) {
	$element.off("click");
	$element.mousedown((e) => {
		if (!this.menuOpen) {
			$element.contextMenu({ x: e.pageX, y: e.pageY });
		}
	});
};

let contextMenueGenerator = new ContextMenueGenerator();
