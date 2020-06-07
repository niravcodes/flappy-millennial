import {
    Kinetics
} from "./kinetics.js"
import {
    physics
} from "./constants.js"

//only AABB collider for now
export default class Collider {
    name = String;
    motion = Kinetics; //needs to know which character to follow
    width;
    height;
    offsetX; //from origin
    offsetY;

    constructor(name, motion, width, height, offsetX, offsetY) {
        this.motion = motion;
        this.width = width;
        this.height = height;
        this.offsetX = offsetX;
        this.offsetY = offsetY
        this.name = name;
    };

    clone(motion) {
        if (motion === undefined)
            motion = this.motion.clone();
        let clone = {
            ...this,
            motion
        }
        return clone;
    }

    isColliding(anotherCollider) {
        let x = this.motion.x - this.offsetX;
        let y = this.motion.y - this.offsetY;
        let w = this.width;
        let h = this.height;

        let x2 = anotherCollider.motion.x - anotherCollider.offsetX;
        let y2 = anotherCollider.motion.y - anotherCollider.offsetY;
        let w2 = anotherCollider.width;
        let h2 = anotherCollider.height;

        if (x < x2 + w2 &&
            x + w > x2 &&
            y < y2 + h2 &&
            y + h > y2) {
            return true;
        }
        return false;
    };
    collisionDirection(anotherCollider) {
        let x = this.motion.x - this.offsetX;
        let y = this.motion.y - this.offsetY;
        let w = this.width;
        let h = this.height;

        let x2 = anotherCollider.motion.x - anotherCollider.offsetX;
        let y2 = anotherCollider.motion.y - anotherCollider.offsetY;
        let w2 = anotherCollider.width;
        let h2 = anotherCollider.height;

        // Now calculating the distance between walls of AABB that can collide. 
        // in the same direction as CSS padding applies to the second collider.
        // in the code documentation, I'll include a picture to explain somewhere
        let dist = [];
        dist[0] = Math.abs(y - (y2 + h2));
        dist[1] = Math.abs((x + w) - x2);
        dist[2] = Math.abs((y + h) - y2);
        dist[3] = Math.abs(x - (x2 + w2))
        let min = Math.min(...dist)
        let direction = 0;
        dist.forEach((d, i) => {
            if (d == min) direction = i
        })
        return direction;
    }

    resolveCollisionLand(collider, direction) {
        if (direction === undefined)
            direction = this.collisionDirection(collider);

        if (direction == 2) {
            this.motion.ay = 0;
            this.motion.vy = 0;
            this.motion.setY((collider.motion.y - collider.offsetY) - (this.height - this.offsetY));
        } else if (direction == 0) {
            this.motion.vy = 0;
            this.motion.setY(collider.motion.y - collider.offsetY + collider.height + this.offsetY);
        } else if (direction === 3) {
            // this.motion.vx = 0;
            this.motion.setX(collider.motion.x - collider.offsetX + collider.width + this.offsetX);
        } else if (direction == 1) {
            // this.motion.vx = 0;
            this.motion.setX(collider.motion.x - collider.offsetX - this.offsetX);
        }
    }

    // hardbody collision resolution
    // for now, the momentum shift is designed 
    // particularly for the octopus. that will need to be changed.
    // Maybe take softness factor as a parameter and invert acceleration
    // accordingly?

    resolveCollisionHard(collider, direction) {
        if (direction === undefined)
            direction = this.collisionDirection(collider);

        if (direction == 2) {
            this.motion.ay = 0;
            this.motion.vy = 0;
            this.motion.setY((collider.motion.y - collider.offsetY) - (this.height - this.offsetY));
        } else if (direction == 0) {
            this.motion.ay = physics.gravity;
            this.motion.vy = 0;
            this.motion.setY(collider.motion.y - collider.offsetY + collider.height + this.offsetY);
        } else if (direction === 3) {
            this.motion.vx = 0;
            this.motion.ax = 1;
            this.motion.setX(collider.motion.x - collider.offsetX + collider.width + this.offsetX);
        } else if (direction == 1) {
            this.motion.vx = 0;
            this.motion.ax = -1;
            this.motion.setX(collider.motion.x - collider.offsetX - this.offsetX);
        }
    }


    // use this if this character moves and might interact with the another moving character
    // for example: a moving platform for the octopus to sit and transport

    //THIS IS SHIT REDO
    resolveCollisionMoving(collider) {
        if (collider.collisionDirection(this) == 0) {
            this.motion.vx = collider.motion.xdirection * 1.25;
            this.motion.y = collider.motion.y - this.height + 14;
        } else if (collider.collisionDirection(this) == 2) {
            this.motion.ay = physics.gravity;
            this.motion.vy = 0;
            this.motion.y += 4; //it's okay if we're pushing octo down when it approaches from below cuz gravity
        } else if (collider.collisionDirection(this) == 1) {
            // this.motion.vx = 0;
            // this.motion.ax = 1;
            this.motion.x = collider.motion.x + collider.width + 6;
        } else if (collider.collisionDirection(this) == 3) {
            // this.motion.vx = 0;
            // this.motion.ax = -1;
            this.motion.x = collider.motion.x - this.width;
        }

    }
}