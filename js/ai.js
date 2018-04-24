function AI(game) {
    this.game = game;
}

AI.prototype.getMove = function() {
    this.ww = game.settings.ww;
    this.wh = game.settings.wh;
    this.wrap = game.settings.wrap;
    var head = this.game.snake.head;
    var fruit = this.game.fruit.cell;
    var fruitMove;

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
        if (!this.isTerminalMove(preferredMoves[i])) {
            return preferredMoves[i];
        }
    }
    // Dead no matter what
    return null;
};

AI.prototype.isTerminalMove = function(move) {
    var snakeCopy = this.game.snake.copy();
    snakeCopy.changeDir(move);
    var newHead = snakeCopy.next(this.ww, this.wh);
    console.log(this.wrap);
    return snakeCopy.isDead(newHead, this.wrap);
};
