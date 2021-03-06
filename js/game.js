function Game(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
}

Game.prototype.init = function() {
    // Direction changed in this frame, and whether game is paused
    this.dirChanged = this.paused = this.startQueued = false;
    this.inGameView = true;
    this.aiMode = false;
    this.ai = new AI(this);
    this.loadCookies();
    this.start();
    this.mobileGestures = false;
};

Game.prototype.reset = function() {
    if (!this.inGameView) {
        this.toggleSettingsView();
    }
    if (this.paused) {
        this.togglePaused();
    }
    this.ai = new AI(this);
    this.settings = new Settings();
    this.writeCookies();
    this.start();
};

Game.prototype.loadSettingsAndStart = function() {
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
    this.writeCookies();
    this.start();
};

Game.prototype.generateFruit = function() {
    var fx = Math.floor(Math.random() * this.settings.ww);
    var fy = Math.floor(Math.random() * this.settings.wh);
    this.fruit = new Fruit(fx, fy);
    for (var i = 0; i < this.snake.length; i++) {
        // Don't generate fruit on top of snake.
        if (this.snake.occupies(this.fruit.cell)) {
            this.generateFruit();
            return;
        }
    }
};

Game.prototype.draw = function() {
    // Update score display
    this.updateScores();
    // Draw background
    this.ctx.fillStyle = this.settings.worldColour;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    // Fruit
    this.drawElement(this.fruit.draw, null, this.fruit.cell, null, this.settings);
    // Snake
    var snakeSizes = this.snake.calculateSizes(this.gs);
    this.snake.getElements(this.settings).forEach(function(e) {
        this.drawElement(e.fn, e.dir, e.cell, snakeSizes, this.settings);
    }, this);
};

Game.prototype.updateScores = function() {
    var scoreString = "Score: " + this.score + " - Highscore: " + this.highscore;
    document.getElementById("score_div").innerHTML = scoreString;
    document.getElementById("settings_highscore").innerHTML = this.highscore;
};

Game.prototype.drawElement = function(elementFn, orientation, coords, sizes, settings) {
    var angle = orientation ? Dir.properties[orientation].angle : 0;
    var rp = new Cell((coords.x + 0.5) * this.gs, (coords.y + 0.5) * this.gs);
    this.ctx.translate(rp.x, rp.y);
    this.ctx.rotate(angle);
    this.ctx.translate(-rp.x, -rp.y);
    elementFn(this.ctx, coords, sizes, settings);
    this.ctx.translate(rp.x, rp.y);
    this.ctx.rotate(-angle);
    this.ctx.translate(-rp.x, -rp.y);
}

Game.prototype.increment = function() {
    if (this.paused) {
        // Game paused, so do nothing for now.
        return;
    }
    var newHead = this.snake.head.adjacent(this.snake.dir, this.settings.ww, this.settings.wh, this.settings.wrap);
    if (this.snake.isDead(newHead, this.settings.wrap)) {
        // If dead, pause graphics for a moment and then restart.
        this.draw();
        this.timer = window.setTimeout(() => this.start(), 1500);
        return;
    }
    var gotFruit = newHead.equals(this.fruit.cell);
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
        if (this.mobileGestures) {
            this.handleGesture(this.storedKeypress);
        } else {
            this.handleKeypress(this.storedKeypress);
        }
        this.storedKeypress = null;
    }
    // Redraw the board.
    this.draw();
    this.timer = window.setTimeout(() => this.increment(), 1000 / this.fr);
    if (this.aiMode) {
        var move = this.ai.getMove();
        this.snake.changeDir(move);
    }
};

Game.prototype.toggleAI = function() {
    var btn = document.getElementById("ai_btn");
    this.aiMode = !this.aiMode;
    if (this.aiMode) {
        btn.innerHTML = "Stop AI";
        if (this.paused) {
            this.togglePaused();
        }
    } else {
        btn.innerHTML = "Run AI";
        if (!this.paused) {
            this.togglePaused();
        }
    }
};

Game.prototype.toggleSettingsView = function() {
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
};

Game.prototype.togglePaused = function() {
    this.paused = !this.paused;
    var x = document.getElementById("paused_div");
    if (this.paused) {
        x.style.display = "block";
    } else {
        x.style.display = "none";
        if (this.startQueued) {
            this.startQueued = false;
            this.start();
        } else {
            this.increment();
        }
    }
};

Game.prototype.resetHighscore = function() {
    this.highscore = 0;
    this.updateScores();
};

Game.prototype.dirChange = function(e, newDir) {
    if (!this.paused && !this.aiMode) {
        if (this.dirChanged) {
            // Only change direction once per frame.
            this.storedKeypress = e;
        } else {
            this.dirChanged = this.snake.changeDir(newDir);
        }
    }
};

Game.prototype.bindKey = function(fn) {
    var span = document.getElementById("key_" + fn);
    span.innerHTML = "_";
    this.keyToBind = fn;
    document.addEventListener("keydown", this.bindEnteredKey);
};

Game.prototype.handleKeypress = function(e) {
    if (this.inGameView) {
        this.mobileGestures = false;
        switch (e.keyCode) {
            case this.settings.keyL:
                this.dirChange(e, Dir.LEFT);
                break;
            case this.settings.keyU:
                this.dirChange(e, Dir.UP);
                break;
            case this.settings.keyR:
                this.dirChange(e, Dir.RIGHT);
                break;
            case this.settings.keyD:
                this.dirChange(e, Dir.DOWN);
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
};

Game.prototype.handleGesture = function(e) {
    if (game.inGameView) {
        game.mobileGestures = true;
        switch (e.type) {
            case "swipeleft":
                game.dirChange(e, Dir.LEFT);
                break;
            case "swipeup":
                game.dirChange(e, Dir.UP);
                break;
            case "swiperight":
                game.dirChange(e, Dir.RIGHT);
                break;
            case "swipedown":
                game.dirChange(e, Dir.DOWN);
                break;
            case "tap": // P for Pause
                game.togglePaused();
                break;
        }
    }
};

Game.prototype.start = function() {
    if (this.paused) {
        this.startQueued = true;
        return;
    }
    this.gs = this.canvas.width / this.settings.ww;
    //this.canvas.width = this.settings.ww * gs;
    this.canvas.height = this.settings.wh * this.gs;
    clearTimeout(this.timer);
    if (this.score > this.highscore) {
        this.highscore = this.score;
        this.writeCookies();
    }
    this.score = 0;
    // Position of head of snake - initially centre of grid.
    x = Math.floor(this.settings.ww / 2);
    y = Math.floor(this.settings.wh / 2);
    this.snake = new Snake(new Cell(x, y));
    // Reset frame rate
    this.fr = this.settings.startFr;
    this.generateFruit();
    this.storedKeypress = null;
    this.increment();
};

Game.prototype.bindEnteredKey = function(e) {
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
    document.removeEventListener("keydown", this.bindEnteredKey);
};

Game.prototype.loadCookies = function() {
    this.highscore = cookieHandler.getCookie("highscore") || 0;
    this.settings = new Settings();
    var cookieSettings = cookieHandler.getCookie("settings");
    if (cookieSettings) {
        Object.assign(this.settings, JSON.parse(cookieSettings));
    }
};

Game.prototype.writeCookies = function() {
    cookieHandler.setCookie("highscore", this.highscore, 365);
    cookieHandler.setCookie("settings", JSON.stringify(this.settings), 365);
};
