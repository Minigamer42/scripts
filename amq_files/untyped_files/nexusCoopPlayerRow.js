"use strict";

class NexusCoopPlayerRow {
	constructor({ name, host, icon, connected }) {
		this.$body = $(format(this.TEMPLATE, name));
		this.$host = this.$body.find(".nexusCoopPlayerHost");
		this.$image = this.$body.find(".nexusCoopPlayerImage");
		this.$disconnected = this.$body.find(".nexusCoopPlayerDisconnected");
		this.$nameContainer = this.$body.find(".nexusCoopPlayerName");
		this.$nameTextContainer = this.$body.find(".nexusCoopPlayerNameInner");

		this.$profileOption = this.$body.find(".nexusCoopPlayerOptionProfile");
		this.$prmoteOption = this.$body.find(".nexusCoopPlayerOptionPromote");
		this.$kickOption = this.$body.find(".nexusCoopPlayerOptionKick");

		this.imagePreload;
		this.name = name;

		if (host) {
			this.setHost();
		}

		if(!connected) {
			this.setDisconnected();
		}

		this.displayIcon(icon);
		this.updateNameSize();

		this.$profileOption.popover({
			content: "Profile",
			delay: 50,
			container: "#nexusCoopContainer",
			placement: "top",
			trigger: "hover",
		});

		this.$prmoteOption.popover({
			content: "Promote Host",
			delay: 50,
			container: "#nexusCoopContainer",
			placement: "top",
			trigger: "hover",
		});

		this.$kickOption.popover({
			content: "Kick",
			delay: 50,
			container: "#nexusCoopContainer",
			placement: "top",
			trigger: "hover",
		});

		this.$profileOption.click(() => {
			playerProfileController.loadProfileIfClosed(name, this.$profileOption, {}, () => {}, false, true);
		});

		this.$prmoteOption.click(() => {
			displayOption("Promote Host", "Promote " + name + " to host?", "Promote", "Cancel", () => {
				socket.sendCommand({
					type: "nexus",
					command: "nexus promote host",
					data: {
						name,
					},
				});
			});
		});

		this.$kickOption.click(() => {
			displayOption("Kick Player", "Kick " + name + " from the room? They won't be able to join again", "Kick", "Cancel", () => {
				socket.sendCommand({
					type: "nexus",
					command: "nexus kick player",
					data: {
						name,
					},
				});
			});
		});
	}

	updateNameSize() {
		fitTextToContainer(this.$nameTextContainer, this.$nameContainer, 22, 8);
	}

	setHost() {
		this.$host.removeClass("hide");
	}

	unsetHost() {
		this.$host.addClass("hide");
	}

	setDisconnected() {
		this.$disconnected.removeClass("hide");
		this.$body.addClass("disconnected");
	}

	unsetDisconnected() {
		this.$disconnected.addClass("hide");
		this.$body.removeClass("disconnected");
	}

	enableHostOptions() {
		if (this.name !== selfName) {
			this.$prmoteOption.removeClass("disabled");
			this.$kickOption.removeClass("disabled");
		}
	}

	disableHostOptions() {
		this.$prmoteOption.addClass("disabled");
		this.$kickOption.addClass("disabled");
	}

	displayIcon({
		emoteId,
		avatarInfo: {
			avatar: { avatarName, outfitName, colorName, optionName, optionActive },
		},
	}) {
		let src, srcSet;
		if (emoteId) {
			let emote = storeWindow.getEmote(emoteId);
			src = emote.src;
			srcSet = emote.srcSet;
		} else {
			src = cdnFormater.newAvatarHeadSrc(avatarName, outfitName, optionName, optionActive, colorName);
			srcSet = cdnFormater.newAvatarHeadSrcSet(avatarName, outfitName, optionName, optionActive, colorName);
		}

		if (this.imagePreload) {
			this.imagePreload.cancel();
		}
		this.imagePreload = new PreloadImage(this.$image, src, srcSet, true, "50px");
	}

	remove() {
		this.$body.remove();
	}
}
NexusCoopPlayerRow.prototype.TEMPLATE = $("#nexusCoopPlayerEntryTemplate").html();
