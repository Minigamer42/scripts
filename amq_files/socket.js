/*exported socket*/
"use strict";

function Socket() {
    this._socket = undefined;
    this.listners = {};
    this._disconnected = false;
    this._sessionId;
    this._attempReconect = true;
}

Socket.prototype.setup = function () {
    $(window).bind('beforeunload', () => {
        this._socket.io.reconnection(false);
        setTimeout(() => {
            setTimeout(() => {
                this._socket.io.reconnection(true);
            }, 1000);
        }, 1);
    });
    try {
        $.ajax({
            url: "/socketToken",
            type: "GET",
            success: function (jsonPackageString) {
                let socketPackage = JSON.parse(jsonPackageString);
                let portString = ':' + socketPackage.port;
                let socketUrl;
                if (location.hostname === "localhost" || location.hostname === "127.0.0.1")
                    socketUrl = location.hostname + portString;
                else {
                    socketUrl = "https://socket.animemusicquiz.com" + portString;
                }
                this._socket = io.connect(socketUrl, {
                    reconnection: true,
                    reconnectionDelay: 1000,
                    reconnectionDelayMax: 2000,
                    reconnectionAttempts: 5,
                    query: {
                        token: socketPackage.token
                    }
                });

                this._socket.on('sessionId', (sessionId) => {
                    this._sessionId = sessionId;
                });


                this._socket.on("command", function (payload) {
                    if (this.listners[payload.command]) {
                        this.listners[payload.command].slice(0).forEach((listner) => {
                            try {
                                listner.fire(payload.data);
                            } catch (error) {
                                console.log(error);
                            }
                        });
                    }
                }.bind(this));

                this._socket.on("disconnect", () => {
                    displayMessage("Disconnected from server", "Attempting to reconnect.");
                    this._disconnected = true;
                });

                this._socket.on('reconnect', () => {
                    console.log("reconnect: " + this._sessionId);
                    displayMessage("Successfully  Reconnected");
                    this._disconnected = false;
                });

                this._socket.on('reconnect_attempt', () => {
                    console.log("Attempting to reconnect: " + this._sessionId);
                    this._socket.io.opts.query = {
                        session: this._sessionId
                    };
                });

                this._socket.on('reconnect_failed', () => {
                    displayMessage("Unable to Reconnect", "Unable to reconnect to the server, reloading the page.", () => {
                        window.location = '/';
                    });
                });
            }.bind(this),
            error: () => {
                displayMessage("Not logged in, please reload the page");
            }
        });
    } catch (err) {
        displayMessage("Error communicating with server", "Please Reload the Page");
    }

};

Socket.prototype.addListerner = function (command, listner) {
    //If listner for command doesn't alreayd exsist, create it
    if (!this.listners[command]) {
        this.listners[command] = [];
    }
    //Add callback to list
    this.listners[command].push(listner);
};

Socket.prototype.removeListener = function (command, listner) {
    //console.log("Listners: " + this.listners[command].length);
    if (this.listners[command]) {
        var index = this.listners[command].findIndex((value) => {
            return value === listner;
        });
        if (index > -1) {
            this.listners[command].splice(index, 1);
        } else {
            console.log("Unknown listner for: " + command);
        }
    }
    //console.log("Listners: " + this.listners[command].length);
};

Socket.prototype.sendCommand = function (content, responseHandler) {
    if (!this._disconnected) {
        if (responseHandler) {
            let responseListener = new Listener(content.command, response => {
                responseHandler(response);
                responseListener.unbindListener();
            });
            responseListener.bindListener();
        }
        this._socket.emit("command", content);
    }
};

var socket = new Socket();