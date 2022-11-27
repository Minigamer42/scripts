'use strict';

/*exported playerProfileController*/

class PlayerProfileController {
    constructor() {
        this.PROFILE_WIDTH = 300; //px
        this.PROFILE_HEIGHT = 210.8; //px

        this.open = false;
        this.currentProfile = null;
        this.editToggleOnListener = null;


        this.$PROFILE_LAYER.click(event => {
            event.originalEvent.profileClick = true;
        });
        $('body').click((event) => {
            if (this.open && !event.originalEvent.profileClick) {
                this.clearProfiles();
            }
        });
    }

    loadProfileIfClosed(profileName, $requestObject, offsetCorrections, closeHandler, offline, inGame) {
        if (!$requestObject.hasClass('playerProfileOpen')) {
            $requestObject.addClass('playerProfileOpen');
            let updatedCloserHandler = () => {
                $requestObject.removeClass('playerProfileOpen');
                closeHandler();
            };
            this.loadProfile(profileName, $requestObject, offsetCorrections, updatedCloserHandler, offline, inGame);
        }
    }

    loadProfile(profileName, $requestObject, offsetCorrections, closeHandler, offline, inGame) {
        let profileListener = new Listener("player profile", (payload) => {
            if (payload.error) {
                displayMessage('Error Getting Player Profile', payload.error);
            } else {
                let offset = this.calculateOffset($requestObject, offsetCorrections);
                this.displayProfile(payload, offset, closeHandler, offline, inGame);
            }
            profileListener.unbindListener();
        });
        profileListener.bindListener();

        socket.sendCommand({
            type: 'social',
            command: 'player profile',
            data: {
                name: profileName
            }
        });
    }

    clearProfiles() {
        if (this.currentProfile) {
            this.currentProfile.close();
            this.currentProfile = null;
        }
        this.open = false;
    }

    toogleEdit() {
        if (this.$profile) {
            this.$profile.toggleClass('showEdit');
        }
    }

    calculateOffset($requestObject, offsetCorrections) {
        let docuementWidth = $(document).width();
        let documentHeight = $(document).height();
        let requestOffset = $requestObject.offset();

        let xOffset;
        if (requestOffset.left < docuementWidth / 2) {
            xOffset = requestOffset.left + $requestObject.innerWidth();
        } else {
            xOffset = requestOffset.left - this.PROFILE_WIDTH;
        }
        if (offsetCorrections.x) {
            xOffset += offsetCorrections.x;
        }

        let yOffset;
        if (requestOffset.top < documentHeight / 2) {
            yOffset = requestOffset.top;
        } else {
            yOffset = requestOffset.top - this.PROFILE_HEIGHT + $requestObject.innerHeight();
        }
        if (offsetCorrections.y) {
            yOffset += offsetCorrections.y;
        }

        return {
            x: xOffset,
            y: yOffset
        };
    }

    displayProfile(profileInfo, offset, closeHandler, offline, inGame) {
        this.clearProfiles();
        this.currentProfile = new PlayerProfile(profileInfo, offset, closeHandler, offline, inGame);
        this.$PROFILE_LAYER.append(this.currentProfile.$profile);
        this.currentProfile.resizeName();
        this.open = true;
    }
}

PlayerProfileController.prototype.$PROFILE_LAYER = $("#playerProfileLayer");

var playerProfileController = new PlayerProfileController();