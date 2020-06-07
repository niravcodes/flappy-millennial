import Character from "./character.js"

export default class Camera {
    elements = [];
    offsetX = 0;
    offsetY = 0;
    frameWidth;
    frameHeight;
    follow = Character;
    followSpeed;
    followDirection = "xy";
    cameraMotion = undefined;
    x;
    y;


    constructor(w, h, x = 0, y = 0, follow = undefined, cameraMotion = undefined, followSpeed = 0) {
        this.frameWidth = w;
        this.frameHeight = h;
        this.follow = follow;

        this.x = x;
        this.y = y;
        this.cameraMotion = cameraMotion;
        this.followSpeed = followSpeed

        this.init = function () {
            this.x = x;
            this.y = y;
        }
    }
    dismantle() {
        this.elements = []
    }

    registerChar(el) {
        this.elements.push(el)
        return this.elements.length - 1;
    }
    unregisterChar(index) {
        delete this.elements[index]
    }
    withinBounds(m) {
        return true; //take widths and heights into account
        if (m.x >= 0 && m.y >= 0)
            if (m.x <= this.frameWidth && m.y <= this.frameHeight)
                return true;
        return false;
    }
    renderFrame() {
        if (this.cameraMotion)
            this.cameraMotion();

        if (this.follow) {
            if (this.followDirection === "x" || this.followDirection === "xy")
                if ((this.follow.motion.x - this.x) > 2 * this.frameWidth / 3) {
                    if (this.followSpeed > 0)
                        this.x += this.followSpeed;
                    else
                        this.x += this.follow.motion.vx;

                }
                else if ((this.follow.motion.x - this.x) < this.frameWidth / 3) {
                    if (this.followSpeed > 0)
                        this.x -= this.followSpeed;
                    else this.x += this.follow.motion.vx;
                }


            if (this.followDirection === "y" || this.followDirection === "xy")
                if ((this.follow.motion.y - this.y) > (2 / 3) * this.frameHeight) {
                    if (this.followSpeed > 0)
                        this.y += this.followSpeed;
                    else this.y += this.follow.motion.vy;
                }
                else if (this.follow.motion.y - this.y < this.frameHeight / 3) {
                    if (this.followSpeed > 0)
                        this.y -= this.followSpeed;
                    else this.y += this.follow.motion.vy;
                }
        }

        this.backgrounds.forEach((bg) => {
            // bg.sprite.draw(this.frameWidth / 2, 300, this.frameWidth, this.frameHeight)
            bg.draw(this.x, this.y)
        })

        this.elements.forEach(el => {
            if (this.withinBounds(el.motion)) {
                if (el === this.follow) {
                    el.draw(-this.x, -this.y)
                    if (DEBUGMODE) {
                        if (el.hasDebugAnnotations())
                            el.debugDrawAnnotations(-this.x, -this.y);
                        el.debugDrawCollider(-this.x, -this.y);
                    }
                } else {
                    el.draw(-this.x, -this.y);
                    if (DEBUGMODE) {
                        if (el.hasDebugAnnotations && el.hasDebugAnnotations())
                            el.debugDrawAnnotations(-this.x, -this.y);
                        if (el.debugDrawCollider)
                            el.debugDrawCollider(-this.x, -this.y);
                    }
                }

            }
        });

        this.foregrounds.forEach((fg) => {
            // bg.sprite.draw(this.frameWidth / 2, 300, this.frameWidth, this.frameHeight)
            fg.draw(this.x, this.y)
        })
    }


    backgrounds = [];
    registerBG(bg) {
        this.backgrounds.push(bg)
    }

    foregrounds = [];
    registerFG(fg) {
        this.foregrounds.push(fg)
    }
}