'ues strict';

function HostPrioList(hosts) {
    this._$list = $("#settingsHostPrioList");
    this._ENTRY_TEMPLATE = $("#hostPrioEntryTemplate").html();

    this._hostMap = {};
    this.ENTRY_COUNT = hosts.length;

    let savedHostOrder = Cookies.get('hostPrioOrder');

    let hostList;
    if (savedHostOrder) {
        savedHostOrder = JSON.parse(savedHostOrder).filter((hostName) => {
            return hostName !== 'mixtape' && hostName !== 'animethemes';
        });
        hostList = shuffleArray(hosts).filter(hostName => !savedHostOrder.includes(hostName)).concat(savedHostOrder);
    } else {
        hostList = hosts;
    }

    hostList.forEach((hostName, index) => {
        let entry = new HostPrioEntry(hostName, index);
        entry.bindUpClick(function (index) {
            this.swapPosition(index, index - 1);
        }.bind(this));
        entry.bindDownClick(function (index) {
            this.swapPosition(index, index + 1);
        }.bind(this));
        entry.updateButton(this.ENTRY_COUNT);

        this._$list.append(entry.$body);
        this._hostMap[index] = entry;
    });

    Cookies.set('hostPrioOrder', JSON.stringify(this.getOrder()), {expires: 365});
}

HostPrioList.prototype.swapPosition = function (indexOne, indexTwo) {
    let entryOne = this._hostMap[indexOne];
    let entryTwo = this._hostMap[indexTwo];

    if (indexOne > indexTwo) {
        entryTwo.$body.before(entryOne.$body);
    } else {
        entryTwo.$body.after(entryOne.$body);
    }

    entryOne.index = indexTwo;
    entryTwo.index = indexOne;
    this._hostMap[indexOne] = entryTwo;
    this._hostMap[indexTwo] = entryOne;

    entryOne.updateButton(this.ENTRY_COUNT);
    entryTwo.updateButton(this.ENTRY_COUNT);

    Cookies.set('hostPrioOrder', JSON.stringify(this.getOrder()), {expires: 365});
};

HostPrioList.prototype.getOrder = function () {
    let orderedAray = [];
    for (let i = 0; i < this.ENTRY_COUNT; i++) {
        orderedAray.push(this._hostMap[i].name);
    }
    return orderedAray;
};

const SETTING_HOST_PRIO_ENTRY_TEMPLATE = $("#hostPrioEntryTemplate").html();

function HostPrioEntry(hostName, index) {
    this.$body = $(format(SETTING_HOST_PRIO_ENTRY_TEMPLATE, capitalizeMajorWords(hostName)));
    this.name = hostName;
    this.index = index;

    let baseColor = 25 + 10 * index;
    this.$body.css('background-color', 'rgb(' + baseColor + ',' + baseColor + ',' + baseColor + ')');
}

HostPrioEntry.prototype.bindUpClick = function (handler) {
    this.$body.find('.fa-chevron-up').click(() => {
        handler(this.index);
    });
};

HostPrioEntry.prototype.bindDownClick = function (handler) {
    this.$body.find('.fa-chevron-down').click(() => {
        handler(this.index);
    });
};

HostPrioEntry.prototype.updateButton = function (entryCount) {
    this.$body.find('.fa-chevron-down').removeClass("disabled");
    this.$body.find('.fa-chevron-up').removeClass("disabled");
    if (this.index === 0) {
        this.$body.find('.fa-chevron-up').addClass("disabled");
    } else if (this.index === entryCount - 1) {
        this.$body.find('.fa-chevron-down').addClass("disabled");
    }
};