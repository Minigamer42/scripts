"use strict";
/*exported StoreTicketStoreController*/

class StoreTicketStoreController {
	constructor(saleInfo) {
		this.$mainContainer = $("#swTicketStoreMainContainer");
		this.$contentContainer = this.$mainContainer.find("#swTicketStoreContentContainer");

		this.entries = [];
		this.ENTRY_VALUES.forEach((entry) => {
			let storeEntry = new StoreTicketStoreEntry(entry.amount, entry.price, entry.tokens, entry.sale, saleInfo);
			this.entries.push(storeEntry);
			this.$contentContainer.append(storeEntry.$entry);
		});
	}

	hide() {
		this.$mainContainer.addClass("hide");
	}

	show() {
		this.$mainContainer.removeClass("hide");
		this.resize();
	}

	resize() {
		this.entries.forEach((entry) => entry.resize());
	}
}
StoreTicketStoreController.prototype.ENTRY_VALUES = [
	{
		price: 19.99,
		amount: 42,
		tokens: 28,
		sale: true
	},
	{
		price: 1,
		amount: 1,
		tokens: 1,
	},
	{
		price: 9.99,
		amount: 12,
		tokens: 11,
	},
	{
		price: 19.99,
		amount: 26,
		tokens: 23,
	},
	{
		price: 49.99,
		amount: 70,
		tokens: 60,
	},
	{
		price: 99.99,
		amount: 150,
		tokens: 125
	},
];

class StoreTicketStoreEntry {
	constructor(amount, price, token, sale, saleInfo) {
		let description = `${amount} ${amount === 1 ? "Ticket" : " Pack"}`;
		this.$entry = $(format(this.TEMPLATE, amount, price, description, token));
		this.$buyContainer = this.$entry.find(".swAvatarTileFooterContent");
		this.$buyText = this.$entry.find(".swAvatarSkinName");
		this.$saleUnlocksLeft = this.$entry.find(".swTicketsStoreSaleUnlocksLeft");
		this.$saleDaysLeft = this.$entry.find(".swTicketsStoreSaleDaysLeft");

		if(sale) {
			this.updateSaleUnlockLeft(saleInfo.unlocksLeft);
			
			let endDate = new moment(saleInfo.endDate);
			let daysLeft = endDate.diff(moment(), "days");
			if(daysLeft < 0) {
				daysLeft = 0;
			}
			this.$saleDaysLeft.text(daysLeft);
			this.$entry.addClass("swTicketStoreEntrySale");
			
			this.saleUnlockListener = new Listener(
				"Store Sale Unlock Amount Update",
				(payload) => {
					this.updateSaleUnlockLeft(payload.unlocksLeft);
				}
			);
			this.saleUnlockListener.bindListener();
		}

		this.$entry.click(() => {
			let taxPrice = price - price / (taxRate / 100 + 1);
			let unitPrice = price - taxPrice;

			let priceItems = [];

			priceItems.push(
				{
					name: "Tickets",
					hidePrice: true,
					bold: true,
				},
				{
					name: `${token} ${token === 1 ? "Avatar Token" : "Avatar Tokens"}`,
					// realMoneyPrice: unitPrice,
					hidePrice: true,
				},
				{
					name: `${amount} ${amount === 1 ? "Ticket" : "Tickets"}`,
					realMoneyPrice: unitPrice,
				}
			);

			storePriceModal.showTicket(priceItems, amount, price, taxPrice);
		});
	}

	updateSaleUnlockLeft(amount) {
		this.$saleUnlocksLeft.text(amount);

		if(amount === 0) {
			this.$entry.addClass("disabled");
		}
	}

	resize() {
		fitTextToContainer(this.$buyText, this.$buyContainer, 40, 12);
	}
}
StoreTicketStoreEntry.prototype.TEMPLATE = $("#swTicketStoreEntryTemplate").html();
