function Fruit(fx, fy) {
    this.cell = new Cell(fx, fy);
}

Fruit.prototype.draw = function(ctx, p, sizes, settings) {
    ctx.beginPath();
    ctx.arc((p.x + 0.5) * game.gs, (p.y + 0.5) * game.gs, 0.4*game.gs, 0, 2 * Math.PI, false);
    ctx.fillStyle = settings.fruitColour;
    ctx.fill();
};
