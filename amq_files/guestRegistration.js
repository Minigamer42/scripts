'use strict';

/*exported guestRegistrationController*/

class GuestRegistrationController {
    constructor() {
        this.$noticeContainer = $("#guestAccountNoticeContainer");
        this.$modal = $("#guestRegistrationModal");

        this.$formContainer = $("#grRegisterFormContainer");
        this.$verificationContainer = $("#grRegisterEmailValidationContainer");

        this.$username = $("#grUsername");
        this.$password = $("#grPassword");
        this.$passwordRepeat = $("#grPasswordRepeat");
        this.$email = $("#grEmail");
        this.$country = $("#grCountry");
        this.$tos = $("#grToS");

        this.$errorContainer = $("#grErrorMessage");
        this.$registerButton = $("#grRegisterButton");
        this.$resendEmailButton = $("#grResendEmail");

        this.$validationEmailText = $("#grVeriEmailTarget");
        this.$validationEmailInput = $("#grVerificationEmail");

        this.$registerButton.click(() => {
            this.sendRegistrationPackage();
        });

        this._guestRegistrationListener = new Listener("guest registration", (payload) => {
            if (payload.succ) {
                this.updateValidationEmail(payload.email);
                this.$formContainer.addClass('hide');
                this.$verificationContainer.removeClass('hide');
            } else {
                this.showError(payload.error);
            }
        });
        this._guestRegistrationListener.bindListener();

        this._accountVerifiedListener = new Listener("account verified", (payload) => {
            this.$modal.modal('hide');
            this.$noticeContainer.addClass('hide');
            selfName = payload.name;
            taxRate = payload.saleTax;
            this.isGuest = false;
            displayMessage('Account Verified', 'All Game Features have been Unlocked!');

        });
        this._accountVerifiedListener.bindListener();

        this.isGuest = false;
    }

    updateValidationEmail(email) {
        this.$validationEmailText.text(email);
        this.$validationEmailInput.val(email);
    }

    setup(isGuest) {
        if (isGuest) {
            this.$noticeContainer.removeClass('hide');
        }
        this.isGuest = isGuest;
    }

    showError(msg) {
        this.$errorContainer
            .text(msg)
            .removeClass('hide');
    }

    sendRegistrationPackage() {
        let username = this.$username.val();
        let password = this.$password.val();
        let passwordRepeat = this.$passwordRepeat.val();
        let email = this.$email.val();
        let country = this.$country.val();

        if (!this.$tos.is(':checked')) {
            this.showError("You must agree to the Terms of Service");
            return;
        }

        if (username.length === 0) {
            this.showError("No username provided");
            return;
        }

        if (username.length > 16) {
            this.showError("Username can't be over 16 characters");
            return;
        }

        if (!/^\w+$/.test(username)) {
            this.showError("Username can only contain letters, numbers and _");
            return;
        }

        if (username.toLowerCase() === 'amq') {
            this.showError('Username "AMQ" is reserved and can\'t be used');
        }

        if (password.length < 5) {
            this.showError("Passwords must be of length at least 5");
            return;
        }

        if (password.length > 9999) {
            this.showError("Password must be at most 9999 characters");
            return;
        }

        if (password !== passwordRepeat) {
            this.showError("Passwords doesn't match");
            return;
        }

        if (email.length === 0) {
            this.showError("No email provided");
            return;
        }

        if (!/.+@.+/.test(email)) {
            this.showError("Not a valid email");
            return;
        }

        if (country.length === +0) {
            this.showError("You must select a country of residence");
            return;
        }

        socket.sendCommand({
            type: "settings",
            command: "guest registration",
            data: {
                username,
                password,
                email,
                country
            }
        });
    }
}

var guestRegistrationController = new GuestRegistrationController();