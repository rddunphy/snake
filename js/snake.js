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
}

// Snake link draw functions

Snake.prototype.drawHead = function(ctx, p, settings) {
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
};

Snake.prototype.drawStraightLink = function(ctx, p, settings) {
    ctx.fillStyle = settings.snakeColour;
    ctx.fillRect(p.x*gs+1, p.y*gs, gs-2, gs);
    ctx.beginPath();
    var spotRad = 3;
    ctx.arc((p.x+0.5)*gs, (p.y+0.5)*gs, spotRad, 0, 2*Math.PI, false);
    ctx.fillStyle = settings.patternColour;
    ctx.fill();
};

Snake.prototype.drawLeftTurnLink = function(ctx, p, settings) {
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
};

Snake.prototype.drawRightTurnLink = function(ctx, p, settings) {
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
};

Snake.prototype.drawTail = function(ctx, p, settings) {
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
