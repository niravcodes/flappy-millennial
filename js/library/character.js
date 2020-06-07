"use strict"
import {
    Kinetics
} from "./kinetics.js"
import {
    cc
} from "./canvas.js"
import Spritesheet from "./spritesheet.js"

// This class will be used for almost all elements of the game
// that have a complex behaviour. Later, I might also make derived 
// classes from the base Character class to describe floors, generic 
// enemies and and other stuff.

//    Main parts:
// 1. colliders[] is the list of colliders of the characters.
//    Collider is how the character will interact with it's surroundings, enemies and other obstacles.
// 2. collidesWith[] is the list of things the character can interact with
//      (the list of other characters colliders which will have to be handled)
// 3. motion is of Kinetics class and will determine how the character moves (gravity, or preprogrammed motions etc)
// 4. height and width are the dimensions of the SPRITESHEET, not collider.
// 5. baseAnimation is the picture or animation that represents the character when idle.
// 6. animations[] will keep spritesheets like running, jumping, dashing. Use this to store all animations for character

export default class Character {
    width;
    height;
    colliders = [];
    collidesWith = [];
    collideActions = [];
    animations = [];

    spriteOffset = { x: 0, y: 0 }
    baseAnimation;
    motion = Kinetics;
    initFn;
    paused = true;
    hidden = false;

    keyboard;

    startingVariables;

    registerCollider(collider) {
        if (collider && collider !== undefined) {
            collider.motion = this.motion;
            this.colliders.push(collider)
        }
    }
    registerCollisionWith(collider) {
        this.collidesWith.push(collider);
    }
    registerAnimation(name, anim) {
        this.animations[name] = anim;
    }
    constructor(motion, collider, baseAnim, width = undefined, height = undefined, initFn = undefined, disinitFn = undefined) {
        if (collider)
            collider.motion = motion;
        this.motion = motion;
        this.colliders[0] = collider;

        this.baseAnimation = baseAnim;
        this.animations[0] = baseAnim;
        this.animations['base'] = baseAnim;

        this.width = width
        this.height = height;

        if (initFn !== undefined)
            this.initFn = initFn.bind(this);
        if (disinitFn !== undefined)
            this.disinitFn = disinitFn.bind(this);

        this.startingVariables = {
            x: motion.x,
            y: motion.y,
        }

    }
    clone() {
        let c = new Character(
            this.motion.clone(),
            this.colliders[0].clone(),
            this.baseAnimation.clone(),
            this.width, this.height
        )
        return c;
    }
    init() {
        this.unpause();
        this.unhide();
        this.motion.x = this.startingVariables.x;
        this.motion.y = this.startingVariables.y;
        if (this.initFn !== undefined)
            this.initFn();
    }
    dismantle() {
        this.pause();
        if (this.disinitFn !== undefined)
            this.disinitFn();
    }

    nextStep() {
        if (!this.paused) {
            this.motion.computePhysics();
            this.checkCollisions();
        }
    }

    pause() {
        this.paused = true;
        if (this.keyboard !== undefined)
            this.keyboard.disarm();
    }
    unpause() {
        this.paused = false;
        if (this.keyboard !== undefined)
            this.keyboard.arm();
    }
    hide() {
        this.hidden = true;
    }
    unhide() {
        this.hidden = false;
    }




    draw(offsetX = 0, offsetY = 0) {
        if (!this.hidden) {
            if (this.baseAnimation === undefined) return;
            this.baseAnimation.draw(
                this.motion.x + offsetX + this.spriteOffset.x,
                this.motion.y + offsetY + this.spriteOffset.y,
                this.motion.angle,
                this.motion.xdirection,
                this.motion.ydirection,
                this.width,
                this.height)
        }
    }

    checkCollisions() {
        let noCollisions = true;
        this.colliders.forEach(myCollider => {
            this.collidesWith.forEach(collideWith => {
                if (myCollider.isColliding(collideWith)) {
                    noCollisions = false;
                    if (this.collideActions[collideWith.name] !== undefined)
                        this.collideActions[collideWith.name].bind(this)(
                            myCollider.collisionDirection(collideWith),
                            myCollider,
                            collideWith
                        );
                }
            })
        })
        if (noCollisions && this.collideActions["NO_COLLISIONS"])
            this.collideActions["NO_COLLISIONS"].bind(this)();
    }

    animationRunning = false;
    runAnimation(name = "base", loop = false, frameRate = 100, afterCall, resetAfterDone = true) {
        // if (!this.animationRunning) {
        // this.animationRunning = true;
        if (loop === false) {
            this.baseAnimation.disengage();
            this.baseAnimation = this.animations[name];
            this.baseAnimation.engage();
            this.baseAnimation.startAnimOneShot(frameRate, () => {
                if (resetAfterDone)
                    this.baseAnimation.resetFrame();
                if (afterCall) afterCall.bind(this)()
            });
        } else {
            this.baseAnimation.disengage();
            this.baseAnimation = this.animations[name];
            this.baseAnimation.engage();
            this.baseAnimation.startAnim(frameRate);
        }
        // }
    }
    stopAnimation() {
        // this.animationRunning = false;
        // this.baseAnimation.resetFrame();
        // this.baseAnimation = this.animations[0];
        // this.baseAnimation.startAnimOneShot(100, () => {
        //     this.baseAnimation.resetFrame()
        // })
        this.baseAnimation.stopAnim();
    }
    setSprite(name = "base") {
        this.baseAnimation.resetFrame();
        this.baseAnimation = this.animations[name];
    }

    registerEvent(ev) {
        this.keyboard = ev;
        if (!this.paused) this.keyboard.arm();
    }

    debugDrawCollider(offsetX, offsetY) {
        this.colliders.forEach(col => {
            if (col !== undefined) {
                cc.save();
                cc.fillStyle = "rgba(0,0,0,0)";
                cc.lineWidth = "1";
                cc.strokeStyle = "white";
                cc.strokeRect(this.motion.x - col.offsetX + offsetX, this.motion.y - col.offsetY + offsetY, col.width, col.height);
                cc.fillStyle = "white"
                cc.fillRect(this.motion.x + offsetX, this.motion.y + offsetY, 3, 3);
                cc.fillStyle = "red"
                cc.fillRect(this.motion.x + offsetX, this.motion.y + offsetY + 3, 3, 3);
                cc.restore();
            }
        })
    };

    debugAnnotations = [];
    registerDebugAnnotation(drawObj) {
        return (this.debugAnnotations.push(drawObj) - 1)
    }
    unregisterDebugAnnotation(number) {
        if (number === undefined) return
        delete this.debugAnnotations[number]
    }
    hasDebugAnnotations() {
        return this.debugAnnotations.filter(x => x).length !== 0;
    }
    debugDrawAnnotations(offX, offY) {
        cc.save();
        cc.strokeStyle = "white";
        cc.fillStyle = "white"
        this.debugAnnotations.forEach(el => {
            if (el.type === "line") {
                cc.beginPath();
                cc.moveTo(el.x1 + offX, el.y1 + offY);
                cc.lineTo(el.x2 + offX, el.y2 + offY);
                cc.stroke();
            } else if (el.type === "text") {
                cc.fillText(el.text, el.x + offX, el.y + offY)
            }

        })
        cc.restore();
    }
}