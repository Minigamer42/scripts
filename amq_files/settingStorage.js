'use strict';

function SettingStorage(savedSettings) {
    this._$SAVED_LIST = $("#mhLoadContainer > ul");
    this._$LOAD_CONTAINER = $("#mhLoadContainer");
    this._$LOAD_FROM_CODE_BUTTON = $("#mhLoadFromSaveCodeButton");
    this._$LOAD_ENTRY_CONTAINER = $("#mhLoadListEntryContainer");
    this._$SAVE_BUTTON = $("#mhSaveSettingButton");
    this._$LOAD_TAB_HEADER = $("#mhLoadHeader > h5");

    this._HEADER_MESSAGES = {
        ENABLED: "Select Settings to Load",
        DISABLED: "Loading Disabled"
    };

    this._$LOAD_ENTRY_CONTAINER.perfectScrollbar({
        suppressScrollX: true
    });

    this._MAX_SETTING_NAME_LENGTH = 20;
    this._MAX_SAVED_COUNT = 20;
    this.saveDisabled = false;
    this.loadingEnabled = true;

    this._serilizer = new SettingSerilizer();

    this._tabs = [];
    savedSettings.forEach(setting => {
        this.addSetting(setting.id, setting.settingString, setting.name);
    });

    this._$LOAD_FROM_CODE_BUTTON.click(() => {
        swal({
            title: 'Load Settings from Code',
            input: 'text',
            inputPlaceholder: 'Setting Code',
            inputValidator: (value) => {
                if (!value) {
                    return 'You must provide a code';
                }
                return false;
            },
            showCancelButton: true,
            confirmButtonColor: '#204d74',
            confirmButtonText: 'Load'
        }).then((result) => {
            if (result.value) {
                try {
                    let settingObject = this._serilizer.decode(result.value);
                    hostModal.changeSettings(settingObject);
                } catch (err) {
                    displayMessage("Error Decoding Code");
                    throw err;
                }
            }
        });
    });

    this._settingDeletedListener = new Listener("quiz setting deleted", (payload) => {
        if (payload.success) {
            let tabIndex = this._tabs.findIndex(tab => {
                return tab.id === payload.id;
            });
            this._tabs[tabIndex].remove();
            this._tabs.splice(tabIndex, 1);
            this.updateScrollBar();
            this.updateSaveButtonState();
        } else {
            displayMessage('Error Deleting Setting', payload.error);
        }
    });
    this._settingDeletedListener.bindListener();
}

SettingStorage.prototype.saveSettings = function (settings) {
    if (!this.saveDisabled) {
        try {
            let encodedSettings = this._serilizer.encode(settings);
            swal({
                title: 'Select Name for Settings',
                input: 'text',
                inputPlaceholder: 'Name',
                inputValidator: (value) => {
                    if (!value) {
                        return 'You must provide a name';
                    } else if (value.length > this._MAX_SETTING_NAME_LENGTH) {
                        return 'Name must be at most ' + this._MAX_SETTING_NAME_LENGTH + ' characters';
                    }
                    return false;
                },
                showCancelButton: true,
                confirmButtonColor: '#204d74',
                confirmButtonText: 'Save'
            }).then((result) => {
                if (result.value) {
                    let resultListener = new Listener('save quiz settings', (payload) => {
                        if (payload.success) {
                            displayMessage("Setting Saved");
                            this.addSetting(payload.setting.id, payload.setting.settingString, payload.setting.name);
                        } else {
                            displayMessage("Error Saving Settings", payload.error);
                        }

                        resultListener.unbindListener();
                    });

                    resultListener.bindListener();
                    socket.sendCommand({
                        command: 'save quiz settings',
                        type: 'settings',
                        data: {
                            name: result.value,
                            settingString: encodedSettings
                        }
                    });
                }
            });
        } catch (err) {
            if (err.message === "encoding to long") {
                displayMessage("Error Saving Settings", "Vintage/Tag/Genre limit exceeded");
            } else {
                displayMessage("Error Saving Settings", "An unexpected error happened, make sure the settings are valid");
            }
        }
    }
};

SettingStorage.prototype.addSetting = function (id, settingString, name) {
    let tab = new StoredSettingTab(id, settingString, name, this._serilizer, this.loadingEnabled);
    this._$SAVED_LIST.append(tab._$body);
    this._tabs.push(tab);
    this.updateScrollBar();
    this.updateSaveButtonState();
};

SettingStorage.prototype.setLoadContainerHidden = function (hidden) {
    if (hidden) {
        this._$LOAD_CONTAINER.addClass('hidden');
    } else {
        this._$LOAD_CONTAINER.removeClass('hidden');
        this.updateScrollBar();
    }
};

SettingStorage.prototype.loadContainerShown = function () {
    return this._$LOAD_CONTAINER.hasClass('hidden');
};

SettingStorage.prototype.updateScrollBar = function () {
    this._$LOAD_ENTRY_CONTAINER.perfectScrollbar('update');
};

SettingStorage.prototype.updateSaveButtonState = function () {
    if (this._tabs.length >= this._MAX_SAVED_COUNT) {
        this.saveDisabled = true;
        this._$SAVE_BUTTON.addClass('disabled')
            .popover({
                content: 'Max number of ' + this._MAX_SAVED_COUNT + ' saved settings reached',
                placement: 'left',
                trigger: 'hover'
            });
    } else {
        this.saveDisabled = false;
        this._$SAVE_BUTTON.removeClass('disabled')
            .popover('destroy');
    }
};

SettingStorage.prototype.setLoadingEnabled = function (enabled) {
    this.loadingEnabled = enabled;
    this._tabs.forEach(tab => {
        tab.setLoadingEnabled(enabled);
    });
    this._$LOAD_TAB_HEADER.text(enabled ? this._HEADER_MESSAGES.ENABLED : this._HEADER_MESSAGES.DISABLED);
    if (enabled) {
        this._$LOAD_FROM_CODE_BUTTON.removeClass('disabled')
            .popover('destroy');
    } else {
        this._$LOAD_FROM_CODE_BUTTON.addClass('disabled')
            .popover({
                content: 'Loading Disabled',
                placement: 'top',
                trigger: 'hover'
            });
    }
};


const SETTING_LOAD_LIST_ENTRY_TEMPlATE = $("#mhLoadListEntryTemplate").html();

function StoredSettingTab(id, settingString, name, serilizer, loadingEnabled) {
    this._$body = $(format(SETTING_LOAD_LIST_ENTRY_TEMPlATE, name));
    this._$settingName = this._$body.find('.mhLoadEntryName');
    this.id = id;
    this._settingString = settingString;

    this.setLoadingEnabled(loadingEnabled);

    let $closeButton = this._$body.find('.mhLoadDelete');
    $closeButton
        .popover({
            content: 'Delete',
            placement: 'top',
            trigger: 'hover',
            container: '#mhLoadContainer'
        }).click(() => {
        displayOption("Delete Saved Setting", name, 'Delete', 'Cancel', () => {
            this.deleteSetting();
        });
    });

    this._$settingName.click(() => {
        try {
            let settingObject = serilizer.decode(this._settingString);
            hostModal.changeSettings(settingObject);
        } catch (err) {
            displayMessage("Error Decoding Settings");
            throw err;
        }
    }).popover({
        content: name,
        placement: 'top',
        trigger: 'hover',
        container: '#mhLoadContainer'
    });

    let $shareCodeButton = this._$body.find('.mhSettingGetCodeButton');
    $shareCodeButton.popover({
        content: 'Get Code',
        placement: 'top',
        trigger: 'hover',
        container: '#mhLoadContainer'
    }).click(() => {
        displayMessage("Setting Code", this._settingString);
    });
}

StoredSettingTab.prototype.deleteSetting = function () {
    socket.sendCommand({
        command: 'delete quiz settings',
        type: 'settings',
        data: {
            id: this.id
        }
    });
};

StoredSettingTab.prototype.remove = function () {
    this._$body.remove();
};

StoredSettingTab.prototype.setLoadingEnabled = function (enabled) {
    if (enabled) {
        this._$settingName.removeClass('disabled');
    } else {
        this._$settingName.addClass('disabled');
    }
};