'use strict';

/*exported imagePreloader */
function ImagePreLoader() {

}

ImagePreLoader.prototype.loadImages = function () {
    $('.imagePreLoad.notStarted').each(function () {
        let $imageLoader = $(this);
        $imageLoader.removeClass("notStarted");
        let interval = setInterval(() => {
            let text = $imageLoader.find('.imagePreLoadText').text();
            if (text.length > 4) {
                text = '.';
            } else {
                text += '.';
            }
            $imageLoader.find('.imagePreLoadText').text(text);
        }, 300);
        let $obj = $('<img/>');
        $obj.addClass($imageLoader.data('class'));

        let img = new Image();
        img.onload = function () {
            clearInterval(interval);
            img.onload = null;
            $obj.attr('sizes', img.sizes)
                .attr('srcset', img.srcset)
                .attr('src', img.src);
            $imageLoader.replaceWith($obj);
        };

        img.sizes = $imageLoader.data('sizes');
        img.srcset = $imageLoader.data('srcset');
        img.src = $imageLoader.data('src');
    });
};

var imagePreloader = new ImagePreLoader();