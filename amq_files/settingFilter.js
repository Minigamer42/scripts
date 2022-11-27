'use strict';
/*exported SETTING_FILTER_ENTRY_TEMPLATES*/

var SETTING_FILTER_ENTRY_TEMPLATES = {
    VINTAGE: $("#vintageFilterEntryTemplate").html(),
    TEXT: $("#textFilterEntryTemplate").html()
};

function SettingFilter($container, valueFormater, valueEqualFunctoin) {
    this.$container = $container;
    this.$contentContainer = this.$container.find('.filterContent');
    this.$list = this.$container.find('.filterList');
    this.$emptyText = this.$container.find('.filterEmptyText');

    this.valueFormater = valueFormater;
    this.valueEqualFunction = valueEqualFunctoin;

    this.$contentContainer.perfectScrollbar({
        suppressScrollX: true
    });

    this.values = [];
}

SettingFilter.prototype.addValue = function (value) {
    if (this.values.some((knownValue) => {
        return this.valueEqualFunction(knownValue, value);
    })) {
        displayMessage("Value Already in Filter");
    } else {
        this.values.push(value);

        let $filterEntry = $(this.valueFormater(value));

        $filterEntry.find('.filterEntryClose').click(() => {
            let index = $filterEntry.index();
            this.values.splice(index, 1);
            $filterEntry.remove();

            if (this.values.length === 0) {
                this.toggleEmptyText(true);
            }
            this.relayout();
        });

        this.$list.append($filterEntry);
        this.toggleEmptyText(false);
        this.relayout();
    }
};

SettingFilter.prototype.clear = function () {
    this.$list.html("");
    this.values = [];
    this.toggleEmptyText(true);
    this.relayout();
};

SettingFilter.prototype.toggleEmptyText = function (show) {
    if (show) {
        this.$emptyText.removeClass('hidden');
    } else {
        this.$emptyText.addClass('hidden');
    }
};

SettingFilter.prototype.relayout = function () {
    this.$contentContainer.perfectScrollbar('update');
};

SettingFilter.prototype.getValues = function () {
    return this.values;
};