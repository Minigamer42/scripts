'use strict';

function BattleRoyalSpectatorController() {
    this.$container = $("#brTileSpectatorCountContainer");
    this.$icon = this.$container.find('i');

    this.$container.popover({
        content: 'Active Spectators',
        delay: 50,
        placement: 'auto',
        trigger: 'hover',
        container: '#brMapContainer'
    });
}

BattleRoyalSpectatorController.prototype.reset = function () {
    this.hide();
};

BattleRoyalSpectatorController.prototype.show = function () {
    this.$container.removeClass('hidden');
};

BattleRoyalSpectatorController.prototype.hide = function () {
    this.$container.addClass('hidden');
};

BattleRoyalSpectatorController.prototype.updateIcon = function (spectatorCount) {
    this.$icon
        .removeClass('fa-eye')
        .removeClass('fa-eye-slash');

    if (spectatorCount > 0) {
        this.$icon.addClass('fa-eye');
        this.$container.data('bs.popover').options.content = 'Active Spectators';
    } else {
        this.$icon.addClass('fa-eye-slash');
        this.$container.data('bs.popover').options.content = 'No Active Spectators';
    }
};