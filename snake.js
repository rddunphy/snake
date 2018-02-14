
// Canvas DOM object and drawing context
var canvas, ctx;
// Grid size - size of a square in pixels
var gs = 20;
// Grid count - number of squares in the grid
var gc;
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
var score = highscore = 0;
// Direction changed in this frame, and whether game is paused
var dirChanged = paused = false;
// Timer used by incrementGame()
var timer;
// Object used to store settings
var settings = {};

window.onload = function() {
    canvas = document.getElementById("snake_canvas");
    ctx = canvas.getContext("2d");
    // Grid count - should be 21 for canvas size 420.
    gc = Math.floor(Math.max(canvas.width, canvas.height) / gs);
    document.addEventListener("keydown", handleKeypress);
    document.getElementById("settings_btn").onclick = loadSettingsAndStart;
    loadSettingsAndStart();
}

function start() {
    clearTimeout(timer);
    snakeLength = 4;
    if (score > highscore) {
        highscore = score;
    }
    score = 0;
    // Position of head of snake - initially centre of grid.
    x = y = Math.floor(gc / 2);
    snake = [[x, y], [x, y + 1], [x, y + 2], [x, y + 3]];
    // Velocity
    vx = vy = 0;
    // Direction = up
    dir = 1;
    // Reset frame rate
    fr = settings.startFr;
    generateFruit();
    storedKeypress = null;
    incrementGame();
}

function loadSettingsAndStart() {
    // Load wrap setting
    settings.wrap = document.getElementById("wrap_cb").checked;
    // Load starting frame rate
    var frInput = document.getElementById("fr_input").value;
    if (isNaN(frInput) || !frInput || frInput < 5 || frInput > 50) {
        frInput = document.getElementById("fr_input").value = 12;
    }
    settings.startFr = frInput;
    // Load acceleration
    var accInput = document.getElementById("acc_input").value;
    if (isNaN(accInput) || !accInput || accInput < 0 || accInput > 100) {
        accInput = document.getElementById("acc_input").value = 25;
    }
    settings.acceleration = 1 + accInput / 1000;
    start();
}

function incrementGame() {
    if (paused) {
        // Game paused, so do nothing for now.
        return;
    }
    var newX = (x + vx + gc) % gc;
    var newY = (y + vy + gc) % gc;
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
        fr *= settings.acceleration;
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
    fx = Math.floor(Math.random() * gc);
    fy = Math.floor(Math.random() * gc);
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
    ctx.fillStyle = "red";
    ctx.fill()
}

function drawSnake() {
    ctx.fillStyle = "green";
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
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // The rest
    drawFruit();
    drawSnake();
}

function toggleSettings() {
    var inst = document.getElementById("instruction_div");
    var set = document.getElementById("settings_div");
    if (inst.style.display != "none") {
        inst.style.display = "none";
        set.style.display = "block";
    } else {
        inst.style.display = "block";
        set.style.display = "none";
    }
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

function handleKeypress(e) {
    if (e.keyCode == 80) { // P for Pause
        togglePaused();
    } else if (e.keyCode == 83) { // S for Settings
        toggleSettings();
    } else if (!paused) {
        if (dirChanged) {
            // Only change direction once per frame.
            storedKeypress = e;
        } else {
            switch(e.keyCode) {
                case 37: // Left
                    if (dir != 2) {
                        vx = -1;
                        vy = 0;
                        dir = 0;
                    }
                    break;
                case 38: // Up
                    if (dir != 3) {
                        vy = -1;
                        vx = 0;
                        dir = 1;
                    }
                    break;
                case 39: // Right
                    if (dir != 0) {
                        vx = 1;
                        vy = 0;
                        dir = 2;
                    }
                    break;
                case 40: // Down
                    if (dir != 1) {
                        vy = 1;
                        vx = 0;
                        dir = 3;
                    }
                    break;
            }
            dirChanged = true;
        }
    }
}
