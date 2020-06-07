// The code is MIT Licenced, read LICENSE.md for details
// Author: Nirav (mail@nirav.com.np)
// Ideally, all these characters would be separated into their 
// own files, but at this scale that might challenge readibility.

let DEBUGMODE = window.DEBUGMODE = false;
import {
    canvas, clearCanvas, ch, cw, SceneManager, Camera, Scene,
    Character, Kinetics, Spritesheet, FreeDraw, Collider,
    Event, Background, StaticText, CompositeSpritesheet
} from "./library/index.js";
import LS from "./LOGSCORE.js";

let LOGSCORE;
if (window.location.hostname !== "nirav.com.np" && window.location.hostname !== "niravko.com")
    LOGSCORE = () => false
else LOGSCORE = LS;

// Game variables and constants
let locked = true;
let gameOver = false;
let score = 0
let highscore = localStorage.getItem("highscore") ?? 0;
let scenemanager = window.scenemanager = new SceneManager();
const pipeStartingOffset = 500;
const pipeOpening = 150;
const pipeWidth = 70;

// Load sound effects
let scoreSFX = new Audio("assets/score.mp3")
let deadSFX = new Audio("assets/dead.mp3")
scoreSFX.load();
deadSFX.load();

// Element that shows score
let scoreShow = new StaticText("Score 0", cw / 2, 70, "Economica", "#ffffff", "bold", 60)

// Dialog when player dies
let dialogGraphic = new CompositeSpritesheet(
    new FreeDraw((cc) => {
        cc.fillStyle = "#ffffff";
        cc.lineWidth = 3;
        cc.fillRect(-100, -50, 200, 100)
        cc.strokeRect(-100, -50, 200, 100)
    }),
    new StaticText("Score: 0", 0, -8, "Economica", "#000000", "bold", 25),
    new StaticText("High Score: " + highscore, 0, 25, "Economica", "#000000", "", 20)
)
let dialog = new Character(
    new Kinetics(undefined, cw / 2, ch / 2, 0, 0),
    undefined,
    dialogGraphic,
    0, 0,
    function () { this.hide() }
)

// Ground collider to restart game
let ground = new Character(
    new Kinetics(undefined, 0, ch - 10),
    new Collider("ground", undefined, 200, 10, -60, 0),
)

// Obstacles for flappy 
let pipeTop, pipeBottom, pipe2Top, pipe2Bottom, resetWord
{

    let getWord; {
        // Simple obsfucation in case someone (like you) views source
        // to read all words without playing the game.
        let wC = 0;
        let words = ["ZXhhbXM", "bGF1bmRyeQ", "", "bG92ZQ", "YWRkaWN0aW9ucw", "ZGVwcmVzc2lvbg", "am9ibGVzcw", "bmV3cw", "cGFuZGVtaWM", "cmVjZXNzaW9u", "ZnV0dXJl", "Y2xpbWF0ZQ", "", "Z3VuZHJ1aw", "bHVzdA", "bG9uZWxpbmVzcw", "bG9uZ2luZw", "", "cG9saXRpY3M", "b2JzZXNzaW9ucw", "bWVkaWE"]
        words = words.map(i => window[(+{} + [])[+!![]] + (!![] + [])[+[]] + ([] + {})[+!![]] + ([] + {})[!+[] + !![]]](i))
        getWord = () => words[wC++ % words.length]
        resetWord = (n) => (wC = n ?? 0)
    }

    let [wood, board] = ["log.png", "board.png"].map(f => new Spritesheet(`assets/${f}`, 1, { width: 0, height: 0 }))
    let [boardText1, boardText2] = [0, 0].map(() => new StaticText(getWord(), 46, 472, "Economica", "#000000", "bold", 17))
    let [comp1, comp2] = [boardText1, boardText2].map(text => new CompositeSpritesheet(board, text))

    function movePipeMaker(outOfScreen) {
        return function () {
            if (!locked) {
                this.x -= 4;
                if (this.x < -pipeWidth) {
                    if (outOfScreen !== undefined)
                        outOfScreen();
                    this.x = cw
                }
            }
        }
    }

    function pipeMaker(top = true, offset = 0, outOfScreen, order = 1) {
        let y = top ? 0 : ch - 100;
        let drawFn = top ? comp1 : wood;
        drawFn = order === 2 && top ? comp2 : drawFn;

        return new Character(
            new Kinetics(movePipeMaker(outOfScreen), cw + offset + pipeStartingOffset, y),
            new Collider("pipe", undefined, pipeWidth, 600, 0, 0),
            drawFn,
            pipeWidth + (top ? 20 : 0), (pipeWidth) * (top ? 7 : 4),
            outOfScreen
        )
    }

    pipeTop = pipeMaker(true, 0, pto, 1);
    pipeBottom = pipeMaker(false, 0, pbo, 1);
    pipe2Top = pipeMaker(true, (cw + pipeWidth) / 2, p2to, 2);
    pipe2Bottom = pipeMaker(false, (cw + pipeWidth) / 2, p2bo, 2);

    [pipeBottom, pipe2Bottom]
        .forEach(pipe => pipe.registerCollider(new Collider("score", undefined, 1, pipeOpening, -pipeWidth, pipeOpening)))

    let pipeTopY = 0;
    let pipe2TopY = 0;
    pipeTop.spriteOffset.x = -10;
    pipe2Top.spriteOffset.x = -10;
    function pto() {
        pipeTopY = pipeTop.colliders[0].height = Math.random() * 300 + 150;
        pipeTop.spriteOffset.y = pipeTopY - pipeTop.height;
        boardText1.setText(getWord())
    }
    function pbo() {
        pipeBottom.motion.y = pipeTopY + pipeOpening;
    }
    function p2to() {
        pipe2TopY = pipe2Top.colliders[0].height = Math.random() * 300 + 150;
        pipe2Top.spriteOffset.y = pipe2TopY - pipe2Top.height;
        boardText2.setText(getWord())
    }
    function p2bo() {
        pipe2Bottom.motion.y = pipe2TopY + pipeOpening;
    }
}

// Main Character
let flappy, setScore;
{
    flappy = new Character(
        new Kinetics(flappyGravity, 140, ch / 2 - 20),
        new Collider("flappy", undefined, 60, 30, 30, 0),
        new Spritesheet("assets/FlappyMilennialFly.png", 7),
        40 * 3, 22 * 3,
        function () {
            this.runAnimation('base', true);
        }
    )

    let vy = 0, ay = 0.46;
    function flappyGravity() {
        if (!locked || gameOver) this.y += vy += ay;
    }

    let jumping = false;
    flappy.jump = function () {
        if (dialog.hidden && gameOver)
            return;
        else if (!dialog.hidden)
            scenemanager.restart();

        if (locked) {
            locked = false;
            this.stopAnimation()
        }
        if (!jumping) {
            this.runAnimation('base', false, 70)
            jumping = true;
            vy = -8;
            this.motion.angle = -Math.PI / 12
            window.setTimeout(() => (jumping = false), 120)
            window.setTimeout(() => { this.motion.angle = 0 }, 200)
        }
    }


    function die() { //gets called multiple times on collision
        locked = true;
        gameOver = true;
        if (flappy.motion.angle < Math.PI / 4)
            flappy.motion.angle += 0.1;
    }
    flappy.collideActions['ground'] = function () {
        die();
        deadSFX.play();
        flappy.motion.angle = Math.PI / 4;
        flappy.paused = true;
        dialog.unhide();
        LOGSCORE(score, highscore);
    }
    flappy.collideActions['pipe'] = die;

    let scoring = false;
    flappy.collideActions['score'] = function () {
        if (!scoring) {
            scoring = true;
            setScore(++score)
            scoreSFX.play();
        }
    }
    flappy.collideActions['NO_COLLISIONS'] = function () {
        if (scoring)
            scoring = false;
    };

    [ground.colliders[0], pipeBottom.colliders[1], pipe2Bottom.colliders[1], pipeTop.colliders[0], pipe2Top.colliders[0], pipeBottom.colliders[0], pipe2Bottom.colliders[0]
    ].forEach(col => (flappy.registerCollisionWith(col)))

    setScore = function (s) {
        score = s;
        scoreShow.setText(s)
        dialogGraphic.sprites[1].setText("Score: " + s)

        highscore = localStorage.getItem("highscore") ?? 0;
        if (score > highscore) {
            localStorage.setItem("highscore", highscore = score)
            dialogGraphic.sprites[2].setText("High Score: " + highscore)
        }
    }

    // Keyboard and Touch Events
    let E = new Event();
    E.subscribe(flappy, [{ code: "Space", cb: flappy.jump }])
    flappy.registerEvent(E)
    canvas.addEventListener("touchstart", e => flappy.jump()) // TODO: touch events need to be in the library
}

// Set up the game
window.onload = () => gameLoop();
function gameLoop() {
    clearCanvas()
    level.nextStep();
    requestAnimationFrame(gameLoop)
}

// Set up the main scene
let camera = new Camera(cw, ch, 0, 0)
let level = new Scene(camera)
scenemanager.register("level", level)

// Set level's starting conditions 
level.startingCondition = function () {
    locked = true;
    gameOver = false;
    flappy.motion.angle = 0;
    setScore(0)
    resetWord();

    // register characters to level, order of registration = z-index
    [ground, pipeTop, pipeBottom, pipe2Top, pipe2Bottom, scoreShow, flappy, dialog]
        .forEach(c => level.register(c));
}

// Set up Backgrounds
{
    let bgX = 0;
    let moveBg = () => !gameOver ? [++bgX, 0] : [bgX, 0]
    let bgStack = [
        new Background(["assets/grassy/layers_fullcolor/sky_fc.png"], 0, 200, undefined, 0),
        new Background(["assets/grassy/layers_fullcolor/far_mountains_fc.png"], 0, 0, moveBg, 0.05),
        new Background(["assets/grassy/layers_fullcolor/grassy_mountains_fc.png"], 0, 0, moveBg, 0.2),
        new Background(["assets/grassy/layers_fullcolor/clouds_mid_fc.png"], 0, 0, moveBg, 0.3),
        new Background(["assets/grassy/layers_fullcolor/hill.png"], 50, 0, moveBg, 0.5),
    ]
    bgStack.forEach(bg => level.registerBG(bg))
    level.registerFG(new Background(["assets/grassy/layers_fullcolor/clouds_front_t_fc.png"], 0, 0, moveBg, 1.3))
}

level.startingCondition(); // Finally, start the level