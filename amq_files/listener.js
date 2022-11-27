'use strict';

function Listener(command, callback) {
    this.command = command;
    this.callback = callback;

    this.bound = false;
}

Listener.prototype.fire = function (payload) {
    this.callback(payload);
};

Listener.prototype.bindListener = function () {
    if (!this.bound) {
        socket.addListerner(this.command, this);
        this.bound = true;
    }
};

Listener.prototype.unbindListener = function () {
    if (this.bound) {
        socket.removeListener(this.command, this);
        this.bound = false;
    }
};