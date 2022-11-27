"use strict";

/*exported storePriceModal*/

class StorePriceModal {
    constructor() {
        this.$modal = $("#swPriceModal");
        this.$itemList = this.$modal.find("#swPriceItems");
        this.$totalList = this.$modal.find("#swPriceTotal");
        this.$buyButton = this.$modal.find("#swPriceBuyButton");
        this.$buySpinner = this.$modal.find("#swPriceSpinner");
        this.$clickBlocker = this.$modal.find(".clickBlocker");
        this.$closeButton = this.$modal.find(".close");
        this.$paypalButton = this.$modal.find("#swPaypalButton");
        this.$patreonButton = this.$modal.find("#swPatreonButton");
        this.$payOptions = this.$modal.find(".swPricePayOption");

        this.$closeButton.click(() => {
            this.$modal.modal("hide");
        });

        this.$modal.on("hidden.bs.modal", () => {
            this.$buyButton.removeClass("hide");
            this.$buySpinner.addClass("hide");
            this.$paypalButton.addClass("hide");
            this.$buyButton.text("Buy");
            this.enableClose();
        });

        this.$patreonButton.click(() => {
            this.hide();
            patreon.showModal();
        });

        this.transactionTimeout;
        this.paypalPackage;
        this.paypalType;
        this.currentNotePrice;

        if (typeof paypal !== "undefined") {
            let successCallback = this.transactionComplete.bind(this);
            let failCallback = this.transactionFailed.bind(this);
            paypal.config.env = PAYPAL_ENV;
            paypal.Button.render(
                {
                    payment: function () {
                        let paypalPackage = this.paypalPackage;
                        let notePrice = this.currentNotePrice;
                        let rhythmPrice = this.totalRhythemPrice;
                        let targetType = this.paypalType;
                        return new paypal.Promise(function (resolve, reject) {
                            if (notePrice && xpBar.currentCreditCount < notePrice) {
                                reject("Insufficient Notes");
                                displayMessage(
                                    "Insufficient Notes",
                                    "You don't have enough Notes to unlock this skin"
                                );
                            } else if (rhythmPrice && storeWindow.rhythm < rhythmPrice) {
                                reject("Insufficient Rhythm");
                                displayMessage(
                                    "Insufficient Rhythm",
                                    "You don't have enough Rhythm to unlock this skin"
                                );
                            } else {
                                jQuery
                                    .post(`/${targetType}/create-payment`, paypalPackage)
                                    .done(function (paymentID) {
                                        resolve(paymentID);
                                    })
                                    .fail(function (err) {
                                        reject(err.responseText);
                                        displayMessage("Payment Error", err.responseText);
                                    });
                            }
                        });
                    }.bind(this),
                    onAuthorize: function (data) {
                        this.startTransaction();
                        jQuery
                            .post(`/${this.paypalType}/execute-payment`, {
                                paymentID: data.orderID,
                                payerID: data.payerID
                            })
                            .done(function () {
                                successCallback("Thanks for your purchase!");
                            })
                            .fail(function (err) {
                                failCallback(err.responseText);
                            });
                    }.bind(this),
                    onCancel: function () {
                        //Do nothing
                    },

                    locale: "en_US",
                    style: {
                        size: "medium",
                        color: "blue",
                        shape: "rect"
                    }
                },
                "#swPaypalButton"
            );
        }

        this.enableClose();
    }

    showAvatar(priceItems, avatarId, colorId) {
        if (guestRegistrationController.isGuest && this.itemsHaveRealMoneyPrice(priceItems)) {
            displayMessage("Unavailable for Guest Accounts", "Guest accounts can't buy content for real money");
            return;
        }
        let buyCallback = (totalNotePrice, totalRhythemPrice) => {
            if (totalNotePrice && xpBar.currentCreditCount < totalNotePrice) {
                displayMessage("Insufficient Notes", "You don't have enough Notes to unlock this skin");
            } else if (totalRhythemPrice && storeWindow.rhythm < totalRhythemPrice) {
                displayMessage("Insufficient Rhythm", "You don't have enough Rhythm to unlock this skin");
            } else {
                this.startTransaction();

                socket.sendCommand({
                    type: "avatar",
                    command: "unlock avatar",
                    data: {
                        avatarId,
                        colorId
                    }
                });
            }
        };
        this.displayPriceItems(priceItems, buyCallback);

        this.paypalType = this.PAYPAL_TYPES.AVATAR;
        this.paypalPackage = {
            avatarId,
            colorId
        };

        this.$modal.modal("show");
    }

    showEmote(priceItems, emoteId) {
        if (guestRegistrationController.isGuest && this.itemsHaveRealMoneyPrice(priceItems)) {
            displayMessage("Unavailable for Guest Accounts", "Guest accounts can't buy content for real money");
            return;
        }
        let buyCallback = (totalNotePrice, totalRhythemPrice) => {
            if (totalNotePrice && xpBar.currentCreditCount < totalNotePrice) {
                displayMessage("Insufficient Notes", "You don't have enough Notes to unlock this emote");
            } else if (totalRhythemPrice && storeWindow.rhythm < totalRhythemPrice) {
                displayMessage("Insufficient Rhythm", "You don't have enough Rhythm to unlock this emote");
            } else {
                this.startTransaction();

                socket.sendCommand({
                    type: "avatar",
                    command: "unlock emote",
                    data: {
                        emoteId
                    }
                });
            }
        };
        this.displayPriceItems(priceItems, buyCallback);

        this.$modal.modal("show");
    }

    showTicket(priceItems, ticketAmount, price, taxPrice) {
        if (guestRegistrationController.isGuest && this.itemsHaveRealMoneyPrice(priceItems)) {
            displayMessage("Unavailable for Guest Accounts", "Guest accounts can't buy content for real money");
            return;
        }
        this.displayPriceItems(priceItems, null, taxPrice);

        this.paypalType = this.PAYPAL_TYPES.TICKETS;
        this.paypalPackage = {
            ticketAmount,
            price
        };

        this.$modal.modal("show");
    }

    itemsHaveRealMoneyPrice(priceItems) {
        return priceItems.some((item) => {
            return item.realMoneyPrice && item.realMoneyPrice > 0;
        });
    }

    displayPriceItems(priceItems, buyCallback, taxPrice) {
        this.$itemList.html("");
        let totalNotePrice = 0;
        let totalRealMoneyPrice = 0;
        let totalRhythemPrice = 0;
        let patreonUnlock = false;
        priceItems.forEach((item) => {
            let value;
            let patreonUnlockable = item.patreonTierToUnlock && item.patreonTierToUnlock > 0;
            let patreonUnlockMeet = patreonUnlockable && item.patreonTierToUnlock <= patreon.backerLevel;
            if (item.notePrice) {
                value = numberWithCommas(item.notePrice);
            } else if (patreonUnlockMeet) {
                value = "Free";
            } else if (item.realMoneyPrice) {
                if (patreonUnlockable) {
                    value = "or $" + item.realMoneyPrice.toFixed(2);
                } else {
                    value = "$" + item.realMoneyPrice.toFixed(2);
                }
            } else if (item.rhythmPrice) {
                value = item.rhythmPrice;
            }
            let $item = $(format(this.ITEM_TEMPLATE, item.name, value));
            if (item.hidePrice) {
                $item.find(".swPriceEntryValue").addClass("hide");
            }
            if (item.bold) {
                $item.addClass("bold");
            }

            if (item.notePrice) {
                totalNotePrice += item.notePrice;
            }
            if (item.realMoneyPrice && !patreonUnlockMeet) {
                totalRealMoneyPrice += item.realMoneyPrice;
            }
            if (item.rhythmPrice) {
                totalRhythemPrice += item.rhythmPrice;
            }
            if (patreonUnlockable) {
                $item
                    .find(".swPriceIcon")
                    .attr("src", cdnFormater.newBadgeSrc(cdnFormater.PATREON_PREVIEW_BADGE_FILENAME));
                $item.find(".swPriceEntryValue").popover({
                    content: "Free for tier 2+ Patreons",
                    delay: 50,
                    placement: "top",
                    trigger: "hover"
                });
                patreonUnlock = true;
            } else if (item.realMoneyPrice) {
                $item.find(".swPriceIcon").addClass("hide");
            } else if (item.rhythmPrice) {
                $item.find(".swPriceIcon").attr("src", cdnFormater.RHYTHM_ICON_PATH);
            }

            this.$itemList.append($item);
        });


        if (totalRealMoneyPrice) {
            this.$paypalButton.removeClass("hide");
            this.$buyButton.addClass("hide");
        } else {
            this.$buyButton.off().click(() => {
                buyCallback(totalNotePrice, totalRhythemPrice);
            });
        }

        this.$totalList.html("");
        let hideTotal = false;
        if (!totalNotePrice && !totalRhythemPrice && !totalRealMoneyPrice) {
            let $item = $(format(this.ITEM_TEMPLATE, "Total", "Free"));
            $item
                .find(".swPriceIcon")
                .attr("src", cdnFormater.newBadgeSrc(cdnFormater.PATREON_PREVIEW_BADGE_FILENAME));
            $item.find(".swPriceEntryValue").popover({
                content: "Free for tier 2+ Patreons",
                delay: 50,
                placement: "top",
                trigger: "hover"
            });
            this.$totalList.append($item);

            this.$buyButton.text("Unlock");
        }
        if (totalRealMoneyPrice) {
            if (taxPrice != undefined) {
                let $item = $(format(this.ITEM_TEMPLATE, "Subtotal", "$" + totalRealMoneyPrice.toFixed(2)));
                $item.find(".swPriceIcon").addClass("hide");
                this.$totalList.append($item);

                $item = $(format(this.ITEM_TEMPLATE, "Sales Tax", "$" + taxPrice.toFixed(2)));
                $item.find(".swPriceIcon").addClass("hide");
                this.$totalList.append($item);

                totalRealMoneyPrice += taxPrice;

                $item = $(format(this.ITEM_TEMPLATE, "Total", "$" + totalRealMoneyPrice.toFixed(2)));
                $item.find(".swPriceIcon").addClass("hide");
                $item.addClass("bold");
                this.$totalList.append($item);
            } else {
                let $item = $(format(this.ITEM_TEMPLATE, "Total", "$" + totalRealMoneyPrice.toFixed(2)));
                $item.find(".swPriceIcon").addClass("hide");
                this.$totalList.append($item);
            }
            hideTotal = true;
        }
        if (totalRhythemPrice) {
            let $item = $(format(this.ITEM_TEMPLATE, "Total", totalRhythemPrice));
            $item.find(".swPriceIcon").attr("src", cdnFormater.RHYTHM_ICON_PATH);
            if (hideTotal) {
                $item.find(".swPriceEntryName").addClass("hide");
            }
            this.$totalList.append($item);
            hideTotal = true;
        }
        if (totalNotePrice) {
            let $item = $(format(this.ITEM_TEMPLATE, "Total", numberWithCommas(totalNotePrice)));

            if (hideTotal) {
                $item.find(".swPriceEntryName").addClass("hide");
            }

            this.$totalList.append($item);
            hideTotal = true;
        }
        if (patreonUnlock && totalRealMoneyPrice) {
            this.$modal.addClass("patreonButtonShown");
        } else {
            this.$modal.removeClass("patreonButtonShown");
        }

        this.currentNotePrice = totalNotePrice;
        this.currentRhythmPrice = totalRhythemPrice;
    }

    transactionComplete(message = "Transaction Complete") {
        clearTimeout(this.transactionTimeout);
        displayMessage(message, null, () => {
            this.hide();
        });
    }

    transactionFailed(error) {
        clearTimeout(this.transactionTimeout);
        displayMessage("Transaction Failed", error, () => {
            this.hide();
        });
    }

    hide() {
        this.$modal.modal("hide");
    }

    startTransaction() {
        this.$payOptions.addClass("hide");
        this.$buySpinner.removeClass("hide");

        this.disableClose();

        this.transactionTimeout = setTimeout(() => {
            this.hide();
            displayMessage("Error Unlocking", "Plase try again later");
        }, this.TRANSACTION_TIMEOUT_TIME);
    }

    enableClose() {
        this.$clickBlocker.addClass("hide");
        this.$closeButton.removeClass("disabled");
    }

    disableClose() {
        this.$clickBlocker.removeClass("hide");
        this.$closeButton.addClass("disabled");
    }
}

StorePriceModal.prototype.ITEM_TEMPLATE = $("#swPriceItemTemplate").html();
StorePriceModal.prototype.TRANSACTION_TIMEOUT_TIME = 10000; //ms
StorePriceModal.prototype.PAYPAL_TYPES = {
    AVATAR: "buy-avatar",
    TICKETS: "buy-tickets"
};

let storePriceModal = new StorePriceModal();
