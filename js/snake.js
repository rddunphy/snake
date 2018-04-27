function Snake(head) {
    this.head = head;
    this.cells = [];
    for (var i = 0; i < 4; i++) {
        this.cells.push(new Cell(head.x, head.y + i));
    }
    this.length = 4;
    this.v = new Cell(0, 0);
    this.dir = Dir.UP;
}

Snake.prototype.isDead = function(newHead, wrap) {
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
};

Snake.prototype.occupies = function(cell) {
    for (var i = 0; i < this.length; i++) {
        if (this.cells[i].equals(cell)) {
            return true;
        }
    }
    return false;
};

Snake.prototype.next = function(ww, wh) {
    var newX = (this.head.x + this.v.x + ww) % ww;
    var newY = (this.head.y + this.v.y + wh) % wh;
    return new Cell(newX, newY);
};

Snake.prototype.stationary = function() {
    return this.v.x == 0 && this.v.y == 0;
};

Snake.prototype.move = function(cell, gotFruit) {
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
};

Snake.prototype.changeDir = function(newDir) {
    if (!newDir) {
        return false;
    }
    if (this.dir != Dir.properties[newDir].opp && this.dir != newDir) {
        switch (newDir) {
            case Dir.LEFT:
                this.v = new Cell(-1, 0);
                break;
            case Dir.UP:
                this.v = new Cell(0, -1);
                break;
            case Dir.RIGHT:
                this.v = new Cell(1, 0);
                break;
            case Dir.DOWN:
                this.v = new Cell(0, 1);
                break;
        }
        this.dir = newDir;
        return true;
    } else if (this.stationary()) {
        // Game not yet started and up entered
        this.v = new Cell(0, -1);
        return true;
    }
    return false;
};

Snake.prototype.getElements = function(settings) {
    var elements = [];
    // Head
    var dirFront, dirBack, link;
    dirBack = this.cells[1].dir(this.head, settings.ww, settings.wh);
    elements.push({cell: this.head, dir: dirBack, fn: this.drawHead});
    // Body
    for (var i = 1; i < this.length-1; i++) {
        dirFront = this.cells[i].dir(this.cells[i-1], settings.ww, settings.wh);
        dirBack = this.cells[i+1].dir(this.cells[i], settings.ww, settings.wh);
        link = this.drawStraightLink;
        if (dirFront == Dir.properties[dirBack].ccw) {
            link = this.drawLeftTurnLink;
        } else if (dirFront == Dir.properties[dirBack].cw) {
            link = this.drawRightTurnLink;
        }
        elements.push({cell: this.cells[i], dir: dirBack, fn: link});
    }
    dirFront = this.cells[this.length - 1].dir(this.cells[this.length - 2], settings.ww, settings.wh);
    elements.push({cell: this.cells[this.length - 1], dir: dirFront, fn: this.drawTail});
    return elements;
};

Snake.prototype.calculateSizes = function(gs) {
    return {
        eyeRad: gs / 20,
        tongueRad: gs / 6,
        margin: gs / 20,
        spotRad: gs / 6,
        tipRad: gs / 8,
        tipSpotRad: gs / 9
    }
};

// Snake link draw functions

Snake.prototype.drawHead = function(ctx, p, sizes, settings) {
    ctx.beginPath();
    ctx.arc((p.x + 0.5) * game.gs, (p.y + 0.7) * game.gs, (game.gs / 2) - sizes.margin, Math.PI, 2 * Math.PI, false);
    ctx.lineTo((p.x + 1) * game.gs - sizes.margin, (p.y + 1) * game.gs + 0.5);
    ctx.lineTo(p.x * game.gs + sizes.margin, (p.y + 1) * game.gs + 0.5);
    ctx.closePath();
    ctx.fillStyle = settings.snakeColour;
    ctx.fill();
    // eyes
    ctx.beginPath();
    ctx.arc((p.x + 0.3) * game.gs, (p.y + 0.8) * game.gs, sizes.eyeRad, 0, 2 * Math.PI, false);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.beginPath();
    ctx.arc((p.x + 0.7) * game.gs, (p.y + 0.8) * game.gs, sizes.eyeRad, 0, 2 * Math.PI, false);
    ctx.fill();
    // tongue
    ctx.beginPath();
    ctx.arc((p.x+0.5)*game.gs - sizes.tongueRad, p.y*game.gs + sizes.tongueRad, sizes.tongueRad, -Math.PI/2, 0, false);
    ctx.lineTo((p.x + 0.5) * game.gs, (p.y + 0.3) * game.gs);
    ctx.arc((p.x+0.5)*game.gs + sizes.tongueRad, p.y*game.gs + sizes.tongueRad, sizes.tongueRad, Math.PI, 3*Math.PI/2, false);
    ctx.strokeStyle = "red";
    ctx.stroke();
};

Snake.prototype.drawStraightLink = function(ctx, p, sizes, settings) {
    ctx.fillStyle = settings.snakeColour;
    ctx.fillRect(p.x*game.gs + sizes.margin, p.y*game.gs, game.gs - 2*sizes.margin, game.gs+0.5);
    ctx.beginPath();
    ctx.arc((p.x+0.5)*game.gs, (p.y+0.5)*game.gs, sizes.spotRad, 0, 2*Math.PI, false);
    ctx.fillStyle = settings.patternColour;
    ctx.fill();
};

Snake.prototype.drawLeftTurnLink = function(ctx, p, sizes, settings) {
    ctx.beginPath();
    ctx.arc(p.x*game.gs, (p.y+1)*game.gs + 0.5, game.gs-sizes.margin, -Math.PI/2, 0, false);
    ctx.lineTo(p.x*game.gs + sizes.margin, (p.y+1)*game.gs + 0.5);
    ctx.lineTo(p.x*game.gs, (p.y+1)*game.gs - sizes.margin);
    ctx.closePath();
    ctx.fillStyle = settings.snakeColour;
    ctx.fill();
    ctx.beginPath();
    ctx.arc((p.x+0.3)*game.gs, (p.y+0.7)*game.gs, sizes.spotRad, 0, 2*Math.PI, false);
    ctx.fillStyle = settings.patternColour;
    ctx.fill();
};

Snake.prototype.drawRightTurnLink = function(ctx, p, sizes, settings) {
    ctx.beginPath();
    ctx.arc((p.x+1)*game.gs, (p.y+1)*game.gs + 0.5, game.gs-sizes.margin, Math.PI, 3*Math.PI/2, false);
    ctx.lineTo((p.x+1)*game.gs, (p.y+1)*game.gs - sizes.margin);
    ctx.lineTo((p.x+1)*game.gs - sizes.margin, (p.y+1)*game.gs + 0.5);
    ctx.closePath();
    ctx.fillStyle = settings.snakeColour;
    ctx.fill();
    ctx.beginPath();
    ctx.arc((p.x+0.7)*game.gs, (p.y+0.7)*game.gs, sizes.spotRad, 0, 2*Math.PI, false);
    ctx.fillStyle = settings.patternColour;
    ctx.fill();
};

Snake.prototype.drawTail = function(ctx, p, sizes, settings) {
    ctx.beginPath();
    ctx.moveTo(p.x*game.gs + sizes.margin, p.y*game.gs);
    ctx.lineTo((p.x+1)*game.gs - sizes.margin, p.y*game.gs);
    ctx.lineTo((p.x+0.5)*game.gs+sizes.tipRad, (p.y+1)*game.gs-sizes.tipRad);
    ctx.arc((p.x+0.5)*game.gs, (p.y+1)*game.gs-sizes.tipRad, sizes.tipRad, 0, Math.PI, false);
    ctx.closePath();
    ctx.fillStyle = settings.snakeColour;
    ctx.fill();
    ctx.beginPath();
    ctx.arc((p.x+0.5)*game.gs, (p.y+0.25)*game.gs, sizes.tipSpotRad, 0, 2*Math.PI, false);
    ctx.fillStyle = settings.patternColour;
    ctx.fill();
};

Snake.prototype.copy = function() {
    var copy = new Snake(this.head.copy());
    copy.cells = [];
    for (var i = 0; i < this.length; i++) {
        copy.cells.push(this.cells[i].copy());
    }
    copy.length = this.length;
    copy.v = this.v.copy();
    copy.dir = this.dir;
    return copy;
};
