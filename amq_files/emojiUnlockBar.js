'use strict';

/*exported emojiUnlockBar*/

function EmojiUnlockBar() {
    this._$unlockContainer = $("#awUnlockMeterContainer");
    this._EMOJI_PREVIEW_TEMPLATE = $("#awEmojiPreviewTemplate").html();

    this._OUTFIT_EMOJI_BASE = {
        80: {
            BASE: 'hib',
            DEFAULT_COLOR: 'R',
            TYPE_AT_LEVEL: {
                1: ['SMILE'],
                3: ['THINK'],
                5: ['CONF'],
                8: ['RELAX'],
                10: ['CHEER', 'POUT']
            }
        },
        81: {
            BASE: 'hibS',
            DEFAULT_COLOR: 'R',
            TYPE_AT_LEVEL: {
                1: ['SMILE'],
                3: ['THINK'],
                5: ['CONF'],
                8: ['RELAX'],
                10: ['CHEER', 'POUT']
            }
        },
        84: {
            BASE: 'hon',
            DEFAULT_COLOR: 'B',
            TYPE_AT_LEVEL: {
                1: ['STARE'],
                3: ['THINK'],
                5: ['CONF'],
                8: ['SMILE'],
                10: ['EASY', 'POUT']
            }
        },
        85: {
            BASE: 'kom',
            DEFAULT_COLOR: 'Y',
            TYPE_AT_LEVEL: {
                1: ['GRIN'],
                3: ['THINK'],
                5: ['CONF'],
                8: ['SMILE'],
                10: ['SMUG', 'ANGRY']
            }
        },
        86: {
            BASE: 'miy',
            DEFAULT_COLOR: 'P',
            TYPE_AT_LEVEL: {
                1: ['SMILE'],
                3: ['CONF'],
                5: ['MAGIC'],
                8: ['CHEER'],
                10: ['RIP', 'SURP']
            }
        },
        87: {
            BASE: 'shi',
            DEFAULT_COLOR: 'P',
            TYPE_AT_LEVEL: {
                1: ['HAPPY'],
                3: ['CHEER'],
                5: ['SMILE'],
                8: ['THINK'],
                10: ['TEHE', 'MAD']
            }
        },
        88: {
            BASE: 'komw',
            DEFAULT_COLOR: 'LB',
            TYPE_AT_LEVEL: {
                1: ['GRIN'],
                3: ['THINK'],
                5: ['CONF'],
                8: ['SMILE'],
                10: ['SMUG', 'ANGRY']
            }
        },
        89: {
            BASE: 'miyw',
            DEFAULT_COLOR: 'BR',
            TYPE_AT_LEVEL: {
                1: ['SMILE'],
                3: ['CONF'],
                5: ['MAGIC'],
                8: ['CHEER'],
                10: ['RIP', 'SURP']
            }
        },
        90: {
            BASE: 'noe',
            DEFAULT_COLOR: 'Y',
            TYPE_AT_LEVEL: {
                1: ['SMILE'],
                3: ['CONF'],
                5: ['WAVE'],
                8: ['THINK'],
                10: ['CRY', 'PROUD']
            }
        },
        91: {
            BASE: 'kyo',
            DEFAULT_COLOR: 'A',
            TYPE_AT_LEVEL: {
                1: ['HAPPY'],
                3: ['PROUD'],
                5: ['THINK'],
                8: ['SMILE'],
                10: ['SURP', 'SHOCK']
            }
        },
        92: {
            BASE: 'hik',
            DEFAULT_COLOR: 'B',
            TYPE_AT_LEVEL: {
                1: ['SMILE'],
                3: ['DRINK'],
                5: ['THINK'],
                8: ['CHEER'],
                10: ['SLEEP', 'WRONG']
            }
        },
        93: {
            BASE: 'noes',
            DEFAULT_COLOR: 'T',
            TYPE_AT_LEVEL: {
                1: ['SMILE'],
                3: ['CONF'],
                5: ['WAVE'],
                8: ['THINK'],
                10: ['CRY', 'PROUD']
            }
        },
        94: {
            BASE: 'hons',
            DEFAULT_COLOR: 'B',
            TYPE_AT_LEVEL: {
                1: ['STARE'],
                3: ['THINK'],
                5: ['CONF'],
                8: ['SMILE'],
                10: ['EASY', 'POUT']
            }
        }
    };

    this.avatarLevels;
    this._currentAvatarId;

    this._unlockListner = new Listener("unlock avatar", (payload) => {
        if (payload.succ) {
            payload.unlockedAvatars.forEach(newOutfit => {
                this.newOutfitUnlocked(newOutfit.avatarId);
            });
        }
    });
}

EmojiUnlockBar.prototype.setup = function (unlockedDesigns) {
    this.avatarLevels = {};
    Object.keys(unlockedDesigns).forEach(avatarId => {
        this.avatarLevels[avatarId] = Object.keys(unlockedDesigns[avatarId]).length;
    });

    this._unlockListner.bindListener();
};

EmojiUnlockBar.prototype.show = function (avatarId) {
    this.updateToOutfit(avatarId);
    this.showProgress(avatarId);

    this._currentAvatarId = avatarId;

    this._$unlockContainer.removeClass('hide');
};

EmojiUnlockBar.prototype.hide = function () {
    this._currentAvatarId = null;

    this._$unlockContainer.addClass('hide');
};

EmojiUnlockBar.prototype.updateToOutfit = function (avatarId) {
    let outfitBase = this._OUTFIT_EMOJI_BASE[avatarId];

    Object.keys(outfitBase.TYPE_AT_LEVEL).forEach(level => {
        let $levelContainer = this._$unlockContainer.find('.levelReward' + level + ' > ul > li');
        $levelContainer.html("");
        outfitBase.TYPE_AT_LEVEL[level].forEach(emojiType => {
            let emojiPath = getEmojiPath(outfitBase.BASE + outfitBase.DEFAULT_COLOR + emojiType);
            $levelContainer.append(format(this._EMOJI_PREVIEW_TEMPLATE, emojiPath));
        });
    });
};

EmojiUnlockBar.prototype.showProgress = function (avatarId) {
    let avatarLevel = this.avatarLevels[avatarId];

    this._$unlockContainer.find('.active').removeClass('active');

    if (avatarLevel >= 1) {
        this._$unlockContainer.find('.lbEntry:first-child').addClass('active');
    }

    if (avatarLevel >= 3) {
        this._$unlockContainer.find('.lbEntry:nth-child(2)').addClass('active');
    }

    if (avatarLevel >= 5) {
        this._$unlockContainer.find('.lbEntry:nth-child(3)').addClass('active');
    }

    if (avatarLevel >= 8) {
        this._$unlockContainer.find('.lbEntry:nth-child(4)').addClass('active');
    }

    if (avatarLevel >= 10) {
        this._$unlockContainer.find('.lbEntry:nth-child(5)').addClass('active');
    }
};

EmojiUnlockBar.prototype.newOutfitUnlocked = function (avatarId) {
    if (!this.avatarLevels[avatarId]) {
        this.avatarLevels[avatarId] = 0;
    }
    this.avatarLevels[avatarId]++;

    if (this._currentAvatarId === avatarId) {
        this.showProgress(avatarId);
    }
};

EmojiUnlockBar.prototype.getAvatarLevel = function (avatarId) {
    return this.avatarLevels[avatarId];
};

EmojiUnlockBar.prototype.haveEntryForOutfit = function (avatarId) {
    return this._OUTFIT_EMOJI_BASE[avatarId] != null;
};

var emojiUnlockBar = new EmojiUnlockBar();