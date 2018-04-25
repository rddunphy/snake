// Grid size - width and height of a cell in pixels
const gs = 20;

var game;
var cookieHandler;
var hammer;

window.onload = function() {
    cookieHandler = new CookieHandler();
    var canvas = document.getElementById("snake_canvas");
    game = new Game(canvas);
    document.addEventListener("keydown", (e) => game.handleKeypress(e));
    document.getElementById("apply_settings_btn").onclick = () => game.loadSettingsAndStart();
    document.getElementById("cancel_settings_btn").onclick = () => game.toggleSettingsView();
    document.getElementById("reset_btn").onclick = () => game.reset();
    document.getElementById("reset_highscore_btn").onclick = () => game.highscore = 0;
    document.getElementById("settings_btn").onclick = () => game.toggleSettingsView();
    document.getElementById("ai_btn").onclick = () => game.toggleAI();
    document.getElementById("key_left").onclick = function() {game.bindKey("left");};
    document.getElementById("key_right").onclick = function() {game.bindKey("right");};
    document.getElementById("key_up").onclick = function() {game.bindKey("up");};
    document.getElementById("key_down").onclick = function() {game.bindKey("down");};
    document.getElementById("key_pause").onclick = function() {game.bindKey("pause");};
    // Swipe gestures
    hammer = new Hammer(canvas);
    hammer.get("swipe").set({ direction: Hammer.DIRECTION_ALL });
    hammer.on("swipeleft swiperight swipeup swipedown tap", game.handleGesture);
    // Initialise game
    game.init();
};
