'use strict';

/*exported newsManager */

function NewsManager() {
    this.$BODY = $("#mpNewsBody");
}

NewsManager.prototype.setup = function () {
    this.$BODY.perfectScrollbar({
        suppressScrollX: true
    });
    $(window).resize(() => {
        this.$BODY.perfectScrollbar('update');
    });
};

var newsManager = new NewsManager();