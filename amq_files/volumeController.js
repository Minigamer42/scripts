"use strict";

/*exported volumeController */
function VolumeController() {
    this.$bar = $("#qpVolumeBar");
    this.$indicator = $("#qpVolumeBarIndicator");
    this.$icon = $("#qpVolumeIcon");

    this.muted;
    this.volume;
}

VolumeController.prototype.setup = function () {
    this.$indicator.draggable({
        axis: "x",
        containment: '#qpVolumeBar',
        drag: function (event, ui) {
            this.volume = ui.position.left / this.$bar.width();
            this.adjustVolume();
        }.bind(this),
        start: () => {
            this.setMuted(false);
        }
    });

    this.$bar.mousedown((event) => {
        this.setMuted(false);
        this.volume = event.offsetX / this.$bar.width();
        this.adjustVolume();

        //Convert event to draggable and trigger the dragable event
        event.type = "mousedown.draggable";
        event.target = this.$indicator[0];
        this.$indicator.trigger(event);
    });

    this.$indicator.mousedown((event) => {
        event.stopPropagation();
    });

    this.$icon.click(() => {
        this.setMuted(!this.muted);
        this.adjustVolume();
    });

    this.volume = Cookies.get('volume');
    this.muted = Cookies.get('volumeMuted') == 'true' ? true : false;
    if (!/^\d*\.?\d*$/.test(this.volume)) {
        this.volume = 1;
    }
    this.adjustVolume();
};

VolumeController.prototype.setMuted = function (state) {
    this.muted = state;
    Cookies.set("volumeMuted", this.muted, {expires: 365});
};

VolumeController.prototype.adjustVolume = function () {
    let newVolume;
    if (this.muted) {
        newVolume = 0;
    } else {
        newVolume = this.volume;
        Cookies.set("volume", newVolume, {expires: 365});
    }
    this.$icon
        .removeClass('fa-volume-up')
        .removeClass('fa-volume-down')
        .removeClass('fa-volume-off');
    if (newVolume > 0.5) {
        this.$icon.addClass('fa-volume-up');
    } else if (newVolume === 0) {
        this.$icon.addClass('fa-volume-off');
    } else {
        this.$icon.addClass('fa-volume-down');
    }

    let uiOffset = newVolume * this.$bar.width();
    this.$indicator.css('left', uiOffset);

    quizVideoController.setVolume(newVolume);
};

var volumeController = new VolumeController();