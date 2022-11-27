"use strict";

class StoreTickets {
    constructor(mainContanier, recentTicketRewards, rollTargets) {
        this.$ticketOptionContainer = $("#swTicketOptionButtonContainer");
        this.$useButton = this.$ticketOptionContainer.find('#swTicketOptionUseButton');
        this.$buyButton = this.$ticketOptionContainer.find('#swTicketOptionBuyButton');
        this.$historyButton = this.$ticketOptionContainer.find('#swTicketOptionHistoryButton');
        this.$infoTabMain = $('#swTicketInfoMain');

        this._topIcon = new StoreTopIcon(
            cdnFormater.newStoreIconSrc(this.TOP_ICON_NAME),
            cdnFormater.newStoreIconSrc(this.TOP_ICON_NAME),
            (selected) => {
                if (selected) {
                    mainContanier.displayTickets();
                    this.rollSelector.resize();
                    this.$infoTabMain.perfectScrollbar('update');
                } else {
                    mainContanier.clearSelection();
                }
            }
        );

        this.$infoTabMain.perfectScrollbar({
            suppressScrollX: true
        });

        this.historySelector = new StoreTicketHistory(recentTicketRewards);
        this.rollSelector = new StoreTicketRollSelector(this.$ticketOptionContainer, this.historySelector, rollTargets);
        this.storeSelector = new StoreTicketStoreController();

        this.$useButton.click(() => {
            this.$buyButton.removeClass('active');
            this.$historyButton.removeClass('active');
            this.$useButton.addClass('active');

            this.storeSelector.hide();
            this.historySelector.hide();
            this.rollSelector.show();
        });
        this.$buyButton.click(() => {
            this.$useButton.removeClass('active');
            this.$historyButton.removeClass('active');
            this.$buyButton.addClass('active');

            this.rollSelector.hide();
            this.historySelector.hide();
            this.storeSelector.show();
        });
        this.$historyButton.click(() => {
            this.$useButton.removeClass('active');
            this.$buyButton.removeClass('active');
            this.$historyButton.addClass('active');

            this.rollSelector.hide();
            this.storeSelector.hide();
            this.historySelector.show();
        });
    }

    get $topIcon() {
        return this._topIcon.$topIcon;
    }

    resize() {
        this.rollSelector.resize();
        this.storeSelector.resize();
    }
}

StoreTickets.prototype.TOP_ICON_NAME = "ticket";