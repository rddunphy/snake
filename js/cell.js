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

Cell.prototype.copy = function() {
    return new Cell(this.x, this.y);
};
