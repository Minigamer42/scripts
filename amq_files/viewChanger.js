"use strict";

/*exported viewChanger*/

function ViewChanger() {
    this.__controllers;

    this.currentView = "main";

    this._$loadingScreen = $("#loadingScreen");
}

ViewChanger.prototype.setup = function () {
    this.__controllers = {
        main: {
            openView: (callback) => {
                if (this.currentView === 'lobby' || this.currentView === 'quiz') {
                    hostModal.reset();
                }
                $("#mainPage").removeClass("hidden");
                callback();
            },
            closeView: function () {
                $("#mainPage").addClass("hidden");
            }
        },
        expandLibrary: expandLibrary,
        roomBrowser: roomBrowser,
        lobby: lobby,
        quiz: quiz,
        battleRoyal: battleRoyal,
        cheatTestGame: cheatTestGame
    };

};

ViewChanger.prototype.changeView = function (newView, arg) {
    if (arg === undefined) {
        arg = {};
    }

    this.__controllers[this.currentView].closeView(arg);
    this._$loadingScreen.removeClass("hidden");
    this.__controllers[newView].openView(function () {
        this._$loadingScreen.addClass("hidden");
        this.currentView = newView;
    }.bind(this));

};

ViewChanger.prototype.getCurrentView = function () {
    return this.currentView;
};

ViewChanger.prototype.hideLoadingScreen = function () {
    this._$loadingScreen.addClass('hidden');
};


var viewChanger = new ViewChanger();
