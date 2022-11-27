'use strict';
var CLOSED_HOST_FILTER_STATES = {
    NOT_SET: 1,
    ONLY: 2,
    EXCLUDE: 3
};

function ExpandQuestionList() {
    this._$questionList = $("#elQuestionList");

    this._$openingsFilter = $("#elOpeningsFilter");
    this._$endingsFilter = $("#elEndingsFilter");
    this._$insertsFilter = $("#elInsertsFilter");
    this._$missingFilter = $("#elMissingFilter");
    this._$resolutionFilter = $("#elResolutionFilter");
    this._$altHostFilter = $("#elAltHostFilter");
    this._$searchBar = $("#elQuestionFilterInput");
    this._$searchSpinner = $("#elQuestionFilterSpinner");

    this._$openingsMoeFilter = $("#elOpeningsMoeFilter");

    this._LIST_FILLER_HTML = '<div class="elQuestion filler"></div>';


    this._$openingsMoeFilter.popover({
        content: "Toggle whether to only show or hide shows only missing this host",
        delay: {show: 100, hide: 0},
        placement: 'bottom',
        trigger: 'hover',
        container: '#elQuestionFilter'
    });


    this._filter = {
        openings: true,
        endings: true,
        inserts: true,
        missing: true,
        resolution: true,
        altHost: true
    };

    this._closedHostFilter = {
        openingsmoe: CLOSED_HOST_FILTER_STATES.NOT_SET
    };

    this._$openingsFilter.click(() => {
        this.toggleFilter(this._$openingsFilter, 'openings');
    });
    this._$endingsFilter.click(() => {
        this.toggleFilter(this._$endingsFilter, 'endings');
    });
    this._$insertsFilter.click(() => {
        this.toggleFilter(this._$insertsFilter, 'inserts');
    });
    this._$missingFilter.click(() => {
        this.toggleFilter(this._$missingFilter, 'missing');
    });
    this._$resolutionFilter.click(() => {
        this.toggleFilter(this._$resolutionFilter, 'resolution');
    });
    this._$altHostFilter.click(() => {
        this.toggleFilter(this._$altHostFilter, 'altHost');
    });

    this._$openingsMoeFilter.click(() => {
        this.toggleHostFilter(this._$openingsMoeFilter, 'openingsmoe');
    });

    this._$searchBar.on('input', () => {
        this.applySearchFilter(this._$searchBar.val());
    });

    this._$questionList.perfectScrollbar({
        suppressScrollX: true,
        wheelSpeed: 0.3,
        minScrollbarLength: 40
    });
    this._$questionList.on('ps-scroll-y', () => {
        this.updateScrollLayout();
    });

    this.animeEntries = [];

    this._QUERY_UPDATE_CHUNK_SiZE = 20;
    this._currentSearchId = 0;
    this.lastSearchRegex = /^$/;
    this.topShownAnimeIndex = 0;
}

ExpandQuestionList.prototype.updateQuestionList = function (questions) {
    this.clear();
    this.animeEntries = questions.map((entry) => {
        return new ExpandQuestionListEntry(entry, this);
    });


    this.animeEntries
        .sort((a, b) => {
            return a.name.localeCompare(b.name);
        })
        .forEach(entry => {
            this._$questionList.append(entry.$body);
        });

    this._$questionList
        .append(this._LIST_FILLER_HTML)
        .prepend(this._LIST_FILLER_HTML);

    this.topShownQuestionIndex = 0;
    this.updateScrollLayout();
};

ExpandQuestionList.prototype.toggleFilter = function ($filterObject, filterName) {
    let newValue = !this._filter[filterName];
    if (newValue) {
        $filterObject.removeClass('off');
    } else {
        $filterObject.addClass('off');
    }
    this._filter[filterName] = newValue;
    this.applyFilter();
};

ExpandQuestionList.prototype.toggleHostFilter = function ($filterObject, hostName) {
    let newValue, newClass, message;
    switch (this._closedHostFilter[hostName]) {
        case CLOSED_HOST_FILTER_STATES.NOT_SET:
            newValue = CLOSED_HOST_FILTER_STATES.ONLY;
            newClass = 'elFilterState-Only';
            message = "Only show songs missing this host";
            break;
        case CLOSED_HOST_FILTER_STATES.ONLY:
            newValue = CLOSED_HOST_FILTER_STATES.EXCLUDE;
            newClass = 'elFilterState-Exclude';
            message = "Hide all songs only missing this host";
            break;
        case CLOSED_HOST_FILTER_STATES.EXCLUDE:
            newValue = CLOSED_HOST_FILTER_STATES.NOT_SET;
            message = "Toggle whether to only show or hide shows only missing this host";

            break;
    }
    this._closedHostFilter[hostName] = newValue;
    $filterObject
        .removeClass('elFilterState-Only')
        .removeClass('elFilterState-Exclude');
    if (newClass) {
        $filterObject.addClass(newClass);
    }

    let popoverContent = $filterObject.data('bs.popover');
    popoverContent.options.content = message;
    $filterObject.popover('show');
    this.applyFilter();
};

ExpandQuestionList.prototype.applyFilter = function () {
    this.animeEntries.forEach(entry => {
        entry.applyFilter(this._filter, this._closedHostFilter);
    });
    this.updateScrollLayout();
};

ExpandQuestionList.prototype.applySearchFilter = function (query) {
    this._$searchSpinner.removeClass('hide');
    this._currentSearchId++;
    let searchId = this._currentSearchId;

    let applyQueryFunctoin;
    if (query) {
        let regexQuery = new RegExp(createAnimeSearchRegexQuery(query), 'i');
        let stricterQuery = this.lastSearchRegex.test(query);
        this.lastSearchRegex = regexQuery;
        applyQueryFunctoin = (entry) => {
            entry.applySearchFilter(regexQuery, stricterQuery);
        };
    } else {
        this.lastSearchRegex = /^$/;
        applyQueryFunctoin = (entry) => {
            entry.resetSearchFilter();
        };
    }

    let updateFunction = (currentIndex) => {
        if (this._currentSearchId !== searchId) {
            return;
        }
        for (let i = currentIndex; i < currentIndex + this._QUERY_UPDATE_CHUNK_SiZE && i < this.animeEntries.length; i++) {
            applyQueryFunctoin(this.animeEntries[i]);
        }

        let nextIndex = currentIndex + this._QUERY_UPDATE_CHUNK_SiZE;
        if (nextIndex < this.animeEntries.length) {
            setTimeout(function () {
                updateFunction(nextIndex);
            }.bind(this), 1);
        } else {
            this.updateScrollLayout();
            this._$searchSpinner.addClass('hide');
        }
    };
    updateFunction(0);
};

ExpandQuestionList.prototype.updateScrollLayout = function () {
    this._$questionList.perfectScrollbar('update');
    if (this.animeEntries.length === 0) {
        return;
    }
    let newTopIndex = this.topShownAnimeIndex;
    if (this.animeEntries[newTopIndex].isOverTop()) {
        while (this.animeEntries[newTopIndex].isOverTop() && newTopIndex < this.animeEntries.length) {
            newTopIndex++;
        }
    } else {
        while (!this.animeEntries[newTopIndex].isOverTop() && newTopIndex > 0) {
            newTopIndex--;
        }
        if (this.animeEntries[newTopIndex].isOverTop() && newTopIndex !== this.animeEntries.length - 1) {
            newTopIndex++;
        }
    }

    this.topShownAnimeIndex = newTopIndex;
    let containerHeight = this._$questionList.height();
    let bottomIndex;
    for (let i = newTopIndex; i < this.animeEntries.length && !this.animeEntries[i].isUnderBottom(containerHeight); i++) {
        this.animeEntries[i].updateScroll(containerHeight);
        bottomIndex = i;
    }

    if (newTopIndex !== 0) {
        this.animeEntries[newTopIndex - 1].updateScroll(containerHeight);
    }
    if (bottomIndex !== this.animeEntries.length - 1) {
        this.animeEntries[bottomIndex + 1].updateScroll(containerHeight);
    }
};

ExpandQuestionList.prototype.removeAnime = function (annId) {
    let index = this.animeEntries.findIndex((entry) => {
        return entry.annId === annId;
    });

    if (index !== -1) {
        let entry = this.animeEntries[index];
        entry.remove();
        this.animeEntries.splice(index, 1);
        this.updateScrollLayout();
    }
};

ExpandQuestionList.prototype.removeSong = function (annId, annSongId) {
    let index = this.animeEntries.findIndex((entry) => {
        return entry.annId === annId;
    });

    if (index !== -1) {
        let entry = this.animeEntries[index];
        entry.removeSong(annSongId);
        if (entry.isEmpty()) {
            this.removeAnime(annId);
        } else {
            this.updateScrollLayout();
        }
    }
};

ExpandQuestionList.prototype.isEmpty = function () {
    return this.animeEntries.length === 0;
};

ExpandQuestionList.prototype.setSongPending = function (annId, annSongId, host, resolution) {
    let index = this.animeEntries.findIndex((entry) => {
        return entry.annId === annId;
    });

    if (index !== -1) {
        let entry = this.animeEntries[index];
        entry.setSongPending(annSongId, host, resolution);
    }
};

ExpandQuestionList.prototype.resetFilterLayout = function () {
    this._$openingsFilter.removeClass('off');
    this._$endingsFilter.removeClass('off');
    this._$insertsFilter.removeClass('off');
    this._$missingFilter.removeClass('off');
    this._$resolutionFilter.removeClass('off');
    this._$altHostFilter.removeClass('off');

    this._$openingsMoeFilter
        .removeClass('elFilterState-Only')
        .removeClass('elFilterState-Exclude');

    this._$searchBar.val("");
    this._$searchSpinner.addClass('hide');
    this._currentSearchId++;

    this._filter = {
        openings: true,
        endings: true,
        inserts: true,
        missing: true,
        resolution: true,
        altHost: true
    };
    this._closedHostFilter = {
        openingsmoe: CLOSED_HOST_FILTER_STATES.NOT_SET
    };
};

ExpandQuestionList.prototype.clear = function () {
    this._$questionList.find('.elQuestion').remove();
};