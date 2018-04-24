var Dir = {
    LEFT: 1,
    UP: 2,
    RIGHT: 3,
    DOWN: 4,
    properties: {
        1: {opp: 3, cw: 2, ccw: 4, angle: -Math.PI/2},
        2: {opp: 4, cw: 3, ccw: 1, angle: 0},
        3: {opp: 1, cw: 4, ccw: 2, angle: Math.PI/2},
        4: {opp: 2, cw: 1, ccw: 3, angle: Math.PI}
    }
};

if (Object.freeze) {
    Object.freeze(Dir);
}
