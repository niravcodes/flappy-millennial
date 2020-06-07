import {
    frameRateMs
} from "./constants.js"
import {
    cc
} from "./canvas.js"

export default class Spritesheet {
    image;
    sheetwidth;
    sheetheight;
    cols;
    spritewidth;
    originFactor; // 0.5 = middle, it's a percentage; that's just what it is 
    imageLoaded = false;

    constructor(location, cols = 1, originFactor = {
        height: 0.5,
        width: 0.5
    }) {
        if (location === undefined) return; // this facilitates clone mechanism (see below).
        this.image = new Image();
        this.image.src = location;
        this.cols = cols;
        this.curFrame = 0
        this.originFactor = originFactor;
        this.image.onload = () => {
            this.sheetwidth = this.image.width;
            this.sheetheight = this.image.height
            this.spritewidth = this.sheetwidth / this.cols;
            this.imageLoaded = true;
        }
    };
    clone() {
        if (this.imageLoaded) {
            let clone = new Spritesheet()
            clone.image = this.image;
            clone.sheetheight = this.sheetheight;
            clone.sheetwidth = this.sheetwidth;
            clone.spritewidth = this.spritewidth;
            clone.originFactor = this.originFactor
            clone.cols = this.cols;
            return clone;
        } else {
            return new Spritesheet(this.location, this.cols, this.originFactor)
        }
    }

    draw = (x, y, angle = 0, xScale = 1, yScale = 1, width = undefined, height = undefined) => {
        if (width === undefined) width = this.image.width / this.cols;
        if (height === undefined) height = this.sheetheight;

        x = Math.floor(x) //turn off subpixel rendering
        y = Math.floor(y) //later we'll have to have a mechanism to turn it on and off

        if (this.image === undefined) return;
        cc.save();
        cc.translate(x, y)

        //temp
        // cc.filter = "invert(100%)"
        // cc.filter = "brightness(0%)"
        //temp end

        if (angle !== 0)
            cc.rotate(angle)
        if (!(xScale === 1 && yScale === 1))
            cc.scale(xScale, yScale)
        cc.drawImage(
            this.image,

            this.curFrame * this.spritewidth - 1,
            0,

            this.spritewidth,
            this.sheetheight,

            -width * this.originFactor.width, // Offseting it to have origin in the center
            -height * this.originFactor.height,

            width,
            height
        );

        cc.restore();
    }


    // Handle Animation
    curFrame = 0;
    animTimer;
    alreadyAnimating = false;
    engaged = false;

    // use this before assigning to character;
    engage() {
        this.engaged = true;
        this.resetFrame();
    }
    disengage() {
        this.engaged = false;
        this.resetFrame();
    }

    newFrame = () => {
        if (this.engaged)
            if ((this.curFrame + 1) >= this.cols)
                return "done"
            else
                ++this.curFrame
    }
    resetFrame = (() => {
        this.curFrame = 0;
    }).bind(this)

    startAnim(framerate = frameRateMs) {
        if (this.engaged && !this.alreadyAnimating) {
            this.animTimer = setInterval(() => {
                if (this.newFrame() === "done")
                    this.resetFrame();
            }, framerate);
            this.alreadyAnimating = true;
        }
    }
    stopAnim() {
        clearInterval(this.animTimer)
        this.animTimer = undefined;
        this.resetFrame();
        this.alreadyAnimating = false;
    }

    startAnimOneShot(framerate = frameRateMs, cb = undefined) {
        if (this.engaged && !this.alreadyAnimating) {
            this.alreadyAnimating = true;
            let oneShotAnimTimer = setInterval(() => {
                if (this.newFrame() === "done") {
                    window.clearInterval(oneShotAnimTimer);
                    this.alreadyAnimating = false;
                    if (cb) cb();
                }
            }, framerate);
        }
    }


    getSpriteWidth() {
        return this.image.width / this.cols;
    }
    getSpriteHeight() {
        return this.image.height;
    }
}

export class CompositeSpritesheet {
    sprites = [];
    constructor(...sprites) {
        this.sprites.push(...sprites)
    }
    draw() {
        this.sprites.forEach(s => (s.draw.apply(s, arguments)))
    }
}