'use strict';

/*exported avatarDrive*/

function AvatarDrive() {
    this.top5Nominations = [];
    this.top5AllTime = [];
    this.top5Monthly = [];
    this.top5Weekly = [];
    this.recentDonations = [];
    this.totalDonations = 0;
    this.DRIVE_GOAL = 600;

    this.TOP_TAB_STATES = {
        WEEKLY: 1,
        MONTLY: 2,
        ALL_TIME: 3
    };

    this.topTabCurrentState = this.TOP_TAB_STATES.WEEKLY;

    this.STANDING_ENTRIES = [
        $("#mpDriveStandingEntry-1"),
        $("#mpDriveStandingEntry-2"),
        $("#mpDriveStandingEntry-3"),
        $("#mpDriveStandingEntry-4"),
        $("#mpDriveStandingEntry-5")
    ];
    this.STANDING_ENTRIES.forEach($entry => {
        $entry.find('.mpDriveEntryName').popover({
            content: '',
            delay: 50,
            placement: 'top',
            trigger: 'hover'
        });
    });

    this.TOP_ENTIRES = [
        $("#mpDrivetopEntry-1"),
        $("#mpDrivetopEntry-2"),
        $("#mpDrivetopEntry-3"),
        $("#mpDrivetopEntry-4"),
        $("#mpDrivetopEntry-5")
    ];

    this.RECENT_ENTIRES = [
        $("#mpDriveRecentEntry-1"),
        $("#mpDriveRecentEntry-2"),
        $("#mpDriveRecentEntry-3"),
        $("#mpDriveRecentEntry-4"),
        $("#mpDriveRecentEntry-5"),
        $("#mpDriveRecentEntry-6"),
        $("#mpDriveRecentEntry-7"),
        $("#mpDriveRecentEntry-8")
    ];
    this.RECENT_ENTIRES.forEach($entry => {
        $entry.popover({
            content: '',
            delay: 50,
            container: '#mpDriveRecentContainer',
            placement: 'top',
            trigger: 'hover'
        });
    });

    this.$TOP_TABS = $("#mpDriveTopTabContainer > div");
    this.$ALL_TIME_TAB = $("#mpDriveAllTimeTab, #mpDriveAllTimeTabSmall");
    this.$ALL_TIME_TAB.click(this.updateTop5AllTime.bind(this));
    this.$MONTHLY_TAB = $("#mpDriveMonthlyTab, #mpDriveMonthlyTabSmall");
    this.$MONTHLY_TAB.click(this.updateTop5Monthly.bind(this));
    this.$WEEKLY_TAB = $("#mpDriveWeeklyTab, #mpDriveWeeklyTabSmall");
    this.$WEEKLY_TAB.click(this.updateTop5Weekly.bind(this));
    this.$PROGRESS_BAR = $('#mpDriveStatusBarContainer .progress-bar');
    this.$TOTAL_TEXT = $("#mpDriveTotal");
    this.$GOAL_TEXT = $("#mpDriveGoal");

    this._$FREE_DONATION_HIGHLIGHT = $("#mpDriveFreeDonationHightlight");

    this.newDonationListener = new Listener('new donation', (payload) => {
        this.recentDonations.unshift(payload.donation);

        if (this.recentDonations.length > 8) {
            this.recentDonations.pop();
        }

        this.top5AllTime = payload.top5AllTime;
        this.top5Monthly = payload.top5Monthly;
        this.top5Nominations = payload.top5Nominations;
        this.top5Weekly = payload.top5Weekly;
        this.totalDonations = payload.total;

        this.updateAll();
    }).bindListener();

    this.newAvatarListener = new Listener('avatar drive changes', (payload) => {
        this.recentDonations = payload.recent8;
        this.top5Nominations = payload.top5Nominations;

        this.updateAll();
    }).bindListener();
}

AvatarDrive.prototype.setup = function (top5Nominations, top5AllTime, top5Monthly, top5Weekly, recentDonations, total, gotFreeDonation) {
    this.top5Nominations = top5Nominations;
    this.top5AllTime = top5AllTime;
    this.top5Monthly = top5Monthly;
    this.top5Weekly = top5Weekly;
    this.recentDonations = recentDonations;
    this.totalDonations = total;

    this.$GOAL_TEXT.text(this.DRIVE_GOAL + '$');

    if (gotFreeDonation) {
        this._$FREE_DONATION_HIGHLIGHT.removeClass('hide');
    }

    this.updateAll();
};

AvatarDrive.prototype.updateTop5Nominations = function () {
    this.top5Nominations.forEach((nomination, index) => {
        let $entry = this.STANDING_ENTRIES[index];
        $entry
            .find('.mpDriveEntryName').text(nomination.name)
            .data('bs.popover').options.content = nomination.name;
        $entry.find('.mpDriveEntryValue').text(this.formatValue(nomination.value));
    });
};

AvatarDrive.prototype.updateTop5AllTime = function () {
    this.topTabCurrentState = this.TOP_TAB_STATES.ALL_TIME;
    this.clearTopTab();
    this.$ALL_TIME_TAB.addClass("selected");
    this.updateTop5Donators(this.top5AllTime);
};

AvatarDrive.prototype.updateTop5Monthly = function () {
    this.topTabCurrentState = this.TOP_TAB_STATES.MONTLY;
    this.clearTopTab();
    this.$MONTHLY_TAB.addClass("selected");
    this.updateTop5Donators(this.top5Monthly);
};

AvatarDrive.prototype.updateTop5Weekly = function () {
    this.topTabCurrentState = this.TOP_TAB_STATES.WEEKLY;
    this.clearTopTab();
    this.$WEEKLY_TAB.addClass("selected");
    this.updateTop5Donators(this.top5Weekly);
};

AvatarDrive.prototype.updateTop5Donators = function (list) {
    list.forEach((donater, index) => {
        let $entry = this.TOP_ENTIRES[index];
        let $entryName = $entry.find('.mpDriveEntryName');
        $entryName.text(donater.name);
        if ($entryName.data('bs.popover')) {
            $entryName.data('bs.popover').options.content = donater.name;
        } else {
            $entryName.popover({
                content: donater.name,
                delay: 50,
                placement: 'top',
                trigger: 'hover'
            });
        }
        $entry.find('.mpDriveEntryValue').text(this.formatValue(donater.amount));
    });
    if (list.length < 5) {
        for (let i = list.length; i < 5; i++) {
            let $entry = this.TOP_ENTIRES[i];
            $entry.find('.mpDriveEntryName').text("");
            $entry.find('.mpDriveEntryValue').text("");
            $entry.popover('destroy');
        }
    }
};

AvatarDrive.prototype.updateRecent = function () {
    this.recentDonations.forEach((donation, index) => {
        let $entry = this.RECENT_ENTIRES[index];
        $entry.find('.mpDriveEntryName').text(donation.username);
        $entry.find('.mpDriveEntryValue').text(this.formatValue(donation.amount));
        $entry.find('.mpDrivenEntryTarget').text(donation.avatarName);
        $entry.data('bs.popover').options.content = donation.username;
    });
};

AvatarDrive.prototype.updateBar = function () {
    let percent = this.totalDonations * 100 / this.DRIVE_GOAL;
    this.$PROGRESS_BAR.css('width', (percent > 100 ? 100 : percent) + '%');
    this.$TOTAL_TEXT.text(this.totalDonations ? this.totalDonations : 0);
};

AvatarDrive.prototype.updateAll = function () {
    this.updateTop5Nominations();
    this.updateRecent();
    this.updateBar();

    if (this.topTabCurrentState === this.TOP_TAB_STATES.WEEKLY) {
        this.updateTop5Weekly();
    } else if (this.topTabCurrentState === this.TOP_TAB_STATES.MONTLY) {
        this.updateTop5Monthly();
    } else {
        this.updateTop5AllTime();
    }

};

AvatarDrive.prototype.clearTopTab = function () {
    this.$TOP_TABS.removeClass("selected");
};

AvatarDrive.prototype.formatValue = function (value) {
    return Math.floor(value) + '$';
};

AvatarDrive.prototype.showModal = function (showDonationTab) {
    if (showDonationTab && guestRegistrationController.isGuest) {
        displayMessage("Unavailable for Guest Accounts", "Guest accounts can't doante to the avatar drive");
        return;
    }
    avatarDriveModal.show(showDonationTab);
};

var avatarDrive = new AvatarDrive();