"use strict"

// This class defines the motion properties of the character.
// the motionFunction is a function that will directly determine
// how the character will move.
import {
    cw,
    ch,
} from "./canvas.js"

export class Kinetics {
    x = 50;
    y = 50;
    xdirection = 1;
    ydirection = 1;
    angle = 0;
    origMotionFunction;
    motionFunction = undefined;

    last = this;
    constructor(motionFunction, x = 50, y = 50) {
        if (motionFunction) {
            this.origMotionFunction = motionFunction;
            this.motionFunction = motionFunction.bind(this);
        }
        this.x = x;
        this.y = y;
    }
    clone() {
        let clone = new Kinetics(this.origMotionFunction, this.x, this.y)
        return clone;
    }

    computePhysics() {
        this.saveLast();
        if (this.motionFunction !== undefined)
            this.motionFunction();
    }
    reset() {
        this.x = 50;
        this.y = 50;
        this.xdirection = 1;
        this.ydirection = 1;
        this.angle = 0;
        this.saveLast();
    }
    saveLast() {
        this.last = {
            ...this
        }
    }

    setX(x) {
        this.saveLast();
        this.x = x;
    }
    setY(y) {
        this.saveLast();
        this.y = y;
    }
}



// This class imparts physics like motion for the character. When applied
// to a character instead of the normal Kinetics class, PhysicsKinetics
// will subject the character to the game gravity defined in constants.js
// and expose functions to naturally move the character by applying force.

import {
    physics
} from "./constants.js"

export class PhysicsKinetics extends Kinetics {
    angle = 0;
    x = cw / 2;
    y = ch / 2;
    vx = 0;
    vy = 0;
    ax = 0;
    ay = 0;

    constructor(gravity = physics.gravity) {
        super();
        if (gravity !== undefined) this.gravity = gravity
        else this.gravity = physics.gravity;
    }
    clone() {
        let clone = new PhysicsKinetics(this.gravity)
        return clone;
    }
    computePhysics() {
        this.saveLast();
        this.ay += this.gravity;

        this.ay = physics.decayMotion * this.ay;
        this.ax = physics.decayMotion * this.ax; //acc.decayMotion

        this.vy += this.ay;
        this.vx += this.ax;

        this.vy = physics.decayMotion * this.vy;
        this.vx = physics.decayMotion * this.vx; //velocity.decayMotion

        this.y += this.vy;
        this.x += this.vx;
    }
    applyAcceleration(magnitude, xFactor = 1, yFactor = 1, angle) {
        if (angle === undefined) angle = this.angle;
        this.saveLast();
        this.ax += xFactor * magnitude * Math.sin(angle);
        this.ay -= yFactor * magnitude * Math.cos(angle);
    }
    reset() {
        Kinetics.prototype.reset();
        this.ax = 0;
        this.ay = 0;
        this.vy = 0;
        this.vx = 0;
    }
}

export class PhysicsKineticsLand extends Kinetics {
    angle = 0;
    x = cw / 2;
    y = ch / 2;
    vx = 0;
    vy = 0;
    ax = 0;
    ay = 0;

    constructor(gravity = physics.gravity) {
        super();
        if (gravity !== undefined) this.gravity = gravity
        else this.gravity = physics.gravity;
    }
    clone() {
        let clone = new PhysicsKineticsLand(this.gravity)
        return clone;
    }
    computePhysics() {
        this.saveLast();
        this.ay += this.gravity;

        this.vy += this.ay;
        this.vx += this.ax;

        this.y += this.vy;
        this.x += this.vx;
    }
    applyAcceleration(magnitude, xFactor = 1, yFactor = 1, angle) {
        if (angle === undefined) angle = this.angle;
        this.saveLast();
        this.ax += xFactor * magnitude * Math.sin(angle);
        this.ay -= yFactor * magnitude * Math.cos(angle);
    }
    applyVelocity(magnitude, angle) {
        if (angle === undefined) angle = this.angle;
        this.saveLast();
        this.vx += magnitude * Math.sin(angle);
        this.vy -= magnitude * Math.cos(angle);
    }

    reset() {
        Kinetics.prototype.reset();
        this.ax = 0;
        this.ay = 0;
        this.vy = 0;
        this.vx = 0;
    }
}