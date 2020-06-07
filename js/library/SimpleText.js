import {
    cc
} from "./canvas.js"

export default class SimpleText {
    text = "";
    font = "";
    color = "";
    property = "";
    size;
    maxWidth = 500

    constructor(text, font, color, property = "", size) {
        this.text = text;
        this.font = font;
        if (color)
            this.color = color;
        this.property = property;
        this.size = size
    }

    draw = (x, y, angle = 0, xdirection = 1, ydirection = 1, size = undefined, maxWidth) => {
        maxWidth = maxWidth ?? this.maxWidth;

        if (size === undefined) {
            if (this.size === undefined)
                size = 20
            else size = this.size
        }
        cc.save();
        cc.translate(x, y)
        if (angle !== 0)
            cc.rotate(angle)
        if (!(xdirection === 1 || ydirection === 1))
            cc.scale(xdirection, ydirection)
        cc.font = this.property + " " + size + "px " + this.font;
        cc.fillStyle = this.color;
        cc.fillText(this.text, -cc.measureText(this.text).width / 2, 0, maxWidth)
        cc.restore();
    }
}