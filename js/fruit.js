function Fruit(fx, fy) {
    this.cell = new Cell(fx, fy);
}

Fruit.prototype.draw = function(ctx, p, settings) {
    ctx.beginPath();
    ctx.arc((p.x + 0.5) * gs, (p.y + 0.5) * gs, 10, 0, 2 * Math.PI, false);
    ctx.fillStyle = settings.fruitColour;
    ctx.fill();
};
