


var game;
// Grid size - size of a square in pixels
const gs = 20;
// Frame rate in Hz
var fr;
// Coordinates of head of snake
// Direction of snake - left=0, up=1, right=2, down=3
var dir;
// Coordinates of fruit
var fx, fy;
// Last keypress event from previous frame
var storedKeypress;
// Scores
var score, highscore;
// Direction changed in this frame, and whether game is paused
var dirChanged = paused = running = startQueued = false;
var gameView = true;
// Timer used by increment()
var timer;
// Object used to store settings
var settings = {};
// Defaults
var defaultSettings = {
    wrap: true,
    startFr: 12,
    acceleration: 15,
    ww: 21,
    wh: 21,
    worldColour: "#C2DEA6",
    snakeColour: "#276A25",
    patternColour: "#63361F",
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


function Point(px, py) {
    this.x = px;
    this.y = py;
    this.equals = function(p) {
        return this.x == p.x && this.y == p.y;
    };
}


var Game = (function() {
    var Constructor = function(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
    };

    Constructor.prototype = {

        reset: function() {
            if (!gameView) {
                toggleSettingsView();
            }
            if (paused) {
                togglePaused();
            }
            settings = Object.assign({}, defaultSettings);
            score = highscore = 0;
            this.start();
        },

        loadSettingsAndStart: function() {
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
            settings.patternColour = document.getElementById("pc_input").value;
            settings.fruitColour = document.getElementById("fc_input").value;
            // Load key bindings
            Object.assign(settings, newKeyBindings);
            newKeyBindings = {};
            if (!gameView) {
                this.toggleSettingsView();
            }
            if (paused) {
                this.togglePaused();
            }
            this.start();
        },

        generateFruit: function() {
            fx = Math.floor(Math.random() * settings.ww);
            fy = Math.floor(Math.random() * settings.wh);
            for (var i = 0; i < this.snake.length; i++) {
                // Don't generate fruit on top of snake.
                if (this.snake.occupies(new Point(fx, fy))) {
                    this.generateFruit();
                    return;
                }
            }
        },

        draw: function() {
            // Update score display
            var scoreString = "Score: " + score + " - Highscore: " + highscore;
            document.getElementById("score_div").innerHTML = scoreString;
            // Draw background
            this.ctx.fillStyle = settings.worldColour;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            // The rest
            drawElement(this.ctx, fruit, 0, new Point(fx, fy));
            this.snake.draw(this.ctx);
        },

        increment: function() {
            if (paused) {
                // Game paused, so do nothing for now.
                return;
            }
            var newHead = this.snake.next(settings.ww, settings.wh);
            if (this.snake.isDead(newHead, settings.wrap)) {
                // If dead, pause graphics for a moment and then restart.
                this.draw();
                timer = window.setTimeout(() => this.start(), 1500);
                return;
            }
            var fruit = new Point(fx, fy);
            var gotFruit = newHead.equals(fruit);
            this.snake.move(newHead, gotFruit);
            if (gotFruit) {
                // You ate the fruit.
                this.generateFruit();
                score++;
                fr *= 1 + settings.acceleration / 1000;
            }
            // Handle leftover keypresses from previous iteration
            dirChanged = false;
            if (storedKeypress != null) {
                this.handleKeypress(storedKeypress);
                storedKeypress = null;
            }
            // Redraw the board.
            this.draw();
            timer = window.setTimeout(() => this.increment(), 1000 / fr);
        },

        toggleSettingsView: function() {
            var gv = document.getElementById("game_view");
            var sv = document.getElementById("settings_view");
            if (gameView) {
                if (running && !paused) {
                    this.togglePaused();
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
                document.getElementById("pc_input").value = settings.patternColour;
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
        },

        togglePaused: function() {
            paused = !paused;
            var x = document.getElementById("paused_div");
            if (paused) {
                x.style.display = "block";
            } else {
                x.style.display = "none";
                if (startQueued) {
                    startQueued = false;
                    this.start();
                }
                this.increment();
            }
        },

        dirChange: function(e, newDir) {
            if (!paused) {
                if (dirChanged) {
                    // Only change direction once per frame.
                    storedKeypress = e;
                } else {
                    var opp = (newDir + 2) % 4;
                    if (dir != opp && dir != newDir) {
                        switch (newDir) {
                            case 0: // Left
                                this.snake.v = new Point(-1, 0);
                                break;
                            case 1: // Up
                                this.snake.v = new Point(0, -1);
                                break;
                            case 2: // Right
                                this.snake.v = new Point(1, 0);
                                break;
                            case 3: // Down
                                this.snake.v = new Point(0, 1);
                                break;
                        }
                        dir = newDir;
                        dirChanged = true;
                    } else if (!running) {
                        // Game not yet started and up entered
                        this.snake.v = new Point(0, -1);
                    }
                    running = true;
                }
            }
        },

        bindKey: function(fn) {
            var span = document.getElementById("key_" + fn);
            span.innerHTML = "_";
            keyToBind = fn;
            document.addEventListener("keydown", bindEnteredKey);
        },

        bindEnteredKey: function(e) {
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
        },

        handleKeypress: function(e) {
            if (gameView) {
                switch (e.keyCode) {
                    case settings.keyL: // Left
                        this.dirChange(e, 0);
                        break;
                    case settings.keyU: // Up
                        this.dirChange(e, 1);
                        break;
                    case settings.keyR: // Right
                        this.dirChange(e, 2);
                        break;
                    case settings.keyD: // Down
                        this.dirChange(e, 3);
                        break;
                    case settings.keyP: // P for Pause
                        this.togglePaused();
                        break;
                    default:
                        // Don't prevent default action if any other key.
                        return;
                }
                e.preventDefault();
            }
        },

        start: function() {
            if (paused) {
                startQueued = true;
                return;
            }
            this.canvas.width = settings.ww * gs;
            this.canvas.height = settings.wh * gs;
            clearTimeout(timer);
            if (score > highscore) {
                highscore = score;
            }
            score = 0;
            // Position of head of snake - initially centre of grid.
            x = Math.floor(settings.ww / 2);
            y = Math.floor(settings.wh / 2);
            this.snake = new Snake(new Point(x, y));
            // Direction = up
            dir = 1;
            running = false;
            // Reset frame rate
            fr = settings.startFr;
            this.generateFruit();
            storedKeypress = null;
            this.increment();
        }
    };

    return Constructor;
})();

var Snake = (function() {
    var Constructor = function(head) {
        this.head = head;
        this.cells = [];
        for (var i = 0; i < 4; i++) {
            this.cells.push(new Point(head.x, head.y + i));
        }
        this.v = new Point(0, 0);
        this.length = 4;
    };

    Constructor.prototype = {
        isDead: function(newHead, wrap) {
            if (!wrap) {
                if (Math.abs(newHead.x - this.head.x) > 1 ||
                    Math.abs(newHead.y - this.head.y) > 1) {
                    // You hit the wall.
                    return true;
                }
            }
            for (var i = 1; i < this.length - 1; i++) {
                if (newHead.x == this.cells[i].x && newHead.y == this.cells[i].y) {
                    // You ate yourself.
                    return true;
                }
            }
            return false;
        },

        occupies: function(cell) {
            for (var i = 0; i < this.length; i++) {
                if (this.cells[i].equals(cell)) {
                    return true;
                }
            }
            return false;
        },

        next: function(ww, wh) {
            var newX = (this.head.x + this.v.x + ww) % ww;
            var newY = (this.head.y + this.v.y + wh) % wh;
            return new Point(newX, newY);
        },

        stationary: function() {
            return this.v.x == 0 && this.v.y == 0;
        },

        move: function(cell, gotFruit) {
            if (!this.stationary()) {
                // Move head forward
                this.head = cell;
                this.cells.unshift(cell);
                if (gotFruit) {
                    this.length++;
                }
                // Chop off tail
                this.cells = this.cells.slice(0, this.length);
            }
        },

        draw: function(ctx) {
            // Head
            var dirFront, dirBack, link;
            dirBack = getDir(this.cells[1], this.head);
            drawElement(ctx, snakeHead, dirBack, this.head);
            // Body
            for (var i = 1; i < this.length-1; i++) {
                dirFront = getDir(this.cells[i], this.cells[i-1]);
                dirBack = getDir(this.cells[i+1], this.cells[i]);
                link = snakeStraightLink;
                if (dirFront == (dirBack+3) % 4) {
                    link = snakeLeftTurnLink;
                } else if (dirFront == (dirBack+1) % 4) {
                    link = snakeRightTurnLink;
                }
                drawElement(ctx, link, dirBack, this.cells[i]);
            }
            dirFront = getDir(this.cells[this.length - 1], this.cells[this.length - 2]);
            drawElement(ctx, snakeTail, dirFront, this.cells[this.length - 1]);
        }
    };

    return Constructor;
})();



function fruit(ctx, p) {
    ctx.beginPath();
    ctx.arc((p.x + 0.5) * gs, (p.y + 0.5) * gs, 10, 0, 2 * Math.PI, false);
    ctx.fillStyle = settings.fruitColour;
    ctx.fill();
}

function snakeHead(ctx, p) {
    ctx.beginPath();
    ctx.arc((p.x + 0.5) * gs, (p.y + 0.7) * gs, 9, Math.PI, 2 * Math.PI, false);
    ctx.lineTo((p.x + 1) * gs - 1, (p.y + 1) * gs);
    ctx.lineTo(p.x * gs + 1, (p.y + 1) * gs);
    ctx.closePath();
    ctx.fillStyle = settings.snakeColour;
    ctx.fill();
    // eyes
    var eyeRad = 1;
    ctx.beginPath();
    ctx.arc((p.x + 0.3) * gs, (p.y + 0.8) * gs, eyeRad, 0, 2 * Math.PI, false);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.beginPath();
    ctx.arc((p.x + 0.7) * gs, (p.y + 0.8) * gs, eyeRad, 0, 2 * Math.PI, false);
    ctx.fill();
    // tongue
    ctx.beginPath();
    var tongueRad = 0.18*gs;
    ctx.arc((p.x+0.5)*gs - tongueRad, p.y*gs + tongueRad, tongueRad, -Math.PI/2, 0, false);
    ctx.lineTo((p.x + 0.5) * gs, (p.y + 0.3) * gs);
    ctx.arc((p.x+0.5)*gs + tongueRad, p.y*gs + tongueRad, tongueRad, Math.PI, 3*Math.PI/2, false);
    ctx.strokeStyle = "red";
    ctx.stroke();
}

function snakeStraightLink(ctx, p) {
    ctx.fillStyle = settings.snakeColour;
    ctx.fillRect(p.x*gs+1, p.y*gs, gs-2, gs);
    ctx.beginPath();
    var spotRad = 3;
    ctx.arc((p.x+0.5)*gs, (p.y+0.5)*gs, spotRad, 0, 2*Math.PI, false);
    ctx.fillStyle = settings.patternColour;
    ctx.fill();
}

function snakeLeftTurnLink(ctx, p) {
    ctx.beginPath();
    ctx.arc(p.x*gs, (p.y+1)*gs, gs-1, -Math.PI/2, 0, false);
    ctx.lineTo(p.x*gs + 1, (p.y+1)*gs);
    ctx.lineTo(p.x*gs, (p.y+1)*gs - 1);
    ctx.closePath();
    ctx.fillStyle = settings.snakeColour;
    ctx.fill();
    ctx.beginPath();
    var spotRad = 3;
    ctx.arc((p.x+0.3)*gs, (p.y+0.7)*gs, spotRad, 0, 2*Math.PI, false);
    ctx.fillStyle = settings.patternColour;
    ctx.fill();
}

function snakeRightTurnLink(ctx, p) {
    ctx.beginPath();
    ctx.arc((p.x+1)*gs, (p.y+1)*gs, gs-1, Math.PI, 3*Math.PI/2, false);
    ctx.lineTo((p.x+1)*gs, (p.y+1)*gs - 1);
    ctx.lineTo((p.x+1)*gs - 1, (p.y+1)*gs);
    ctx.closePath();
    ctx.fillStyle = settings.snakeColour;
    ctx.fill();
    ctx.beginPath();
    var spotRad = 3;
    ctx.arc((p.x+0.7)*gs, (p.y+0.7)*gs, spotRad, 0, 2*Math.PI, false);
    ctx.fillStyle = settings.patternColour;
    ctx.fill();
}

function snakeTail(ctx, p) {
    var tipRad = 3;
    ctx.beginPath();
    ctx.moveTo(p.x*gs + 1, p.y*gs);
    ctx.lineTo((p.x+1)*gs - 1, p.y*gs);
    ctx.lineTo((p.x+0.5)*gs+tipRad, (p.y+1)*gs-tipRad);
    ctx.arc((p.x+0.5)*gs, (p.y+1)*gs-tipRad, tipRad, 0, Math.PI, false);
    ctx.closePath();
    ctx.fillStyle = settings.snakeColour;
    ctx.fill();
    ctx.beginPath();
    var spotRad = 1.8;
    ctx.arc((p.x+0.5)*gs, (p.y+0.25)*gs, spotRad, 0, 2*Math.PI, false);
    ctx.fillStyle = settings.patternColour;
    ctx.fill();
}

function getDir(p1, p2) {
    // only works for adjacent points
    if (p1.x == p2.x) {
        if (p1.y == p2.y + 1 || (p1.y == 0 && p2.y == settings.wh - 1)) {
            return 1; // up
        }
        return 3; // down
    }
    if (p1.x == p2.x + 1 || (p1.x == 0 && p2.x == settings.ww -1)) {
        return 0; // left
    }
    return 2; // right
}

function drawElement(ctx, elementFn, orientation, coords) {
    var angle = (orientation - 1) * Math.PI/2;
    var rp = {x: (coords.x + 0.5) * gs, y: (coords.y + 0.5) * gs};
    ctx.translate(rp.x, rp.y);
    ctx.rotate(angle);
    ctx.translate(-rp.x, -rp.y);
    elementFn(ctx, coords);
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
    document.getElementById("key_left").onclick = function() {bindKey("left");};
    document.getElementById("key_right").onclick = function() {bindKey("right");};
    document.getElementById("key_up").onclick = function() {bindKey("up");};
    document.getElementById("key_down").onclick = function() {bindKey("down");};
    document.getElementById("key_pause").onclick = function() {bindKey("pause");};
    game.reset();
}
