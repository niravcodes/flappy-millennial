export default class Event {

    //structure for subscribersKey: [{Character, [{code, cbFunction}, ...]}, ...]
    //I'll have to enforce this later, or atleast have failsafe duck typing that 
    //throws warning if unexpected things happen
    subscribersKey = [];
    keyUpQueue = [];

    subscribersMouse = [];

    arm() {
        window.addEventListener("keydown", this.keyDown)
        window.addEventListener("keyup", this.keyUp)
        window.addEventListener("mousemove", this.mouseMove)
    }
    disarm() {
        window.removeEventListener("keydown", this.keyDown)
        window.removeEventListener("keyup", this.keyUp)
        window.removeEventListener("mousemove", this.mouseMove)
    }

    codesAlreadyRegistered = [];
    keyDown = ((e) => {
        this.subscribersKey.forEach(s => {
            s.keyEvent.forEach(kE => {
                if (kE.code == e.code) {
                    e.preventDefault();

                    let keyUpFunction = kE.cb.bind(s.character)();
                    if (keyUpFunction !== undefined) {
                        if (this.codesAlreadyRegistered.find(x => x === kE.code) === undefined) {
                            this.keyUpQueue.push({
                                code: kE.code,
                                cb: keyUpFunction,
                                character: s.character
                            })
                            this.codesAlreadyRegistered.push(kE.code)
                        }
                    }
                }
            })
        })
    }).bind(this)

    keyUp = ((e) => {
        this.keyUpQueue.forEach((i, index, obj) => {
            if (e.code === i.code && i.cb !== undefined) {
                i.cb.bind(i.character)(e)
                obj.splice(index, 1)
                this.codesAlreadyRegistered = this.codesAlreadyRegistered.filter(x => x !== e.code)
            }
        })
    }).bind(this)

    mouseMove = ((e) => {
        this.subscribersMouse
            .filter(i => i.event == "move")
            .forEach(i => i.fn.bind(i.character)(e))
    }).bind(this)

    subscribe(character, keyEvent = []) {
        this.subscribersKey.push({
            character,
            keyEvent
        })
    }
    subscribeMouse(character, fn, event = "move") {
        if (event === "move") {
            this.subscribersMouse.push({
                character,
                fn,
                event
            })
        }
    }
}

class Keyboard extends Event {

}

class Mouse extends Event {

}