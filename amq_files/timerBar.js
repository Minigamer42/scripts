'use strict';

/*exported TimerBar*/

function TimerBar($bar) {
    this.$TIMER_BAR = $bar;

    this.TICK_RATE = 1000 / 60; //60 fps

    this.updateInterval;

    this.setWidthPercent(0);
}

TimerBar.prototype.setWidthPercent = function (percent) {
    this.$TIMER_BAR.css('transform', 'translateX(-' + (100 - percent) + '%)');
};

TimerBar.prototype.start = function (timerLength, timeAlreadyPlayed) {
    if (!timeAlreadyPlayed) {
        timeAlreadyPlayed = 0;
    }
    let startTime = moment().subtract(timeAlreadyPlayed, 's');

    clearInterval(this.updateInterval);
    this.updateInterval = setInterval(() => {
        let timeSinceStart = moment.duration(moment().diff(startTime)).asSeconds();
        if (timeSinceStart > timerLength) {
            this.setWidthPercent(100);
            clearInterval(this.updateInterval);
        } else {
            let percentDone = (timeSinceStart / timerLength) * 100;
            this.setWidthPercent(percentDone);
        }
    }, this.TICK_RATE);
};

TimerBar.prototype.reset = function () {
    clearInterval(this.updateInterval);
    this.setWidthPercent(0);
};

TimerBar.prototype.updateState = function (state) {
    if (state) {
        this.start(state.length, state.played);
    } else {
        this.reset();
    }
};