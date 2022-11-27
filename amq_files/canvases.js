'use strict';

/*exported AnimationCanvasCenter*/

class AnimationCanvas {
    constructor($canvas) {
        this.$canvas = $canvas;

        this.ctx = this.$canvas[0].getContext('2d');

        this.ctx.save();

        this.width = 0;
        this.height = 0;

        this.content = [];
    }

    updateCanvasSize() {
        this.width = this.$canvas.width();
        this.height = this.$canvas.height();
        this.$canvas
            .attr('height', this.height)
            .attr('width', this.width);

        this.ctx.restore();

        this.translateToDefault();

        this.ctx.save();

        this.updateContent();
        this.redraw(0);
    }

    translateToDefault() {
        //Do nothing by default
    }

    updateContent() {
        //Do nothing by default
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    redraw(deltaTimeSeconds) {
        this.clearCanvas();
        this.content.forEach(canvasContent => canvasContent.draw(deltaTimeSeconds));
    }
}

class AnimationCanvasCenter extends AnimationCanvas {
    constructor($canvas) {
        super($canvas);
    }

    translateToDefault() {
        this.ctx.translate(this.width / 2, this.height / 2);
    }

    clearCanvas() {
        this.ctx.clearRect(-this.width / 2, -this.height / 2, this.width, this.height);
    }
}