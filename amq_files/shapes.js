"use strict";

/*exported AnimationShapeCircle AnimationShapeDonut*/

class AnimationShapeCircle {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    getRandomPointWithin() {
        let angle = Math.random() * 2 * Math.PI;
        let distance = this.radius * Math.sqrt(Math.random());

        return {
            x: distance * Math.cos(angle),
            y: distance * Math.sin(angle)
        };
    }

    generateShortestDirection(sourceX, sourceY) {
        let targetVector = {
            x: this.x - sourceX,
            y: this.y - sourceY
        };

        let vectorLength = Math.sqrt(Math.pow(targetVector.x, 2) + Math.pow(targetVector.y, 2));
        let targetDistance = vectorLength - this.radius;

        return {
            normVector: {
                x: targetVector.x / vectorLength,
                y: targetVector.y / vectorLength
            },
            distance: targetDistance
        };
    }

    calculateAngleToPoint(x, y) {
        if (x === this.x && y === this.y) {
            return null;
        }
        if (x === this.x) {
            if (y > this.y) {
                return Math.PI * 1.5;
            } else {
                return 0.5 * Math.PI;
            }
        }
        if (y === this.y) {
            if (x > this.x) {
                return 0;
            } else {
                return Math.PI;
            }
        }
        let angle = Math.atan((y - this.y) / (x - this.x));
        if (angle > 0) {
            if (y > this.y) {
                return angle;
            } else {
                return Math.PI + angle;
            }
        } else {
            if (y < this.y) {
                return angle;
            } else {
                return Math.PI + angle;
            }
        }
    }
}

class AnimationShapeDonut {
    constructor(x, y, innerRadius, outerRadius) {
        this.x = x;
        this.y = y;
        this.innerRadius = innerRadius;
        this.outerRadius = outerRadius;
    }

    getRandomPointWithin() {
        let angle = Math.random() * 2 * Math.PI;
        let donutWidth = this.outerRadius - this.innerRadius;
        let distance = donutWidth * Math.sqrt(Math.random()) + this.innerRadius;

        return {
            x: distance * Math.cos(angle),
            y: distance * Math.sin(angle)
        };
    }
}