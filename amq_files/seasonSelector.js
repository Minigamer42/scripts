'use strict';

function SeasonSelector($seasonContainer) {
    this.seasonObjects = $seasonContainer.children();

    this._listeners = [];

    this.seasonObjects.each((index, season) => {
        $(season).click(() => {
            this.setValue(index);
            this._listeners.forEach((listener => {
                listener(this.getValue());
            }));
        });
    });
}

SeasonSelector.prototype.setValue = function (seasonNumber) {
    this.seasonObjects.removeClass('selected');
    this.seasonObjects.eq(seasonNumber).addClass('selected');
};

SeasonSelector.prototype.getValue = function () {
    let selectedValue;

    this.seasonObjects.each((index, season) => {
        if ($(season).hasClass('selected')) {
            selectedValue = index;
        }
    });

    return selectedValue;
};

SeasonSelector.prototype.addListener = function (listener) {
    this._listeners.push(listener);
};