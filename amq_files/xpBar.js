"use strict";

/*exported xpBar*/
function XpBar() {
    this.$xpBarOuter = $("#xpOuterContainer");
    this.$xpBarInner = $("#xpBarInner");
    this.$xpBarAnimationContainer = $("#xpBarAnimationContainer");
    this.$levelText = $(".levelText");
    this.$creditText = $("#currencyText");
    this.$CREDIT_ICON_GLOW = $("#currencyIconGlow");
    this.$creditSpawner = $("#currencyBubbleTextSpawner");
    this.$xpSpawner = $("#xpBubbleTextSpawner");
    this.$ticketText = $("#currencyTicketText");
    this.$ticketSpawner = $("#currencyTicketBubbleTextSpawner");

    this.creditBubbleTextController;
    this.xpBubbleTextController;

    this.$xpBarOuter.popover({
        content: "- / -",
        placement: "top",
        trigger: "hover"
    });

    this._xpPercent = 0;
    this.level = 0;
    this.currentCreditCount = 0;
    this.currentTicketCount = 0;
    this.TICK_RATE = 50;

    this._uploadedUrlRemoved = new Listener(
        "xp credit change",
        function (payload) {
            this.setXpPercent(payload.xpInfo.xpPercent);
            this.setXpText(payload.xpInfo.xpIntoLevel, payload.xpInfo.xpForLevel);
            this.setLevel(payload.level);
            this.setCredits(payload.credits);
        }.bind(this)
    );
    this._ticketChangeListener = new Listener(
        "ticket update",
        function (payload) {
            this.setTickets(payload.tickets);
            if (payload.avatarTokens != undefined) {
                storeWindow.avatarTokens = payload.avatarTokens;
            }
        }.bind(this)
    );
    this._noteUpdateListener = new Listener(
        "note update",
        function (payload) {
            this.setCredits(payload.notes);
        }.bind(this)
    );
}

XpBar.prototype.setup = function (xpInfo, level, credits, tickets) {
    this.creditBubbleTextController = new BubbleTextController(this.$creditSpawner);
    this.xpBubbleTextController = new BubbleTextController(this.$xpSpawner);
    this.ticketBubbleTextController = new BubbleTextController(this.$ticketSpawner);

    this.setLevel(level);
    this.setXpPercent(xpInfo.xpPercent);
    this.setXpText(xpInfo.xpIntoLevel, xpInfo.xpForLevel);
    this.setCredits(credits, true);
    this.setTickets(tickets, true);

    this._uploadedUrlRemoved.bindListener();
    this._ticketChangeListener.bindListener();
    this._noteUpdateListener.bindListener();
};

XpBar.prototype.setLevel = function (newLevel) {
    this.level = newLevel;
    this.$levelText.text(newLevel);
};

XpBar.prototype.setXpPercent = function (newXpP) {
    this._xpPercent = newXpP;
    this.$xpBarInner.css("transform", "translateX(" + (newXpP * 100 - 100) + "%)");
};

XpBar.prototype.setXpText = function (current, target) {
    let xpString = current + "/" + target;
    this.$xpBarOuter.data("bs.popover").options.content = xpString;
};

XpBar.prototype.handleXpChange = function (newXpPercent, toNextLevel, currentXp, level, lastGain) {
    this.xpGain(newXpPercent, level);
    this.setXpText(currentXp, toNextLevel);
    if (lastGain) {
        this.xpBubbleTextController.spawnText("+" + lastGain);
    }
};

XpBar.prototype.xpGain = function (newXpP, newLevel) {
    if (newLevel === this.level) {
        this.$xpBarAnimationContainer.addClass("smallGlow");
        this.$xpBarAnimationContainer.on("transitionend", () => {
            this.$xpBarAnimationContainer.removeClass("smallGlow");
            this.$xpBarAnimationContainer.off("transitionend");
        });
        this.setXpPercent(newXpP);
    } else {
        this.$xpBarAnimationContainer.addClass("smallGlow");

        this.$xpBarInner.on("transitionend", () => {
            this.$xpBarAnimationContainer.removeClass("smallGlow").addClass("bigGlow");
            this.$levelText.addClass("textGlowGreen");
            this.$xpBarInner.off("transitionend").on("transitionend", () => {
                this.$xpBarAnimationContainer.removeClass("bigGlow");
                this.$levelText.removeClass("textGlowGreen");
                this.$xpBarAnimationContainer.off("transitionend");
            });

            this.setXpPercent(newXpP);
            this.setLevel(newLevel);
        });

        this.setXpPercent(1);
    }
};

XpBar.prototype.setCredits = function (credits, noAnimation, onlyIfLarger) {
    if (onlyIfLarger && credits <= this.currentCreditCount) {
        return;
    }
    if (noAnimation) {
        this.$creditText.text(credits);
    } else {
        this.textCountAnimation(this.currentCreditCount, credits, this.$creditText);

        let creditGain = credits - this.currentCreditCount;
        if (creditGain > 0) {
            this.creditBubbleTextController.spawnText("+" + creditGain);
        } else if (creditGain < 0) {
            this.creditBubbleTextController.spawnText(creditGain);
        }
    }

    this.currentCreditCount = credits;
};

XpBar.prototype.setTickets = function (tickets, noAnimation, onlyIfLarger) {
    if (onlyIfLarger && tickets <= this.currentTicketCount) {
        return;
    }
    if (noAnimation) {
        this.$ticketText.text(tickets);
    } else {
        this.textCountAnimation(this.currentTicketCount, tickets, this.$ticketText);

        let gain = tickets - this.currentTicketCount;
        if (gain > 0) {
            this.ticketBubbleTextController.spawnText("+" + gain);
        } else if (gain < 0) {
            this.ticketBubbleTextController.spawnText(gain);
        }
    }

    this.currentTicketCount = tickets;
};

XpBar.prototype.textCountAnimation = function (currentAmount, targetAmount, $textContainer) {
    let change = targetAmount - currentAmount;
    let tickChange = change / this.TICK_RATE;
    let currentValue = currentAmount;
    let animationInterval = setInterval(() => {
        currentValue += tickChange;
        if ((change < 0 && currentValue <= targetAmount) || (change >= 0 && currentValue >= targetAmount)) {
            $textContainer.text(targetAmount);
            clearInterval(animationInterval);
        } else {
            $textContainer.text(Math.floor(currentValue));
        }
    }, 1000 / this.TICK_RATE);
};

var xpBar = new XpBar();
