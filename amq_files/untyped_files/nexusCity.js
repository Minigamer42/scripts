"use strict";
/*exported NexusCity*/

class NexusCity {
	constructor(statBaseMax) {
		this.$container = $("#nexusCityContainer");
		this.$canvasContainer = $("#nexusCityCanvasContainer");
		this.$locationNameContainer = $("#nexusCityLocationNameContainer");
		this.skyCanvasController = new AdvancedAnimationController(
			new AnimationCanvas($("#nexusCitySkyCanvas")),
			new AnimationCanvas($("#nexusCityCloudCanvas"))
		);

		this.cityCanvasController = new AdvancedAnimationController(
			new AnimationCanvas($("#nexusCityBackCanvas")),
			new AnimationCanvas($("#nexusCityFrontCanvas"))
		);

		this.cityCanvasController.staticCanvas.attachMouseMoveListener((event) => {
			this.handleMouseMove(event.canvasX, event.canvasY, event.clientX, event.clientY);
		});

		this.cityCanvasController.addClickTickListener((event) => {
			this.handleMouseClick(event.canvasX, event.canvasY);
		});

		this.cityCanvasController.addDomElement(
			"exitButton",
			new DomElement($("#nexusCityBackButton"), () => {
				viewChanger.changeView("main");
			})
		);

		this.ostAudioGroup = audioController.getGroup("cityOstGroup");

		this.dungeonSelectionWindow = new NexusCityDungeonSelectionWindow(statBaseMax);
		this.workshopWindow = new NexusCityWorkshopWindow(statBaseMax);
		this.innWindow = new NexusCityInnWindow(statBaseMax);

		this.overflowHeight;
		this.overflowWidth;
		this.currentTransformX = 0;
		this.currentTransformY = 0;

		this.baseLoadDone = false;
		this.skyBackdrop;
		this.cloudElement;

		this.cityStaticElements = [];
		this.cityStaticElementMap = {};
		this.hoveredElement;

		this.initDone = false;

		this.shown = false;
			
		$(window).resize(() => {
			if (this.shown && this.initDone) {
				this.readjustCanvasSizes();
			}
		});

		this._nexusMapRejoin = new Listener("nexus map rejoin", (payload) => {
			this.dungeonSelectionWindow.open();
			this.dungeonSelectionWindow.setupDungeonInfo(payload.lobbyDescription);
		});
		this._nexusMapRejoin.bindListener();

		this._startNexusGameLoadListener = new Listener("start nexus game load", () => {
			nexus.displayLoading();
			viewChanger.changeView("nexus", {
				rejoin: true,
			});
			nexus.changeToDungeon();
		});
		this._startNexusGameLoadListener.bindListener();
	}

	show() {
		this.$container.removeClass("hide");
		this.readjustCanvasSizes();

		if(this.overflowWidth > 0) {
			this.centerHorizontally();
		}

		this.skyCanvasController.startDynamicAnimation();
		this.cityCanvasController.startDynamicAnimation();
		this.shown = true;
	}

	centerHorizontally() {
		this.$canvasContainer.css("transform", `translateX(-${this.overflowWidth / 2}px)`).css("transition", "none");
		this.$canvasContainer.width(); // force reflow
		this.$canvasContainer.css("transition", "");
	}

	hide() {
		this.$container.addClass("hide");
		this.skyCanvasController.stopDynamicAnimation();
		this.cityCanvasController.stopDynamicAnimation();
		this.shown = false;
		this.fadeOutOst();
	}

	fadeOutOst() {
		this.ostAudioGroup.fadeTrack("day", 80, 500);
		setTimeout(() => {
			this.ostAudioGroup.resetAll();
		}, 500);
	}

	init() {
		if (!this.initDone) {
			nexus.displayLoading();
		}

		this.loadNexusCityContent(() => {
			this.ostAudioGroup.playTrack("day");
			nexus.hideLoading();
			if(!tutorial.state.nexusCityOverview) {
				nexusTutorialController.startCityOverviewTutorial(this.$container, this.cityStaticElementMap, this);
			}
		});
	}

	loadNexusCityContent(callback) {
		let targetCount = 2;
		let currentCount = 0;
		let loadCallback = () => {
			currentCount++;
			if (currentCount < targetCount) {
				return;
			}

			if (!this.baseLoadDone) {
				this.skyBackdrop = new NexusCityStaticElement(
					this.skyCanvasController.staticCanvas.ctx,
					imageBuffer.getImage("nexusCityDay", "sky"),
					0,
					0,
					this.skyCanvasController.staticCanvas.width
				);
				this.skyCanvasController.addStaticElement(this.skyBackdrop.canvasElement);

				this.cloudElement = new NexusCitySlideElement(
					this.skyCanvasController.dynamicCanvas.ctx,
					imageBuffer.getImage("nexusCityDay", "clouds"),
					0,
					0,
					this.skyCanvasController.dynamicCanvas.width,
					10
				);
				this.skyCanvasController.addDynamicElement(this.cloudElement.canvasElement);

				this.CITY_STATIC_ELEMENT_DESCRIPTNS.forEach(({ name, x, y, collisionBoxInfo, nameInfo, clickHandler }) => {
					if (clickHandler) {
						clickHandler = clickHandler.bind(this);
					}
					let element = new NexusCityStaticElement(
						this.cityCanvasController.staticCanvas.ctx,
						imageBuffer.getImage("nexusCityDay", name),
						x,
						y,
						this.cityCanvasController.staticCanvas.width,
						collisionBoxInfo,
						nameInfo,
						clickHandler
					);
					this.cityCanvasController.addStaticElement(element.canvasElement);
					this.cityStaticElements.push(element);
					this.cityStaticElementMap[name] = element;
					if (element.$nameContainer) {
						this.$locationNameContainer.append(element.$nameContainer);
					}
				});
				this.cityStaticElements.reverse();
				this.baseLoadDone = true;
			}

			this.readjustCanvasSizes();

			if(this.overflowWidth > 0) {
				this.centerHorizontally();
			}

			this.skyCanvasController.updateSize();
			this.cityCanvasController.updateSize();

			this.skyCanvasController.drawStatic();
			this.skyCanvasController.drawDynamic();
			this.skyCanvasController.startDynamicAnimation();

			this.cityCanvasController.drawStatic();
			this.cityCanvasController.drawDynamic();
			this.cityCanvasController.startDynamicAnimation();
			
			this.initDone = true;
			if (callback) {
				callback();
			}
		};

		imageBuffer.waitMultipleCategoryLoad(["nexusCityDay"], loadCallback);
		this.ostAudioGroup.waitLoad(loadCallback);
	}

	readjustCanvasSizes() {
		if(!this.baseLoadDone) {
			return;
		}

		let baseHeight = this.$container.height();
		let baseWidth = this.$container.width();
		let baseRatio = baseWidth / baseHeight;

		let targetHeight = baseHeight;
		let targetWidth = baseWidth;
		if(baseRatio > this.CITY_RATIO) {
			let scale = baseWidth / this.STANDARD_CITY_WIDTH;
			targetHeight = this.STANDARD_CITY_HEIGHT * scale;
		} else {
			let scale = baseHeight / this.STANDARD_CITY_HEIGHT;
			targetWidth = this.STANDARD_CITY_WIDTH * scale;
		}

		this.$canvasContainer.height(targetHeight);
		this.$canvasContainer.width(targetWidth);

		this.skyCanvasController.updateSize();
		this.cityCanvasController.updateSize();

		this.skyBackdrop.updateSize(targetWidth);
		this.cloudElement.updateSize(targetWidth);
		this.cityStaticElements.forEach(element => {
			element.updateSize(targetWidth);
		});

		this.overflowHeight = this.skyBackdrop.canvasElement.cityScale * this.STANDARD_CITY_HEIGHT - baseHeight;
		this.overflowWidth = this.skyBackdrop.canvasElement.cityScale * this.STANDARD_CITY_WIDTH - baseWidth;

		if(this.currentTransformX > this.overflowHeight) {
			this.$canvasContainer.css("transform", `translateY(-${this.overflowHeight}px)`);
		}
		if(this.currentTransformY > this.overflowWidth) {
			this.$canvasContainer.css("transform", `translateX(-${this.overflowWidth}px)`);
		}

		this.skyCanvasController.drawStatic();
		this.skyCanvasController.drawDynamic();
		this.cityCanvasController.drawStatic();
		this.cityCanvasController.drawDynamic();
	}

	handleMouseMove(canvasX, canvasY, clientX, clientY) {
		let hoveredElement = this.getElementInCords(canvasX, canvasY);
		this.cityCanvasController.displayClickable(hoveredElement !== undefined);
		if (hoveredElement !== this.hoveredElement) {
			if (this.hoveredElement) {
				this.hoveredElement.hideName();
			}
			if (hoveredElement) {
				hoveredElement.displayName();
			}
			this.hoveredElement = hoveredElement;
		}

		let containerHeight = this.$container.height();
		let containerWidth = this.$container.width();

		//Check vertical scroll
		if (this.overflowHeight > 0) {
			if (containerHeight * (1 - this.TRIGGER_SCROLL_PERCENT) < clientY) {
				this.$canvasContainer.css("transform", `translateY(-${this.overflowHeight}px)`);
				this.currentTransformY = this.overflowHeight;
			} else if (containerHeight * this.TRIGGER_SCROLL_PERCENT > clientY) {
				this.$canvasContainer.css("transform", `translateY(0)`);
				this.currentTransformY = 0;
			}
		} else if(this.overflowWidth > 0) {
			if (containerWidth * (1 - this.TRIGGER_SCROLL_PERCENT) < clientX) {
				this.$canvasContainer.css("transform", `translateX(-${this.overflowWidth}px)`);
				this.currentTransformX = this.overflowWidth;
			} else if (containerWidth * this.TRIGGER_SCROLL_PERCENT > clientX) {
				this.$canvasContainer.css("transform", `translateX(0)`);
				this.currentTransformX = 0;
			}
		}
	}

	scrollMapBottom() {
		if (this.overflowHeight > 0) {
			this.$canvasContainer.css("transform", `translateY(-${this.overflowHeight}px)`);
		}
	}

	handleMouseClick(canvasX, canvasY) {
		let hoveredElement = this.getElementInCords(canvasX, canvasY);
		if (hoveredElement && hoveredElement.clickHandler) {
			hoveredElement.clickHandler();
		}
	}

	getElementInCords(x, y) {
		return this.cityStaticElements.find((element) => element.checkCollision(x, y));
	}
}

NexusCity.prototype.TRIGGER_SCROLL_PERCENT = 0.2;
NexusCity.prototype.SCROLL_SPEED = 200;
NexusCity.prototype.STANDARD_CITY_HEIGHT = 1080;
NexusCity.prototype.STANDARD_CITY_WIDTH = 2160;
NexusCity.prototype.CITY_RATIO = NexusCity.prototype.STANDARD_CITY_WIDTH / NexusCity.prototype.STANDARD_CITY_HEIGHT;

NexusCity.prototype.CITY_STATIC_ELEMENT_DESCRIPTNS = [
	{
		name: "base-city",
		x: 0,
		y: 120,
	},
	{
		name: "tower",
		x: 742,
		y: 1,
		collisionBoxInfo: [
			{
				x: 1058,
				y: 0,
				width: 118,
				height: 327,
			},
			{
				x: 808,
				y: 328,
				width: 617,
				height: 329,
			},
		],
		nameInfo: {
			name: "Dungeon",
			x: 375,
			y: 270,
		},
		clickHandler: function () {
			this.dungeonSelectionWindow.trigger();
		},
	},
	{
		name: "skyline",
		x: 0,
		y: 368,
	},
	{
		name: "building-1",
		x: 48,
		y: 494,
	},
	{
		name: "cafe",
		x: 13,
		y: 673,
		collisionBoxInfo: [
			{
				x: 35,
				y: 771,
				width: 366,
				height: 309,
			},
			{
				x: 9,
				y: 670,
				width: 178,
				height: 102,
			},
		],
		nameInfo: {
			name: "Locked",
			x: 280,
			y: 0,
			locked: true,
		},
	},
	{
		name: "guild-hall",
		x: 1343,
		y: 382,
		collisionBoxInfo: [
			{
				x: 1536,
				y: 378,
				width: 123,
				height: 163,
			},
			{
				x: 1513,
				y: 539,
				width: 350,
				height: 61,
			},
			{
				x: 1431,
				y: 599,
				width: 592,
				height: 229,
			},
		],
		nameInfo: {
			name: "Locked",
			x: 400,
			y: 50,
			locked: true,
		},
	},
	{
		name: "building-2",
		x: 2005,
		y: 644,
	},
	{
		name: "lab",
		x: 393,
		y: 480,
		collisionBoxInfo: [
			{
				x: 659,
				y: 479,
				width: 146,
				height: 244,
			},
			{
				x: 615,
				y: 585,
				width: 78,
				height: 137,
			},
			{
				x: 465,
				y: 515,
				width: 150,
				height: 206,
			},
			{
				x: 389,
				y: 721,
				width: 491,
				height: 100,
			},
		],
		nameInfo: {
			name: "Workshop",
			x: 230,
			y: -10,
		},
		clickHandler: function () {
			this.workshopWindow.trigger();
		},
	},
	{
		name: "inn",
		x: 1248,
		y: 752,
		collisionBoxInfo: [
			{
				x: 1290,
				y: 753,
				width: 189,
				height: 85,
			},
			{
				x: 1321,
				y: 836,
				width: 303,
				height: 61,
			},
			{
				x: 1248,
				y: 896,
				width: 386,
				height: 179,
			},
		],
		nameInfo: {
			name: "Inn",
			x: 120,
			y: -40,
		},
		clickHandler: function () {
			this.innWindow.trigger();
		},
	},
	{
		name: "arena",
		x: 23,
		y: 91,
		collisionBoxInfo: [
			{
				x: 179,
				y: 85,
				width: 96,
				height: 130,
			},
			{
				x: 20,
				y: 214,
				width: 412,
				height: 297,
			},
			{
				x: 133,
				y: 510,
				width: 191,
				height: 43,
			},
			{
				x: 205,
				y: 552,
				width: 44,
				height: 33,
			},
		],
		nameInfo: {
			name: "Locked",
			x: 200,
			y: 30,
			locked: true,
		},
	},
];

class NexusCityStaticElement {
	constructor(ctx, image, baseX, baseY, canvasWidth, collisionBoxInfo, nameInfo, clickHandler) {
		this.currentCanvasWidth = canvasWidth;
		this.collisionBoxInfo = collisionBoxInfo;

		this.canvasElement = new NexusCityCanvasElement(ctx, baseX, baseY, canvasWidth, image);
		this.collisionBoxes = [];
		this.buildCollisionBox();
		this.clickHandler = clickHandler;
		this.nameInfo = nameInfo;
		if (nameInfo) {
			this.$nameContainer = $(format(this.NAME_TEMPALTE, this.nameInfo.name));
			if (nameInfo.locked) {
				this.$nameContainer.addClass("locked");
			}
			this.updateNameContainerPosition();
		}
	}

	updateSize(canvasWidth) {
		if(this.currentCanvasWidth === canvasWidth) {
			return;
		}
		this.canvasElement.cityWidth = canvasWidth;
		this.canvasElement.render();
		this.buildCollisionBox();
		this.updateNameContainerPosition();
	}

	buildCollisionBox() {
		if(this.collisionBoxInfo) {
			let scale = this.canvasElement.cityScale;
			this.collisionBoxes = [];
			this.collisionBoxInfo.forEach(({ x, y, width, height }) => {
				this.collisionBoxes.push(
					new CollisionShapeSquare({ x: x * scale, y: y * scale }, width * scale, height * scale)
				);
			});
		}
	}

	displayName() {
		if (!this.nameInfo) {
			return;
		}
		this.$nameContainer.addClass("display");
	}

	hideName() {
		if (!this.nameInfo) {
			return;
		}
		this.$nameContainer.removeClass("display");
	}

	checkCollision(x, y) {
		return this.collisionBoxes && this.collisionBoxes.some((box) => box.pointInside(x, y));
	}

	updateNameContainerPosition() {
		if (!this.nameInfo) {
			return;
		}
		let { x, y } = this.nameInfo;
		let scale = this.canvasElement.cityScale;

		let targetX = x * scale + this.canvasElement.x * scale;
		let targetY = y * scale + this.canvasElement.y * scale;
		this.$nameContainer.css("left", `${targetX}px`).css("top", `${targetY}px`);
	}
}
NexusCityStaticElement.prototype.NAME_TEMPALTE = '<div class="nexusCityLocationName">{0}</div>';

class NexusCitySlideElement {
	constructor(ctx, image, baseX, baseY, canvasWidth, speed) {
		this.currentCanvasWidth = canvasWidth;
		this.canvasElement = new NexusCityCanvasElementInfiniteSlide(ctx, baseX, baseY, canvasWidth, image, speed);
	}
	
	updateSize(canvasWidth) {
		if(this.currentCanvasWidth === canvasWidth) {
			return;
		}
		this.canvasElement.cityWidth = canvasWidth;
		this.canvasElement.render();
	}
}
