"use strict";
/*exported socialRewardModal*/

class SocialRewardModal {
	constructor() {
		this.$modal = $("#socialRewardModal");
		this.$twitterButton = $("#srmTwitterClaimButton");
		this.$discordButton = $("#srmDiscordClaimButton");
		this.$menuBanner = $("#mpSocialRewardContainer");

		this.twitterClaimed = false;
		this.discordClaimed = false;

		new Listener("social reward claimed", (data) => {
			if(data.platform === "Twitter") {
				this.setTwitterClaimed();
			} else {
				this.setDiscordClaimed();
			}
			this.hideMenuBannerCheck();
		}).bindListener();
	}

	setup(twitterClaimed, discordClaimed) {
		if(twitterClaimed) {
			this.setTwitterClaimed();
		}
		if(discordClaimed) {
			this.setDiscordClaimed();
		}
		this.hideMenuBannerCheck();
	}

	hideMenuBannerCheck() {
		if(this.twitterClaimed && this.discordClaimed) {
			this.$menuBanner.remove();
			this.$twitterButton.width(); //Wait for dom update to finsih
			promoCarousel.initCarousel();
		}
	}

	setTwitterClaimed() {
		this.twitterClaimed = true;
		this.setButtonClaimed(this.$twitterButton);
	}

	setDiscordClaimed() {
		this.discordClaimed = true;
		this.setButtonClaimed(this.$discordButton);
	}

	setButtonClaimed($button) {
		$button.text("Claimed");
		$button.addClass("disabled");
	}

	triggerTwitterClaim() {
		this.triggerClaimWindow("/twitter/oauth");
	}

	triggerDiscordClaim() {
		this.triggerClaimWindow("/discord/oauth");
	}

	triggerClaimWindow(url) {
		window.open(
			url,
			"popUpWindow",
			"height=700,width=420,left=10,top=10,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,directories=no,status=yes"
		);
	}
}

var socialRewardModal = new SocialRewardModal();