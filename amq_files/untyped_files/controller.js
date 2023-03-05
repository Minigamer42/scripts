"use strict";
/*exported AnimationController SimpleAnimationController AdvancedAnimationController AdvancedAnimationControllerTripple*/

class AnimationController {
	constructor(staticAnimationCanvas, dynamicAnimationCanvas) {
		this.staticCanvas = staticAnimationCanvas;
		this.dynamicCanvas = dynamicAnimationCanvas;
	}

	updateCanvasSize(skipRedraw) {
		this.staticCanvas.updateCanvasSize(skipRedraw);
		this.dynamicCanvas.updateCanvasSize(skipRedraw);
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

		this.tickListeners = [];
	}

	start() {
		if(!this.running) {
			this.lastTimeStamp = new Date();
			this.running = true;
			this.runAnimation();
		}
	}

	runAnimation() {
		if(!this.running) {
			return;
		}
		let timestamp = new Date().valueOf();
		let deltaTimeSeconds = (timestamp - this.lastTimeStamp) / 1000;

		this.tickListeners.forEach(listener => listener(deltaTimeSeconds));

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
	}

	addTickListener(handler) {
		this.tickListeners.push(handler);
	}

	removeTickListener(handler) {
		let index = this.tickListeners.findIndex(entry => entry === handler);
		if(index !== -1) {
			this.tickListeners.splice(index, 1);
		}
	}
}

class AdvancedAnimationController {
	constructor(staticCanvas, dynamicCanvas) {
		this.staticCanvas = staticCanvas;
		this.dynamicCanvas = dynamicCanvas;

		this.staticAnimation = new this.canvasClass(this.staticCanvas);
		this.dynamicAniamtion = new this.canvasClass(this.dynamicCanvas);

		this.domElements = {};
	}

	get canvasClass() {
		return SimpleAnimationController;
	}

	get staticCtx() {
		return this.staticCanvas.ctx;
	}

	get dynamicCtx() {
		return this.dynamicCanvas.ctx;
	}

	disableInputEvents() {
		this.staticCanvas.inputEventsActive = false;
	}

	enableInputEvents() {
		this.staticCanvas.inputEventsActive = true;
	}

	updateSize(saveTranslateY, skipRedraw) {
		let savedY;
		if(saveTranslateY) {
			savedY = this.staticCanvas.translateY;
		}
		this.staticCanvas.updateCanvasSize(skipRedraw);
		this.dynamicCanvas.updateCanvasSize(skipRedraw);
		if(savedY) {
			this.updateTranslate(0, savedY - this.staticCanvas.translateY);
		}
	}

	drawStatic() {
		this.staticCanvas.redraw(0);
	}

	drawDynamic() {
		this.dynamicCanvas.redraw(0);
	}

	addStaticElement(element) {
		this.staticCanvas.content.push(element);
	}

	removeStaticElement(element) {
		let index = this.staticCanvas.content.findIndex((entry) => entry === element);
		if (index !== -1) {
			this.staticCanvas.content.splice(index, 1);
		}
	}

	addDynamicElement(element) {
		this.dynamicCanvas.content.push(element);
	}

	removeDynamicElement(element) {
		let index = this.dynamicCanvas.content.findIndex((entry) => entry === element);
		if (index !== -1) {
			this.dynamicCanvas.content.splice(index, 1);
		}
	}

	startStaticAnimation() {
		this.staticAnimation.start();
	}

	stopStaticAnimation() {
		this.staticAnimation.stop();
	}

	startDynamicAnimation() {
		this.dynamicAniamtion.start();
	}

	stopDynamicAnimation() {
		this.dynamicAniamtion.stop();
	}

	attatchDragEvents(onStart, onDrag, onEnd) {
		this.staticCanvas.attachDragListener(onStart, onDrag, onEnd);
	}

	attachTranslateChangeListener(handler) {
		this.staticCanvas.addTranslateChangeListener(handler);
	}

	enableDrag() {
		this.staticCanvas.enableDrag();
	}

	disableDrag() {
		this.staticCanvas.disableDrag();
	}

	updateTranslate(xChange, yChange) {
		let newX = this.staticCanvas.translateX + xChange;
		let newY =this.staticCanvas.translateY + yChange;
		this.staticCanvas.updateTranslate(newX, newY);
		this.dynamicCanvas.updateTranslate(newX, newY);
	}

	setTranslateLimits(horiMin, horiMax, vertMin, vertMax, grazeSize) {
		this.staticCanvas.setDragLimits(horiMin, horiMax, vertMin, vertMax, grazeSize);
		this.dynamicCanvas.setDragLimits(horiMin, horiMax, vertMin, vertMax, grazeSize);
	}
	
	addDomElement(id, element) {
		this.domElements[id] = element;
	}

	resetCanvasContent() {
		this.staticCanvas.content = [];
		this.dynamicCanvas.content = [];
		this.staticAnimation.tickListeners = [];
		this.dynamicAniamtion.tickListeners = [];
	}

	disableDomElement(id) {
		this.domElements[id].disable();
	}

	enableDomElement(id) {
		this.domElements[id].enable();
	}

	addStaticTickListener(handler) {
		this.staticAnimation.addTickListener(handler);
	}

	removeStaticTickListener(handler) {
		this.staticAnimation.removeTickListener(handler);
	}

	addDynamicTickListener(handler) {
		this.dynamicAniamtion.addTickListener(handler);
	}

	removeDynamicTickListener(handler) {
		this.dynamicAniamtion.removeTickListener(handler);
	}

	displayClickable(on) {
		this.staticCanvas.setClickable(on);
	}

	addClickTickListener(handler) {
		this.staticCanvas.attachClickListener(handler);
	}
	
	addWheelListener(handler) {
		this.staticCanvas.attachWheelistener(handler);
	}

	updateScale(newScale) {
		this.staticCanvas.scale = newScale;
		this.dynamicCanvas.scale = newScale;
	}

	clearFrame() {
		this.staticCanvas.clearCanvas();
		this.dynamicCanvas.clearCanvas();
	}
}

class AdvancedAnimationControllerTripple extends AdvancedAnimationController {
	constructor(staticCanvas, dynamicCanvas, extraDynamicCanvases) {
		super(staticCanvas, dynamicCanvas);
		
		this.extraDynamicCanvases = extraDynamicCanvases;
		this.extraDynamicAniamtion = new this.canvasClass(this.extraDynamicCanvases);
	}

	get extraDynamicCtx() {
		return this.extraDynamicCanvases.ctx;
	}

	updateSize(saveTranslateY, skipRedraw) {
		this.extraDynamicCanvases.updateCanvasSize(skipRedraw);
		super.updateSize(saveTranslateY, skipRedraw);
	}

	drawExtraDynamic() {
		this.extraDynamicCanvases.redraw(0);
	}

	addExtraDynamicElement(element) {
		this.extraDynamicCanvases.content.push(element);
	}

	removeExtraDynamicElement(element) {
		let index = this.extraDynamicCanvases.content.findIndex((entry) => entry === element);
		if (index !== -1) {
			this.extraDynamicCanvases.content.splice(index, 1);
		}
	}

	startExtraDynamicAnimation() {
		this.extraDynamicAniamtion.start();
	}

	stopExtraDynamicAnimation() {
		this.extraDynamicAniamtion.stop();
	}

	clearExtraDynamicFrame() {
		this.extraDynamicCanvases.clearCanvas();
	}

	updateTranslate(xChange, yChange) {
		let newX = this.staticCanvas.translateX + xChange;
		let newY =this.staticCanvas.translateY + yChange;

		super.updateTranslate(xChange, yChange);
		this.extraDynamicCanvases.updateTranslate(newX, newY);
	}

	setTranslateLimits(horiMin, horiMax, vertMin, vertMax, grazeSize) {
		super.setTranslateLimits(horiMin, horiMax, vertMin, vertMax, grazeSize);
		this.extraDynamicCanvases.setDragLimits(horiMin, horiMax, vertMin, vertMax, grazeSize);
	}

	resetCanvasContent() {
		super.resetCanvasContent();
		this.extraDynamicCanvases.content = [];
	}

	updateScale(newScale) {
		super.updateScale(newScale);
		this.extraDynamicCanvases.scale = newScale;
	}

	clearFrame() {
		super.clearFrame();
		this.extraDynamicCanvases.clearCanvas();
	}
}