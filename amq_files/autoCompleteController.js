'use strict';

function AutoCompleteController($input) {
    this.list = [];
    this.version = null;
    this.$input = $input;
    this.awesomepleteInstance;
}

AutoCompleteController.prototype.updateList = function () {
    if (this.version === null) {
        let retriveListListener = new Listener("get all song names", function (payload) {
            this.version = payload.version;
            this.list = payload.names;
            this.newList();
            retriveListListener.unbindListener();
        }.bind(this));
        retriveListListener.bindListener();
        socket.sendCommand({
            type: 'quiz',
            command: 'get all song names'
        });
    } else {
        let updateSongsListener = new Listener("update all song names", function (payload) {
            this.version = payload.version;
            if (payload.deleted.length + payload.new.length > 0) {
                this.list = this.list.filter(name => !payload.deleted.includes(name));
                this.list = this.list.concat(payload.new);
                this.newList();
            }
            updateSongsListener.unbindListener();
        }.bind(this));
        updateSongsListener.bindListener();
        socket.sendCommand({
            type: 'quiz',
            command: 'update all song names',
            data: {
                currentVersion: this.version
            }
        });
    }
};

AutoCompleteController.prototype.newList = function () {
    if (this.awesomepleteInstance) {
        this.awesomepleteInstance.destroy();
    }
    this.awesomepleteInstance = new AmqAwesomeplete(this.$input[0],
        {
            list: this.list,
            minChars: 1,
            maxItems: 25
        },
        true);
};

AutoCompleteController.prototype.hide = function () {
    if (this.awesomepleteInstance) {
        this.awesomepleteInstance.hide();
    }
};