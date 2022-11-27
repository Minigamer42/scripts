'use strict';

/*exported LobbyAvatarContainer*/

class LobbyAvatarContainer {
    constructor() {
        this.$avatarContainer = $("#lobbyAvatarContainer");
        this.$leftContainer = $(".lobbyAvatarRow.left");
        this.$rightContainer = $(".lobbyAvatarRow.right");

        this.$avatarContainer.perfectScrollbar({
            suppressScrollX: true,
            minScrollbarLength: 50
        });
    }

    get leftContainerCount() {
        return this.$leftContainer.children().length;
    }

    get rightContainerCount() {
        return this.$rightContainer.children().length;
    }

    addAvatar(avatarSlot) {
        if (this.leftContainerCount <= this.rightContainerCount) {
            this.$leftContainer.append(avatarSlot.$LOBBY_SLOT);
        } else {
            this.$rightContainer.append(avatarSlot.$LOBBY_SLOT);
        }
        avatarSlot.updateLayout();
    }

    updateLayout() {
        this.$avatarContainer.perfectScrollbar('update');
    }

    reset() {
        // Object.values(this.avatarSlots).forEach(slot => {
        // 	slot.reset();
        // });
    }
}

LobbyAvatarContainer.prototype.AVATAR_SLOT_COUNT = 8;
LobbyAvatarContainer.prototype.ROW_SIZE = 3;