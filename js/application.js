
// Grid size - width and height of a square in pixels
const gs = 20;

var game;

function fruit(ctx, p, settings) {
    ctx.beginPath();
    ctx.arc((p.x + 0.5) * gs, (p.y + 0.5) * gs, 10, 0, 2 * Math.PI, false);
    ctx.fillStyle = settings.fruitColour;
    ctx.fill();
}

function drawElement(ctx, elementFn, orientation, coords, settings) {
    var angle = (orientation - 1) * Math.PI/2;
    var rp = new Point((coords.x + 0.5) * gs, (coords.y + 0.5) * gs);
    ctx.translate(rp.x, rp.y);
    ctx.rotate(angle);
    ctx.translate(-rp.x, -rp.y);
    elementFn(ctx, coords, settings);
    ctx.translate(rp.x, rp.y);
    ctx.rotate(-angle);
    ctx.translate(-rp.x, -rp.y);
}

window.onload = function() {
    var canvas = document.getElementById("snake_canvas");
    game = new Game(canvas);
    // Grid count - should be 21 for canvas size 420.
    document.addEventListener("keydown", (e) => game.handleKeypress(e));
    document.getElementById("apply_settings_btn").onclick = () => game.loadSettingsAndStart();
    document.getElementById("cancel_settings_btn").onclick = () => game.toggleSettingsView();
    document.getElementById("reset_btn").onclick = () => game.reset();
    document.getElementById("settings_btn").onclick = () => game.toggleSettingsView();
    document.getElementById("key_left").onclick = function() {game.bindKey("left");};
    document.getElementById("key_right").onclick = function() {game.bindKey("right");};
    document.getElementById("key_up").onclick = function() {game.bindKey("up");};
    document.getElementById("key_down").onclick = function() {game.bindKey("down");};
    document.getElementById("key_pause").onclick = function() {game.bindKey("pause");};
    game.reset();
}
