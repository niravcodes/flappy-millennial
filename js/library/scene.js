import Camera from "./camera.js"

export default class Scene {
    characters = [];
    cam = Camera;
    keyboard;

    constructor(cam) {
        this.cam = cam;
    }
    initialize() {
        if (this.startingCondition) this.startingCondition.bind(this)()
        this.cam.init();
        this.characters.forEach(ch => {
            ch.init();
        })
        if (this.keyboard !== undefined)
            this.keyboard.arm();
    }
    dismantle() {
        if (this.keyboard !== undefined)
            this.keyboard.disarm();
        this.characters.forEach(ch => {
            this.cam.dismantle();
            ch.dismantle();
        })
        this.characters = []
    }
    nextStep() {
        this.characters.forEach(ch => {
            ch.nextStep();
        })
        this.cam.renderFrame();
    }


    sceneIndexToCamIndex = []
    register(ch) {
        ch.init();
        this.characters.push(ch);
        let index = this.characters.length - 1;
        let camIndex = this.cam.registerChar(ch);
        this.sceneIndexToCamIndex[index] = camIndex;
        return index;
    }
    unregister(index) {
        delete this.characters[index];
        this.cam.unregisterChar(this.sceneIndexToCamIndex[index])
    }


    hasCharacter(ch) {
        if (ch.find(c => c === ch)) return true;
        return false;
    }


    backgrounds = [];
    foregrounds = [];

    registerBG(bg) {
        this.cam.registerBG(bg)
    }
    registerFG(fg) {
        this.cam.registerFG(fg)
    }
};