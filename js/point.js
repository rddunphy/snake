function Point(px, py) {
    this.x = px;
    this.y = py;
}

Point.prototype.equals = function(p) {
    return this.x == p.x && this.y == p.y;
};

Point.prototype.dir = function(p, ww, wh) {
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
};
