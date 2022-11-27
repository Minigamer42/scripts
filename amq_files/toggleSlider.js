'use strict';

/*exported ToggleSlider */

function ToggleSlider($container, tickNames) {
    this.$container = $container;
    let spacing = 100 / (tickNames.length - 1);

    let $track = $("<div class='slider-track'></div>");
    this.$container.append($track);

    let tracks = [];
    for (let i = 0; i < tickNames.length - 1; i++) {
        let track = new ToggleTrack(spacing);
        $track.append(track.$track);
        tracks.push(track);
    }

    let $tickContainer = $("<div class='slider-tick-container clickAble'></div>");

    this.tickList = [];
    tickNames.forEach((name, index) => {
        let toggleTick = new ToggleTick(name, true, index * spacing);
        this.tickList.push(toggleTick);
        $tickContainer.append(toggleTick.$tick);

        if ((index - 1) >= 0) {
            tracks[index - 1].addTick(toggleTick);
        }

        if (index < tracks.length) {
            tracks[index].addTick(toggleTick);
        }

    });
    this.$container.append($tickContainer);
}

ToggleSlider.prototype.setValue = function (onArray) {
    onArray.forEach((on, index) => {
        this.tickList[index].toggle(on);
    });
};

ToggleSlider.prototype.getValues = function () {
    return this.tickList.map((tick) => {
        return tick.on;
    });
};

function ToggleTrack(widthPercent) {
    this.$track = $("<div class='slider-selection toggleTrack' style='width:" + widthPercent + "%;'></div>");

    this.ticks = [];
}

ToggleTrack.prototype.addTick = function (tick) {
    this.ticks.push(tick);
    tick.addListener(() => {
        this.update();
    });
    this.update();
};

ToggleTrack.prototype.update = function () {
    let oneOff = this.ticks.some(tick => {
        return !tick.on;
    });

    if (oneOff) {
        this.$track.addClass('off');
    } else {
        this.$track.removeClass('off');
    }
};

function ToggleTick(name, on, tickOffsetPercent) {
    this.name = name;
    this.on;
    this._listeners = [];

    this.$tick = $("<div class='slider-tick round in-selection' style='left: " + tickOffsetPercent + "%;'></div>");
    this.$label = $("<div class='toggleTickLabel'>" + this.name + "</div>");

    this.$tick.append(this.$label);

    this.toggle(on);

    this.$tick.click(() => {
        this.toggle(!this.on);
    });
}

ToggleTick.prototype.toggle = function (on) {
    this.on = on;
    if (this.on) {
        this.$tick.removeClass('off');
    } else {
        this.$tick.addClass('off');
    }

    this._listeners.forEach(listener => {
        listener(on);
    });
};

ToggleTick.prototype.addListener = function (listener) {
    this._listeners.push(listener);
};