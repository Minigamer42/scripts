"use strict";

/*exported AnimationController SimpleAnimationController*/

class AnimationController {
    constructor(staticAnimationCanvas, dynamicAnimationCanvas) {
        this.staticCanvas = staticAnimationCanvas;
        this.dynamicCanvas = dynamicAnimationCanvas;
    }

    updateCanvasSize() {
        this.staticCanvas.updateCanvasSize();
        this.dynamicCanvas.updateCanvasSize();
    }

    drawFrame(deltaTimeSeconds) {
        this.staticCanvas.redraw();
        this.dynamicCanvas.redraw(deltaTimeSeconds);
    }

    clearFrame() {
        this.staticCanvas.clearCanvas();
        this.dynamicCanvas.clearCanvas();
    }
}

class SimpleAnimationController {
    constructor(canvas) {
        this.canvas = canvas;
        this.lastTimeStamp;
        this.running = false;
    }

    start() {
        this.lastTimeStamp = new Date();
        this.running = true;
        this.runAnimation();
    }

    runAnimation() {
        let timestamp = new Date().valueOf();
        let deltaTimeSeconds = (timestamp - this.lastTimeStamp) / 1000;
        this.canvas.redraw(deltaTimeSeconds);
        this.lastTimeStamp = timestamp;
        if (this.running) {
            window.requestAnimationFrame(() => {
                this.runAnimation();
            });
        }
    }

    stop() {
        this.lastTimeStamp = null;
        this.running = false;
        this.canvas.clearCanvas();
    }
}
