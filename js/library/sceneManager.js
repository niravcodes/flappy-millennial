export default class SceneManager {
    curScene;
    scenes = []

    constructor() {
        return true;
    }
    register(name, scene) {
        if (this.curScene === undefined) {
            this.curScene = scene;
            this.curScene.initialize();
        }
        this.scenes.push({
            name,
            scene
        })
    }
    gotoScene(name) {
        this.curScene.dismantle();
        let sc = this.scenes.find(s => s.name === name);
        if (sc === undefined) {
            console.log("No such Scene")
        } else {
            this.curScene = sc.scene;
            this.curScene.initialize();
        }
    }

    nextStep() {
        if (this.curScene)
            this.curScene.nextStep();
    }
    restart() {
        this.curScene.dismantle();
        this.curScene.initialize();
    }
}