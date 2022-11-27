'use strict';

/*exported avatarDriveModal */


function AvatarDriveModal() {
    this.$MODAL = $("#avatarDriveModal");

    this.$STANDING_LIST = $("#admStandingList");
    this.$STANDING_CONTAINER = $("#admStandingContainer");
    this.$FAQ_CONTAINER = $("#admFAQContainer");
    this.$DONATION_CONTAINER = $("#admDonationContainer");
    this.$DONATION_BUTTON = $("#admDonationButton");

    this.$DONATION_DESCRIPTION = $("#admAvatarDescriptionContainer");
    this.$DONATION_CHOICE_TEXT = $("#admAvatarChoiceText");

    this._$FREE_DONATION_TOGGLE = $("#admFreeDonationToggle");
    this._$FREE_AMOUNT_CONTAINER = $("#admFreeAmountContainer");
    this._$PAYPAL_AMOUNT_CONTAINER = $("#admPaypalAmountContainer");
    this._$FREE_DONATION_CHECKBOX = $("#admUseFreeDonation");

    this.STANDING_ENTRY_TEMPLATE = $("#avmStandingEntry").html();
    this.standingListener = new Listener('avatar drive standings', (payload) => {
        this.$STANDING_LIST.html("");
        let selectionArray = [];
        payload.standings.forEach((standing, index) => {
            let $entry = $(format(this.STANDING_ENTRY_TEMPLATE, index + 1 + '.', standing.name, avatarDrive.formatValue(standing.value)));
            this.$STANDING_LIST.append($entry);
            $entry.popover({
                content: standing.name,
                delay: 50,
                placement: 'top',
                trigger: 'hover',
                container: '#avatarDriveModal'
            });
            selectionArray.push(standing.name);
        });
        selectionArray.sort();

        let $selectionDropDown = $(".admDonationAvatarSelector");
        $selectionDropDown.find('.selectpicker').html("");
        $selectionDropDown.find('.selectpicker').append("<option>None</option>");

        selectionArray.forEach((avatarName) => {
            $selectionDropDown.find('.selectpicker').append("<option>" + avatarName + "</option>");
        });

        $selectionDropDown.selectpicker('refresh');

        this.$STANDING_CONTAINER.perfectScrollbar('update');
    });

    this._patreonChangeListner = new Listener("patreon changed", function (payload) {
        this.updateFreeDonationState(payload.backerLevel, payload.freeDonation);
    }.bind(this)).bindListener();

    this.$MODAL.on('hide.bs.modal', () => {
        this.standingListener.unbindListener();
    });

    this.$MODAL.on('shown.bs.modal', () => {
        this.$STANDING_CONTAINER.perfectScrollbar('update');
        this.$FAQ_CONTAINER.perfectScrollbar('update');
    });
}

AvatarDriveModal.prototype.setup = function (backerLevel, gotFreeDonation) {
    this.$STANDING_CONTAINER.perfectScrollbar({
        suppressScrollX: true
    });
    this.$FAQ_CONTAINER.perfectScrollbar({
        suppressScrollX: true
    });
    if (typeof paypal !== 'undefined') {
        paypal.config.env = PAYPAL_ENV;
        paypal.Button.render({
            payment: function () {
                return new paypal.Promise(function (resolve, reject) {
                    jQuery.post('/donation/create-payment', avatarDriveModal.getDonationInfo())
                        .done(function (paymentID) {
                            resolve(paymentID);
                        }).fail(function (err) {
                        reject(err.responseText);
                        displayMessage("Donation Error", err.responseText);
                    });
                });
            },
            onAuthorize: function (data) {
                jQuery.post('/donation/execute-payment', {paymentID: data.orderID, payerID: data.payerID})
                    .done(function () {
                        $("#admDonationAmount").val("");
                        displayMessage("Thanks for your Donation!");
                    }).fail(function (err) {
                    displayMessage("Donation Error", err.responseText);
                });
            },
            onCancel: function () {
                //Do nothing
            },

            locale: 'en_US',
            style: {
                size: 'medium',
                color: 'blue',
                shape: 'rect'
            }

        }, '#admPaypalButton');
    } else {
        displayMessage("Unable to connect to PayPal", "PayPal donations won't be possible, you can try reloading the page to fix this.", () => {
        });
    }

    this.updateFreeDonationState(backerLevel, gotFreeDonation);

    this._$FREE_DONATION_CHECKBOX.prop('checked', false);
    this._$FREE_DONATION_TOGGLE.find('.customCheckbox').click(() => {
        this.toggleFreeDonation(this._$FREE_DONATION_CHECKBOX.is(':checked'));
    });
};

AvatarDriveModal.prototype.show = function (showDonation) {
    if (showDonation) {
        this.showDonation();
    } else {
        this.hideDonation();
    }
    this.$MODAL.modal('show');
    this.standingListener.bindListener();
    this.requestStandings();
};

AvatarDriveModal.prototype.showDonation = function () {
    if (guestRegistrationController.isGuest) {
        displayMessage("Unavailable for Guest Accounts", "Guest accounts can't doante to the avatar drive");
        return;
    }
    this.$DONATION_CONTAINER.removeClass('hide');
    this.$DONATION_BUTTON.addClass('hide');
    this.$FAQ_CONTAINER.perfectScrollbar('update');
};

AvatarDriveModal.prototype.hideDonation = function () {
    this.$DONATION_CONTAINER.addClass('hide');
    this.$DONATION_BUTTON.removeClass('hide');
};

AvatarDriveModal.prototype.requestStandings = function () {
    socket.sendCommand({
        command: 'get avatar drive standings',
        type: 'avatardrive'
    });
};

AvatarDriveModal.prototype.showNominatedDonations = function () {
    this.$DONATION_DESCRIPTION.addClass('hide');
    this.$DONATION_CHOICE_TEXT
        .removeClass('hide')
        .text("Nomination");
    $(".admDonationAvatarSelector").removeClass("hide");
    this.$FAQ_CONTAINER.perfectScrollbar('update');
};

AvatarDriveModal.prototype.showNewDonations = function () {
    this.$DONATION_DESCRIPTION.removeClass('hide');
    this.$DONATION_CHOICE_TEXT
        .removeClass('hide')
        .text("Secondary Choice");
    $(".admDonationAvatarSelector").removeClass("hide");
    this.$FAQ_CONTAINER.perfectScrollbar('update');
};

AvatarDriveModal.prototype.showNoneDonations = function () {
    this.$DONATION_DESCRIPTION.addClass('hide');
    this.$DONATION_CHOICE_TEXT.addClass('hide');
    $(".admDonationAvatarSelector").addClass("hide");
    this.$FAQ_CONTAINER.perfectScrollbar('update');
};

AvatarDriveModal.prototype.toggleFreeDonation = function (on) {
    if (on) {
        this._$PAYPAL_AMOUNT_CONTAINER.addClass('hide');
        this._$FREE_AMOUNT_CONTAINER.removeClass('hide');
    } else {
        this._$FREE_DONATION_CHECKBOX.prop('checked', false);
        this._$FREE_AMOUNT_CONTAINER.addClass('hide');
        this._$PAYPAL_AMOUNT_CONTAINER.removeClass('hide');
    }
};

AvatarDriveModal.prototype.updateFreeDonationState = function (backerLevel, gotFreeDonation) {
    if (backerLevel > 2 || gotFreeDonation) {
        this._$FREE_DONATION_TOGGLE.removeClass('hide');
        if (!gotFreeDonation) {
            this._$FREE_DONATION_TOGGLE.find('.customCheckbox').addClass('disabled');
            this._$FREE_DONATION_TOGGLE.popover({
                content: "No more free donations this month",
                trigger: 'hover',
                placement: 'top',
                container: '#avatarDriveModal'
            });
        }
    } else {
        this.toggleFreeDonation(false);
    }
};

AvatarDriveModal.prototype.sendFreeDonation = function () {
    displayOption("Use Free Donation?", "You only get one free donation per month", "Use", "Cancel", () => {
        let resultListner = new Listener('free avatar donation', (payload) => {
            if (payload.succ) {
                displayMessage("Donation Recived");
            } else {
                displayMessage("Error Handling Donation", payload.error);
            }
            resultListner.unbindListener();
        });
        resultListner.bindListener();
        socket.sendCommand({
            command: 'free avatar donation',
            type: 'avatardrive',
            data: this.getDonationInfo()
        });
    }, () => {
    });
};


AvatarDriveModal.prototype.getDonationInfo = function () {
    let donationType;
    if ($("#admTargetExisting:checked").length > 0) {
        donationType = 1;
    } else if ($("#admTargetNew:checked").length > 0) {
        donationType = 2;
    } else {
        donationType = 3;
    }
    return {
        type: donationType,
        description: $("#admDonationDescription").val(),
        avatarSelected: $(".admDonationAvatarSelector > .btn > span:first-child").text(),
        anon: $("#admDonationAnon > input:checked").length > 0,
        value: $("#admDonationAmount").val()
    };
};

let avatarDriveModal = new AvatarDriveModal();