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
offset_x = 516,
offset_y = 32,
target = -1,
through = 0,
timeout = 0,
world = [],

draw = (sprite, x, y, p = 16) => {
    while (p--) {
        if (c.fillStyle = palette[
                // Single-digit sprites are solid 4x4 blocks of the same color.
                sprite < 8
                    ? sprite
                    : 0|sprite / 8 ** p & 7]) {
            c.fillRect(x + (p % 4), y + (0|p / 4), 1, 1);
        }
    }
},

minimap = (i, sprite) =>
    draw(sprite, i % 30 * 4 + 500, (0|i / 30) * 4 + 20),

viewport = (i, sprite) => {
    // Approximate scale(8, 8) and rotate(Math.PI / 4).
    c.setTransform(6, 6, -6, 6,
        (i % 30 * 4 + 502 - offset_x) * 8,
        ((0|i / 30) * 4 + 20 - offset_y) * 8);
    draw(sprite, 0, 0);
    c.resetTransform();
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
    viewport(i, 0x80590db018), // The X
    i
 ),

scroll = (x, y) => {
    offset_x = x - 30;
    offset_y = y - 30;
    render();
    // Draw the path to the current target, but only if the player hasn't
    // reached it yet.
    world[target] && path(target);
},

trace = i => (through = i, neighbors(i).some(n =>
         world[n] === 0 || world[n] < world[i] &&
             (viewport(n, 0x8018000), // The dot
             trace(n)))),

render = (i = 900, v) => {
    // Sidebar
    c.fillStyle = palette[2];
    c.fillRect(480, 0, 160, 480);
    c.fillStyle = palette[1];
    c.fillRect(490, 10, 140, 140);
    c.fillStyle = palette[3];
    c.fillRect(490, 160, 140, 310);

    // Map
    while (i--) {
        v = 5 * Math.sin((i % 30 - 9) * (i - 600) / 2e3)
                + Math.sin(i * i) + 3;
        minimap(i,
            v > 6 ? 0x249249649acd: // rock
            v > 4 ? 0xa6d925b25b2d: // tree
            v > 1 ? 5: // grass
            v > 0 ? 0x92592db6db6d: // bush
            6 // water
        );

        world[i] = 0 < v && v <= 4 ? Infinity : "x";
    }

    world[player_pos] = 0;
    distance(player_pos);

    minimap(player_pos, 0x1c70711d8ff2); // knight
    minimap(267, 0x6180d81d8fda); // griffin

    // Viewport
    c.drawImage(a, offset_x, offset_y, 60, 60, 0, 0, 480, 480);

    // Overflow border
    c.lineWidth = 2;
    c.strokeStyle = palette[7];
    c.strokeRect(offset_x, offset_y, 60, 60);
};

render();

a.onclick = (e, x, y) => (
    x = e.x - e.target.offsetLeft,
    y = e.y - e.target.offsetTop,
    // Handle viewport clicks
    x < 480 && move(
        // Transform x, y into an index into the world array
        0|(x/8 + offset_x - 500) / 4
        + 30 * (0|(y/8 + offset_y - 20) / 4)),
    // Handle minimap clicks
    (500 < x && x < 620 && 20 < y && y < 140) && scroll(x, y));
