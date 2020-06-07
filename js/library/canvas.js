let canvas = document.getElementById("game");

let cc = canvas.getContext('2d');
cc.imageSmoothingEnabled = false
export {
    canvas,
    cc
};
export let cw = canvas.clientWidth;
export let ch = canvas.clientHeight;
export function clearCanvas(color = "#000") {
    cc.save();
    cc.fillStyle = color;
    cc.fillRect(0, 0, cw, ch)
    cc.restore();
}