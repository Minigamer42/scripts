"use strict";
/*exported nameChangeModal */

class NameChangeModal {
	constructor() {
		this.$modal = $("#nameChangeModal");
		this.$tokenCount = this.$modal.find("#ncTokenCount");
		this.$nicknameInput = this.$modal.find("#ncNewNickname");
		this.$checkAvailableButton = this.$modal.find("#ncCheckNameAvaliableButton");
		this.$changeButton = this.$modal.find("#ncChangeNicknameButton");

		this.$checkAvailableButton.click(() => {
			let newNickname = this.$nicknameInput.val();
			if (newNickname) {
				socket.sendCommand({
					type: "settings",
					command: "nickname available",
					data: {
						nickname: newNickname,
					},
				});
			}
		});

		this.$changeButton.click(() => {
			let newNickname = this.$nicknameInput.val();
			if (newNickname) {
				displayOption('Change Nickname to: ' + newNickname, "Ones changed you can't go back to your current name without using a name change token", 'Change', 'Cancel', () => {
					socket.sendCommand({
						type: "settings",
						command: "change nickname",
						data: {
							nickname: newNickname,
						},
					});
				});
			}
		});

		this.nicknameAvailableListener = new Listener("nickname available", function ({error, available, reason}) {
			if(error) {
				displayMessage("Error Check Name Available", error);
			} else if(available) {
				displayMessage("Nickname Available");
			} else {
				displayMessage('Nickname Not Available', reason);
			}
		}.bind(this));

		this.changeNicknameListener = new Listener("change nickname", function ({error, success, reason, noTokens, tokenCount, banned}) {
			if(banned) {
				displayMessage("Your Account is Banned from Changing Nickname");
			} else if(error) {
				displayMessage("Error Checking Name Available", error);
			} else if(success) {
				displayMessage("Nickname Changed");
			} else if(noTokens) {
				displayMessage("No Name Change Tokens Available");
			} else {
				displayMessage('Nickname Not Available', reason);
			}
			this.updateTokenCount(tokenCount);
		}.bind(this));
	}

	setup(tokenCount) {
		this.updateTokenCount(tokenCount);

		this.nicknameAvailableListener.bindListener();
		this.changeNicknameListener.bindListener();
	}

	show() {
		this.$modal.modal("show");
	}

	hide() {
		this.$modal.modal("hide");
	}

	updateTokenCount(newCount) {
		this.$tokenCount.text(newCount);
	}
}

var nameChangeModal = new NameChangeModal();
