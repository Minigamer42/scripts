"use strict";

/*exported SocialStatus*/
class SocialStatus {
    constructor($entry) {
        this.$entry = $entry;
        this.$entry.on("click", function (event) {
            event.stopPropagation();
            $('#socialTabStatusInnerCircle').contextMenu({x: event.clientX, y: event.clientY});
        });

        this.currentStatus = this.STATUS_IDS.ONLINE;

        $.contextMenu({
            selector: "#socialTabStatusInnerCircle",
            trigger: 'none',
            items: {
                SocialStatusOnline: {
                    name: "Online",
                    className: "cmSocialOnline",
                    callback: () => {
                        socialTab.socialStatus.changeSocialStatus(this.STATUS_IDS.ONLINE);
                    },
                    icon: "fa-circle"
                },
                SocialStatusDoNotDisturb: {
                    name: "Do Not Disturb",
                    className: "cmSocialDoNotDisturb",
                    callback: () => {
                        socialTab.socialStatus.changeSocialStatus(this.STATUS_IDS.DO_NO_DISTURB);
                    },
                    icon: "fa-circle"
                },
                SocialStatusAway: {
                    name: "Away",
                    className: "cmSocialAway",
                    callback: () => {
                        socialTab.socialStatus.changeSocialStatus(this.STATUS_IDS.AWAY);
                    },
                    icon: "fa-circle"
                },
                SocialStatusInvisble: {
                    name: "Invisible",
                    className: "cmSocialInvisible",
                    callback: () => {
                        socialTab.socialStatus.changeSocialStatus(this.STATUS_IDS.INVISIBLE);
                    },
                    icon: "fa-circle"
                }
            }

        });
    }

    changeSocialStatus(socialStatus) {
        socket.sendCommand({
            type: "social",
            command: "change social status",
            data: {
                socialStatus: socialStatus
            }
        });

        this.currentStatus = socialStatus;

        switch (socialStatus) {
            case this.STATUS_IDS.ONLINE:
                this.$entry.css("background-color", "#008000");
                break;
            case this.STATUS_IDS.DO_NO_DISTURB:
                this.$entry.css("background-color", "#c80e0e");
                break;
            case this.STATUS_IDS.AWAY:
                this.$entry.css("background-color", "#ecec0b");
                break;
            case this.STATUS_IDS.INVISIBLE:
                this.$entry.css("background-color", "#808080");
                break;
            default:
                this.$entry.css("background-color", "green");
                break;
        }
    }

    getSocialStatusInfo(statusCode) {
        switch (statusCode) {
            case this.STATUS_IDS.ONLINE:
                return "Online";
            case this.STATUS_IDS.DO_NO_DISTURB:
                return "Do Not Disturb";
            case this.STATUS_IDS.AWAY:
                return "Away";
            default:
                return "Offline";
        }
    }
}

SocialStatus.prototype.STATUS_IDS = {
    ONLINE: 1,
    DO_NO_DISTURB: 2,
    AWAY: 3,
    INVISIBLE: 4
};