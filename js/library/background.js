import {
    cc,
    cw,
    ch
} from "./canvas.js"
class Background {
    images = [];
    bgStack = [];
    parallaxFactor = 0.2;
    scale = 1;

    //debug
    debugmode = false;

    nImgsLoaded = 0;
    allImgsLoaded = false;

    constructor(locations, x, y, motionFunc, parallaxFactor) {
        if (locations === undefined) return;
        locations.forEach(location => {
            let image = new Image();
            image.src = location;
            image.onload = () => {
                this.nImgsLoaded += 1;
                if (this.nImgsLoaded === this.images.length) this.allImgsLoaded = true;
            }
            this.images.push(image)
        })
        this.x = x === undefined ? 0 : x
        this.y = y === undefined ? 0 : y
        this.motionFunc = motionFunc === undefined ? undefined : motionFunc;
        if (parallaxFactor !== undefined) this.parallaxFactor = parallaxFactor;
    }

    populateBgStack() {
        let index = 0;
        if (this.allImgsLoaded) {
            for (let wCovered = 0; wCovered <= cw;) {
                let img = this.images[index++ % this.images.length];
                this.bgStack.push({
                    img,
                    x: wCovered,
                    y: "whatever"
                })
                wCovered += img.width * this.scale;
            }
        }
    }
    setScale(scale = 1) {
        this.scale = scale;
        this.populateBgStack();
    }

    indexRight = 0;
    indexLeft = 0;
    nextIndex(side) {
        if (side === undefined) {
            return 0;
        } else if (side === "left") {
            if (this.indexLeft < 0) this.indexLeft = 0;
            return this.indexLeft++ % this.images.length;
        } else if (side === "right") {
            if (this.indexRight < 0) this.indexRight = 0;
            return this.indexRight++ % this.images.length;
        }
    }
    decIndex(side) {
        if (side === undefined) {
            return 0;
        } else if (side === "left") {
            this.indexLeft -= 1;
            if (this.indexLeft < 0) this.indexLeft = 0;
        } else if (side === "right") {
            this.indexRight -= 1;
            if (this.indexRight < 0) this.indexRight = 0;
        }
    }
    draw(offX, offY, scale = 2) {
        if (this.motionFunc !== undefined)
            [offX, offY] = this.motionFunc();

        if (scale !== this.scale)
            this.setScale(scale)
        if (this.bgStack.length === 0) this.populateBgStack();
        offX *= this.parallaxFactor;
        offY *= this.parallaxFactor;

        let bg = this.bgStack[this.bgStack.length - 1]
        let imgWidth = bg.img.width * scale
        if (bg.x + imgWidth < offX + cw) {
            this.bgStack.push({
                img: this.images[this.nextIndex("right")],
                x: bg.x + imgWidth,
                y: "whatever"
            })
        } else if (bg.x > offX + cw) {
            this.decIndex("right")
            this.bgStack.pop();
        }

        bg = this.bgStack[0]
        imgWidth = bg.img.width * scale
        if (offX > bg.x + imgWidth) {
            this.decIndex("left")
            this.bgStack.shift()
        } else if (bg.x > offX) {
            this.bgStack.unshift({
                img: this.images[this.nextIndex("left")],
                x: bg.x - imgWidth,
                y: "dontcare"
            })
        }

        let wCovered = 0;
        this.bgStack.forEach(bg => {
            let img = bg.img;
            if (img === undefined) return;

            cc.save();
            cc.translate(bg.x - offX - this.x, ch - img.height * scale - this.y)
            cc.scale(scale, scale)
            cc.drawImage(img, 0, 0, img.width, img.height)
            cc.restore();

            wCovered += img.width;
        })
    }

}
export default Background;