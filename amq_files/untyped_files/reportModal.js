/* exported reportModal*/

function ReportModal() {
	this._$modal = $("#reportPlayerModal");
	this._$nameContainer = $("#rpName");
	this._$reportTypeSelector = $("#rpReportType");
	this._$reportDescription = $("#rpReportReason");
	this._$submitButton = $("#rpSubmit");
	this.$playerContent = $("#rpPlayerContent");
	this.$modContent = $("#rpModContent");
	this.$modButton = $("#rpToggleMod");
	this.$modRadioButtons = $(".rpModRadio");
	this.$modReasonMessage = $("#rpReasonMessage");

	this.targetPlayer = "";
}

ReportModal.prototype.setup = function () {
	this._$reportTypeSelector.change((event) => {
		let newValue = parseInt(event.target.value);
		if (newValue === 0) {
			this._$submitButton.attr("disabled", true);
		} else {
			this._$submitButton.attr("disabled", false);
		}
	});

	this.$modRadioButtons.click(() => {
		this._$submitButton.attr("disabled", false);
	});

	if (isGameAdmin) {
		this.$modButton.addClass("adminEnabled");
	}
};

ReportModal.prototype.show = function (playerName) {
	if (guestRegistrationController.isGuest) {
		displayMessage("Unavailable for Guess Accounts", "Guest accounts are not able to report players");
		return;
	}
	this.targetPlayer = playerName;

	this._$nameContainer.text(this.targetPlayer);
	this._$reportTypeSelector.val(0);
	this._$reportDescription.val("");
	this._$submitButton.attr("disabled", true);
	this._$modal.modal("show");
};

ReportModal.prototype.submitReport = function () {
	if (this.$modContent.hasClass("hide")) {
		socket.sendCommand({
			type: "social",
			command: "report player",
			data: {
				reportType: parseInt(this._$reportTypeSelector.find("option:selected").val()),
				reportReason: this._$reportDescription.val(),
				target: this.targetPlayer,
			},
		});
		displayOption("Player Reported", "Block Player Aswell?", "Yes", "No", () => {
			socialTab.blockPlayer(this.targetPlayer);
		});
		this._$modal.modal("hide");
	} else {
		let strikeReason = this.$modReasonMessage.val();
		let selectedOption = this.$modRadioButtons.filter(":checked").val();
		if (strikeReason.length === 0) {
			displayMessage("A Reason Must be Provided");
		} else if ((selectedOption === "cheat" || selectedOption === "challenge") && strikeReason.length < 50) {
			displayMessage("A reason of at least 50 characters must be provided for a cheat ban");
		} else {
			let message;
			switch (selectedOption) {
				case "warn":
					message = "Send Warning to ";
					break;
				case "name":
					message = "Force Name Change for ";
					break;
				case "chat":
					message = "Chat Ban ";
					break;
				case "rankedChat":
					message = "Ranked Chat Ban ";
					break;
				case "game":
					message = "Ban ";
					break;
				case "cheat":
					message = "Cheat Ban ";
					break;
				case "challenge":
					message = "Cheat Challenge ";
					break;
				case "rankedHide":
					message = "Hide From Ranked ";
					break;
				case "message":
					message = "Send Mod Message to ";
					break;
			}
			displayOption(message + this.targetPlayer, "Proceed?", "Yes", "No", () => {
				socket.sendCommand({
					type: "social",
					command: "mod strike",
					data: {
						strikeType: selectedOption,
						reason: strikeReason,
						target: this.targetPlayer,
					},
				});
				this.$modReasonMessage.val("");
				this.$modRadioButtons.prop("checked", false);
				this._$submitButton.attr("disabled", true);
			});
		}
	}
};

ReportModal.prototype.toggleMod = function () {
	this.$modRadioButtons.prop("checked", false);
	this._$reportTypeSelector.val("0");
	this.$modReasonMessage.val("");
	this._$submitButton.attr("disabled", true);
	if (this.$modContent.hasClass("hide")) {
		this.$playerContent.addClass("hide");
		this.$modContent.removeClass("hide");
	} else {
		this.$modContent.addClass("hide");
		this.$playerContent.removeClass("hide");
	}
};

var reportModal = new ReportModal();
