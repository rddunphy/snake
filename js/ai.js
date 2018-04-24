function AI(game) {
    this.game = game;
    this.ww = game.settings.ww;
    this.wh = game.settings.wh;
}

AI.prototype.getMove = function(head, dir, fruit) {
    var fruitMove;
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
    return fruitMove;
};
