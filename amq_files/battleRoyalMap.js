'use strict';

function BattleRoyalMap() {
    this.$mapContent = $("#brMapContent");
    this.$dropText = $("#brDropZoneText");
    this.$returnToMapButton = $("#brReturnToMapButton");

    let clicked = false;
    this.$returnToMapButton.click(() => {
        if (!clicked) {
            socket.sendCommand({
                type: "quiz",
                command: "battle royal return map"
            });
            clicked = true;
            setTimeout(() => {
                clicked = false;
            }, 200);
        }
    });


    this.mapObjects = {};
    this.mapGates = {};
    this.activeObjects = [];
    this.playerMap = {};
    this.tiles = {};
    this.pointPixelSize = null;
    this.gateSize = null;
    this.tileId = null;
    this.overmapSize = null;
    this.selfPlayer = null;
    this.activationRadius = null;
    this.tileSize = null;
    this.lastServerUpdate = null;
    this.lastUpdate = null;
    this.spectatorCount = 0;
    this.collectionFull = false;

    this.playerMovementInterval = null;
    this.BASE_PLAYER_MOVE_SERVER_TICK_RATE = 1000 / 10; //ms
    this.PLAYER_MOVEMENT_TICK_RATE = 1000 / 30; //ms
    this.playerMovementController = new BattleRoyalMovementController();
    this.inventoryFullMessageController = new BattleRoyaleInventoryFullMessageController();
}

BattleRoyalMap.prototype.drawTileOverview = function (mapSize, isSpectator, tilePlayerCounts) {
    this.clear();
    this.overmapSize = mapSize;
    let tilePercentWidth = 100 / mapSize;
    for (let y = 0; y < mapSize; y++) {
        for (let x = 0; x < mapSize; x++) {
            let tile = new BattleRoyalTile(x, y, tilePercentWidth, isSpectator);

            if (tilePlayerCounts) {
                tile.updateCount(tilePlayerCounts[x][y]);
            }

            this.$mapContent.append(tile.$html);

            if (!this.tiles[x]) {
                this.tiles[x] = {};
            }
            this.tiles[x][y] = tile;
        }
    }
    if (!isSpectator) {
        this.$dropText.removeClass('hidden');
    }
};

BattleRoyalMap.prototype.setupTile = function (tileState, isSpectator, inventoryFull) {
    this.clear();
    this.collectionFull = inventoryFull;
    this.spectatorCount = tileState.spectatorCount;
    this.tileSize = tileState.tileSize;
    this.pointPixelSize = this.$mapContent.width() / this.tileSize;
    this.tileId = tileState.tileId;
    this.gateSize = tileState.gateSize;
    this.activationRadius = tileState.activationRadius;
    tileState.objects.forEach(object => {
        this.spawnObject(object, inventoryFull);
    });

    if (this.tileId.x !== 0) {
        this.spawnGate('west', isSpectator);
    }
    if (this.tileId.x !== this.overmapSize - 1) {
        this.spawnGate('east', isSpectator);
    }
    if (this.tileId.y !== 0) {
        this.spawnGate('north', isSpectator);
    }
    if (this.tileId.y !== this.overmapSize - 1) {
        this.spawnGate('south', isSpectator);
    }

    tileState.players.forEach(player => {
        this.spawnPlayer(player, tileState.moveSpeed);
    });

    if (this.selfPlayer) {
        Object.values(this.mapGates).forEach(gate => {
            gate.setActive(gate.inGate(this.selfPlayer.x, this.selfPlayer.y));
        });
    }
    if (isSpectator) {
        this.$returnToMapButton.removeClass('hidden');
    }
};

BattleRoyalMap.prototype.spawnObject = function (object, inventoryFull) {
    let entry;
    if (object.info.type === 'NameEntry') {
        entry = new BattleRoyalShowEntry(object.info.annId, this.extractShowName(object.info), object.x, object.y, inventoryFull, this.inventoryFullMessageController, () => {
            this.executeMove(true);
        });
    } else {
        entry = new BattleRoyalContainerEntry(object.x, object.y, this.$mapContent, inventoryFull, this.inventoryFullMessageController, () => {
            this.executeMove(true);
        });
    }

    entry.updatePosition(this.pointPixelSize);
    this.$mapContent.append(entry.$html);
    if (!this.mapObjects[object.x]) {
        this.mapObjects[object.x] = {};
    }
    this.mapObjects[object.x][object.y] = entry;
};

BattleRoyalMap.prototype.spawnPlayer = function (playerInfo, moveSpeed) {
    let self = playerInfo.name === selfName;
    let playerEntry = new BattleRoyalPlayer(playerInfo.name, playerInfo.avatar.avatar, playerInfo.position.x, playerInfo.position.y, this.pointPixelSize, self, this.tileSize);

    this.$mapContent.append(playerEntry.$html);

    if (self) {
        this.selfPlayer = playerEntry;
        this.playerMovementController.setSpeed(moveSpeed);
        this.startPlayerMovement();
    } else {
        this.playerMap[playerInfo.gamePlayerId] = playerEntry;
    }
};

BattleRoyalMap.prototype.despawnPlayer = function (playerId) {
    this.playerMap[playerId].remove();
    delete this.playerMap[playerId];
};

BattleRoyalMap.prototype.updatePlayerPosition = function (playerId, position) {
    let player = this.playerMap[playerId];
    player.x = position.x;
    player.y = position.y;
    player.updatePosition(this.pointPixelSize);
};

BattleRoyalMap.prototype.spawnGate = function (position, isSpectator) {
    let gate = new BattleRoyalTileGate(this.gateSize, this.pointPixelSize, position, this.tileSize, () => {
        this.executeMove(true);
    }, isSpectator);
    this.$mapContent.append(gate.$html);
    this.mapGates[position] = gate;
};

BattleRoyalMap.prototype.objectDespawn = function (x, y) {
    if (this.mapObjects[x] && this.mapObjects[x][y]) {
        this.mapObjects[x][y].remove();
        delete this.mapObjects[x][y];
    }
};

BattleRoyalMap.prototype.containerEntryDespawn = function (x, y, annId) {
    if (this.mapObjects[x] && this.mapObjects[x][y]) {
        this.mapObjects[x][y].removeContentEntry(annId);
    }
};

BattleRoyalMap.prototype.showContainerContent = function (x, y, entries) {
    if (this.mapObjects[x] && this.mapObjects[x][y]) {
        this.mapObjects[x][y].showContent(entries.map(entry => {
            return {
                id: entry.id,
                name: this.extractShowName(entry)
            };
        }));
    }
};

BattleRoyalMap.prototype.updatePlayerName = function (gamePlayerId, newName) {
    let playerEntry = this.playerMap[gamePlayerId];
    if (playerEntry) {
        playerEntry.updateName(newName);
    }
};

BattleRoyalMap.prototype.relayout = function () {
    this.pointPixelSize = this.$mapContent.width() / this.tileSize;
    Object.values(this.mapObjects).forEach(row => {
        Object.values(row).forEach(object => {
            object.updatePosition(this.pointPixelSize);
        });
    });
    Object.values(this.playerMap).forEach(playerEntry => {
        playerEntry.updatePosition(this.pointPixelSize);
    });
    if (this.selfPlayer) {
        this.selfPlayer.updatePosition(this.pointPixelSize);
    }
    Object.values(this.mapGates).forEach(gate => {
        gate.updateSize(this.pointPixelSize);
    });
};

BattleRoyalMap.prototype.clear = function () {
    Object.values(this.mapObjects).forEach(row => {
        Object.values(row).forEach(entry => {
            entry.remove();
        });
    });
    //Extra handler to make sure no popover is left stuck
    setTimeout(() => {
        $("#brMapContainer").find('.popover').remove();
    }, 1);
    this.$mapContent.html("");
    this.$dropText.addClass('hidden');
    this.$returnToMapButton.addClass('hidden');
    this.mapObjects = {};
    this.mapGates = {};
    this.playerMap = {};
    this.tiles = {};
    this.pointPixelSize = null;
    this.tileId = null;
    this.gateSize = null;
    this.selfPlayer = null;
    this.activationRadius = null;
    this.tileSize = null;
    this.lastServerUpdate = null;
    this.lastUpdate = null;
    this.spectatorCount = 0;
    this.stopPlayerMovement();
    this.inventoryFullMessageController.hide();
};

BattleRoyalMap.prototype.extractShowName = function (nameInfo) {
    if (!nameInfo.eng) {
        return nameInfo.jap;
    } else if (!nameInfo.jap) {
        return nameInfo.eng;
    } else if (options.useRomajiNames) {
        return nameInfo.jap;
    } else {
        return nameInfo.eng;
    }
};

BattleRoyalMap.prototype.startPlayerMovement = function () {
    clearInterval(this.playerMovementInterval);
    this.lastUpdate = new Date();
    this.lastServerUpdate = new Date();
    this.playerMovementInterval = setInterval(() => {
        this.executeMove();
    }, this.PLAYER_MOVEMENT_TICK_RATE);
};

BattleRoyalMap.prototype.executeMove = function (forceServerUpdate) {
    let now = new Date();
    let deltaTimeMs = now - this.lastUpdate;
    this.lastUpdate = now;

    if (this.selfPlayer && this.playerMovementController.moving()) {
        let moveVector = this.playerMovementController.getMovementVector(deltaTimeMs / 1000);
        this.selfPlayer.move(moveVector);
        this.selfPlayer.updatePosition(this.pointPixelSize);

        this.toggleActiveObjects();
    }

    if (forceServerUpdate || now - this.lastServerUpdate > this.BASE_PLAYER_MOVE_SERVER_TICK_RATE || Object.keys(this.playerMap).length || this.spectatorCount) {
        let serverDelta = now - this.lastServerUpdate;
        socket.sendCommand({
            type: "quiz",
            command: "battle royal position",
            data: {
                x: this.selfPlayer.x,
                y: this.selfPlayer.y,
                deltaTime: serverDelta
            }
        });
        this.lastServerUpdate = now;
    }
};

BattleRoyalMap.prototype.toggleActiveObjects = function () {
    this.activeObjects.forEach((obj) => {
        obj.setActive(false);
    });
    this.activeObjects = [];

    let xPos = Math.floor(this.selfPlayer.x);
    let yPos = Math.floor(this.selfPlayer.y);
    for (let x = xPos - this.activationRadius; x <= xPos + this.activationRadius; x++) {
        if (this.mapObjects[x]) {
            let yRange = this.activationRadius - Math.floor((Math.abs(xPos - x)) * 0.5);
            for (let y = yPos - yRange; y <= yPos + yRange; y++) {
                if (this.mapObjects[x][y]) {
                    this.mapObjects[x][y].setActive(true);
                    this.activeObjects.push(this.mapObjects[x][y]);
                }
            }
        }
    }

    Object.values(this.mapGates).forEach(gate => {
        gate.setActive(gate.inGate(this.selfPlayer.x, this.selfPlayer.y));
    });
};

BattleRoyalMap.prototype.stopPlayerMovement = function () {
    clearInterval(this.playerMovementInterval);
};

BattleRoyalMap.prototype.correctPosition = function (x, y) {
    if (this.selfPlayer) {
        this.selfPlayer.x = x;
        this.selfPlayer.y = y;
        this.selfPlayer.updatePosition();
    }
};

BattleRoyalMap.prototype.updateTileCount = function (x, y, count) {
    if (this.tiles[x] && this.tiles[x][y]) {
        this.tiles[x][y].updateCount(count);
    }
};

BattleRoyalMap.prototype.setCollectionFull = function (isFull) {
    if (isFull !== this.collectionFull) {
        this.collectionFull = isFull;
        Object.values(this.mapObjects).forEach(entry => {
            Object.values(entry).forEach((object => {
                object.toggleInventoryFullState(isFull);
            }));
        });
    }
};

function BattleRoyalTile(x, y, sizePercent, isSpectator) {
    this.$html = $("<div class='brTile'><div></div><h2>0</h2></div>");
    this.$html
        .css('width', sizePercent + '%')
        .css('height', sizePercent + '%');

    this.$counter = this.$html.find('h2');
    if (isSpectator) {
        this.$html.addClass('spectator');
        this.$counter.popover({
            content: 'Players in Tile',
            delay: {show: 50, hide: 0},
            placement: 'auto',
            trigger: 'hover',
            container: '#brMapContainer'
        });
    }

    this.$html.click(() => {
        socket.sendCommand({
            type: "quiz",
            command: "tile selected",
            data: {
                x: x,
                y: y
            }
        });
    });
}

BattleRoyalTile.prototype.updateCount = function (count) {
    this.$counter.text(count);
};

function BattleRoyalShowEntry(annId, name, x, y, inventoryFull, inventoryFullMessageController, updatePosition) {
    this.$html = $(format(this.template));
    this.annId = annId;
    this.x = parseInt(x);
    this.y = parseInt(y);
    this.$html.popover({
        content: name,
        delay: {show: 50, hide: 0},
        placement: 'auto',
        trigger: 'hover',
        container: '#brMapContainer'
    });

    this.inventoryFull = false;
    this.toggleInventoryFullState(inventoryFull);

    let clicked = false;
    this.$html.click(() => {
        if (this.active && !clicked) {
            if (this.inventoryFull) {
                inventoryFullMessageController.show();
            } else {
                updatePosition();
                socket.sendCommand({
                    type: "quiz",
                    command: "object selected",
                    data: {
                        x: this.x,
                        y: this.y
                    }
                });
                clicked = true;
                setTimeout(() => {
                    clicked = false;
                }, 200);
            }
        }
    });
    this.active = false;
}

BattleRoyalShowEntry.prototype.updatePosition = function (pointPixelSize) {
    let translateX = 'translateX(calc(' + pointPixelSize * this.x + 'px - 50%))';
    let translateY = 'translateY(calc(' + pointPixelSize * this.y + 'px - 50%))';
    this.$html.css('transform', translateX + ' ' + translateY);
};

BattleRoyalShowEntry.prototype.setActive = function (active) {
    this.active = active;
    if (active) {
        this.$html.addClass('active');
    } else {
        this.$html.removeClass('active');
    }
};

BattleRoyalShowEntry.prototype.remove = function () {
    this.$html.popover('disable').popover('hide');
    this.$html.addClass('removed');
};

BattleRoyalShowEntry.prototype.toggleInventoryFullState = function (toggleOn) {
    this.inventoryFull = toggleOn;
    if (toggleOn) {
        this.$html.addClass('inventoryFull');
    } else {
        this.$html.removeClass('inventoryFull');
    }
};

BattleRoyalShowEntry.prototype.template = $("#brShowEntryTemplate").html();

function BattleRoyalContainerEntry(x, y, $container, inventoryFull, inventoryFullMessageController, updatePosition) {
    this.$html = $(format(this.template));
    this.$containerContent = this.$html.find('.brContainerContent');
    this.x = parseInt(x);
    this.y = parseInt(y);
    this.$html.popover({
        content: 'Data Store',
        delay: {show: 50, hide: 0},
        placement: 'auto',
        trigger: 'hover',
        container: '#brMapContainer'
    });

    this.inventoryFull = false;
    this.toggleInventoryFullState(inventoryFull);
    this.inventoryFullMessageController = inventoryFullMessageController;

    let clicked = false;
    this.$html.click((event) => {
        if (this.active && !clicked) {
            updatePosition();
            socket.sendCommand({
                type: "quiz",
                command: "object selected",
                data: {
                    x: this.x,
                    y: this.y
                }
            });

            clicked = true;
            setTimeout(() => {
                clicked = false;
            }, 200);
        }
        event.stopPropagation();
    });

    $container.click(() => {
        if (this.active) {
            this.hideContent();
        }
    });


    this.active = false;
}

BattleRoyalContainerEntry.prototype.updatePosition = function (pointPixelSize) {
    let translateX = 'translateX(calc(' + pointPixelSize * this.x + 'px - 50%))';
    let translateY = 'translateY(calc(' + pointPixelSize * this.y + 'px - 50%))';
    this.$html.css('transform', translateX + ' ' + translateY);
};

BattleRoyalContainerEntry.prototype.setActive = function (active) {
    this.active = active;
    if (active) {
        this.$html.addClass('active');
    } else {
        this.$html.removeClass('active');
        this.hideContent();
    }
};

BattleRoyalContainerEntry.prototype.showContent = function (entries) {
    if (this.active) {
        this.$containerContent.html("");
        entries.forEach(entry => {
            let $entry = $("<li class='brContainerEntry-" + entry.id + "'>" + entry.name + '</li>');
            $entry.popover({
                content: entry.name,
                placement: 'auto',
                trigger: 'hover',
                container: '#brMapContainer'
            });
            $entry.click(() => {
                if (this.inventoryFull) {
                    this.inventoryFullMessageController.show();
                } else {
                    socket.sendCommand({
                        type: "quiz",
                        command: "container entry selected",
                        data: {
                            x: this.x,
                            y: this.y,
                            id: entry.id
                        }
                    });
                    $entry.popover('hide');
                }
            });
            this.$containerContent.append($entry);
        });
        this.$containerContent.removeClass('hidden');
        this.$html.css('z-index', 1);
        this.$html.popover('disable').popover("hide");
    }
};

BattleRoyalContainerEntry.prototype.hideContent = function () {
    this.$containerContent.find('li').popover('hide');
    this.$html.css('z-index', "");
    this.$html.popover('enable');
    this.$containerContent.addClass('hidden');
};

BattleRoyalContainerEntry.prototype.removeContentEntry = function (id) {
    let $entry = this.$containerContent.find('.brContainerEntry-' + id);
    $entry.popover('disable').popover('hide');
    this.$containerContent.addClass('transitionDisable');
    $entry.remove();
    //Make it so new popovers aren't triggered strait away as this causes issue with bootstrap
    setTimeout(() => {
        this.$containerContent.removeClass('transitionDisable');
    }, 50);
};


BattleRoyalContainerEntry.prototype.remove = function () {
    if (this.active) {
        this.hideContent();
    }
    this.$html.popover('disable').popover('hide');
    this.$html.addClass('removed');
};

BattleRoyalContainerEntry.prototype.toggleInventoryFullState = function (toggleOn) {
    this.inventoryFull = toggleOn;
    if (toggleOn) {
        this.$html.addClass('inventoryFull');
    } else {
        this.$html.removeClass('inventoryFull');
    }
};

BattleRoyalContainerEntry.prototype.template = $("#brContainerEntryTemplate").html();

function BattleRoyalTileGate(gateSize, pointPixelSize, position, tileSize, updatePosition, isSpectator) {
    this.$html = $(format(this.template));
    this.gateSize = gateSize;
    this.position = position;
    this.tileSize = tileSize;
    this.active = false;

    let clicked = false;
    this.$html.click(() => {
        if (this.active && !clicked) {
            if (!isSpectator) {
                updatePosition();
            }
            socket.sendCommand({
                type: "quiz",
                command: "change tile",
                data: {
                    direction: this.position
                }
            });

            clicked = true;
            setTimeout(() => {
                clicked = false;
            }, 200);
        }
    });

    this.updateSize(pointPixelSize);

    this.$html.addClass(position);
    if (isSpectator) {
        this.setActive(true);
    }
}

BattleRoyalTileGate.prototype.updateSize = function (pointPixelSize) {
    let gateWidth = pointPixelSize * this.gateSize;
    let gateHeight = this.gateSize / 2 * pointPixelSize;
    if (this.position === 'north' || this.position === 'south') {
        this.$html
            .height(gateHeight)
            .width(gateWidth);
    } else {
        this.$html
            .height(gateWidth)
            .width(gateHeight);
    }
};

BattleRoyalTileGate.prototype.inGate = function (x, y) {
    let halfWidth = this.gateSize / 2;
    let halfHeight = this.gateSize / 2;
    let center = this.tileSize / 2;
    if (this.position === 'north' || this.position === 'south') {
        return x >= center - halfWidth && x <= center + halfWidth &&
            (this.position !== 'north' || y <= halfHeight) &&
            (this.position !== 'south' || y >= this.tileSize - halfHeight);
    } else {
        return y >= center - halfWidth && y <= center + halfWidth &&
            (this.position !== 'west' || x <= halfHeight) &&
            (this.position !== 'east' || x >= this.tileSize - halfHeight);
    }

};

BattleRoyalTileGate.prototype.setActive = function (active) {
    this.active = active;
    if (active) {
        this.$html.addClass('active');
    } else {
        this.$html.removeClass('active');
    }
};

BattleRoyalTileGate.prototype.template = $("#brTileGateTemplate").html();

function BattleRoyalPlayer(name, avatar, x, y, pointPixelSize, self, tileSize) {
    let avatarSrc = cdnFormater.newAvatarHeadSrc(
        avatar.avatarName,
        avatar.outfitName,
        avatar.optionName,
        avatar.optionActive,
        avatar.colorName
    );
    let avatarSrcSet = cdnFormater.newAvatarHeadSrcSet(
        avatar.avatarName,
        avatar.outfitName,
        avatar.optionName,
        avatar.optionActive,
        avatar.colorName
    );

    this.$html = $(format(this.template, avatarSrcSet, avatarSrc));

    if (!self) {
        this.$html.popover({
            content: name,
            delay: {show: 50, hide: 0},
            placement: 'auto',
            trigger: 'hover',
            container: '#brMapContainer'
        });
    }

    this.x = x;
    this.y = y;
    this.tileSize = tileSize;

    this.updatePosition(pointPixelSize);

    if (self) {
        this.$html.addClass('self');
    }
}

BattleRoyalPlayer.prototype.move = function (moveVector) {
    this.x += moveVector.x;
    this.y += moveVector.y;
    if (this.x < 0) {
        this.x = 0;
    } else if (this.x > this.tileSize) {
        this.x = this.tileSize;
    }
    if (this.y < 0) {
        this.y = 0;
    } else if (this.y > this.tileSize) {
        this.y = this.tileSize;
    }
};

BattleRoyalPlayer.prototype.updatePosition = function (pointPixelSize) {
    let translateX = 'translateX(calc(' + pointPixelSize * this.x + 'px - 50%))';
    let translateY = 'translateY(calc(' + pointPixelSize * this.y + 'px - 50%))';
    this.$html.css('transform', translateX + ' ' + translateY);
};

BattleRoyalPlayer.prototype.updateName = function (newName) {
    this.$html.data('bs.popover').options.content = newName;
};

BattleRoyalPlayer.prototype.remove = function () {
    this.$html.remove();
};

BattleRoyalPlayer.prototype.template = $("#brPlayerTemplate").html();

function BattleRoyalMovementController() {
    this.keysDown = {
        up: false,
        down: false,
        left: false,
        right: false
    };

    this.moveSpeedSec = 0;
    this.digMoveSpeedSec = 0;
    this.lastMove;

    $("#brMap").keydown((event) => {
        if (this.UP_KEY_CODES.includes(event.which)) {
            this.keysDown.up = true;
        } else if (this.DOWN_KEY_CODES.includes(event.which)) {
            this.keysDown.down = true;
        } else if (this.LEFT_KEY_CODES.includes(event.which)) {
            this.keysDown.left = true;
        } else if (this.RIGHT_KEY_CODES.includes(event.which)) {
            this.keysDown.right = true;
        }
    });
    $("#brMap").keyup((event) => {
        if (this.UP_KEY_CODES.includes(event.which)) {
            this.keysDown.up = false;
        } else if (this.DOWN_KEY_CODES.includes(event.which)) {
            this.keysDown.down = false;
        } else if (this.LEFT_KEY_CODES.includes(event.which)) {
            this.keysDown.left = false;
        } else if (this.RIGHT_KEY_CODES.includes(event.which)) {
            this.keysDown.right = false;
        }
    });
    $("#brMap").focusout(() => {
        this.reset();
    });
}

BattleRoyalMovementController.prototype.UP_KEY_CODES = [87, 38];
BattleRoyalMovementController.prototype.DOWN_KEY_CODES = [83, 40];
BattleRoyalMovementController.prototype.LEFT_KEY_CODES = [65, 37];
BattleRoyalMovementController.prototype.RIGHT_KEY_CODES = [68, 39];

BattleRoyalMovementController.prototype.setSpeed = function (baseSpeed) {
    this.moveSpeedSec = baseSpeed;
    this.digMoveSpeedSec = Math.sqrt(2) * baseSpeed / 2;
};

BattleRoyalMovementController.prototype.reset = function () {
    this.keysDown = {
        up: false,
        down: false,
        left: false,
        right: false
    };
};

BattleRoyalMovementController.prototype.moving = function () {
    return this.keysDown.up || this.keysDown.down || this.keysDown.left || this.keysDown.right;
};

BattleRoyalMovementController.prototype.getMovementVector = function (deltaTimeSec) {
    let movementVector = {x: 0, y: 0};
    if (this.keysDown.up) {
        movementVector.y--;
    }
    if (this.keysDown.down) {
        movementVector.y++;
    }
    if (this.keysDown.left) {
        movementVector.x--;
    }
    if (this.keysDown.right) {
        movementVector.x++;
    }

    let totalMove = Math.abs(movementVector.x) + Math.abs(movementVector.y);
    let speed = totalMove === 2 ? this.digMoveSpeedSec : this.moveSpeedSec;
    let vectorSpeed = speed * deltaTimeSec;

    return {
        x: movementVector.x * vectorSpeed,
        y: movementVector.y * vectorSpeed
    };
};