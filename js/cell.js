function Cell(px, py) {
    this.x = px;
    this.y = py;
}

Cell.prototype.equals = function(p) {
    return this.x == p.x && this.y == p.y;
};

Cell.prototype.dir = function(p, ww, wh) {
    // only works for adjacent cells
    if (this.x == p.x) {
        if (this.y == p.y + 1 || (this.y == 0 && p.y == wh - 1)) {
            return Dir.UP;
        }
        return Dir.DOWN;
    }
    if (this.x == p.x + 1 || (this.x == 0 && p.x == ww - 1)) {
        return Dir.LEFT;
    }
    return Dir.RIGHT;
};

Cell.prototype.adjacent = function(dir, ww, wh, wrap) {
    var x = this.x;
    var y = this.y;
    var wrapped = false;
    switch (dir) {
        case Dir.UP:
            if (this.y > 0) {
                y = this.y - 1;
            } else {
                y = wh - 1;
                wrapped = true;
            }
            break;
        case Dir.DOWN:
            if (this.y < wh - 1) {
                y = this.y + 1;
            } else {
                y = 0;
                wrapped = true;
            }
            break;
        case Dir.LEFT:
            if (this.x > 0) {
                x = this.x - 1;
            } else {
                x = ww - 1;
                wrapped = true;
            }
            break;
        case Dir.RIGHT:
            if (this.x < ww - 1) {
                x = this.x + 1;
            } else {
                x = 0;
                wrapped = true;
            }
            break;
    }
    var adj = new Cell(this.x, this.y)
    if (wrapped && !wrap) {
        return null;
    }
    return new Cell(x, y);
};

Cell.prototype.copy = function() {
    return new Cell(this.x, this.y);
};
