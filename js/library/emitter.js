import Character from "./character.js"

class Emitter {
    motion;
    particle;
    decayTime
    constructor(motion, particle, decayTime = 1000, range = {
        min: 1,
        max: 3
    }, locationRange = {
        x: 30,
        y: 30
    }) {
        this.motion = motion;
        // later allow particle to be an array 
        // that can be randomly picked from?
        this.particle = particle;
        this.decayTime = decayTime;
        this.range = range
        this.locationRange = locationRange;
    }

    curParticles = []

    emit() {
        let range = this.range;
        let locRange = this.locationRange
        let numPart = Math.floor(Math.random() * (range.max - range.min)) + range.min;
        for (let i = 0; i < numPart; i++) {
            let xLoc = Math.floor(Math.random() * locRange.x * 2) - locRange.x
            let yLoc = Math.floor(Math.random() * locRange.y * 2) - locRange.y
            let chosenParticle = this.particle[Math.floor(this.particle.length * Math.random())]
            if (chosenParticle === undefined) {
                console.log("the random indexing is producing out of range values prolly")
                chosenParticle = this.particle[0]
            }

            let {
                motion,
                collider,
                sprite,
                width,
                height,
                init,
                afterFn
            } = chosenParticle;

            let dupMotion = motion.clone();
            dupMotion.x = this.motion.x + xLoc;
            dupMotion.y = this.motion.y + yLoc;

            let dupCollider
            if (collider !== undefined)
                dupCollider = collider.clone(dupMotion);
            let dupSprite = sprite.clone();

            let particle = new Character(
                dupMotion, dupCollider, dupSprite, width, height, init
            )

            let particleIndex = window.sceneManager.curScene.register(particle)
            if (afterFn) afterFn(particle);

            setTimeout(() => {
                window.sceneManager.curScene.unregister(particleIndex);
            }, this.decayTime)
        }
    }
    dismantle() { }
}

export default Emitter;