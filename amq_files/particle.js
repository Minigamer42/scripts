/*exported Particle*/
var particleTemplate = $("#particleTemplate").html();

function Particle($container, startPoint, endPoint, diameter, ticks) {
    this.$container = $container;
    this.diameter = diameter;
    this.startPoint = startPoint;

    //Calculate the travel path
    this.path = [];
    this.step = 0;

    this.movementCompleted = false;

    //Define with direction the particle is moving
    let directionX;
    let directionY;
    if (startPoint.x < endPoint.x) {
        directionX = 1;
    } else {
        directionX = -1;
    }
    if (startPoint.y < endPoint.y) {
        directionY = 1;
    } else {
        directionY = -1;
    }

    let xDistance = Math.abs(startPoint.x - endPoint.x);
    let yDistance = Math.abs(startPoint.y - endPoint.y);

    let longestDistance = xDistance > yDistance ? xDistance : yDistance;

    let accelerationTickCount = Math.floor(ticks * 0.33);
    let maxSpeedTickCount = ticks - accelerationTickCount;

    let accelerationDistance = Math.floor(longestDistance * 0.33);
    let maxSpeedDistance = longestDistance - accelerationDistance;

    let maxSpeed = maxSpeedDistance / maxSpeedTickCount;
    let startSpeed = 0;
    let acceleration = this.calculateAcceleration(startSpeed, accelerationDistance, accelerationTickCount);

    let ySpeed;
    let xSpeed;
    if (xDistance > yDistance) {
        ySpeed = yDistance / ticks;
        xSpeed = startSpeed;
    } else {
        xSpeed = xDistance / ticks;
        ySpeed = startSpeed;
    }

    let xTraveled = 0;
    let yTraveled = 0;
    while (xTraveled < xDistance) {
        if (xDistance > yDistance) {
            xSpeed += acceleration;
            if (xSpeed > maxSpeed) {
                xSpeed = maxSpeed;
            }
        } else {
            ySpeed += acceleration;
            if (ySpeed > maxSpeed) {
                ySpeed = maxSpeed;
            }
        }
        xTraveled += xSpeed;
        yTraveled += ySpeed;
        this.path.push({
            x: xTraveled * directionX,
            y: yTraveled * directionY
        });
    }

    this.$particle = $(format(particleTemplate, this.diameter));
}

Particle.prototype.insert = function () {
    this.$particle
        .css("left", this.startPoint.x)
        .css("top", this.startPoint.y);
    this.$container.append(this.$particle);
};

Particle.prototype.update = function () {
    if (this.step >= this.path.length) {
        this.movementCompleted = true;
        return;
    }
    let entry = this.path[this.step];
    this.$particle.css('transform', 'translateX(' + entry.x + 'px) translateY(' + entry.y + 'px)');

    this.step++;
};

Particle.prototype.delete = function () {
    this.$particle.remove();
};

//Using equation for motion under constant acceleration: distance(t) = distance_start + startSpeed * time + 1/2 * acceleration * time^2
Particle.prototype.calculateAcceleration = function (startSpeed, distance, ticks) {
    return (distance * 2 - startSpeed * ticks * 2) / ticks ^ 2;
};