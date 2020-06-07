import {
    cc
} from "./canvas.js"

export default class FreeDraw {
    constructor(drawFn) {
        this.drawFn = drawFn;
    }

    draw = (x, y, angle = 0, xdirection = 1, ydirection = 1, size = undefined, maxWidth = 500) => {
        if (this.drawFn === undefined) return;
        cc.save();
        cc.translate(x, y)
        if (angle !== 0)
            cc.rotate(angle)
        if (!(xdirection === 1 || ydirection === 1))
            cc.scale(xdirection, ydirection)
        this.drawFn(cc);
        cc.restore();
    }
    clone() {
        return new FreeDraw(this.drawFn)
    }
    engage() { }
    disengage() { }
    startAnim() { }
}