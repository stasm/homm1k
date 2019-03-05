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
player_pos = 248,
offset_x = 2,
offset_y = 2,
target = -1,
through = 0,
timeout = 0,
distances = [],
world = (x, y) => 30 * (y + offset_y) + x + offset_x,
view = i => [(i % 30) - offset_x, (i / 30 >> 0) - offset_y],
minimap = (x, y) => [500 + x * 4, 20 + y * 4],

draw = (x, y, pattern, i) => {
    for (i = 16; i--;) {
        if (c.fillStyle = palette[
                // Single-digit patters are solid 4x4 sprites of the same color.
                pattern < 9 ? pattern : ("" + pattern).padStart(16, 0)[i]]) {
            c.fillRect(x + (i % 4), y + (i / 4 >> 0), 1, 1);
        }
    }
},

draw_tilted = ([x, y], pattern) => {
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
    distances[i] + 1 < distances[n] &&
        (distances[n] = distances[i] + 1, distance(n))),

move = i => {
    // x, y are in view coords
    clearTimeout(timeout);
    render();
    if (distances[i] > 0 && distances[i] < Infinity) {
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
    draw_tilted(view(i), 40044401410010 /* x */),
    i
 ),

scroll = (x, y) => {
    offset_x = x / 4 >> 0;
    offset_y = y / 4 >> 0;
    render();
    // Draw the path to the current target, but only if the player hasn't
    // reached it yet.
    distances[target] && path(target);
},

trace = i => (through = i, neighbors(i).some(n =>
        //  (c.font = "8px sans-serif", c.fillStyle = "#fff",
        //  c.fillText(distances[n], ...view(n).map(x => x * 32 + 4)),
         distances[n] === 0 || distances[n] < distances[i] &&
             (draw_tilted(view(n), 40001e5 /* dot */), trace(n)))),

render = i => {
    // Sidebar
    c.fillStyle = palette[2];
    c.fillRect(480, 0, 160, 480);
    c.fillStyle = palette[1];
    c.fillRect(490, 10, 140, 140);

    // Map
    for (i = 30**2; i--;) {
        let x = i % 30;
        let y = i / 30 >> 0;
        let v =
            (Math.sin((x + 5) / 3) + Math.sin(y / 4))
            + (Math.cos((x + 3) / 5) + Math.cos(y / 6));

        draw(...minimap(x, y),
            v > 2.3 ? 5135111311111111 : // rock
            v > .7 ? 5545544554445515 : // tree
            v > -1 ? 5 : // grass
            v > -1.7 ? 3 : // beach
            6, // water
        );

        // Palette here stands for a non-numerical value and represents
        // non-passable terrain.
        distances[i] = -1.7 < v && v < .7 ? Infinity : palette;
    }

    distances[player_pos] = 0;
    distance(player_pos);

    draw(
        ...minimap(player_pos % 30, player_pos / 30 >> 0),
        2677067012107070 /* knight */);

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
    // Handle viewport clicks
    x < 480 && move(world(x / 32 >> 0, y / 32 >> 0)),
    // Handle minimap clicks
    (500 < x && x < 620 && 20 < y && y < 140) && scroll(x - 530, y - 50));
