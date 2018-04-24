
// Grid size - width and height of a cell in pixels
const gs = 20;

var game;

function drawElement(ctx, elementFn, orientation, coords, settings) {
    var angle = orientation ? Dir.properties[orientation].angle : 0;
    var rp = new Cell((coords.x + 0.5) * gs, (coords.y + 0.5) * gs);
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
