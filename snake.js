
// Grid size - width and height of a square in pixels
const gs = 20;

var game;


var Point = (function() {
    var Constructor = function(px, py) {
        this.x = px;
        this.y = py;
    };

    Constructor.prototype = {
        equals: function(p) {
            return this.x == p.x && this.y == p.y;
        },

        dir: function(p, ww, wh) {
            // only works for adjacent points
            if (this.x == p.x) {
                if (this.y == p.y + 1 || (this.y == 0 && p.y == wh - 1)) {
                    return 1; // up
                }
                return 3; // down
            }
            if (this.x == p.x + 1 || (this.x == 0 && p.x == ww -1)) {
                return 0; // left
            }
            return 2; // right
        }
    };

    return Constructor;
})();


var Settings = (function() {
    var Constructor = function() {
        this.wrap = true;
        this.startFr = 12;
        this.acceleration = 15;
        this.ww = 21;
        this.wh = 21;
        this.worldColour = "#C2DEA6";
        this.snakeColour = "#276A25";
        this.patternColour = "#63361F";
        this.fruitColour = "#ff0000";
        this.keyL = 37;
        this.keyStrL = "ArrowLeft";
        this.keyU = 38;
        this.keyStrU = "ArrowUp";
        this.keyR = 39;
        this.keyStrR = "ArrowRight";
        this.keyD = 40;
        this.keyStrD = "ArrowDown";
        this.keyP = 80;
        this.keyStrP = "p";
        this.newKeyBindings = {};
    };

    Constructor.prototype = {};

    return Constructor;
})();


var Game = (function() {
    var Constructor = function(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        // Direction changed in this frame, and whether game is paused
        this.dirChanged = this.paused = this.startQueued = false;
        this.inGameView = true;
    };

    Constructor.prototype = {

        reset: function() {
            if (!this.inGameView) {
                this.toggleSettingsView();
            }
            if (this.paused) {
                this.togglePaused();
            }
            this.settings = new Settings();
            this.score = this.highscore = 0;
            this.start();
        },

        loadSettingsAndStart: function() {
            var defaultSettings = new Settings();
            // Load wrap setting
            this.settings.wrap = document.getElementById("wrap_cb").checked;
            // Load world width
            var wwInput = parseInt(document.getElementById("ww_input").value);
            if (isNaN(wwInput) || !wwInput || wwInput < 7 || wwInput > 41) {
                wwInput = document.getElementById("ww_input").value = defaultSettings.ww;
            }
            this.settings.ww = wwInput;
            // Load world height
            var whInput = parseInt(document.getElementById("wh_input").value);
            if (isNaN(whInput) || !whInput || whInput < 7 || whInput > 41) {
                whInput = document.getElementById("wh_input").value = defaultSettings.wh;
            }
            this.settings.wh = whInput;
            // Load starting frame rate
            var frInput = parseInt(document.getElementById("fr_input").value);
            if (isNaN(frInput) || !frInput || frInput < 5 || frInput > 50) {
                frInput = document.getElementById("fr_input").value = defaultSettings.startFr;
            }
            this.settings.startFr = frInput;
            // Load acceleration
            var accInput = parseInt(document.getElementById("acc_input").value);
            if (isNaN(accInput) || !accInput || accInput < 0 || accInput > 100) {
                accInput = document.getElementById("acc_input").value = defaultSettings.acceleration;
            }
            this.settings.acceleration = accInput;
            // Load colour scheme
            this.settings.worldColour = document.getElementById("wc_input").value;
            this.settings.snakeColour = document.getElementById("sc_input").value;
            this.settings.patternColour = document.getElementById("pc_input").value;
            this.settings.fruitColour = document.getElementById("fc_input").value;
            // Load key bindings
            Object.assign(this.settings, this.settings.newKeyBindings);
            this.settings.newKeyBindings = {};
            if (!this.inGameView) {
                this.toggleSettingsView();
            }
            if (this.paused) {
                this.togglePaused();
            }
            this.start();
        },

        generateFruit: function() {
            var fx = Math.floor(Math.random() * this.settings.ww);
            var fy = Math.floor(Math.random() * this.settings.wh);
            this.fruit = new Point(fx, fy);
            for (var i = 0; i < this.snake.length; i++) {
                // Don't generate fruit on top of snake.
                if (this.snake.occupies(this.fruit)) {
                    this.generateFruit();
                    return;
                }
            }
        },

        draw: function() {
            // Update score display
            var scoreString = "Score: " + this.score + " - Highscore: " + this.highscore;
            document.getElementById("score_div").innerHTML = scoreString;
            // Draw background
            this.ctx.fillStyle = this.settings.worldColour;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            // The rest
            drawElement(this.ctx, fruit, 0, this.fruit, this.settings);
            this.snake.draw(this.ctx, this.settings);
        },

        increment: function() {
            if (this.paused) {
                // Game paused, so do nothing for now.
                return;
            }
            var newHead = this.snake.next(this.settings.ww, this.settings.wh);
            if (this.snake.isDead(newHead, this.settings.wrap)) {
                // If dead, pause graphics for a moment and then restart.
                this.draw();
                this.timer = window.setTimeout(() => this.start(), 1500);
                return;
            }
            var gotFruit = newHead.equals(this.fruit);
            this.snake.move(newHead, gotFruit);
            if (gotFruit) {
                // You ate the fruit.
                this.generateFruit();
                this.score++;
                this.fr *= 1 + this.settings.acceleration / 1000;
            }
            // Handle leftover keypresses from previous iteration
            this.dirChanged = false;
            if (this.storedKeypress) {
                this.handleKeypress(this.storedKeypress);
                this.storedKeypress = null;
            }
            // Redraw the board.
            this.draw();
            this.timer = window.setTimeout(() => this.increment(), 1000 / this.fr);
        },

        toggleSettingsView: function() {
            var gv = document.getElementById("game_view");
            var sv = document.getElementById("settings_view");
            if (this.inGameView) {
                if (!this.snake.stationary() && !this.paused) {
                    this.togglePaused();
                }
                gv.style.display = "none";
                sv.style.display = "block";
                document.getElementById("wrap_cb").checked = this.settings.wrap;
                document.getElementById("fr_input").value = this.settings.startFr;
                document.getElementById("acc_input").value = this.settings.acceleration;
                document.getElementById("ww_input").value = this.settings.ww;
                document.getElementById("wh_input").value = this.settings.wh;
                document.getElementById("wc_input").value = this.settings.worldColour;
                document.getElementById("sc_input").value = this.settings.snakeColour;
                document.getElementById("pc_input").value = this.settings.patternColour;
                document.getElementById("fc_input").value = this.settings.fruitColour;
                document.getElementById("key_left").innerHTML = this.settings.keyStrL;
                document.getElementById("key_up").innerHTML = this.settings.keyStrU;
                document.getElementById("key_right").innerHTML = this.settings.keyStrR;
                document.getElementById("key_down").innerHTML = this.settings.keyStrD;
                document.getElementById("key_pause").innerHTML = this.settings.keyStrP;
            } else {
                gv.style.display = "block";
                sv.style.display = "none";
            }
            this.inGameView = !this.inGameView;
        },

        togglePaused: function() {
            this.paused = !this.paused;
            var x = document.getElementById("paused_div");
            if (this.paused) {
                x.style.display = "block";
            } else {
                x.style.display = "none";
                if (this.startQueued) {
                    this.startQueued = false;
                    this.start();
                }
                this.increment();
            }
        },

        dirChange: function(e, newDir) {
            if (!this.paused) {
                if (this.dirChanged) {
                    // Only change direction once per frame.
                    this.storedKeypress = e;
                } else {
                    this.dirChanged = this.snake.changeDir(newDir);
                }
            }
        },

        bindKey: function(fn) {
            var span = document.getElementById("key_" + fn);
            span.innerHTML = "_";
            this.keyToBind = fn;
            document.addEventListener("keydown", bindEnteredKey);
        },

        handleKeypress: function(e) {
            if (this.inGameView) {
                switch (e.keyCode) {
                    case this.settings.keyL: // Left
                        this.dirChange(e, 0);
                        break;
                    case this.settings.keyU: // Up
                        this.dirChange(e, 1);
                        break;
                    case this.settings.keyR: // Right
                        this.dirChange(e, 2);
                        break;
                    case this.settings.keyD: // Down
                        this.dirChange(e, 3);
                        break;
                    case this.settings.keyP: // P for Pause
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
            if (this.paused) {
                this.startQueued = true;
                return;
            }
            this.canvas.width = this.settings.ww * gs;
            this.canvas.height = this.settings.wh * gs;
            clearTimeout(this.timer);
            if (this.score > this.highscore) {
                this.highscore = this.score;
            }
            this.score = 0;
            // Position of head of snake - initially centre of grid.
            x = Math.floor(this.settings.ww / 2);
            y = Math.floor(this.settings.wh / 2);
            this.snake = new Snake(new Point(x, y));
            // Reset frame rate
            this.fr = this.settings.startFr;
            this.generateFruit();
            this.storedKeypress = null;
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
        this.length = 4;
        this.v = new Point(0, 0);
        this.dir = 1;
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

        changeDir: function(newDir) {
            var opp = (newDir + 2) % 4;
            if (this.dir != opp && this.dir != newDir) {
                switch (newDir) {
                    case 0: // Left
                        this.v = new Point(-1, 0);
                        break;
                    case 1: // Up
                        this.v = new Point(0, -1);
                        break;
                    case 2: // Right
                        this.v = new Point(1, 0);
                        break;
                    case 3: // Down
                        this.v = new Point(0, 1);
                        break;
                }
                this.dir = newDir;
                return true;
            } else if (this.stationary()) {
                // Game not yet started and up entered
                this.v = new Point(0, -1);
                return true;
            }
            return false;
        },

        draw: function(ctx, settings) {
            // Head
            var dirFront, dirBack, link;
            dirBack = this.cells[1].dir(this.head, settings.ww, settings.wh);
            drawElement(ctx, snakeHead, dirBack, this.head, settings);
            // Body
            for (var i = 1; i < this.length-1; i++) {
                dirFront = this.cells[i].dir(this.cells[i-1], settings.ww, settings.wh);
                dirBack = this.cells[i+1].dir(this.cells[i], settings.ww, settings.wh);
                link = snakeStraightLink;
                if (dirFront == (dirBack+3) % 4) {
                    link = snakeLeftTurnLink;
                } else if (dirFront == (dirBack+1) % 4) {
                    link = snakeRightTurnLink;
                }
                drawElement(ctx, link, dirBack, this.cells[i], settings);
            }
            dirFront = this.cells[this.length - 1].dir(this.cells[this.length - 2], settings.ww, settings.wh);
            drawElement(ctx, snakeTail, dirFront, this.cells[this.length - 1], settings);
        }
    };

    return Constructor;
})();


function fruit(ctx, p, settings) {
    ctx.beginPath();
    ctx.arc((p.x + 0.5) * gs, (p.y + 0.5) * gs, 10, 0, 2 * Math.PI, false);
    ctx.fillStyle = settings.fruitColour;
    ctx.fill();
}

function snakeHead(ctx, p, settings) {
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

function snakeStraightLink(ctx, p, settings) {
    ctx.fillStyle = settings.snakeColour;
    ctx.fillRect(p.x*gs+1, p.y*gs, gs-2, gs);
    ctx.beginPath();
    var spotRad = 3;
    ctx.arc((p.x+0.5)*gs, (p.y+0.5)*gs, spotRad, 0, 2*Math.PI, false);
    ctx.fillStyle = settings.patternColour;
    ctx.fill();
}

function snakeLeftTurnLink(ctx, p, settings) {
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

function snakeRightTurnLink(ctx, p, settings) {
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

function snakeTail(ctx, p, settings) {
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

function bindEnteredKey(e) {
    var key = e.key;
    var code = e.keyCode;
    if (code == 32) {
        key = "Space";
    }
    var span = document.getElementById("key_" + game.keyToBind);
    switch (game.keyToBind) {
        case "left":
            game.settings.newKeyBindings.keyL = code;
            game.settings.newKeyBindings.keyStrL = key;
            break;
        case "up":
            game.settings.newKeyBindings.keyU = code;
            game.settings.newKeyBindings.keyStrU = key;
            break;
        case "right":
            game.settings.newKeyBindings.keyR = code;
            game.settings.newKeyBindings.keyStrR = key;
            break;
        case "down":
            game.settings.newKeyBindings.keyD = code;
            game.settings.newKeyBindings.keyStrD = key;
            break;
        case "pause":
            game.settings.newKeyBindings.keyP = code;
            game.settings.newKeyBindings.keyStrP = key;
            break;
    }
    span.innerHTML = key;
    document.removeEventListener("keydown", bindEnteredKey);
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
