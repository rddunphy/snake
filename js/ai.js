function AI(game) {
    this.game = game;
}

AI.prototype.getMove = function() {
    this.ww = game.settings.ww;
    this.wh = game.settings.wh;
    this.wrap = game.settings.wrap;
    var moves = this.availableMoves();
    moves = this.eliminateDangerousMoves(moves);
    return this.moveTowardsFruit(moves);
};

AI.prototype.moveArea = function(move) {
    var map = this.snakeBitMap();
    var cell = this.game.snake.head.adjacent(move, this.ww, this.wh, this.wrap);
    return this.floodFillArea(map, cell);
};

AI.prototype.snakeBitMap = function() {
    var map = [];
    for (var y = 0; y < this.wh; y++) {
        var row = [];
        for (var x = 0; x < this.ww; x++) {
            row.push(this.game.snake.occupies(new Cell(x, y)) ? 1 : 0);
        }
        map.push(row);
    }
    return map;
};

AI.prototype.floodFillArea = function(map, cell) {
    if (!cell || map[cell.y][cell.x] != 0) {
        return 0;
    }
    map[cell.y][cell.x] = 1;
    var n = 1;
    n += this.floodFillArea(map, cell.adjacent(Dir.UP, this.ww, this.wh, this.wrap));
    n += this.floodFillArea(map, cell.adjacent(Dir.DOWN, this.ww, this.wh, this.wrap));
    n += this.floodFillArea(map, cell.adjacent(Dir.LEFT, this.ww, this.wh, this.wrap));
    n += this.floodFillArea(map, cell.adjacent(Dir.RIGHT, this.ww, this.wh, this.wrap));
    return n;
};

AI.prototype.availableMoves = function() {
    var dir = this.game.snake.dir;
    return [dir, Dir.properties[dir].cw, Dir.properties[dir].ccw];
};

AI.prototype.eliminateDangerousMoves = function(moves) {
    var okMoves = [];
    var maxArea = 0;
    for (var i = 0; i < moves.length; i++) {
        var area = this.moveArea(moves[i]);
        if (area > maxArea) {
            okMoves = [moves[i]];
            maxArea = area;
        } else if (area == maxArea) {
            okMoves.push(moves[i]);
        }
    }
    return okMoves;
};

AI.prototype.moveTowardsFruit = function(moves) {
    var fruitMove;
    var head = this.game.snake.head;
    var fruit = this.game.fruit.cell;
    if (!this.wrap) {
        if (head.x != fruit.x) {
            fruitMove = (head.x > fruit.x) ? Dir.LEFT : Dir.RIGHT;
        } else {
            fruitMove = (head.y > fruit.y) ? Dir.UP : Dir.DOWN;
        }
    } else {
        if (head.x != fruit.x) {
            if (head.x < fruit.x && Math.abs(head.x - fruit.x) > this.ww / 2
            || head.x > fruit.x && Math.abs(head.x - fruit.x) < this.ww / 2) {
                fruitMove = Dir.LEFT;
            } else {
                fruitMove = Dir.RIGHT;
            }
        } else if (head.y < fruit.y && Math.abs(head.y - fruit.y) > this.wh / 2
            || head.y > fruit.y && Math.abs(head.y - fruit.y) < this.wh / 2) {
            fruitMove = Dir.UP;
        } else {
            fruitMove = Dir.DOWN;
        }
    }

    var preferredMoves = [
        fruitMove,
        Dir.properties[fruitMove].opp,
        Dir.properties[fruitMove].cw,
        Dir.properties[fruitMove].ccw
    ];
    for (var i = 0; i < preferredMoves.length; i++) {
        if (moves.includes(preferredMoves[i])) {
            return preferredMoves[i];
        }
    }
    // Dead no matter what
    return null;
};
