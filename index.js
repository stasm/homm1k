c.imageSmoothingEnabled = false;
var palette = [
    ,       // transparent
    "#000", // 1 black
    "#900", // 2 red
    "#c96", // 3 beige
    "#382", // 4 light green
    "#352", // 5 dark green
    "#036", // 6 blue
    "#fff", // 7 white
],
player_pos = 400,
offset_x = 4,
offset_y = 4,
target = -1,
through = 0,
timeout = 0,
world = [],
minimap = (x, y) => [500 + x * 4, 20 + y * 4],

draw = (x, y, pattern, i) => {
    for (i = 16; i--;) {
        if (c.fillStyle = palette[
                // Single-digit patters are solid 4x4 sprites of the same color.
                pattern < 9 ? pattern : ("" + pattern).padStart(16, 0)[i]]) {
            c.fillRect(x + (i % 4), 0|y + i / 4, 1, 1);
        }
    }
},

draw_tilted = (i, pattern, x, y) => {
    x = i % 30 - offset_x;
    y = 0|i / 30 - offset_y;
    //c.scale(8, 8);
    //c.rotate(Math.PI / 4);
    //c.translate(x * 4 + 2.5, y * 4 + 1.5);
    c.setTransform(5.6, 5.6, -5.6, 5.6, x*32+20, y*32+12);
    draw(-2.5, -1.5, pattern);
    c.setTransform(1, 0, 0, 1, 0, 0);
},

neighbors = i => [
    // Cardinal directions: N W S E
    i - 30, i - 1, i + 30, i + 1,
    // Diagonal directions: NW SW SE NE
    i - 31, i + 29, i + 31, i - 29],

distance = i => neighbors(i).map(n =>
    world[i] + 1 < world[n] &&
        (world[n] = world[i] + 1, distance(n))),

move = i => {
    // x, y are in view coords
    clearTimeout(timeout);
    render();
    if (world[i] > 0 && world[i] < Infinity) {
        if (i === target) {
            player_pos = through;
            timeout = setTimeout(() => move(i));
        }
        // path() returns i
        target = path(i);
    }
},

path = i => (
    trace(i),
    draw_tilted(i, 30033301310010 /* x */),
    i
 ),

scroll = (x, y) => {
    offset_x = 0|x / 4;
    offset_y = 0|y / 4;
    render();
    // Draw the path to the current target, but only if the player hasn't
    // reached it yet.
    world[target] && path(target);
},

trace = i => (through = i, neighbors(i).some(n =>
         world[n] === 0 || world[n] < world[i] &&
             (draw_tilted(n, 30001e5 /* dot */), trace(n)))),

render = i => {
    // Sidebar
    c.fillStyle = palette[2];
    c.fillRect(480, 0, 160, 480);
    c.fillStyle = palette[1];
    c.fillRect(490, 10, 140, 140);

    // Map
    for (i = 30**2; i--;) {
        let x = i % 30;
        let y = 0|i / 30;
        let v = 5 * Math.sin((x - 9) * (y - 22) / 80) + Math.sin(i * i) + 3;

        draw(...minimap(x, y),
            v > 6 ? 5135111311111111: // rock
            v > 4 ? 5545544554445515: // tree
            v > 1 ? 5: // grass
            v > 0 ? 5555555555445444: // bush
            6 // water
        );

        world[i] = 0 < v && v <= 4 ? Infinity : "x";
    }

    world[player_pos] = 0;
    distance(player_pos);

    draw(
        ...minimap(player_pos % 30, 0|player_pos / 30),
        2677037016107070 /* knight */);

    // Viewport
    c.drawImage(a, ...minimap(offset_x, offset_y), 60, 60, 0, 0, 480, 480);

    // Overflow border
    c.lineWidth = 2;
    c.strokeStyle = palette[7];
    c.strokeRect(...minimap(offset_x, offset_y), 60, 60);
};

render();

a.onclick = (e, x, y) => (
    x = e.x - e.target.offsetLeft,
    y = e.y - e.target.offsetTop,
    // Handle viewport clicks. Transform x, y into an index into the world array.
    x < 480 && move(0|30 * (0|y / 32 + offset_y) + x / 32 + offset_x),
    // Handle minimap clicks
    (500 < x && x < 620 && 20 < y && y < 140) && scroll(x - 530, y - 50));
