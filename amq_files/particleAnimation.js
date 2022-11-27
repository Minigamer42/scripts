'use strict';

/*exported PARTICLE_SPAWN_STRATEGIES */

function ParticleAnimation() {
    this.particleTracks = [];
    this.animationRunning = false;
}

ParticleAnimation.prototype.addTrack = function (particleTrack) {
    this.particleTracks.push(particleTrack);
};

ParticleAnimation.prototype.clearTrack = function () {
    this.particleTracks = [];
};

ParticleAnimation.prototype.startAnimation = function () {
    if (this.particleTracks.length > 0) {
        this.animationRunning = true;
        let spawnTimeout = this.particleTracks[0].spawnAnimation();
        setTimeout(() => {
            this.particleTracks.forEach((track) => {
                track.spawnParticles();
            });

            let animationInternval = setInterval(() => {
                let animationCompleted = true;
                this.particleTracks.forEach((track) => {
                    if (!track.tick()) {
                        animationCompleted = false;
                    }
                });
                if (animationCompleted) {
                    clearInterval(animationInternval);
                    this.animationRunning = false;
                }
            }, 16);
        }, spawnTimeout);
    }
};

function ParticleTrack($startElement, $endElement, startPointStrategy) {
    this.$startElement = $startElement;
    this.$endElement = $endElement;

    var endFunction = () => {
        this.$startElement.removeClass("runAnimation");
    };
    this.$startElement
        .bind('webkitAnimationEnd', endFunction)
        .bind('animationEnd ', endFunction);

    this.$particleContainer = $("#particleContainer");
    this.particels = []; //Build with buildTrack
    this.particleCount;
    this.spawnTimeout;
    this.activeParticles = [];
    this.endEvent = () => {
    };
    this.endEventFired = false;

    this.startPointStrategy = startPointStrategy;
}

ParticleTrack.prototype.setEndEvent = function (event) {
    this.endEvent = event;
    this.endEventFired = false;
};

ParticleTrack.prototype.buildTrack = function () {
    let durationMs;
    switch (options.particleQuality) {
        case 0:
            this.particleCount = 0;
            this.spawnTimeout = 50;
            durationMs = 0;
            break;
        case 1:
            this.particleCount = 4;
            this.spawnTimeout = 360;
            durationMs = 300;
            break;
        case 2:
            this.particleCount = 8;
            this.spawnTimeout = 360;
            durationMs = 300;
            break;
    }

    this.particels = [];

    for (let i = 0; i < this.particleCount; i++) {
        let startCoordinates = this.startPointStrategy(this.$startElement);

        //Calculate the endpoint
        var endOffsetAngle = Math.random() * Math.PI / 2;
        var endOffsetLength = Math.random() * 40;
        var endXCord = Math.sin(endOffsetAngle) * endOffsetLength;
        var endYCord = Math.cos(endOffsetAngle) * endOffsetLength;

        if (Math.random() < 0.5) {
            endXCord *= -1;
        }
        if (Math.random() < 0.5) {
            endYCord *= -1;
        }

        let endElementOffset = this.$endElement.offset();
        let offsetX = this.$endElement.width() / 2 + endElementOffset.left;
        let offsetY = this.$endElement.height() / 2 + endElementOffset.top;

        var endXPos = offsetX + endXCord;
        var endYPos = offsetY + endYCord;

        let ticks = durationMs * 60 / 1000;
        var particleDiameter = Math.random() * 5 + 5;
        this.particels.push(new Particle(this.$particleContainer, {
            x: startCoordinates.x,
            y: startCoordinates.y
        }, {x: endXPos, y: endYPos}, particleDiameter, ticks));
    }
};

ParticleTrack.prototype.spawnAnimation = function () {
    this.$startElement.addClass("runAnimation");
    return this.spawnTimeout;
};

ParticleTrack.prototype.spawnParticles = function () {
    if (this.particels.length) {
        this.spawnNextParticle();

        setTimeout(() => {
            this.spawnParticles();
        }, this.getSpawnTimeout());
    }
};


ParticleTrack.prototype.getSpawnTimeout = function () {
    return 80 + Math.random() * 40;
};

ParticleTrack.prototype.spawnNextParticle = function () {
    let particle = this.particels.pop();
    particle.insert();
    this.activeParticles.push(particle);
};

ParticleTrack.prototype.tick = function () {
    if (this.particleCount) {
        var completed = true;
        this.activeParticles.forEach((particle) => {
            if (!particle.movementCompleted) {
                particle.update();
                completed = false;
            } else {
                if (!this.endEventFired) {
                    this.endEvent();
                    this.endEventFired = true;
                }
                particle.delete();
            }
        });
        return completed;
    } else {
        this.endEvent();
        return true;
    }
};

var PARTICLE_SPAWN_STRATEGIES = {
    CIRCLE: function ($spawnElement) {
        let startElementRadius = $spawnElement.width() / 2;
        let offset = $spawnElement.offset();
        let offsetX = offset.left + $spawnElement.innerWidth() / 2;
        let offsetY = offset.top + $spawnElement.innerHeight() / 2;
        var angleOffset = Math.random() * Math.PI / 2;
        var containerOffset = Math.random() * 7 + 3; //Distance particle spawns from container
        var xCord = Math.sin(angleOffset) * (startElementRadius + containerOffset);
        var yCord = Math.cos(angleOffset) * (startElementRadius + containerOffset);
        //Decide with way the offsets should tilt
        if (Math.random() < 0.5) {
            xCord *= -1;
        }
        if (Math.random() < 0.5) {
            yCord *= -1;
        }
        return {
            x: xCord + offsetX,
            y: yCord + offsetY
        };
    },
    RECTANGLE_VERTICAL_EDGES: function ($spawnElement) {
        let width = $spawnElement.width();
        let height = $spawnElement.height();
        let leftOffset = $spawnElement.offset().left;
        let topOffset = $spawnElement.offset().top;

        let xCord;
        if (Math.random() < 0.5) {
            xCord = leftOffset;
        } else {
            xCord = leftOffset + width;
        }

        let yCord = topOffset + Math.random() * height;

        return {
            x: xCord,
            y: yCord
        };
    }
};