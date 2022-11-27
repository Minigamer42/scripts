'use strict';

var DROPDOWN_INCLUSION_SETTINGS = {
    INCLUDE: 1,
    EXCLUDE: 2,
    ONE_OFF: 3
};

function DropDownSettingFilter($container, $input, inputList) {
    let idNameMap = {};
    inputList.forEach((entry) => {
        idNameMap[entry.id] = entry.name;
    });

    let valueFormater = (value) => {
        let stateClass;
        let stateSymbol;

        switch (value.state) {
            case DROPDOWN_INCLUSION_SETTINGS.INCLUDE:
                stateClass = 'include';
                stateSymbol = '+';
                break;
            case DROPDOWN_INCLUSION_SETTINGS.EXCLUDE:
                stateClass = 'exclude';
                stateSymbol = '-';
                break;
            case DROPDOWN_INCLUSION_SETTINGS.ONE_OFF:
                stateClass = 'optional';
                stateSymbol = '~';
                break;
        }

        let $entry = $(format(SETTING_FILTER_ENTRY_TEMPLATES.TEXT, idNameMap[value.id], stateClass, stateSymbol));

        let $additionContainer = $entry.find('.filterEntryAdditionContainer');
        let popOverMessage = "Included";
        $additionContainer.popover({
            content: () => {
                return popOverMessage;
            },
            trigger: 'hover',
            placement: 'left',
            container: "#mhHostModal"
        });
        $additionContainer.click(() => {
            value.state = (value.state % Object.keys(DROPDOWN_INCLUSION_SETTINGS).length) + 1;
            $additionContainer
                .removeClass('include')
                .removeClass('exclude')
                .removeClass('optional');
            switch (value.state) {
                case DROPDOWN_INCLUSION_SETTINGS.INCLUDE:
                    $additionContainer.text('+');
                    $additionContainer.addClass('include');
                    popOverMessage = 'Include';
                    break;
                case DROPDOWN_INCLUSION_SETTINGS.EXCLUDE:
                    $additionContainer.text('-');
                    $additionContainer.addClass('exclude');
                    popOverMessage = 'Exclude';
                    break;
                case DROPDOWN_INCLUSION_SETTINGS.ONE_OFF:
                    $additionContainer.text('~');
                    $additionContainer.addClass('optional');
                    popOverMessage = 'Optional';
                    break;
            }
            $additionContainer.popover('show');
        });

        return $entry;
    };
    let valueEqualFunctoin = (a, b) => {
        return a.id === b.id;
    };

    SettingFilter.call(this, $container, valueFormater, valueEqualFunctoin);

    this.awesomepleteInstance = new AmqAwesomeplete($input[0],
        {
            list: inputList,
            minChars: 0,
            maxItems: 500,
            sort: (a, b) => {
                return a.toLowerCase().localeCompare(b.toLowerCase());
            },
            data: (item) => {
                return {label: item.name, value: item.id};
            }
        },
        true);

    $input.on('awesomplete-selectcomplete', (event) => {
        this.addValue({
            id: $input.val(),
            state: DROPDOWN_INCLUSION_SETTINGS.INCLUDE
        });

        this.awesomepleteInstance.close();
        $input.val("");

        event.preventDefault();
    });

    $input.on('click', () => {
        this.awesomepleteInstance.evaluate();
    });
}

DropDownSettingFilter.prototype = Object.create(SettingFilter.prototype);
DropDownSettingFilter.prototype.constructor = DropDownSettingFilter;