
// Canvas DOM object and drawing context
var canvas, ctx;
// Grid size - size of a square in pixels
var gs = 20;
// Frame rate in Hz
var fr;
// Coordinates of head of snake
var x, y;
// Velocity of snake
var vx, vy;
// Direction of snake - left=0, up=1, right=2, down=3
var dir;
// Coordinates of fruit
var fx, fy;
// Array of snake coordinates and length of snake
var snake, snakeLength;
// Last keypress event from previous frame
var storedKeypress;
// Scores
var score, highscore;
// Direction changed in this frame, and whether game is paused
var dirChanged = paused = running = false;
var gameView = true;
// Timer used by incrementGame()
var timer;
// Object used to store settings
var settings = {};
// Defaults
var defaultSettings = {
    wrap: true,
    startFr: 10,
    acceleration: 25,
    ww: 21,
    wh: 21,
    worldColour: "#C2DEA6",
    snakeColour: "#276A25",
    fruitColour: "#ff0000",
    keyL: 37,
    keyStrL: "ArrowLeft",
    keyU: 38,
    keyStrU: "ArrowUp",
    keyR: 39,
    keyStrR: "ArrowRight",
    keyD: 40,
    keyStrD: "ArrowDown",
    keyP: 80,
    keyStrP: "p"
};
newKeyBindings = {};
keyToBind = "";

window.onload = function() {
    canvas = document.getElementById("snake_canvas");
    ctx = canvas.getContext("2d");
    // Grid count - should be 21 for canvas size 420.
    document.addEventListener("keydown", handleKeypress);
    document.getElementById("apply_settings_btn").onclick = loadSettingsAndStart;
    document.getElementById("cancel_settings_btn").onclick = toggleSettingsView;
    document.getElementById("reset_btn").onclick = reset;
    document.getElementById("settings_btn").onclick = toggleSettingsView;
    document.getElementById("key_left").onclick = function() {bindKey("left");};
    document.getElementById("key_right").onclick = function() {bindKey("right");};
    document.getElementById("key_up").onclick = function() {bindKey("up");};
    document.getElementById("key_down").onclick = function() {bindKey("down");};
    document.getElementById("key_pause").onclick = function() {bindKey("pause");};
    reset();
}

function start() {
    canvas.width = settings.ww * gs;
    canvas.height = settings.wh * gs;
    clearTimeout(timer);
    snakeLength = 4;
    if (score > highscore) {
        highscore = score;
    }
    score = 0;
    // Position of head of snake - initially centre of grid.
    x = Math.floor(settings.ww / 2);
    y = Math.floor(settings.wh / 2);
    snake = [[x, y], [x, y + 1], [x, y + 2], [x, y + 3]];
    // Velocity
    vx = vy = 0;
    running = false;
    // Direction = up
    dir = 1;
    // Reset frame rate
    fr = settings.startFr;
    generateFruit();
    storedKeypress = null;
    incrementGame();
}

function reset() {
    if (!gameView) {
        toggleSettingsView();
    }
    if (paused) {
        togglePaused();
    }
    settings = Object.assign({}, defaultSettings);
    score = highscore = 0;
    start();
}

function loadSettingsAndStart() {
    // Load wrap setting
    settings.wrap = document.getElementById("wrap_cb").checked;
    // Load world width
    var wwInput = parseInt(document.getElementById("ww_input").value);
    if (isNaN(wwInput) || !wwInput || wwInput < 7 || wwInput > 41) {
        wwInput = document.getElementById("ww_input").value = defaultSettings.ww;
    }
    settings.ww = wwInput;
    // Load world height
    var whInput = parseInt(document.getElementById("wh_input").value);
    if (isNaN(whInput) || !whInput || whInput < 7 || whInput > 41) {
        whInput = document.getElementById("wh_input").value = defaultSettings.wh;
    }
    settings.wh = whInput;
    // Load starting frame rate
    var frInput = parseInt(document.getElementById("fr_input").value);
    if (isNaN(frInput) || !frInput || frInput < 5 || frInput > 50) {
        frInput = document.getElementById("fr_input").value = defaultSettings.startFr;
    }
    settings.startFr = frInput;
    // Load acceleration
    var accInput = parseInt(document.getElementById("acc_input").value);
    if (isNaN(accInput) || !accInput || accInput < 0 || accInput > 100) {
        accInput = document.getElementById("acc_input").value = defaultSettings.acceleration;
    }
    settings.acceleration = accInput;
    // Load colour scheme
    settings.worldColour = document.getElementById("wc_input").value;
    settings.snakeColour = document.getElementById("sc_input").value;
    settings.fruitColour = document.getElementById("fc_input").value;
    // Load key bindings
    Object.assign(settings, newKeyBindings);
    newKeyBindings = {};
    if (!gameView) {
        toggleSettingsView();
    }
    if (paused) {
        togglePaused();
    }
    start();
}

function incrementGame() {
    if (paused) {
        // Game paused, so do nothing for now.
        return;
    }
    var newX = (x + vx + settings.ww) % settings.ww;
    var newY = (y + vy + settings.wh) % settings.wh;
    if (isDead(newX, newY)) {
        // If dead, pause graphics for a moment and then restart.
        draw();
        timer = window.setTimeout(start, 1500);
        return;
    }
    x = newX;
    y = newY;
    if (vx != 0 || vy != 0) {
        // Move head forward
        snake.unshift([x, y]);
    }
    if (x == fx && y == fy) {
        // You ate the fruit.
        generateFruit();
        snakeLength++;
        score++;
        fr *= 1 + settings.acceleration / 1000;
    }
    // Chop off tail
    snake = snake.slice(0, snakeLength);
    // Handle leftover keypresses from previous iteration
    dirChanged = false;
    if (storedKeypress != null) {
        handleKeypress(storedKeypress);
        storedKeypress = null;
    }
    // Redraw the board.
    draw();
    timer = window.setTimeout(incrementGame, 1000 / fr);
}

function isDead(newX, newY) {
    if (!settings.wrap) {
        if (Math.abs(newX - snake[0][0]) > 1 || Math.abs(newY - snake[0][1]) > 1) {
            // You hit the wall.
            return true;
        }
    }
    for (var i = 1; i < snake.length; i++) {
        if (newX == snake[i][0] && newY == snake[i][1]) {
            // You ate yourself.
            return true;
        }
    }
    return false;
}

function generateFruit() {
    fx = Math.floor(Math.random() * settings.ww);
    fy = Math.floor(Math.random() * settings.wh);
    for (var i = 0; i < snake.length; i++) {
        // Don't generate fruit on top of snake.
        if (snake[i][0] == fx && snake[i][1] == fy) {
            generateFruit();
            return;
        }
    }
}

function drawFruit() {
    ctx.beginPath();
    ctx.arc((fx + 0.5) * gs, (fy + 0.5) * gs, 10, 0, 2 * Math.PI, false);
    ctx.fillStyle = settings.fruitColour;
    ctx.fill()
}

function drawSnake() {
    ctx.fillStyle = settings.snakeColour;
    // Head
    ctx.beginPath();
    ctx.arc((x + 0.5) * gs, (y + 0.5) * gs, 9, (dir+1) * Math.PI / 2, (dir + 3) * Math.PI / 2, false);
    var a = (dir > 1) ? 0 : 1;
    var b = (dir == 1 || dir == 2) ? 1 : 0;
    var c = (dir > 1) ? 1 : -1;
    var d = (dir == 1 || dir == 2) ? -1 : 1;
    ctx.lineTo((x + a) * gs + c, (y + b) * gs + d);
    ctx.lineTo((x + 1 - b) * gs - d, (y + a) * gs + c);
    ctx.closePath();
    ctx.fill();
    // Body
    for (var i = 1; i < snake.length; i++) {
        // Margin from edge of grid square
        var m = 1
        // Tail
        if (i == snake.length - 2) {
            m = 3;
        } else if (i == snake.length - 1) {
            m = 5;
        }
        ctx.fillRect(snake[i][0]*gs + m, snake[i][1]*gs + m, gs - 2*m, gs - 2*m);
    }
}

function draw() {
    // Update score display
    var scoreString = "Score: " + score + " - Highscore: " + highscore;
    document.getElementById("score_div").innerHTML = scoreString;
    // Draw background
    ctx.fillStyle = settings.worldColour;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // The rest
    drawFruit();
    drawSnake();
}

function toggleSettingsView() {
    var gv = document.getElementById("game_view");
    var sv = document.getElementById("settings_view");
    if (gameView) {
        if (running && !paused) {
            togglePaused();
        }
        gv.style.display = "none";
        sv.style.display = "block";
        document.getElementById("wrap_cb").checked = settings.wrap;
        document.getElementById("fr_input").value = settings.startFr;
        document.getElementById("acc_input").value = settings.acceleration;
        document.getElementById("ww_input").value = settings.ww;
        document.getElementById("wh_input").value = settings.wh;
        document.getElementById("wc_input").value = settings.worldColour;
        document.getElementById("sc_input").value = settings.snakeColour;
        document.getElementById("fc_input").value = settings.fruitColour;
        document.getElementById("key_left").innerHTML = settings.keyStrL;
        document.getElementById("key_up").innerHTML = settings.keyStrU;
        document.getElementById("key_right").innerHTML = settings.keyStrR;
        document.getElementById("key_down").innerHTML = settings.keyStrD;
        document.getElementById("key_pause").innerHTML = settings.keyStrP;
    } else {
        gv.style.display = "block";
        sv.style.display = "none";
    }
    gameView = !gameView;
}

function togglePaused() {
    paused = !paused;
    var x = document.getElementById("paused_div");
    if (paused) {
        x.style.display = "block";
    } else {
        x.style.display = "none";
        incrementGame();
    }
}

function dirChange(e, newDir) {
    if (!paused) {
        if (dirChanged) {
            // Only change direction once per frame.
            storedKeypress = e;
        } else {
            var opp = (newDir + 2) % 4;
            if (dir != opp && dir != newDir) {
                switch (newDir) {
                    case 0: // Left
                        vx = -1;
                        vy = 0;
                        break;
                    case 1: // Up
                        vx = 0;
                        vy = -1;
                        break;
                    case 2: // Right
                        vx = 1;
                        vy = 0;
                        break;
                    case 3: // Down
                        vx = 0;
                        vy = 1;
                        break;
                }
                dir = newDir;
                dirChanged = true;
            } else if (!running) {
                // Game not yet started
                vy = -1;
            }
            running = true;
        }
    }
}

function bindKey(fn) {
    var span = document.getElementById("key_" + fn);
    span.innerHTML = "_";
    keyToBind = fn;
    document.addEventListener("keydown", bindEnteredKey);
}

function bindEnteredKey(e) {
    var key = e.key;
    var code = e.keyCode;
    if (code == 32) {
        key = "Space";
    }
    var span = document.getElementById("key_" + keyToBind);
    switch (keyToBind) {
        case "left":
            newKeyBindings.keyL = code;
            newKeyBindings.keyStrL = key;
            break;
        case "up":
            newKeyBindings.keyU = code;
            newKeyBindings.keyStrU = key;
            break;
        case "right":
            newKeyBindings.keyR = code;
            newKeyBindings.keyStrR = key;
            break;
        case "down":
            newKeyBindings.keyD = code;
            newKeyBindings.keyStrD = key;
            break;
        case "pause":
            newKeyBindings.keyP = code;
            newKeyBindings.keyStrP = key;
            break;
    }
    span.innerHTML = key;
    document.removeEventListener("keydown", bindEnteredKey);
}

function handleKeypress(e) {
    if (gameView) {
        switch (e.keyCode) {
            case settings.keyL: // Left
                dirChange(e, 0);
                break;
            case settings.keyU: // Up
                dirChange(e, 1);
                break;
            case settings.keyR: // Right
                dirChange(e, 2);
                break;
            case settings.keyD: // Down
                dirChange(e, 3);
                break;
            case settings.keyP: // P for Pause
                togglePaused();
                break;
            default:
                // Don't prevent default action if any other key.
                return;
        }
        e.preventDefault();
    }
}
