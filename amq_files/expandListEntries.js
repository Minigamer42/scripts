var EXPAND_QUESTION_TEMPLATE = $("#elQuestionTemplate").html();
var EXPAND_SONG_QUESTION_TEMPLATE = $("#elQuestionSongTemplate").html();

var EXPAND_SONG_STATUS = {
    APPROVED: 1,
    PENDING: 2,
    MISSING: 3
};

function ExpandQuestionListEntry(question, expandList) {
    this.name = question.name;
    this.annId = question.annId;
    this.$body = $(format(EXPAND_QUESTION_TEMPLATE, escapeHtml(this.name)));
    this.$animeEntry = this.$body.find('.elQuestionAnime');

    this.$songContainer = this.$body.find('.elQuestionSongContainer');
    this.$opStatus = this.$body.find('.elQuestionAnimeStatusOp');
    this.$edStatus = this.$body.find('.elQuestionAnimeStatusEd');
    this.$inStatus = this.$body.find('.elQuestionAnimeStatusIn');

    this.songList = [];

    question.songs.forEach(songInfo => {
        this.songList.push(new ExpandQuestionSongEntry(songInfo, this.annId, this.name));
    });
    this.updateSongList();

    this.open = false;
    this.$body.find('.elQuestionAnime').click(() => {
        if (this.open) {
            this.$body.removeClass('open');
            this.open = false;
        } else {
            this.$body.addClass('open');
            this.open = true;
        }
        expandList.updateScrollLayout();
    });

    this.active = true;
}

ExpandQuestionListEntry.prototype.updateSongList = function () {
    this.songList.sort((a, b) => {
        if (a.type !== b.type) {
            return a.type - b.type;
        } else if (a.number !== b.number) {
            return a.number - b.number;
        } else if (a.name !== b.name) {
            return a.name.localeCompare(b.name);
        } else {
            return a.artist.localeCompare(b.artist);
        }
    });

    this.$songContainer.find('.elQuestionSongContainer').html("");
    this.songList.forEach(songEntry => {
        this.$songContainer.append(songEntry.$body);
    });

    this.updateSongStatuses();
};

ExpandQuestionListEntry.prototype.updateSongStatuses = function () {
    let openingCount = 0;
    let endingCount = 0;
    let insertCount = 0;
    this.songList.forEach(songEntry => {
        if (songEntry.isActive()) {
            if (songEntry.type === 1) {
                openingCount++;
            } else if (songEntry.type === 2) {
                endingCount++;
            } else {
                insertCount++;
            }
        }
    });

    this.$opStatus.text(openingCount + " OP");
    this.$edStatus.text(endingCount + " ED");
    this.$inStatus.text(insertCount + " IN");
};

ExpandQuestionListEntry.prototype.applyFilter = function (filter, closedHostFilter) {
    this.songList.forEach(entry => {
        entry.applyFilter(filter, closedHostFilter);
    });

    this.updateDisplay();
};

ExpandQuestionListEntry.prototype.applySearchFilter = function (regexFilter, stricter) {
    if (stricter && !this.active) {
        return false;
    }

    if (regexFilter.test(this.name)) {
        this.resetSearchFilter();
    } else {
        this.songList.forEach(entry => {
            entry.applySearchFilter(regexFilter, stricter);
        });
        this.updateDisplay();
    }
};

ExpandQuestionListEntry.prototype.resetSearchFilter = function () {
    this.songList.forEach(entry => {
        entry.resetSearchFilter();
    });
    this.updateDisplay();
};

ExpandQuestionListEntry.prototype.updateDisplay = function () {
    this.updateSongStatuses();
    this.active = this.songList.some(entry => {
        return entry.isActive();
    });
    if (this.active) {
        this.$body.removeClass('hide');
    } else {
        this.$body.addClass('hide');
    }
};

ExpandQuestionListEntry.prototype.updateScroll = function (containerHeight) {
    if (this.isShown(containerHeight) && this.active) {
        let height = this.$animeEntry.height();
        let top = this.$body.position().top;

        this.$animeEntry.css('transform', 'translateX(' + calculateScrollIndent(top, height, containerHeight) + '%)');

        if (this.open) {
            this.songList.forEach(entry => {
                entry.updateScroll(containerHeight);
            });
        }
    } else {
        this.$animeEntry.css('transform', 'translateX(100%)');
    }
};

ExpandQuestionListEntry.prototype.isShown = function (containerHeight) {
    let top = this.$body.position().top;
    let height = this.$body.height();

    return top <= containerHeight && top + height >= 0;
};

ExpandQuestionListEntry.prototype.isOverTop = function () {
    let top = this.$body.position().top;
    let height = this.$body.height();
    return top + height < 0;
};

ExpandQuestionListEntry.prototype.isUnderBottom = function (containerHeight) {
    let top = this.$body.position().top;
    return top > containerHeight;
};

ExpandQuestionListEntry.prototype.remove = function () {
    this.$body.remove();
};

ExpandQuestionListEntry.prototype.removeSong = function (annSongId) {
    let index = this.songList.findIndex(entry => {
        return entry.annSongId === annSongId;
    });

    if (index !== -1) {
        let entry = this.songList[index];
        entry.remove();
        this.songList.splice(index, 1);
        this.updateSongStatuses();
    }
};

ExpandQuestionListEntry.prototype.isEmpty = function () {
    return this.songList.length === 0;
};

ExpandQuestionListEntry.prototype.setSongPending = function (annSongId, host, resolution) {
    let index = this.songList.findIndex(entry => {
        return entry.annSongId === annSongId;
    });

    if (index !== -1) {
        let entry = this.songList[index];
        entry.setVersionPending(host, resolution);
    }
};

const HIGH_PERCENT = 70;
const HIGH_PERCENT_SCROLL_RANGE = 50;
const SCROLL_START_RANGE = 100;

function calculateScrollIndent(topOffset, height, containerHeight) {
    let toHiddenTop = topOffset + height;
    let toHiddenBottom = containerHeight - topOffset;
    let bottom = toHiddenBottom - height;
    if (toHiddenTop < 0 || toHiddenBottom < 0) {
        return 100;
    } else {
        let offsetToUse = toHiddenTop < toHiddenBottom ? topOffset : bottom;
        offsetToUse = offsetToUse < 0 ? 0 : offsetToUse;
        if (offsetToUse <= HIGH_PERCENT_SCROLL_RANGE) {
            return (1 - (offsetToUse / HIGH_PERCENT_SCROLL_RANGE)) * HIGH_PERCENT + (100 - HIGH_PERCENT);
        } else if (offsetToUse <= SCROLL_START_RANGE) {
            return (1 - (offsetToUse / SCROLL_START_RANGE)) * (100 - HIGH_PERCENT);
        } else {
            return 0;
        }
    }
}

function ExpandQuestionSongEntry(songInfo, animeId, animeName) {
    this.annSongId = songInfo.annSongId;
    this.type = songInfo.type;
    this.number = songInfo.number;
    this.animeId = animeId;
    this.animeName = animeName;
    this.videoExamples = songInfo.examples;

    if (this.type === 1) {
        this.typeName = "OP" + this.number;
    } else if (this.type === 2) {
        this.typeName = "ED" + this.number;
    } else {
        this.typeName = "IN";
    }
    this.artist = songInfo.artist;
    this.name = songInfo.name;

    this.$body = $(format(EXPAND_SONG_QUESTION_TEMPLATE, escapeHtml(this.typeName), escapeHtml(this.name), escapeHtml(this.artist)));

    this.versionStatus = songInfo.versions;

    this.updateMissingState();

    this.open = false;

    this.$body.click(() => {
        this.setOpen(!this.open);
        if (this.open) {
            expandLibrary.songOpened(this);
        } else {
            expandLibrary.songClosed();
        }
    });

    this.inFilter = true;
    this.inSearch = true;
}

ExpandQuestionSongEntry.prototype.updateMissingState = function () {
    this.missingRess = false;
    this.missingHosts = false;
    this.missingAll = true;
    this.onlyMissingClosed = true;

    let resolutionApprovedCount = {
        720: 0,
        480: 0,
        mp3: 0
    };

    let resolutionMissingCount = {
        720: 0,
        480: 0,
        mp3: 0
    };

    Object.keys(this.versionStatus.open).forEach(host => {
        Object.keys(this.versionStatus.open[host]).forEach(resolution => {
            let status = this.versionStatus.open[host][resolution];
            if (status === EXPAND_SONG_STATUS.APPROVED) {
                this.missingAll = false;
                resolutionApprovedCount[resolution]++;
            } else if (status === EXPAND_SONG_STATUS.MISSING) {
                resolutionMissingCount[resolution]++;
                this.onlyMissingClosed = false;
            }
        });
    });

    let closedAvailableRes = {};

    Object.values(this.versionStatus.closed).forEach(entries => {
        if (entries.status === EXPAND_SONG_STATUS.APPROVED) {
            this.missingAll = false;
            closedAvailableRes[entries.resolution] = true;
        } else if (entries.status === EXPAND_SONG_STATUS.MISSING) {
            this.missingHosts = true;
        }
    });

    if (this.missingAll) {
        this.missingHosts = false;
        this.missingRess = false;
    } else {
        Object.keys(resolutionApprovedCount).forEach(resolution => {
            let approvedCount = resolutionApprovedCount[resolution];
            let missingCount = resolutionMissingCount[resolution];
            let closedHostVersion = closedAvailableRes[resolution];


            if ((approvedCount || closedHostVersion) && missingCount) {
                this.missingHosts = true;
            } else if (missingCount) {
                this.missingRess = true;
            }
        });
    }

};

ExpandQuestionSongEntry.prototype.applyFilter = function (filter, closedHostFilter) {
    this.inFilter = (filter.openings && this.type === 1 || filter.endings && this.type === 2 || filter.inserts && this.type === 3) &&
        (filter.missing && this.missingAll || filter.resolution && this.missingRess || filter.altHost && this.missingHosts) &&
        //Closed Host Filter Check, hard code for speed
        (
            //Check if all entries are not set
            (closedHostFilter.openingsmoe === CLOSED_HOST_FILTER_STATES.NOT_SET) ||
            //Check if any entries satisfy include
            (
                (
                    closedHostFilter.openingsmoe === CLOSED_HOST_FILTER_STATES.ONLY &&
                    this.versionStatus.closed.openingsmoe.status === EXPAND_SONG_STATUS.MISSING
                )
            ) ||
            //Check if entries satisfy exclude (negated)
            (
                //Both Excluded but others are missing
                (closedHostFilter.openingsmoe === CLOSED_HOST_FILTER_STATES.EXCLUDE && !this.onlyMissingClosed) ||
                //OpeningsMoe excluded but others are missing
                (
                    closedHostFilter.openingsmoe === CLOSED_HOST_FILTER_STATES.EXCLUDE &&
                    (
                        !this.onlyMissingClosed
                    )
                )
            )
        );

    this.updateDisplay();
};

ExpandQuestionSongEntry.prototype.applySearchFilter = function (regex, stricter) {
    if (stricter && !this.inSearch) {
        return false;
    }

    this.inSearch = regex.test(this.name) || regex.test(this.artist);

    this.updateDisplay();
};

ExpandQuestionSongEntry.prototype.resetSearchFilter = function () {
    this.inSearch = true;
    this.updateDisplay();
};

ExpandQuestionSongEntry.prototype.updateDisplay = function () {
    if (this.isActive()) {
        this.$body.removeClass('hide');
    } else {
        this.$body.addClass('hide');
    }
};

ExpandQuestionSongEntry.prototype.isActive = function () {
    return this.inFilter && this.inSearch;
};

ExpandQuestionSongEntry.prototype.updateScroll = function (entryContainerHeight) {
    let top = this.$body.position().top;
    this.$body.css('transform', 'translateX(' + calculateScrollIndent(top, this.$body.height(), entryContainerHeight) + '%)');
};

ExpandQuestionSongEntry.prototype.setOpen = function (open) {
    if (open) {
        this.$body.addClass('open');
    } else {
        this.$body.removeClass('open');
    }
    this.open = open;
};

ExpandQuestionSongEntry.prototype.remove = function () {
    this.$body.remove();
};

ExpandQuestionSongEntry.prototype.setVersionPending = function (host, resolution) {
    if (this.versionStatus.open[host]) {
        this.versionStatus.open[host][resolution] = EXPAND_SONG_STATUS.PENDING;
    } else {
        this.versionStatus.closed[host].status = EXPAND_SONG_STATUS.PENDING;
    }
    this.updateMissingState();
};