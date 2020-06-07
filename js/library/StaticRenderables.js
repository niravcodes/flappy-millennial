// a Renderable Image

import Spritesheet from "./spritesheet.js"
import SimpleText from "./SimpleText.js"

export class StaticImage {
    img = Spritesheet;
    x;
    y;
    height;
    width;

    constructor(location, x, y, height = undefined, width = undefined) {
        if (location === undefined) return;
        this.img = new Spritesheet(location)
        this.x = x;
        this.y = y;
        this.height = height;
        this.width = width;
    }
    draw(offX, offY) {
        this.img.draw(this.x + offX, this.y + offY, 0, 1, 1, this.width, this.height)
    }
}

export class StaticText {
    text = SimpleText;
    x;
    y;
    font;

    text = SimpleText;

    constructor(text, x, y, font, color, property = "", size) {
        this.text = new SimpleText(text, font, color, property, size);
        this.x = x;
        this.y = y;
    }

    //note: This is not needed here. Write scene methods so that 
    // these functions are only called if classes have them
    init() { }
    nextStep() { }
    dismantle() { }
    // note end

    setText(text) {
        this.text.text = text;
    }
    setProperty(property) {
        this.text.property = property
    }
    draw(offX, offY) {
        this.text.draw(this.x + offX, this.y + offY)
    }

}

export function StaticTextGeneratorGenerator(font, color, property, size) {
    return function (text, x, y) {
        return new StaticText(text, x, y, font, color, property, size)
    }
}